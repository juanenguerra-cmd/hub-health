import { Clock3, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { WorkflowStage } from '@/lib/workflow-tracker';
import { calculateWorkflowMetrics, getNextWorkflowAction } from '@/lib/workflow-tracker';

interface ClosedLoopTrackerProps {
  stages: WorkflowStage[];
  onStageClick?: (stage: WorkflowStage) => void;
}

const statusVariant = {
  pending: 'secondary',
  'in-progress': 'default',
  complete: 'outline',
  blocked: 'destructive',
} as const;

export function ClosedLoopTracker({ stages, onStageClick }: ClosedLoopTrackerProps) {
  const metrics = calculateWorkflowMetrics(stages);
  const nextAction = getNextWorkflowAction(stages);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Closed-loop workflow tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{metrics.progressPercent}%</span>
          </div>
          <Progress value={metrics.progressPercent} />
        </div>

        <div className="space-y-2">
          {stages.map((stage) => (
            <button
              type="button"
              key={stage.id}
              onClick={() => onStageClick?.(stage)}
              className="w-full rounded-lg border border-border px-3 py-2 text-left hover:bg-muted/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{stage.title}</p>
                  <p className="text-xs text-muted-foreground">{stage.description}</p>
                </div>
                <Badge variant={statusVariant[stage.status]}>{stage.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                {stage.completedAt && <span>Completed: {stage.completedAt.slice(0, 10)}</span>}
                {typeof stage.daysInStage === 'number' && <span className="flex items-center gap-1"><Clock3 className="w-3 h-3" />{stage.daysInStage} days</span>}
                {stage.assignee && <span>Owner: {stage.assignee}</span>}
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border p-3">
          <p className="text-sm font-medium">Next Action: {nextAction.action}</p>
          <p className="text-xs text-muted-foreground">{nextAction.description}</p>
          <Button size="sm" variant="outline" className="mt-2" asChild>
            <a href={nextAction.linkTo}>
              Open <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
