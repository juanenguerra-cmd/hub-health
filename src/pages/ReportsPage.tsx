import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateICReport } from '@/lib/ic-calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  summarizeSessions, 
  computeClosedLoopStats, 
  filterSessionsByRange,
  filterActionsByRange,
  todayYMD,
  dateAddDays
} from '@/lib/calculations';
import { StatusBadge } from '@/components/StatusBadge';
import { PrintableQaActionsReport } from '@/components/reports/PrintableQaActionsReport';
import { StaffPerformanceReport } from '@/components/reports/StaffPerformanceReport';
import { CsvTrainingImportReport } from '@/components/reports/CsvTrainingImportReport';
import { 
  FileText, 
  Download, 
  Printer, 
  ClipboardList, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Shield
} from 'lucide-react';

export function ReportsPage() {
  const { 
    sessions, 
    qaActions, 
    eduSessions, 
    templates, 
    facilityName 
  } = useApp();
  
  const [reportRange, setReportRange] = useState('30');
  const [selectedUnit, setSelectedUnit] = useState('All');
  const [activeReport, setActiveReport] = useState('qapi-summary');
  const [showQaActionsPrint, setShowQaActionsPrint] = useState(false);
  const [showStaffPerformance, setShowStaffPerformance] = useState(false);

  const daysAgo = parseInt(reportRange, 10);
  const today = todayYMD();
  const fromDate = daysAgo < 9999 ? dateAddDays(today, -daysAgo) : '';
  const rangeLabel = daysAgo >= 9999 ? 'All Time' : `Last ${daysAgo} Days`;

  // Filter data
  const filteredSessions = filterSessionsByRange(sessions, daysAgo).filter(s => {
    if (selectedUnit !== 'All' && s.header?.unit !== selectedUnit) return false;
    return s.header?.status === 'complete';
  });
  
  const filteredActions = filterActionsByRange(qaActions, daysAgo).filter(a => {
    if (selectedUnit !== 'All' && a.unit !== selectedUnit) return false;
    return true;
  });

  const filteredEdu = eduSessions.filter(e => {
    if (e.status !== 'completed') return false;
    const dt = (e.completedDate || e.scheduledDate || '').slice(0, 10);
    if (fromDate && dt < fromDate) return false;
    if (selectedUnit !== 'All' && e.unit !== selectedUnit) return false;
    return true;
  });

  // Compute stats
  const summary = summarizeSessions(filteredSessions);
  const qaStats = computeClosedLoopStats(filteredActions);

  // Get unique units
  const units = useMemo(() => {
    const unitSet = new Set<string>();
    sessions.forEach(s => {
      if (s.header?.unit) unitSet.add(s.header.unit);
    });
    return ['All', ...Array.from(unitSet).sort()];
  }, [sessions]);

  // Overdue actions
  const overdueActions = filteredActions.filter(a => {
    if (a.status === 'complete') return false;
    return a.dueDate && a.dueDate < today;
  }).slice(0, 20);

  // Top issues for QAPI
  const topIssues = useMemo(() => {
    const issueMap: Record<string, number> = {};
    for (const a of filteredActions) {
      const key = `${a.templateTitle}: ${a.issue}`;
      issueMap[key] = (issueMap[key] || 0) + 1;
    }
    return Object.entries(issueMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [filteredActions]);


  const projection = useMemo(() => {
    const total = filteredActions.length || 1;
    const closed = filteredActions.filter((a) => a.status === 'complete').length;
    const closureRate = Math.round((closed / total) * 100);
    const overdue = filteredActions.filter((a) => a.status !== 'complete' && a.dueDate && a.dueDate < today).length;
    return {
      closureRate,
      complianceProjection: Math.max(0, Math.min(100, Math.round(summary.compliance + (closureRate - 50) * 0.2))),
      overdueProjection: Math.max(0, overdue - Math.round(closed * 0.15)),
    };
  }, [filteredActions, summary.compliance, today]);

  const pdsaItems = useMemo(() => topIssues.map(([issue]) => ({
    plan: `Review root cause for ${issue}`,
    do: `Assign owner and launch bundle for ${issue}`,
    study: `Check re-audit outcome for ${issue}`,
    act: `Standardize successful intervention for ${issue}`,
  })), [topIssues]);

  const icReport = useMemo(() => generateICReport(sessions, qaActions, eduSessions, templates, 0), [sessions, qaActions, eduSessions, templates]);

  const copyQapiNarrative = async () => {
    const narrative = `QAPI ${rangeLabel}: Compliance ${summary.compliance}%. Closure rate ${qaStats.closureRate}%. Overdue actions ${qaStats.overdueCount}.`; 
    await navigator.clipboard.writeText(narrative);
  };
  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV handler
  const exportQaActionsCsv = () => {
    const rows = [
      ['Created At', 'Status', 'Tool', 'Unit', 'Audit Date', 'Issue', 'Owner', 'Due Date', 'Completed At'].join(',')
    ];
    
    for (const a of filteredActions) {
      rows.push([
        a.createdAt,
        a.status,
        `"${a.templateTitle}"`,
        a.unit,
        a.auditDate,
        `"${a.issue}"`,
        `"${a.owner}"`,
        a.dueDate,
        a.completedAt
      ].join(','));
    }
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qa-actions-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate QAPI summaries, action plans, and huddle reports
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowQaActionsPrint(true)}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Print QA Actions
          </Button>
          <Button variant="outline" onClick={() => setShowStaffPerformance(true)}>
            <Users className="w-4 h-4 mr-2" />
            Staff Performance
          </Button>
          <Button variant="outline" onClick={copyQapiNarrative}>
            <FileText className="w-4 h-4 mr-2" />
            Copy QAPI Narrative
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Current
          </Button>
          <Button variant="outline" onClick={exportQaActionsCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Date Range
              </label>
              <Select value={reportRange} onValueChange={setReportRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last 12 months</SelectItem>
                  <SelectItem value="9999">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Unit
              </label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeReport} onValueChange={setActiveReport}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="qapi-summary">QAPI Summary</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="huddle">Huddle Report</TabsTrigger>
          <TabsTrigger value="ic-safety">IC Safety</TabsTrigger>
          <TabsTrigger value="csv-import">CSV Imports</TabsTrigger>
        </TabsList>

        {/* QAPI Summary Report */}
        <TabsContent value="qapi-summary">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>QAPI Summary Report</CardTitle>
                  <CardDescription>
                    {facilityName} • {rangeLabel} • {selectedUnit === 'All' ? 'All Units' : `Unit ${selectedUnit}`}
                  </CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Executive Summary */}
              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Executive Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{summary.sessions}</p>
                    <p className="text-sm text-muted-foreground">Audits Completed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{summary.samples}</p>
                    <p className="text-sm text-muted-foreground">Samples Reviewed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className={`text-2xl font-bold ${summary.compliance >= 90 ? 'text-success' : summary.compliance >= 70 ? 'text-warning' : 'text-error'}`}>
                      {summary.compliance}%
                    </p>
                    <p className="text-sm text-muted-foreground">Compliance Rate</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className={`text-2xl font-bold ${summary.criticalFails === 0 ? 'text-success' : 'text-error'}`}>
                      {summary.criticalFails}
                    </p>
                    <p className="text-sm text-muted-foreground">Critical Fails</p>
                  </div>
                </div>
              </section>

              {/* QA Closed-Loop Status */}
              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Closed-Loop QA Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{qaStats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Actions</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold text-warning">{qaStats.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold text-primary">{qaStats.prog}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold text-success">{qaStats.done}</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className={`text-xl font-bold ${qaStats.overdueCount > 0 ? 'text-error' : 'text-success'}`}>
                      {qaStats.overdueCount}
                    </p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  Closure Rate: <strong>{qaStats.closureRate}%</strong> • 
                  Avg. Time to Close: <strong>{qaStats.avgCloseDays} days</strong>
                </div>
              </section>

              {/* Top Issues */}
              {topIssues.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Top Issues Identified
                  </h3>
                  <div className="space-y-2">
                    {topIssues.map(([issue, count], idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                        <span className="text-sm">{issue}</span>
                        <StatusBadge status={count >= 5 ? 'error' : count >= 3 ? 'warning' : 'info'}>
                          {count}x
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly/Monthly Projection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border">Projected Compliance: <strong>{projection.complianceProjection}%</strong></div>
                  <div className="p-3 rounded-lg border">Projected Closure Rate: <strong>{projection.closureRate}%</strong></div>
                  <div className="p-3 rounded-lg border">Projected Overdue Load: <strong>{projection.overdueProjection}</strong></div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3">PDSA Action List</h3>
                <div className="space-y-2">
                  {pdsaItems.length === 0 ? <p className="text-sm text-muted-foreground">No current issues to convert into PDSA actions.</p> : pdsaItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border text-sm">
                      <p><strong>Plan:</strong> {item.plan}</p>
                      <p><strong>Do:</strong> {item.do}</p>
                      <p><strong>Study:</strong> {item.study}</p>
                      <p><strong>Act:</strong> {item.act}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Tool Performance */}
              {summary.byTool.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance by Audit Tool
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Tool</th>
                          <th className="text-center p-2">Samples</th>
                          <th className="text-center p-2">Passing</th>
                          <th className="text-center p-2">Rate</th>
                          <th className="text-center p-2">Critical</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.byTool.map((tool, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{tool.title}</td>
                            <td className="text-center p-2">{tool.total}</td>
                            <td className="text-center p-2">{tool.passing}</td>
                            <td className="text-center p-2">
                              <StatusBadge status={tool.rate >= 90 ? 'success' : tool.rate >= 70 ? 'warning' : 'error'}>
                                {tool.rate}%
                              </StatusBadge>
                            </td>
                            <td className="text-center p-2">{tool.criticals}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Education Summary */}
              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Education Summary
                </h3>
                <p className="text-sm">
                  <strong>{filteredEdu.length}</strong> inservice session(s) completed during this period.
                </p>
              </section>

              {/* Recommendations */}
              <section className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {summary.compliance < 90 && (
                    <li>Prioritize focused re-education on tools with compliance below 90%</li>
                  )}
                  {summary.criticalFails > 0 && (
                    <li>Implement immediate corrective action for {summary.criticalFails} critical fail(s)</li>
                  )}
                  {qaStats.overdueCount > 0 && (
                    <li>Clear {qaStats.overdueCount} overdue QA action(s); assign owners and document interim controls</li>
                  )}
                  {summary.compliance >= 90 && summary.criticalFails === 0 && (
                    <li>Maintain performance via continued rounding and targeted coaching</li>
                  )}
                  <li>Continue monitoring and re-audit as scheduled</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Plan Report */}
        <TabsContent value="action-plan">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>QA Action Plan</CardTitle>
                  <CardDescription>
                    {facilityName} • {rangeLabel} • {selectedUnit === 'All' ? 'All Units' : `Unit ${selectedUnit}`}
                  </CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {filteredActions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No QA actions in this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Issue</th>
                        <th className="text-left p-2">Tool</th>
                        <th className="text-center p-2">Unit</th>
                        <th className="text-center p-2">Owner</th>
                        <th className="text-center p-2">Due</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions.slice(0, 50).map((action) => {
                        const isOverdue = action.status !== 'complete' && action.dueDate && action.dueDate < today;
                        
                        return (
                          <tr key={action.id} className="border-b">
                            <td className="p-2">{action.issue}</td>
                            <td className="p-2 text-muted-foreground">{action.templateTitle}</td>
                            <td className="text-center p-2">{action.unit || '—'}</td>
                            <td className="text-center p-2">{action.owner || 'Unassigned'}</td>
                            <td className="text-center p-2">
                              <span className={isOverdue ? 'text-error' : ''}>
                                {action.dueDate || '—'}
                              </span>
                            </td>
                            <td className="text-center p-2">
                              <StatusBadge 
                                status={
                                  action.status === 'complete' ? 'success' : 
                                  isOverdue ? 'error' : 
                                  action.status === 'in_progress' ? 'info' : 'warning'
                                }
                              >
                                {action.status === 'complete' ? 'Done' : 
                                 action.status === 'in_progress' ? 'WIP' : 
                                 isOverdue ? 'Overdue' : 'Open'}
                              </StatusBadge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Huddle Report */}
        <TabsContent value="huddle">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Daily Huddle Report</CardTitle>
                  <CardDescription>
                    {facilityName} • {today} • {selectedUnit === 'All' ? 'All Units' : `Unit ${selectedUnit}`}
                  </CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date().toLocaleString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{qaStats.open + qaStats.prog}</p>
                  <p className="text-sm text-muted-foreground">Active Actions</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className={`text-2xl font-bold ${qaStats.overdueCount > 0 ? 'text-error' : 'text-success'}`}>
                    {qaStats.overdueCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{summary.compliance}%</p>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{summary.criticalFails}</p>
                  <p className="text-sm text-muted-foreground">Critical Fails</p>
                </div>
              </div>

              {/* Overdue Items */}
              {overdueActions.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-error">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue Items Requiring Attention
                  </h3>
                  <div className="space-y-2">
                    {overdueActions.map((action) => (
                      <div key={action.id} className="p-3 rounded-lg border border-error/30 bg-error/5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{action.issue}</p>
                            <p className="text-sm text-muted-foreground">
                              {action.templateTitle} • Unit {action.unit || 'N/A'} • 
                              Due: {action.dueDate}
                            </p>
                          </div>
                          <StatusBadge status="error">
                            {action.owner || 'Unassigned'}
                          </StatusBadge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Focus Areas */}
              <section>
                <h3 className="font-semibold text-lg mb-3">Today's Focus Areas</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {qaStats.overdueCount > 0 && (
                    <li className="text-error">
                      Address {qaStats.overdueCount} overdue QA action(s) - assign owners and set new target dates
                    </li>
                  )}
                  {summary.byTool.filter(t => t.rate < 90).slice(0, 3).map((tool, idx) => (
                    <li key={idx}>
                      Focus on <strong>{tool.title}</strong> compliance ({tool.rate}% - below threshold)
                    </li>
                  ))}
                  {summary.criticalFails > 0 && (
                    <li className="text-error">
                      Review {summary.criticalFails} critical failure(s) and implement corrective actions
                    </li>
                  )}
                  {qaStats.overdueCount === 0 && summary.criticalFails === 0 && summary.compliance >= 90 && (
                    <li className="text-success">
                      All metrics within target - maintain current practices
                    </li>
                  )}
                </ul>
              </section>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Infection Control Safety Meeting Report */}
        <TabsContent value="ic-safety">
          <Card className="print:shadow-none print:border-0">
            <CardHeader className="print:pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Infection Control Safety Meeting Report
                  </CardTitle>
                  <CardDescription>
                    {facilityName} • {icReport.period.label} • {selectedUnit === 'All' ? 'All Units' : `Unit ${selectedUnit}`}
                  </CardDescription>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated: {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Executive Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{icReport.summary.totalAudits}</p>
                    <p className="text-sm text-muted-foreground">IC Audits</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-2xl font-bold">{icReport.summary.totalSamples}</p>
                    <p className="text-sm text-muted-foreground">Samples Reviewed</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <p className={`text-2xl font-bold ${icReport.summary.complianceRate >= 90 ? 'text-success' : icReport.summary.complianceRate >= 75 ? 'text-warning' : 'text-error'}`}>
                        {icReport.summary.complianceRate}%
                      </p>
                      {icReport.summary.priorMonthComparison.complianceChange !== 0 && (
                        <span className={`text-xs ${icReport.summary.priorMonthComparison.complianceChange > 0 ? 'text-success' : 'text-error'}`}>
                          {icReport.summary.priorMonthComparison.complianceChange > 0 ? '+' : ''}
                          {icReport.summary.priorMonthComparison.complianceChange}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">IC Compliance</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <p className={`text-2xl font-bold ${icReport.summary.criticalFails === 0 ? 'text-success' : 'text-error'}`}>
                        {icReport.summary.criticalFails}
                      </p>
                      {icReport.summary.priorMonthComparison.criticalFailsChange !== 0 && (
                        <span className={`text-xs ${icReport.summary.priorMonthComparison.criticalFailsChange < 0 ? 'text-success' : 'text-error'}`}>
                          {icReport.summary.priorMonthComparison.criticalFailsChange > 0 ? '+' : ''}
                          {icReport.summary.priorMonthComparison.criticalFailsChange}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Critical Fails</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  6-Month Infection Control Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={icReport.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} name="Compliance %" />
                    <Line yAxisId="right" type="monotone" dataKey="criticals" stroke="#ef4444" strokeWidth={2} name="Critical Fails" />
                    <Line yAxisId="right" type="monotone" dataKey="actions" stroke="#f59e0b" strokeWidth={2} name="QA Actions" />
                  </LineChart>
                </ResponsiveContainer>
              </section>

              {icReport.byTemplate.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Performance by IC Audit Tool
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Audit Tool</th>
                          <th className="text-center p-2">Samples</th>
                          <th className="text-center p-2">Compliance</th>
                          <th className="text-center p-2">Critical Fails</th>
                          <th className="text-center p-2">F-Tags</th>
                          <th className="text-center p-2">Trend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {icReport.byTemplate.map((tool) => (
                          <tr key={tool.templateId} className="border-b">
                            <td className="p-2 font-medium">{tool.templateTitle}</td>
                            <td className="text-center p-2">{tool.samples}</td>
                            <td className="text-center p-2">
                              <StatusBadge status={tool.rate >= 90 ? 'success' : tool.rate >= 75 ? 'warning' : 'error'}>
                                {tool.rate}%
                              </StatusBadge>
                            </td>
                            <td className="text-center p-2">
                              <span className={tool.criticals > 0 ? 'text-error font-semibold' : ''}>{tool.criticals}</span>
                            </td>
                            <td className="text-center p-2">
                              <div className="flex flex-wrap gap-1 justify-center">
                                {tool.ftags.slice(0, 3).map((ftag) => (
                                  <Badge key={ftag} variant="outline" className="text-xs">
                                    {ftag}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="text-center p-2">
                              {tool.trend === 'improving' && <TrendingUp className="w-4 h-4 text-success inline" />}
                              {tool.trend === 'declining' && <TrendingDown className="w-4 h-4 text-error inline" />}
                              {tool.trend === 'stable' && <span className="text-muted-foreground text-xs">Stable</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {icReport.byFTag.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    CMS F-Tag Compliance (F880-F888)
                  </h3>
                  <div className="space-y-2">
                    {icReport.byFTag.map((ftag) => (
                      <div key={ftag.ftag} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <p className="font-medium">{ftag.ftag}: {ftag.description}</p>
                          <p className="text-sm text-muted-foreground">{ftag.audits} audit(s) conducted</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-xl font-bold ${ftag.status === 'compliant' ? 'text-success' : ftag.status === 'at-risk' ? 'text-warning' : 'text-error'}`}>
                              {ftag.compliance}%
                            </p>
                          </div>
                          <StatusBadge status={ftag.status === 'compliant' ? 'success' : ftag.status === 'at-risk' ? 'warning' : 'error'}>
                            {ftag.status === 'compliant' ? 'Compliant' : ftag.status === 'at-risk' ? 'At Risk' : 'Non-Compliant'}
                          </StatusBadge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  IC Education & Training
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{icReport.education.sessionsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Sessions Completed</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{icReport.education.topicsCount}</p>
                    <p className="text-xs text-muted-foreground">Unique Topics</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{icReport.education.attendanceTotal}</p>
                    <p className="text-xs text-muted-foreground">Total Attendance</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className={`text-xl font-bold ${icReport.education.effectiveness >= 75 ? 'text-success' : 'text-warning'}`}>
                      {icReport.education.effectiveness}%
                    </p>
                    <p className="text-xs text-muted-foreground">QA Resolution Rate</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{icReport.education.linkedToQA} QA action(s) linked to education sessions</p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  IC-Related QA Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{icReport.qaActions.total}</p>
                    <p className="text-xs text-muted-foreground">Total Actions</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold text-warning">{icReport.qaActions.open}</p>
                    <p className="text-xs text-muted-foreground">Open</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className={`text-xl font-bold ${icReport.qaActions.overdue > 0 ? 'text-error' : 'text-success'}`}>
                      {icReport.qaActions.overdue}
                    </p>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold text-success">{icReport.qaActions.closed}</p>
                    <p className="text-xs text-muted-foreground">Closed</p>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <p className="text-xl font-bold">{icReport.qaActions.avgDaysToClose}</p>
                    <p className="text-xs text-muted-foreground">Avg Days to Close</p>
                  </div>
                </div>
              </section>

              {icReport.qaActions.recurringIssues.length > 0 && (
                <section>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-error">
                    <AlertTriangle className="w-5 h-5" />
                    Recurring IC Issues (Systemic Concerns)
                  </h3>
                  <div className="space-y-2">
                    {icReport.qaActions.recurringIssues.map((issue) => (
                      <div key={`${issue.issue}-${issue.count}`} className="p-3 rounded-lg border border-error/30 bg-error/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{issue.issue}</p>
                            <p className="text-sm text-muted-foreground">Found in: {issue.templates.join(', ')}</p>
                          </div>
                          <Badge variant="destructive">{issue.count}x occurrences</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-sm font-medium">⚠️ Action Required:</p>
                    <p className="text-sm">Recurring issues indicate potential systemic problems. Convene multidisciplinary team to conduct root cause analysis and implement system-level interventions.</p>
                  </div>
                </section>
              )}

              <section className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-semibold text-lg mb-3">Safety Meeting Discussion Points</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  {icReport.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </section>

              <section className="p-4 rounded-lg bg-muted/30 border">
                <h3 className="font-semibold text-sm mb-2">📋 Regulatory Documentation Notes</h3>
                <p className="text-xs text-muted-foreground">
                  This report supports CMS F880 (Infection Prevention & Control Program) requirements for ongoing monitoring,
                  analysis, and corrective action. Retain with QAPI committee meeting minutes. Next IP quarterly report due: [DATE].
                </p>
              </section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="csv-import">
          <CsvTrainingImportReport />
        </TabsContent>
      </Tabs>

      {/* Print Modals */}
      <PrintableQaActionsReport
        open={showQaActionsPrint}
        onOpenChange={setShowQaActionsPrint}
        actions={filteredActions}
        title={`QA Actions Report - ${rangeLabel}`}
      />

      <StaffPerformanceReport
        open={showStaffPerformance}
        onOpenChange={setShowStaffPerformance}
        dateRange={fromDate ? { from: fromDate, to: today } : undefined}
      />
    </div>
  );
}
