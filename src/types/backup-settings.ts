// Backup Settings Types

export type ReminderFrequency = 'daily' | '3days' | 'weekly' | 'never';

export interface BackupSettings {
  reminderFrequency: ReminderFrequency;
  lastBackupAt: string | null;
  lastReminderDismissedAt: string | null;
  browserCloseWarning: boolean;
  isFirstVisit: boolean;
}

export const DEFAULT_BACKUP_SETTINGS: BackupSettings = {
  reminderFrequency: '3days',
  lastBackupAt: null,
  lastReminderDismissedAt: null,
  browserCloseWarning: true,
  isFirstVisit: true,
};

// Get reminder interval in milliseconds
export function getReminderIntervalMs(frequency: ReminderFrequency): number {
  switch (frequency) {
    case 'daily':
      return 24 * 60 * 60 * 1000; // 1 day
    case '3days':
      return 3 * 24 * 60 * 60 * 1000; // 3 days
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000; // 7 days
    case 'never':
      return Infinity;
    default:
      return 3 * 24 * 60 * 60 * 1000;
  }
}

// Check if reminder should be shown
export function shouldShowReminder(settings: BackupSettings): boolean {
  if (settings.reminderFrequency === 'never') return false;
  
  const intervalMs = getReminderIntervalMs(settings.reminderFrequency);
  const now = Date.now();
  
  // Check last backup time
  if (settings.lastBackupAt) {
    const lastBackup = new Date(settings.lastBackupAt).getTime();
    if (now - lastBackup < intervalMs) return false;
  }
  
  // Check last dismissed time (don't show again for 12 hours after dismissing)
  if (settings.lastReminderDismissedAt) {
    const lastDismissed = new Date(settings.lastReminderDismissedAt).getTime();
    const minDismissInterval = 12 * 60 * 60 * 1000; // 12 hours
    if (now - lastDismissed < minDismissInterval) return false;
  }
  
  // Show reminder if no backup ever done, or if interval passed
  if (!settings.lastBackupAt) return true;
  
  const lastBackup = new Date(settings.lastBackupAt).getTime();
  return now - lastBackup >= intervalMs;
}

// Format last backup time for display
export function formatLastBackup(lastBackupAt: string | null): string {
  if (!lastBackupAt) return 'Never';
  
  const date = new Date(lastBackupAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  
  if (diffHours < 1) return 'Less than an hour ago';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}
