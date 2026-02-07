import { Button } from '@/components/ui/button';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { Eye } from 'lucide-react';
import type { AuditSession } from '@/types/nurse-educator';

interface AuditCardsProps {
  audits: AuditSession[];
  onView: (session: AuditSession) => void;
}

export function AuditCards({ audits, onView }: AuditCardsProps) {
  return (
    <div className="space-y-3">
      {audits.map(session => {
        const scoredSamples = session.samples.filter(smp => smp.result);
        const passingCount = scoredSamples.filter(smp => smp.result?.pass).length;
        const totalSamples = scoredSamples.length;
        const complianceRate = totalSamples > 0 ? Math.round((passingCount / totalSamples) * 100) : 0;
        return (
          <div key={session.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Resident</p>
                <p className="font-semibold">—</p>
              </div>
              <StatusBadge status={session.header.status === 'complete' ? 'success' : 'warning'}>
                {session.header.status === 'complete' ? 'Complete' : 'In Progress'}
              </StatusBadge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="font-medium">{session.templateTitle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-medium">{session.header.unit || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                {totalSamples > 0 ? (
                  <div className="flex items-center gap-2">
                    <ComplianceIndicator rate={complianceRate} size="sm" showLabel={false} />
                    <span className="font-medium">{complianceRate}%</span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not scored</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{session.header.auditDate}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => onView(session)}>
                <Eye className="mr-1 h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
