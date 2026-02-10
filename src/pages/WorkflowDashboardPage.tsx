import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buildWorkflowStages, calculateWorkflowMetrics } from '@/lib/workflow-tracker';

export function WorkflowDashboardPage() {
  const { qaActions, sessions, eduSessions } = useApp();

  const activeItems = qaActions.filter((item) => item.status !== 'complete');
  const workflows = useMemo(() => activeItems.map((qaAction) => {
    const stages = buildWorkflowStages(qaAction, sessions, eduSessions);
    const metrics = calculateWorkflowMetrics(stages);
    return { qaAction, stages, metrics };
  }), [activeItems, eduSessions, sessions]);

  const overdueCount = activeItems.filter((item) => item.dueDate && item.dueDate < new Date().toISOString().slice(0, 10)).length;
  const averageProgress = workflows.length > 0
    ? Math.round(workflows.reduce((sum, item) => sum + item.metrics.progressPercent, 0) / workflows.length)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Workflow Dashboard</h1>
        <p className="text-muted-foreground">Closed-loop visibility across audit, QA, education, and re-audit.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle className="text-sm">Total active workflows</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{activeItems.length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Overdue</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{overdueCount}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg workflow progress</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{averageProgress}%</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Recently closed (30d)</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{qaActions.filter((item) => item.status === 'complete').length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Needs Attention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {workflows.length === 0 ? <p className="text-sm text-muted-foreground">No active workflows.</p> : workflows.map(({ qaAction, metrics }) => (
            <div key={qaAction.id} className="rounded border border-border p-3 flex flex-wrap items-center gap-3 justify-between">
              <div>
                <p className="font-medium text-sm">{qaAction.issue || 'Untitled QA Action'}</p>
                <p className="text-xs text-muted-foreground">Owner: {qaAction.owner || 'Unassigned'} · Unit: {qaAction.unit || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={metrics.progressPercent === 100 ? 'default' : 'secondary'}>{metrics.progressPercent}% complete</Badge>
                {qaAction.dueDate && qaAction.dueDate < new Date().toISOString().slice(0, 10) && <Badge variant="destructive">Overdue</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
