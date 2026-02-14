import { useMemo, useState, type ChangeEvent } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [selectedChecklist, setSelectedChecklist] = useState('All');

  const courseReport: CourseCompletionReport = useMemo(
    () => buildCourseCompletionReport(courseCsv),
    [courseCsv]
  );

  const checklistReport = useMemo(
    () => buildChecklistCompletionReport(checklistCsv, selectedChecklist),
    [checklistCsv, selectedChecklist]
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>CSV Imports for Department Training</CardTitle>
          <CardDescription>
            Upload a Course Completion report and a Checklist Completion report to get staff-level review, department performance, and checklist completion filters.
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Completion Review</CardTitle>
          <CardDescription>Per staff results and overall department performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label="Staff" value={String(courseReport.departmentSummary.staffCount)} />
            <Metric label="Modules" value={String(courseReport.departmentSummary.totalModules)} />
            <Metric label="Completion" value={`${courseReport.departmentSummary.completionRate}%`} />
            <Metric label="Avg Score" value={`${courseReport.departmentSummary.averageScore}%`} />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Department</th>
                  <th className="p-2 text-right">Completed</th>
                  <th className="p-2 text-right">Rate</th>
                  <th className="p-2 text-right">Avg Score</th>
                  <th className="p-2 text-left">Review</th>
                </tr>
              </thead>
              <tbody>
                {courseReport.staffRows.map((row) => (
                  <tr key={`${row.staffName}-${row.department}`} className="border-t">
                    <td className="p-2">{row.staffName}</td>
                    <td className="p-2">{row.department}</td>
                    <td className="p-2 text-right">{row.completedModules}/{row.totalModules}</td>
                    <td className="p-2 text-right">{row.completionRate}%</td>
                    <td className="p-2 text-right">{row.averageScore}%</td>
                    <td className="p-2 text-xs text-muted-foreground">{row.reviewNotes[0] || '—'}</td>
                  </tr>
                ))}
                {courseReport.staffRows.length === 0 && (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={6}>Upload course completion CSV to generate this report.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Checklist Completion Report</CardTitle>
          <CardDescription>Filter report completion by checklist name.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 max-w-sm">
            <Select value={selectedChecklist} onValueChange={setSelectedChecklist}>
              <SelectTrigger>
                <SelectValue placeholder="Select checklist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Checklists</SelectItem>
                {checklistReport.checklistNames.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setSelectedChecklist('All')}>Reset</Button>
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
                    <td className="p-3 text-muted-foreground" colSpan={3}>Upload checklist completion CSV to generate this report.</td>
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
