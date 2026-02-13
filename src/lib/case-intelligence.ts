import { todayYMD } from '@/lib/calculations';
import type { QaAction } from '@/types/nurse-educator';

export interface EscalationEvent {
  id: string;
  caseId: string;
  type: 'critical_overdue' | 'stale_case' | 'reaudit_missed';
  message: string;
  recipients: string[];
  createdAt: string;
}

export function getEscalationEvents(actions: QaAction[], inactivityDays = 5): EscalationEvent[] {
  const today = todayYMD();
  return actions.flatMap((action) => {
    const events: EscalationEvent[] = [];
    if (!action.caseId) return events;
    if (action.status !== 'complete' && action.severity === 'critical' && action.dueDate && action.dueDate < today) {
      events.push({
        id: `esc-${action.id}-critical`,
        caseId: action.caseId,
        type: 'critical_overdue',
        message: `Critical QA action overdue for case ${action.caseId}`,
        recipients: [action.owner || 'QAPI Coordinator'],
        createdAt: new Date().toISOString(),
      });
    }
    if (action.reAuditDueDate && !action.reAuditCompletedAt && action.reAuditDueDate < today) {
      events.push({
        id: `esc-${action.id}-reaudit`,
        caseId: action.caseId,
        type: 'reaudit_missed',
        message: `Re-audit missed due date for case ${action.caseId}`,
        recipients: [action.owner || 'Unit Manager'],
        createdAt: new Date().toISOString(),
      });
    }
    if (action.createdAt) {
      const created = action.createdAt.slice(0, 10);
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() - inactivityDays);
      if (action.status !== 'complete' && created < cutoff.toISOString().slice(0, 10)) {
        events.push({
          id: `esc-${action.id}-stale`,
          caseId: action.caseId,
          type: 'stale_case',
          message: `No progress for ${inactivityDays}+ days on case ${action.caseId}`,
          recipients: [action.owner || 'Director of Nursing'],
          createdAt: new Date().toISOString(),
        });
      }
    }
    return events;
  });
}
