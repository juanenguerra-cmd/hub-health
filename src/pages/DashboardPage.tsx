import { useApp } from '@/contexts/AppContext';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  summarizeSessions, 
  computeClosedLoopStats, 
  computeTrendSeries,
  filterSessionsByRange,
  filterActionsByRange,
  summarizeEducation,
  todayYMD,
  dateAddDays
} from '@/lib/calculations';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  GraduationCap,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function DashboardPage() {
  const { 
    sessions, 
    qaActions, 
    eduSessions,
    templates,
    dashFilters, 
    setDashFilters,
    loadDemoData 
  } = useApp();

  const daysAgo = parseInt(dashFilters.range, 10);
  
  // Filter data by range
  const filteredSessions = filterSessionsByRange(sessions, daysAgo).filter(s => {
    if (dashFilters.unit !== 'All' && s.header?.unit !== dashFilters.unit) return false;
    if (dashFilters.tool !== 'All' && s.templateTitle !== dashFilters.tool) return false;
    return s.header?.status === 'complete';
  });

  const filteredActions = filterActionsByRange(qaActions, daysAgo);

  // Compute metrics
  const summary = summarizeSessions(filteredSessions);
  const qaStats = computeClosedLoopStats(filteredActions);
  const trendData = computeTrendSeries(filteredSessions);
  
  // Education stats
  const today = todayYMD();
  const fromDate = daysAgo < 9999 ? dateAddDays(today, -daysAgo) : '';
  const eduStats = summarizeEducation(eduSessions, fromDate, today, dashFilters.unit !== 'All' ? dashFilters.unit : '');

  // Get unique units and tools for filters
  const units = ['All', ...Array.from(new Set(sessions.map(s => s.header?.unit).filter(Boolean))).sort()];
  const tools = ['All', ...Array.from(new Set(templates.map(t => t.title))).sort()];

  // Check if we have data
  const hasData = sessions.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Continuous analytics across all saved audit sessions
          </p>
        </div>
        
        {!hasData && (
          <Button onClick={loadDemoData} className="gap-2">
            <Sparkles className="w-4 h-4" />
            Load Demo Data
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Date Range
              </label>
              <Select 
                value={dashFilters.range} 
                onValueChange={(v) => setDashFilters({ ...dashFilters, range: v })}
              >
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
              <Select 
                value={dashFilters.unit} 
                onValueChange={(v) => setDashFilters({ ...dashFilters, unit: v })}
              >
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
            
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Audit Tool
              </label>
              <Select 
                value={dashFilters.tool} 
                onValueChange={(v) => setDashFilters({ ...dashFilters, tool: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tools.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Grid */}
      <KpiGrid>
        <KpiCard
          label="Sessions"
          value={summary.sessions}
          icon={<FileText className="w-5 h-5" />}
          subtitle="Completed audits"
        />
        <KpiCard
          label="Total Samples"
          value={summary.samples}
          icon={<Target className="w-5 h-5" />}
          subtitle="Patients audited"
        />
        <KpiCard
          label="Compliance Rate"
          value={`${summary.compliance}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          status={summary.compliance >= 90 ? 'success' : summary.compliance >= 70 ? 'warning' : 'error'}
          subtitle="Sample-level"
        />
        <KpiCard
          label="Critical Fails"
          value={summary.criticalFails}
          icon={<AlertTriangle className="w-5 h-5" />}
          status={summary.criticalFails === 0 ? 'success' : 'error'}
          subtitle="Requires action"
        />
      </KpiGrid>

      {/* Infographic */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-transparent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Quality Loop Infographic
          </CardTitle>
          <CardDescription>How audits translate into safer outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="relative rounded-lg border border-border/60 bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Assess</p>
                  <p className="text-xs text-muted-foreground">Capture real-time audits</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{summary.sessions}</span>
                <span className="text-xs text-muted-foreground">sessions completed</span>
              </div>
            </div>
            <div className="relative rounded-lg border border-border/60 bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Act</p>
                  <p className="text-xs text-muted-foreground">Close the loop on QA</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{qaStats.done}</span>
                <span className="text-xs text-muted-foreground">actions closed</span>
              </div>
            </div>
            <div className="relative rounded-lg border border-border/60 bg-background/70 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10 text-warning">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Improve</p>
                  <p className="text-xs text-muted-foreground">Lift compliance results</p>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{summary.compliance}%</span>
                <span className="text-xs text-muted-foreground">current compliance</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          label="Inservices"
          value={eduStats.count}
          icon={<GraduationCap className="w-4 h-4" />}
          subtitle="Completed"
        />
        <KpiCard
          label="QA Open"
          value={qaStats.open + qaStats.prog}
          icon={<Clock className="w-4 h-4" />}
          status={qaStats.open > 10 ? 'warning' : 'neutral'}
        />
        <KpiCard
          label="QA Closed"
          value={qaStats.done}
          icon={<CheckCircle2 className="w-4 h-4" />}
          status="success"
        />
        <KpiCard
          label="Closure Rate"
          value={`${qaStats.closureRate}%`}
          status={qaStats.closureRate >= 80 ? 'success' : qaStats.closureRate >= 60 ? 'warning' : 'error'}
        />
        <KpiCard
          label="Overdue"
          value={qaStats.overdueCount}
          icon={<AlertCircle className="w-4 h-4" />}
          status={qaStats.overdueCount === 0 ? 'success' : 'error'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compliance Trend</CardTitle>
            <CardDescription>Sample-level compliance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="compliance" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No trend data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Critical Fails by Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Critical Fails</CardTitle>
            <CardDescription>Critical failures over time</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="critical" 
                    fill="hsl(var(--error))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tool Performance & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tool Performance</CardTitle>
            <CardDescription>Compliance by audit tool (lowest first)</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.byTool.length > 0 ? (
              <div className="space-y-3">
                {summary.byTool.slice(0, 5).map((tool) => (
                  <div key={tool.title} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{tool.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {tool.passing}/{tool.total} passing • {tool.criticals} critical
                      </p>
                    </div>
                    <ComplianceIndicator rate={tool.rate} showLabel={false} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No audit data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Action Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Action Needed</CardTitle>
            <CardDescription>Most common issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.actionItems.length > 0 ? (
              <div className="space-y-3">
                {summary.actionItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.issue}</p>
                      <p className="text-xs text-muted-foreground">{item.template}</p>
                    </div>
                    <StatusBadge status="error">{item.count}x</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">No action items pending</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QAPI Smart Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            QAPI Smart Summary
          </CardTitle>
          <CardDescription>
            Last {dashFilters.range === '9999' ? 'all time' : `${dashFilters.range} days`} • 
            {dashFilters.unit !== 'All' ? ` Unit ${dashFilters.unit}` : ' All units'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Summary of Findings</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Completed sessions: {summary.sessions} • Samples: {summary.samples} • Compliance: {summary.compliance}%</li>
                <li>Critical fails: {summary.criticalFails} requiring immediate corrective action</li>
                <li>QA closure rate: {qaStats.closureRate}% with {qaStats.overdueCount} overdue items</li>
              </ul>
            </div>
            
            {summary.byTool.length > 0 && summary.byTool[0].rate < 90 && (
              <div>
                <h4 className="font-semibold mb-1">Focus Areas</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {summary.byTool.slice(0, 3).map(t => (
                    <li key={t.title}>
                      <strong>{t.title}</strong>: {t.rate}% compliance - recommend targeted in-service
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-1">Recommendations</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {summary.compliance < 90 && (
                  <li>Prioritize focused re-education on lowest-performing tools</li>
                )}
                {summary.criticalFails > 0 && (
                  <li>Implement immediate corrective action for critical fails</li>
                )}
                {qaStats.overdueCount > 0 && (
                  <li>Clear overdue QA actions; assign owners and document interim controls</li>
                )}
                {summary.compliance >= 90 && summary.criticalFails === 0 && (
                  <li>Maintain performance via continued rounding and targeted coaching</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
