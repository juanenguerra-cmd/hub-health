import type { QaAction } from '@/types/nurse-educator';

export function recordChange(
  action: QaAction,
  field: keyof QaAction,
  newValue: unknown,
  userName: string = 'System User'
): QaAction {
  const oldValue = action[field];

  // Skip if no change
  if (oldValue === newValue) return action;

  const changeRecord = {
    timestamp: new Date().toISOString(),
    user: userName,
    field: String(field),
    oldValue: String(oldValue ?? ''),
    newValue: String(newValue ?? '')
  };

  return {
    ...action,
    modifiedAt: changeRecord.timestamp,
    modifiedBy: userName,
    changeHistory: [...(action.changeHistory || []), changeRecord]
  };
}

export function getChangeLog(action: QaAction): string {
  if (!action.changeHistory?.length) return 'No changes recorded';

  return action.changeHistory
    .map((ch) => `[${ch.timestamp.slice(0, 16)}] ${ch.user} changed ${ch.field}: "${ch.oldValue}" → "${ch.newValue}"`)
    .join('\n');
}
