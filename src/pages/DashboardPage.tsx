import { useApp } from '@/contexts/AppContext';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
  TrendingDown,
  Bug,
  Activity,
  Plus,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

type CaseEntry = {
  id: string;
  date: string;
  unit: string;
  sourceConditions: string[];
  pathogens: string[];
};

function PillInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const addDraft = () => {
    const cleaned = draft.trim().replace(/,$/, '');
    if (!cleaned || values.includes(cleaned)) return;
    onChange([...values, cleaned]);
    setDraft('');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-md border border-input bg-background p-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map(value => (
            <Badge key={value} variant="secondary" className="gap-1 rounded-full px-3 py-1">
              {value}
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => onChange(values.filter(item => item !== value))}
                aria-label={`Remove ${value}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ',') {
                event.preventDefault();
                addDraft();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addDraft}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

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

  const infographicSteps = useMemo(() => ([
    {
      id: 'assess',
      title: 'Assess',
      description: 'Capture real-time audits',
      stat: `${summary.sessions}`,
      statLabel: 'sessions completed',
      icon: ClipboardCheck,
      tone: 'primary',
      recommendation: 'Expand rounding coverage to high-risk shifts and focus on repeat findings.',
      insight: 'Audit volume drives clearer trends and faster escalation.',
    },
    {
      id: 'act',
      title: 'Act',
      description: 'Close the loop on QA',
      stat: `${qaStats.done}`,
      statLabel: 'actions closed',
      icon: ShieldCheck,
      tone: 'success',
      recommendation: 'Prioritize actions tied to critical fails and assign owners with due dates.',
      insight: 'Timely closures reduce recurrence and keep compliance stable.',
    },
    {
      id: 'improve',
      title: 'Improve',
      description: 'Lift compliance results',
      stat: `${summary.compliance}%`,
      statLabel: 'current compliance',
      icon: TrendingDown,
      tone: 'warning',
      recommendation: 'Target in-services for the bottom two topics this month.',
      insight: 'Training lifts sustained compliance and lowers critical failures.',
    },
  ]), [qaStats.done, summary.compliance, summary.sessions]);
  const [activeInfographicStep, setActiveInfographicStep] = useState(infographicSteps[0]?.id ?? 'assess');
  const activeStep = infographicSteps.find(step => step.id === activeInfographicStep) ?? infographicSteps[0];

  const censusByUnit = [
    { unit: 'Unit A', census: 24 },
    { unit: 'Unit B', census: 18 },
    { unit: 'Unit C', census: 27 },
    { unit: 'Unit D', census: 15 },
  ];

  const abtDistribution = [
    { name: 'Cephalosporins', value: 18 },
    { name: 'Penicillins', value: 13 },
    { name: 'Fluoroquinolones', value: 7 },
    { name: 'Macrolides', value: 5 },
  ];

  const isolationHeatMap = [
    { unit: 'Unit A', isolation: 8, ebp: 12 },
    { unit: 'Unit B', isolation: 4, ebp: 9 },
    { unit: 'Unit C', isolation: 10, ebp: 14 },
    { unit: 'Unit D', isolation: 3, ebp: 6 },
  ];

  const [ipCases, setIpCases] = useState<CaseEntry[]>([]);
  const [caseForm, setCaseForm] = useState<Omit<CaseEntry, 'id'>>({
    date: today,
    unit: units.find(unit => unit !== 'All') ?? 'Unit A',
    sourceConditions: [],
    pathogens: [],
  });

  const reportBySource = useMemo(() => {
    const counts = new Map<string, number>();
    ipCases.forEach(entry => {
      entry.sourceConditions.forEach(condition => {
        counts.set(condition, (counts.get(condition) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [ipCases]);

  const reportByPathogen = useMemo(() => {
    const counts = new Map<string, number>();
    ipCases.forEach(entry => {
      entry.pathogens.forEach(pathogen => {
        counts.set(pathogen, (counts.get(pathogen) ?? 0) + 1);
      });
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [ipCases]);

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Infection Prevention Infographic
          </CardTitle>
          <CardDescription>Desktop hover cards for census, ABT class distribution, and isolation/EBP heat map.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:border-primary/60 hover:bg-primary/5">
                <p className="text-sm font-semibold">Census per Unit</p>
                <p className="text-xs text-muted-foreground">Hover to view census graphic</p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-[320px]">
              <p className="mb-3 text-sm font-semibold">Current census by unit</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={censusByUnit}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="unit" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="census" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:border-primary/60 hover:bg-primary/5">
                <p className="text-sm font-semibold">ABT Distribution</p>
                <p className="text-xs text-muted-foreground">Hover to view med class numbers</p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-[320px]">
              <p className="mb-3 text-sm font-semibold">Antibiotic class mix</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={abtDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {abtDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={["#4f46e5", "#0284c7", "#f59e0b", "#16a34a"][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1 text-xs">
                {abtDistribution.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="rounded-lg border border-border/60 bg-background p-4 text-left transition hover:border-primary/60 hover:bg-primary/5">
                <p className="text-sm font-semibold">IP Cases Heat Map</p>
                <p className="text-xs text-muted-foreground">Hover to view isolation + EBP by unit</p>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-[360px]">
              <p className="mb-3 text-sm font-semibold">Isolation / EBP load</p>
              <div className="space-y-2">
                {isolationHeatMap.map(item => {
                  const total = item.isolation + item.ebp;
                  const tone = total >= 20 ? 'bg-error/25' : total >= 12 ? 'bg-warning/25' : 'bg-success/25';
                  return (
                    <div key={item.unit} className={`rounded-md p-2 ${tone}`}>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span>{item.unit}</span>
                        <span>{total} total</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Isolation: {item.isolation} • EBP: {item.ebp}</p>
                    </div>
                  );
                })}
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            IP Add Case + Type Reports
          </CardTitle>
          <CardDescription>Add multiple source conditions and pathogens as pills, then generate reports by type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-lg border border-border/60 bg-background/70 p-4">
              <div className="space-y-2">
                <Label htmlFor="case-date">Case date</Label>
                <Input id="case-date" type="date" value={caseForm.date} onChange={(event) => setCaseForm(prev => ({ ...prev, date: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="case-unit">Unit</Label>
                <Select value={caseForm.unit} onValueChange={(value) => setCaseForm(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger id="case-unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.filter(unit => unit !== 'All').map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <PillInput
                label="Source Condition"
                placeholder="Type then Enter (e.g. UTI, Wound, Respiratory)"
                values={caseForm.sourceConditions}
                onChange={(next) => setCaseForm(prev => ({ ...prev, sourceConditions: next }))}
              />
              <PillInput
                label="Pathogen"
                placeholder="Type then Enter (e.g. MRSA, C. diff, ESBL)"
                values={caseForm.pathogens}
                onChange={(next) => setCaseForm(prev => ({ ...prev, pathogens: next }))}
              />
              <Button
                onClick={() => {
                  if (caseForm.sourceConditions.length === 0 && caseForm.pathogens.length === 0) return;
                  setIpCases(prev => [
                    {
                      id: crypto.randomUUID(),
                      ...caseForm,
                    },
                    ...prev,
                  ]);
                  setCaseForm(prev => ({ ...prev, sourceConditions: [], pathogens: [] }));
                }}
              >
                Add IP Case
              </Button>
            </div>

            <div className="space-y-4 rounded-lg border border-border/60 bg-background/70 p-4">
              <p className="text-sm font-semibold">Generated reports by type</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Source condition report</p>
                  <div className="space-y-2">
                    {reportBySource.length > 0 ? reportBySource.map(item => (
                      <div key={item.name} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No source condition data yet.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Pathogen report</p>
                  <div className="space-y-2">
                    {reportByPathogen.length > 0 ? reportByPathogen.map(item => (
                      <div key={item.name} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2 text-sm">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No pathogen data yet.</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                Total cases logged: <strong className="text-foreground">{ipCases.length}</strong>
              </div>
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="grid gap-6 md:grid-cols-3">
              {infographicSteps.map(step => {
                const Icon = step.icon;
                const isActive = step.id === activeStep?.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveInfographicStep(step.id)}
                    className={`relative w-full rounded-lg border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                      isActive ? 'border-primary/60 bg-primary/10' : 'border-border/60 bg-background/70'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          step.tone === 'primary'
                            ? 'bg-primary/10 text-primary'
                            : step.tone === 'success'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-semibold">{step.stat}</span>
                      <span className="text-xs text-muted-foreground">{step.statLabel}</span>
                    </div>
                    {isActive && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        {step.insight}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommendation</p>
              <h3 className="mt-2 text-sm font-semibold">{activeStep?.title} focus</h3>
              <p className="mt-2 text-sm text-muted-foreground">{activeStep?.recommendation}</p>
              <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Why it matters:</strong> {activeStep?.insight}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {infographicSteps.map(step => (
                  <Button
                    key={`${step.id}-pill`}
                    size="sm"
                    variant={step.id === activeStep?.id ? 'default' : 'outline'}
                    onClick={() => setActiveInfographicStep(step.id)}
                  >
                    {step.title}
                  </Button>
                ))}
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
