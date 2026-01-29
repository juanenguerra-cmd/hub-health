// Backup Settings Storage

import type { BackupSettings } from '@/types/backup-settings';
import { DEFAULT_BACKUP_SETTINGS } from '@/types/backup-settings';

const LS_KEY = 'NES_BACKUP_SETTINGS_V1';

export function loadBackupSettings(): BackupSettings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_BACKUP_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_BACKUP_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_BACKUP_SETTINGS;
  }
}

export function saveBackupSettings(settings: BackupSettings): void {
  localStorage.setItem(LS_KEY, JSON.stringify(settings));
}

export function updateLastBackupTime(): void {
  const settings = loadBackupSettings();
  settings.lastBackupAt = new Date().toISOString();
  settings.isFirstVisit = false;
  saveBackupSettings(settings);
}

export function dismissReminder(): void {
  const settings = loadBackupSettings();
  settings.lastReminderDismissedAt = new Date().toISOString();
  saveBackupSettings(settings);
}

export function markFirstVisitComplete(): void {
  const settings = loadBackupSettings();
  settings.isFirstVisit = false;
  saveBackupSettings(settings);
}
