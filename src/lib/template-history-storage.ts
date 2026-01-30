// Template History Storage

import type { TemplateChange } from '@/types/template-history';

const LS_KEY = 'NES_TEMPLATE_HISTORY_V1';

export function loadTemplateHistory(): TemplateChange[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTemplateHistory(history: TemplateChange[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(history));
}

export function addTemplateChange(change: TemplateChange): void {
  const history = loadTemplateHistory();
  history.unshift(change);
  // Keep last 500 changes
  if (history.length > 500) {
    history.splice(500);
  }
  saveTemplateHistory(history);
}

export function getTemplateChanges(templateId: string): TemplateChange[] {
  const history = loadTemplateHistory();
  return history.filter(c => c.templateId === templateId);
}

// Bump version: major.minor.patch
export function bumpVersion(currentVersion: string, changeType: 'major' | 'minor' | 'patch'): string {
  const parts = currentVersion.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    return '1.0.1';
  }
  
  if (changeType === 'major') {
    return `${parts[0] + 1}.0.0`;
  } else if (changeType === 'minor') {
    return `${parts[0]}.${parts[1] + 1}.0`;
  } else {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
}
