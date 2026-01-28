import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { filterActionsByRange, computeClosedLoopStats, todayYMD } from '@/lib/calculations';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  User,
  Calendar,
  MoreVertical
} from 'lucide-react';

export function QaActionsPage() {
  const { qaActions, actionsFilters, setActionsFilters, templates } = useApp();

  const daysAgo = parseInt(actionsFilters.range, 10);
  const today = todayYMD();
  
  // Filter actions
  let filtered = filterActionsByRange(qaActions, daysAgo);
  
  if (actionsFilters.status !== 'All') {
    filtered = filtered.filter(a => a.status === actionsFilters.status);
  }
  
  if (actionsFilters.tool !== 'All') {
    filtered = filtered.filter(a => a.templateTitle === actionsFilters.tool);
  }
  
  if (actionsFilters.search) {
    const q = actionsFilters.search.toLowerCase();
    filtered = filtered.filter(a => 
      (a.issue || '').toLowerCase().includes(q) ||
      (a.topic || '').toLowerCase().includes(q) ||
      (a.templateTitle || '').toLowerCase().includes(q) ||
      (a.unit || '').toLowerCase().includes(q)
    );
  }

  // Sort by created date desc
  filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const stats = computeClosedLoopStats(filtered);
  const tools = ['All', ...Array.from(new Set(qaActions.map(a => a.templateTitle).filter(Boolean))).sort()];

  const getStatusBadge = (action: typeof qaActions[0]) => {
    const due = (action.dueDate || '').slice(0, 10);
    const isOverdue = due && due < today && action.status !== 'complete';
    
    if (action.status === 'complete') {
      return <StatusBadge status="success"><CheckCircle2 className="w-3 h-3" /> Complete</StatusBadge>;
    }
    if (isOverdue) {
      return <StatusBadge status="error"><AlertCircle className="w-3 h-3" /> Overdue</StatusBadge>;
    }
    if (action.status === 'in_progress') {
      return <StatusBadge status="warning"><Clock className="w-3 h-3" /> In Progress</StatusBadge>;
    }
    return <StatusBadge status="info"><Clock className="w-3 h-3" /> Open</StatusBadge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QA Action Tracker</h1>
          <p className="text-muted-foreground">Closed-loop QAPI tracking with owners and re-audits</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Action
        </Button>
      </div>

      {/* KPIs */}
      <KpiGrid>
        <KpiCard label="Total Actions" value={stats.total} />
        <KpiCard 
          label="Open / In Progress" 
          value={stats.open + stats.prog}
          status={stats.open + stats.prog > 10 ? 'warning' : 'neutral'}
        />
        <KpiCard 
          label="Closure Rate" 
          value={`${stats.closureRate}%`}
          status={stats.closureRate >= 80 ? 'success' : stats.closureRate >= 60 ? 'warning' : 'error'}
        />
        <KpiCard 
          label="Overdue" 
          value={stats.overdueCount}
          status={stats.overdueCount === 0 ? 'success' : 'error'}
        />
      </KpiGrid>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={actionsFilters.search}
                  onChange={(e) => setActionsFilters({ ...actionsFilters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select 
              value={actionsFilters.range} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, range: v })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="9999">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={actionsFilters.status} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, status: v })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={actionsFilters.tool} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, tool: v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tool" />
              </SelectTrigger>
              <SelectContent>
                {tools.map(t => (
                  <SelectItem key={t} value={t}>{t === 'All' ? 'All Tools' : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-medium">No action items found</p>
              <p className="text-sm text-muted-foreground">All QA actions are resolved or no items match your filters</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(action => (
            <Card key={action.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(action)}
                    </div>
                    <h3 className="font-semibold">{action.issue || 'Untitled Issue'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.topic || action.summary || 'No description'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {action.templateTitle || 'No tool'}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {action.owner || 'Unassigned'}
                      </span>
                      {action.unit && (
                        <span>Unit {action.unit}</span>
                      )}
                      {action.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {action.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Evidence indicators */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {action.ev_educationProvided && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Education</span>
                      )}
                      {action.ev_competencyValidated && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Competency</span>
                      )}
                      {action.ev_correctiveAction && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Corrective</span>
                      )}
                      {action.reAuditCompletedAt && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Re-audited</span>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
