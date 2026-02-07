import { Button } from '@/components/ui/button';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { Eye } from 'lucide-react';
import type { AuditSession } from '@/types/nurse-educator';

interface AuditTableProps {
  audits: AuditSession[];
  onView: (session: AuditSession) => void;
}

export function AuditTable({ audits, onView }: AuditTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted">
            <tr className="text-left">
              <th className="px-3 py-2 font-semibold">Date/Time</th>
              <th className="px-3 py-2 font-semibold">Resident</th>
              <th className="px-3 py-2 font-semibold">Type</th>
              <th className="px-3 py-2 font-semibold">Unit</th>
              <th className="px-3 py-2 font-semibold">Total Score %</th>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((session, index) => {
              const scoredSamples = session.samples.filter(smp => smp.result);
              const passingCount = scoredSamples.filter(smp => smp.result?.pass).length;
              const totalSamples = scoredSamples.length;
              const complianceRate = totalSamples > 0 ? Math.round((passingCount / totalSamples) * 100) : 0;
              return (
                <tr key={session.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="px-3 py-2">
                    {new Date(session.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">—</td>
                  <td className="px-3 py-2">{session.templateTitle}</td>
                  <td className="px-3 py-2">{session.header.unit || 'N/A'}</td>
                  <td className="px-3 py-2">
                    {totalSamples > 0 ? (
                      <div className="flex items-center gap-2">
                        <ComplianceIndicator rate={complianceRate} size="sm" showLabel={false} />
                        <span>{complianceRate}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not scored</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={session.header.status === 'complete' ? 'success' : 'warning'}>
                      {session.header.status === 'complete' ? 'Complete' : 'In Progress'}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => onView(session)}>
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
