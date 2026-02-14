import type { QaAction } from '@/types/nurse-educator';

function getCurrentUser(): string {
  return localStorage.getItem('hub-health-current-user') || 'System User';
}

export function recordChange(
  action: QaAction,
  changes: Record<string, { old: unknown; new: unknown }>,
  changeType: 'created' | 'updated' | 'status_changed' | 'deleted' = 'updated'
): QaAction {
  const timestamp = new Date().toISOString();
  const user = getCurrentUser();

  const newChanges = Object.entries(changes).map(([field, { old: oldValue, new: newValue }]) => ({
    timestamp,
    user,
    action: changeType,
    field,
    oldValue: String(oldValue ?? ''),
    newValue: String(newValue ?? ''),
    description: generateChangeDescription(field, oldValue, newValue),
  }));

  return {
    ...action,
    modifiedAt: timestamp,
    modifiedBy: user,
    changeHistory: [...(action.changeHistory || []), ...newChanges],
  };
}

export function recordCreation(action: QaAction): QaAction {
  const timestamp = new Date().toISOString();
  const user = getCurrentUser();

  return {
    ...action,
    createdBy: user,
    createdAt: action.createdAt || timestamp,
    changeHistory: [
      {
        timestamp,
        user,
        action: 'created',
        description: `QA Action created: ${action.issue || 'Untitled'}`,
      },
    ],
  };
}

export function recordDeletion(action: QaAction, reason?: string): QaAction {
  const timestamp = new Date().toISOString();
  const user = getCurrentUser();
  return {
    ...action,
    modifiedAt: timestamp,
    modifiedBy: user,
    changeHistory: [
      ...(action.changeHistory || []),
      {
        timestamp,
        user,
        action: 'deleted',
        description: reason || 'QA Action deleted',
      },
    ],
  };
}

function generateChangeDescription(field: string, oldValue: unknown, newValue: unknown): string {
  const fieldLabels: Record<string, string> = {
    status: 'Status',
    owner: 'Owner',
    dueDate: 'Due Date',
    issue: 'Issue',
    notes: 'Notes',
    ev_policyReviewed: 'Evidence: Policy Reviewed',
    ev_educationProvided: 'Evidence: Education Provided',
    ev_competencyValidated: 'Evidence: Competency Validated',
    ev_correctiveAction: 'Evidence: Corrective Action',
    ev_monitoringInPlace: 'Evidence: Monitoring in Place',
  };

  const label = fieldLabels[field] || field;
  if (oldValue === newValue) return `No change to ${label}`;
  if (!oldValue && newValue) return `${label} set to "${String(newValue)}"`;
  if (oldValue && !newValue) return `${label} cleared (was "${String(oldValue)}")`;
  return `${label} changed from "${String(oldValue)}" to "${String(newValue)}"`;
}

export function getChangeLog(action: QaAction): string {
  if (!action.changeHistory?.length) return 'No change history recorded';

  return action.changeHistory
    .map((ch) => {
      const timestamp = new Date(ch.timestamp).toLocaleString();
      return `[${timestamp}] ${ch.user} - ${ch.description || `${ch.action} ${ch.field || ''}`}`;
    })
    .join('\n');
}

export function detectChanges(
  original: QaAction,
  updated: QaAction
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  const trackedFields: Array<keyof QaAction> = [
    'status', 'owner', 'dueDate', 'issue', 'topic', 'summary', 'reason',
    'notes', 'unit', 'staffAudited', 'completedAt', 'reAuditDueDate',
    'ev_policyReviewed', 'ev_educationProvided', 'ev_competencyValidated',
    'ev_correctiveAction', 'ev_monitoringInPlace'
  ];

  for (const field of trackedFields) {
    if (original[field] !== updated[field]) {
      changes[field] = { old: original[field], new: updated[field] };
    }
  }

  return changes;
}
