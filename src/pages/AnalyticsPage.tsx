import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  computeHeatmap, 
  computeClosedLoopStats, 
  summarizeSessions,
  filterSessionsByRange,
  filterActionsByRange,
  todayYMD,
  dateAddDays
} from '@/lib/calculations';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { getAllUnitOptions, matchesUnitOrWings } from '@/types/facility-units';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { cn } from '@/lib/utils';
import { Building2, ChevronRight } from 'lucide-react';

export function AnalyticsPage() {
  const { sessions, qaActions, eduSessions, analyticsFilters, setAnalyticsFilters, facilityUnits } = useApp();
  
  const daysAgo = parseInt(analyticsFilters.range || '30', 10);
  const today = todayYMD();
  const fromDate = daysAgo < 9999 ? dateAddDays(today, -daysAgo) : '';
  
  // Filter data
  const filteredSessions = filterSessionsByRange(sessions, daysAgo).filter(s => {
    if (analyticsFilters.unit !== 'All') {
      // Check if session unit matches the filter or is a wing of the filter unit
      if (!matchesUnitOrWings(facilityUnits, analyticsFilters.unit, s.header?.unit || '')) {
        return false;
      }
    }
    return s.header?.status === 'complete';
  });
  
  const filteredActions = filterActionsByRange(qaActions, daysAgo);

  // Compute analytics
  const summary = summarizeSessions(filteredSessions);
  const qaStats = computeClosedLoopStats(filteredActions);
  const heatmap = computeHeatmap(filteredSessions);

  // Get unique units from sessions for filter dropdown
  const units = useMemo(() => {
    const unitSet = new Set<string>();
    sessions.forEach(s => {
      if (s.header?.unit) unitSet.add(s.header.unit);
    });
    // Also add configured facility units (parent units)
    facilityUnits.forEach(u => unitSet.add(u.name));
    return ['All', ...Array.from(unitSet).sort()];
  }, [sessions, facilityUnits]);

  // Compute unit compliance with drill-down for wings
  const unitComplianceData = useMemo(() => {
    const completeSessions = filterSessionsByRange(sessions, daysAgo).filter(s => s.header?.status === 'complete');
    
    // Group sessions by parent unit
    const parentStats: Record<string, { 
      samples: number; 
      passing: number; 
      criticals: number;
      wings: Record<string, { samples: number; passing: number; criticals: number }> 
    }> = {};
    
    for (const session of completeSessions) {
      const sessionUnit = session.header?.unit || 'Unknown';
      
      // Find parent unit
      let parentName = sessionUnit;
      let wingName: string | null = null;
      
      for (const unit of facilityUnits) {
        if (unit.name === sessionUnit) {
          parentName = unit.name;
          break;
        }
        if (unit.wings.includes(sessionUnit)) {
          parentName = unit.name;
          wingName = sessionUnit;
          break;
        }
      }
      
      // Initialize parent if not exists
      if (!parentStats[parentName]) {
        parentStats[parentName] = { samples: 0, passing: 0, criticals: 0, wings: {} };
      }
      
      // Count samples
      for (const sample of session.samples) {
        if (!sample.result) continue;
        
        parentStats[parentName].samples++;
        if (sample.result.pass) parentStats[parentName].passing++;
        if (sample.result.criticalFails.length > 0) parentStats[parentName].criticals++;
        
        // Track wing stats if applicable
        if (wingName) {
          if (!parentStats[parentName].wings[wingName]) {
            parentStats[parentName].wings[wingName] = { samples: 0, passing: 0, criticals: 0 };
          }
          parentStats[parentName].wings[wingName].samples++;
          if (sample.result.pass) parentStats[parentName].wings[wingName].passing++;
          if (sample.result.criticalFails.length > 0) parentStats[parentName].wings[wingName].criticals++;
        }
      }
    }
    
    return Object.entries(parentStats)
      .map(([name, stats]) => ({
        name,
        samples: stats.samples,
        passing: stats.passing,
        criticals: stats.criticals,
        rate: stats.samples > 0 ? Math.round((stats.passing / stats.samples) * 100) : 0,
        wings: Object.entries(stats.wings).map(([wingName, wingStats]) => ({
          name: wingName,
          samples: wingStats.samples,
          passing: wingStats.passing,
          criticals: wingStats.criticals,
          rate: wingStats.samples > 0 ? Math.round((wingStats.passing / wingStats.samples) * 100) : 0
        }))
      }))
      .filter(u => u.samples > 0)
      .sort((a, b) => b.samples - a.samples);
  }, [sessions, facilityUnits, daysAgo]);

  // Recurring issues data
  const recurringIssues = useMemo(() => {
    const issueMap: Record<string, { issue: string; template: string; count: number; firstSeen: string; lastSeen: string }> = {};
    
    for (const action of filteredActions) {
      const key = `${action.templateTitle}|${action.issue}`;
      if (!issueMap[key]) {
        issueMap[key] = {
          issue: action.issue,
          template: action.templateTitle,
          count: 0,
          firstSeen: action.createdAt,
          lastSeen: action.createdAt
        };
      }
      issueMap[key].count++;
      if (action.createdAt < issueMap[key].firstSeen) {
        issueMap[key].firstSeen = action.createdAt;
      }
      if (action.createdAt > issueMap[key].lastSeen) {
        issueMap[key].lastSeen = action.createdAt;
      }
    }
    
    return Object.values(issueMap)
      .filter(x => x.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredActions]);

  // Time-to-close distribution
  const timeToCloseData = useMemo(() => {
    const buckets = {
      '≤7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '>30 days': 0
    };
    
    for (const action of filteredActions) {
      if (action.status !== 'complete' || !action.completedAt) continue;
      
      const created = new Date(action.createdAt);
      const completed = new Date(action.completedAt);
      const days = Math.ceil((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      
      if (days <= 7) buckets['≤7 days']++;
      else if (days <= 14) buckets['8-14 days']++;
      else if (days <= 30) buckets['15-30 days']++;
      else buckets['>30 days']++;
    }
    
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [filteredActions]);

  // QA Status distribution
  const qaStatusData = useMemo(() => [
    { name: 'Open', value: qaStats.open, color: 'hsl(var(--warning))' },
    { name: 'In Progress', value: qaStats.prog, color: 'hsl(var(--primary))' },
    { name: 'Complete', value: qaStats.done, color: 'hsl(var(--success))' }
  ], [qaStats]);

  // Owner performance
  const ownerPerformance = useMemo(() => {
    return Object.entries(qaStats.byOwner)
      .map(([owner, stats]) => ({
        owner,
        open: stats.open,
        inProgress: stats.in_progress,
        complete: stats.complete,
        overdue: stats.overdue,
        total: stats.open + stats.in_progress + stats.complete
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [qaStats]);

  // Education by category
  const eduByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    
    for (const edu of eduSessions) {
      if (edu.status !== 'completed') continue;
      const date = (edu.completedDate || edu.scheduledDate || '').slice(0, 10);
      if (fromDate && date < fromDate) continue;
      
      const cat = edu.category || 'Other';
      cats[cat] = (cats[cat] || 0) + 1;
    }
    
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [eduSessions, fromDate]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--error))', 'hsl(var(--muted-foreground))'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Deep insights into compliance, issues, and performance
          </p>
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
              <Select 
                value={analyticsFilters.range} 
                onValueChange={(v) => setAnalyticsFilters({ ...analyticsFilters, range: v })}
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
                value={analyticsFilters.unit} 
                onValueChange={(v) => setAnalyticsFilters({ ...analyticsFilters, unit: v })}
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
          </div>
        </CardContent>
      </Card>

      {/* Compliance Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compliance Heatmap</CardTitle>
          <CardDescription>Tool × Unit compliance rates (click to drill down)</CardDescription>
        </CardHeader>
        <CardContent>
          {heatmap.tools.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit data available for heatmap
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium">Tool</th>
                    {heatmap.units.map(unit => (
                      <th key={unit} className="text-center p-2 font-medium">{unit}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.tools.map(tool => (
                    <tr key={tool}>
                      <td className="p-2 font-medium truncate max-w-[200px]" title={tool}>{tool}</td>
                      {heatmap.units.map(unit => {
                        const cell = heatmap.data[tool]?.[unit];
                        if (!cell) {
                          return <td key={unit} className="text-center p-2 text-muted-foreground">—</td>;
                        }
                        
                        const bgColor = cell.rate >= 90 
                          ? 'bg-success/20' 
                          : cell.rate >= 70 
                            ? 'bg-warning/20' 
                            : 'bg-error/20';
                        
                        return (
                          <td 
                            key={unit} 
                            className={cn("text-center p-2 cursor-pointer hover:opacity-80", bgColor)}
                            title={`${cell.passing}/${cell.total} passing • ${cell.critical} critical`}
                          >
                            <span className="font-medium">{cell.rate}%</span>
                            <span className="text-xs text-muted-foreground block">
                              {cell.total} samples
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Compliance Summary with Wing Drill-Down */}
      {unitComplianceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Unit Compliance Summary
            </CardTitle>
            <CardDescription>Parent unit compliance with wing breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitComplianceData.map(unit => (
                <div 
                  key={unit.name} 
                  className={cn(
                    "p-4 rounded-lg border",
                    unit.rate >= 90 ? "bg-success/5 border-success/20" :
                    unit.rate >= 70 ? "bg-warning/5 border-warning/20" :
                    "bg-error/5 border-error/20"
                  )}
                >
                  {/* Parent Unit Header */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{unit.name}</h3>
                    <ComplianceIndicator rate={unit.rate} size="sm" />
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3">
                    {unit.passing}/{unit.samples} samples passing
                    {unit.criticals > 0 && (
                      <span className="text-error ml-2">• {unit.criticals} critical</span>
                    )}
                  </div>
                  
                  {/* Wing Breakdown */}
                  {unit.wings.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Wing Breakdown
                      </p>
                      {unit.wings.map(wing => (
                        <div 
                          key={wing.name}
                          className="flex items-center justify-between text-sm bg-background/50 rounded px-2 py-1.5"
                        >
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <span>{wing.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {wing.passing}/{wing.samples}
                            </span>
                            <Badge 
                              variant={wing.rate >= 90 ? "default" : wing.rate >= 70 ? "secondary" : "destructive"}
                              className="text-xs px-1.5 py-0"
                            >
                              {wing.rate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring Issues</CardTitle>
            <CardDescription>Issues appearing multiple times</CardDescription>
          </CardHeader>
          <CardContent>
            {recurringIssues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recurring issues detected
              </div>
            ) : (
              <div className="space-y-3">
                {recurringIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{issue.issue}</p>
                      <p className="text-xs text-muted-foreground">{issue.template}</p>
                    </div>
                    <StatusBadge status={issue.count >= 5 ? 'error' : issue.count >= 3 ? 'warning' : 'info'}>
                      {issue.count}x
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time to Close Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Time to Close</CardTitle>
            <CardDescription>QA action closure distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {timeToCloseData.every(d => d.value === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed actions in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timeToCloseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
            
            <div className="mt-4 pt-4 border-t text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. time to close:</span>
                <span className="font-medium">{qaStats.avgCloseDays} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QA Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">QA Action Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {qaStats.total === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No QA actions in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={qaStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {qaStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-muted-foreground">Closure Rate</p>
                <p className="font-semibold text-lg">{qaStats.closureRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Overdue</p>
                <p className={cn("font-semibold text-lg", qaStats.overdueCount > 0 && "text-error")}>
                  {qaStats.overdueCount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-lg">{qaStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner Performance</CardTitle>
            <CardDescription>QA actions by assigned owner</CardDescription>
          </CardHeader>
          <CardContent>
            {ownerPerformance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No owner data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ownerPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="owner" 
                    type="category" 
                    tick={{ fontSize: 11 }} 
                    stroke="hsl(var(--muted-foreground))"
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="complete" stackId="a" fill="hsl(var(--success))" />
                  <Bar dataKey="inProgress" stackId="a" fill="hsl(var(--primary))" />
                  <Bar dataKey="open" stackId="a" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Education Categories */}
      {eduByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Education by Category</CardTitle>
            <CardDescription>Completed inservices by topic category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eduByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }} 
                  stroke="hsl(var(--muted-foreground))"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}