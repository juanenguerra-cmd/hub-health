import { useMemo, useState, type ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  buildChecklistCompletionReport,
  buildCourseCompletionReport,
  type CourseCompletionReport,
} from '@/lib/csv-import-report';

const readFileAsText = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsText(file);
});

export function CsvTrainingImportReport() {
  const [courseCsv, setCourseCsv] = useState('');
  const [checklistCsv, setChecklistCsv] = useState('');
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  const [selectedChecklists, setSelectedChecklists] = useState<string[]>([]);

  const courseReport: CourseCompletionReport = useMemo(
    () => buildCourseCompletionReport(courseCsv),
    [courseCsv]
  );

  const checklistReport = useMemo(
    () => buildChecklistCompletionReport(checklistCsv, selectedChecklists),
    [checklistCsv, selectedChecklists]
  );

  const handleUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await readFileAsText(file);
    setter(text);
    event.target.value = '';
  };

  const toggleChecklist = (checklistName: string) => {
    setSelectedChecklists((current) => (
      current.includes(checklistName)
        ? current.filter((name) => name !== checklistName)
        : [...current, checklistName]
    ));
  };

  const printFilteredReport = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const selectedLabel = selectedChecklists.length ? selectedChecklists.join(', ') : 'All checklists';

    const departmentRows = courseReport.departmentRows
      .map((row) => `
        <tr>
          <td>${row.department}</td>
          <td style="text-align:right;">${row.staffCount}</td>
          <td style="text-align:right;">${row.completedStaffCount}</td>
          <td style="text-align:right;">${row.pendingStaffCount}</td>
          <td style="text-align:right;">${row.completedModules}/${row.totalModules}</td>
          <td style="text-align:right;">${row.completionRate}%</td>
        </tr>
      `)
      .join('');

    const followThroughRows = checklistReport.followThroughRows
      .map((row) => `
        <tr>
          <td>${row.checklistName}</td>
          <td>${row.staffName}</td>
          <td>${row.department}</td>
          <td>${row.status}</td>
        </tr>
      `)
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Mastered IT Review</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { margin: 0 0 10px; }
            p { margin: 0 0 14px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
            th { background: #f5f5f5; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Mastered IT Review</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>

          <h2>Course Completion Review (Filtered)</h2>
          <table>
            <thead>
              <tr>
                <th>Department</th>
                <th style="text-align:right;">Staff</th>
                <th style="text-align:right;">Completed Staff</th>
                <th style="text-align:right;">Incomplete/Pending Staff</th>
                <th style="text-align:right;">Completed Modules</th>
                <th style="text-align:right;">Rate</th>
              </tr>
            </thead>
            <tbody>${departmentRows || '<tr><td colspan="6">No course data loaded.</td></tr>'}</tbody>
          </table>

          <h2>Checklist Completion Follow-through (Filtered)</h2>
          <p>Checklists: ${selectedLabel}</p>
          <table>
            <thead>
              <tr>
                <th>Checklist</th>
                <th>Staff</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${followThroughRows || '<tr><td colspan="4">No follow-through rows for current filters.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mastered IT Review</CardTitle>
          <CardDescription>
            Upload Course Completion and Checklist Completion CSV files to review staff completion, department drill-downs, and filtered follow-through lists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="rounded-md border p-3 text-sm font-medium cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-4 w-4" />
                Course Completion CSV
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => void handleUpload(event, setCourseCsv)}
              />
              <p className="text-xs text-muted-foreground">Contains module completion by staff.</p>
            </label>

            <label className="rounded-md border p-3 text-sm font-medium cursor-pointer hover:border-primary transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="h-4 w-4" />
                Checklist Completion CSV
              </div>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => void handleUpload(event, setChecklistCsv)}
              />
              <p className="text-xs text-muted-foreground">Contains checklist completion rows.</p>
            </label>
          </div>

          <Button variant="outline" onClick={printFilteredReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print Filtered Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Completion Review</CardTitle>
          <CardDescription>Department summary with drill-down for complete and incomplete/pending staff.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <Metric label="Staff" value={String(courseReport.departmentSummary.staffCount)} />
            <Metric label="Modules" value={String(courseReport.departmentSummary.totalModules)} />
            <Metric label="Completion" value={`${courseReport.departmentSummary.completionRate}%`} />
            <Metric label="Completed Staff" value={String(courseReport.departmentSummary.completedStaffCount)} />
            <Metric label="Incomplete/Pending Staff" value={String(courseReport.departmentSummary.pendingStaffCount)} />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-right">Staff</th>
                  <th className="p-2 text-right">Completed Staff</th>
                  <th className="p-2 text-right">Incomplete/Pending Staff</th>
                  <th className="p-2 text-right">Completed Modules</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">Drill-down</th>
                </tr>
              </thead>
              <tbody>
                {courseReport.departmentRows.map((row) => (
                  <tr key={row.department} className="border-t">
                    <td className="p-2">{row.department}</td>
                    <td className="p-2 text-right">{row.staffCount}</td>
                    <td className="p-2 text-right">{row.completedStaffCount}</td>
                    <td className="p-2 text-right">{row.pendingStaffCount}</td>
                    <td className="p-2 text-right">{row.completedModules}/{row.totalModules}</td>
                    <td className="p-2 text-right">{row.completionRate}%</td>
                    <td className="p-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedDepartment((current) => (current === row.department ? null : row.department))}
                      >
                        {expandedDepartment === row.department ? 'Hide' : 'View Staff'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {courseReport.departmentRows.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={7}>Upload course completion CSV to generate this report.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {expandedDepartment && (
            <div className="rounded-md border p-3 space-y-3">
              <p className="font-medium">{expandedDepartment} Staff Drill-down</p>
              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="p-2 text-left">Staff</th>
                      <th className="p-2 text-right">Completed Modules</th>
                      <th className="p-2 text-right">Rate</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseReport.staffRows
                      .filter((row) => row.department === expandedDepartment)
                      .map((row) => (
                        <tr key={`${row.staffName}-${row.department}`} className="border-t">
                          <td className="p-2">{row.staffName}</td>
                          <td className="p-2 text-right">{row.completedModules}/{row.totalModules}</td>
                          <td className="p-2 text-right">{row.completionRate}%</td>
                          <td className="p-2"><Badge variant={row.status === 'Complete' ? 'default' : 'secondary'}>{row.status}</Badge></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Completion Report</CardTitle>
          <CardDescription>Select multiple checklists and drill down to staff/department follow-through needs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Checklist Filter</p>
            <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
              {checklistReport.checklistNames.map((name) => (
                <label key={name} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={selectedChecklists.includes(name)}
                    onCheckedChange={() => toggleChecklist(name)}
                  />
                  <span>{name}</span>
                </label>
              ))}
              {checklistReport.checklistNames.length === 0 && (
                <p className="text-xs text-muted-foreground">Upload checklist completion CSV to enable filters.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedChecklists([])}>Show All</Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedChecklists(checklistReport.checklistNames)}>Select All</Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-2 text-left">Checklist</th>
                  <th className="p-2 text-right">Completed</th>
                  <th className="p-2 text-right">Rate</th>
                </tr>
              </thead>
              <tbody>
                {checklistReport.checklists.map((row) => (
                  <tr key={row.checklistName} className="border-t">
                    <td className="p-2">{row.checklistName}</td>
                    <td className="p-2 text-right">{row.completedItems}/{row.totalItems}</td>
                    <td className="p-2 text-right">{row.completionRate}%</td>
                  </tr>
                ))}
                {checklistReport.checklists.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={3}>No checklist rows match the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-2 text-left">Checklist</th>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {checklistReport.followThroughRows.map((row, index) => (
                  <tr key={`${row.checklistName}-${row.staffName}-${row.department}-${index}`} className="border-t">
                    <td className="p-2">{row.checklistName}</td>
                    <td className="p-2">{row.staffName}</td>
                    <td className="p-2">{row.department}</td>
                    <td className="p-2">{row.status}</td>
                  </tr>
                ))}
                {checklistReport.followThroughRows.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={4}>No follow-through needed for current checklist filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
