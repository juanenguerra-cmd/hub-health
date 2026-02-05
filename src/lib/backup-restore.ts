// Backup & Restore utilities for Nurse Educator Suite

import type {
  AuditTemplate,
  AuditSession,
  AuditSample,
  QaAction,
  EducationSession,
  EduTopic,
  OrientationRecord,
  AdminOwners,
  StaffMember
} from '@/types/nurse-educator';
import type { FacilityUnit } from '@/types/facility-units';

export interface BackupData {
  v?: number;
  kind?: string;
  exportedAt?: string;
  templates?: AuditTemplate[];
  sessions?: LegacySession[];
  eduSessions?: LegacyEduSession[];
  eduLibrary?: EduTopic[];
  qaActions?: QaAction[];
  orientationRecords?: OrientationRecord[];
  adminOwners?: AdminOwners;
  facilityName?: string;
  staffDirectory?: { rows: StaffMember[]; asOf: string };
  facilityUnits?: FacilityUnit[];
}

// Legacy session format from old tool
interface LegacySession {
  id: string;
  templateId: string;
  templateTitle: string;
  templateVersion?: string;
  category?: string;
  createdAt: string;
  header: {
    auditDate: string;
    unit: string;
    staffAudited?: string;
    position?: string;
    sessionId: string;
    status: string;
    [key: string]: string | undefined;
  };
  sessionAnswers?: Record<string, string>;
  samples: LegacySample[];
}

interface LegacySample {
  sampleId?: string;
  id?: string;
  patientCode?: string;
  answers: Record<string, string>;
  result: {
    pct: number;
    pass: boolean;
    criticalFails: string[];
    actionNeeded: { key: string; label: string; reason: string }[];
    max: number;
    got: number;
  };
}

// Legacy education session format
interface LegacyEduSession {
  id: string;
  topic: string;
  status: string;
  scheduledDate: string;
  completedDate: string;
  unit?: string;
  instructor?: string;
  audience?: string;
  attendees?: string;
  linkedQaActionId?: string;
  summary?: string;
  notes?: string;
  createdAt: string;
  templateTitle?: string;
  templateId?: string;
  issue?: string;
  category?: string;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  counts: {
    templates: number;
    sessions: number;
    eduSessions: number;
    eduLibrary: number;
    qaActions: number;
  };
}

/**
 * Parse and validate backup file content
 */
