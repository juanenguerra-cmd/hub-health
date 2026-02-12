import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AuditSession, QaAction } from '@/types/nurse-educator';
import { toast } from '@/hooks/use-toast';

interface ReAuditLinkageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qaAction: QaAction | null;
  sessions: AuditSession[];
  onLink: (results: QaAction['reAuditResults']) => void;
}

export function ReAuditLinkageModal({ open, onOpenChange, qaAction, sessions, onLink }: ReAuditLinkageModalProps) {
  const eligibleSessions = useMemo(() => {
    if (!qaAction) return [];
    return sessions.filter((session) => {
      if (session.header.status !== 'complete') return false;
      if (qaAction.reAuditTemplateId && session.templateId !== qaAction.reAuditTemplateId) return false;
      if (qaAction.templateId && !qaAction.reAuditTemplateId && session.templateId !== qaAction.templateId) return false;
      return session.header.auditDate >= qaAction.auditDate;
    });
  }, [qaAction, sessions]);

  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [notes, setNotes] = useState('');

  const selectedSession = eligibleSessions.find((s) => s.id === selectedSessionId);
  const complianceRate = selectedSession?.samples.length
    ? Math.round((selectedSession.samples.filter((s) => s.result?.pass).length / selectedSession.samples.length) * 100)
    : 0;

  const handleLink = () => {
    if (!qaAction || !selectedSession) return;
    const passed = complianceRate >= 90;
    if (!passed) {
      toast({
        title: 'Re-audit below target',
        description: 'Linking is allowed but this action should not be closed until passing.',
        variant: 'destructive'
      });
    }

    onLink({
      sessionId: selectedSession.id,
      templateId: selectedSession.templateId,
      completedDate: selectedSession.header.auditDate,
      passed,
      complianceRate,
      staffAudited: qaAction.staffAudited,
      notes,
      sampleIds: selectedSession.samples.map((sample) => sample.id)
    });

    setSelectedSessionId('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Re-Audit</DialogTitle>
          <DialogDescription>Select a completed re-audit session that validates this action.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Eligible Re-Audit Session</Label>
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {eligibleSessions.map((session) => (
                  <SelectItem key={session.id} value={session.id}>
                    {session.header.sessionId} • {session.header.auditDate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSession && (
            <div className="text-sm rounded border p-3 bg-muted/30">
              <p><strong>Original finding:</strong> {qaAction?.issue}</p>
              <p><strong>Re-audit date:</strong> {selectedSession.header.auditDate}</p>
              <p><strong>Re-audit result:</strong> {complianceRate >= 90 ? 'PASS' : 'FAIL'} ({complianceRate}%)</p>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add linkage notes" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleLink} disabled={!selectedSessionId}>Link Re-Audit</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
