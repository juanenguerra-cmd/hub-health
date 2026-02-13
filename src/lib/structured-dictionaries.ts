import type { EducationSession, QaAction } from '@/types/nurse-educator';

export interface StructuredDictionaries {
  units: string[];
  owners: string[];
  staffRoles: string[];
  topics: string[];
}

const canonicalize = (value: string): string => value.trim().replace(/\s+/g, ' ').toLowerCase();

const dedupe = (values: string[]): string[] => {
  const seen = new Map<string, string>();
  for (const raw of values) {
    if (!raw?.trim()) continue;
    const label = raw.trim();
    const key = canonicalize(label);
    if (!seen.has(key) || seen.get(key)!.length > label.length) {
      seen.set(key, label);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
};

export function buildStructuredDictionaries(actions: QaAction[], sessions: EducationSession[]): StructuredDictionaries {
  return {
    units: dedupe([...actions.map((a) => a.unit), ...sessions.map((s) => s.unit)]),
    owners: dedupe([...actions.map((a) => a.owner), ...sessions.map((s) => s.instructor)]),
    staffRoles: dedupe(actions.map((a) => a.staffRole || '')),
    topics: dedupe([...actions.map((a) => a.topic), ...actions.map((a) => a.issue), ...sessions.map((s) => s.topic)]),
  };
}

export function migrateLegacyLabel(value: string, options: string[]): string {
  const key = canonicalize(value || '');
  if (!key) return '';
  const match = options.find((option) => canonicalize(option) === key);
  return match || value.trim();
}