export function parseBackupFile(content: string): BackupData | null {
  try {
    const data = JSON.parse(content);
    
    // Validate it's a valid backup format
    if (data.kind === 'INSERVICE_RN_HUB_BACKUP' || 
        Array.isArray(data.templates) || 
        Array.isArray(data.sessions) ||
        Array.isArray(data)) {
      
      // Handle if it's just an array of templates
      if (Array.isArray(data)) {
        return { templates: data };
      }
      
      return data as BackupData;
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert legacy session format to current format
 */
function convertSession(legacy: LegacySession): AuditSession {
  const samples: AuditSample[] = legacy.samples.map(s => ({
    id: s.sampleId || s.id || `smp_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    answers: s.answers,
    result: {
      pct: s.result.pct,
      pass: s.result.pass,
      criticalFails: s.result.criticalFails || [],
      actionNeeded: s.result.actionNeeded || [],
      max: s.result.max,
      got: s.result.got
    }
  }));

  return {
    id: legacy.id,
    templateId: legacy.templateId,
    templateTitle: legacy.templateTitle,
    createdAt: legacy.createdAt,
    header: {
      status: (legacy.header.status as 'draft' | 'in_progress' | 'complete') || 'complete',
      sessionId: legacy.header.sessionId,
      auditDate: legacy.header.auditDate,
      auditor: legacy.header.staffAudited || '',
      unit: legacy.header.unit || '',
      ...legacy.sessionAnswers
    },
    samples
  };
}

/**
 * Convert legacy education session format
 */
function convertEduSession(legacy: LegacyEduSession): EducationSession {
  // Parse attendees if it's a string
  let attendees: string[] = [];
  if (legacy.attendees) {
    if (typeof legacy.attendees === 'string') {
      attendees = legacy.attendees.split(',').map(a => a.trim()).filter(Boolean);
    } else if (Array.isArray(legacy.attendees)) {
      attendees = legacy.attendees;
    }
  }

  return {
    id: legacy.id,
    createdAt: legacy.createdAt,
    status: legacy.status === 'completed' ? 'completed' : 'planned',
    topic: legacy.topic,
    summary: legacy.summary || '',
    audience: legacy.audience || '',
    instructor: legacy.instructor || '',
    unit: legacy.unit || '',
    scheduledDate: normalizeDate(legacy.scheduledDate),
    completedDate: normalizeDate(legacy.completedDate),
    notes: legacy.notes || '',
    templateTitle: legacy.templateTitle || '',
    templateId: legacy.templateId || '',
    issue: legacy.issue || '',
    linkedQaActionId: legacy.linkedQaActionId || '',
    category: legacy.category,
    attendees
  };
}

/**
 * Normalize date formats (handle MM/DD/YYYY vs YYYY-MM-DD)
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Already in ISO format
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10);
  }
  
  // MM/DD/YYYY format
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateStr;
}

/**
 * Process backup data and return normalized data ready for import
 */
export function processBackupData(backup: BackupData): {
  templates: AuditTemplate[];
  sessions: AuditSession[];
  eduSessions: EducationSession[];
  eduLibrary: EduTopic[];
  qaActions: QaAction[];
  orientationRecords?: OrientationRecord[];
  adminOwners?: AdminOwners;
  facilityName?: string;
  staffDirectory?: { rows: StaffMember[]; asOf: string };
  facilityUnits?: FacilityUnit[];
} {
  const templates: AuditTemplate[] = [];
  const sessions: AuditSession[] = [];
  const eduSessions: EducationSession[] = [];
  const eduLibrary: EduTopic[] = [];
  const qaActions: QaAction[] = [];
  const orientationRecords = Array.isArray(backup.orientationRecords) ? backup.orientationRecords : undefined;
  const adminOwners = backup.adminOwners;
  const facilityName = backup.facilityName;
  const staffDirectory = Array.isArray(backup.staffDirectory?.rows)
    ? { rows: backup.staffDirectory?.rows ?? [], asOf: backup.staffDirectory?.asOf ?? '' }
    : undefined;
  const facilityUnits = Array.isArray(backup.facilityUnits) ? backup.facilityUnits : undefined;

  // Process templates (filter out archived)
  if (backup.templates) {
    for (const tpl of backup.templates) {
      if (!tpl.archived) {
        templates.push(tpl);
      }
    }
  }

  // Process sessions
  if (backup.sessions) {
    for (const sess of backup.sessions) {
      sessions.push(convertSession(sess));
    }
  }

  // Process education sessions
  if (backup.eduSessions) {
    for (const edu of backup.eduSessions) {
      eduSessions.push(convertEduSession(edu));
    }
  }

  // Process education library
  if (backup.eduLibrary) {
    for (const topic of backup.eduLibrary) {
      if (!topic.archived) {
        eduLibrary.push(topic);
      }
    }
  }

  // Process QA actions
  if (backup.qaActions) {
    qaActions.push(...backup.qaActions);
  }

  return {
    templates,
    sessions,
    eduSessions,
    eduLibrary,
    qaActions,
    orientationRecords,
    adminOwners,
    facilityName,
    staffDirectory,
    facilityUnits
  };
}

/**
 * Create a backup of current data
 */
export function createBackup(data: {
  templates: AuditTemplate[];
  sessions: AuditSession[];
  eduSessions: EducationSession[];
  eduLibrary: EduTopic[];
  qaActions: QaAction[];
  orientationRecords: OrientationRecord[];
  adminOwners: AdminOwners;
  facilityName: string;
  staffDirectory: { rows: StaffMember[]; asOf: string };
  facilityUnits: FacilityUnit[];
}): string {
  const backup = {
    v: 1,
    kind: 'NURSE_EDUCATOR_SUITE_BACKUP',
    exportedAt: new Date().toISOString(),
    ...data
  };
  
  return JSON.stringify(backup, null, 2);
}
