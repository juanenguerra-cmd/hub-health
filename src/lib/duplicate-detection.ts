import type { QaAction, AuditSession } from '@/types/nurse-educator';

export function findDuplicateQaAction(
  newAction: QaAction,
  existingActions: QaAction[]
): QaAction | null {
  // Check for duplicate within 7 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return existingActions.find((a) =>
    a.issue === newAction.issue &&
    a.unit === newAction.unit &&
    a.staffAudited === newAction.staffAudited &&
    a.auditDate >= cutoffStr &&
    a.status !== 'complete' &&
    !a.deletedAt
  ) || null;
}

export function findDuplicateSession(
  sessionId: string,
  existingSessions: AuditSession[]
): AuditSession | null {
  return existingSessions.find((s) => s.header.sessionId === sessionId) || null;
}
