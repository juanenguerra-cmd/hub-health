// Nurse Educator Suite - Local Storage Management

import type {
  AuditTemplate,
  AuditSession,
  QaAction,
  EducationSession,
  OrientationRecord,
  EduTopic,
  StaffMember,
  AdminOwners
} from '@/types/nurse-educator';
import { SEED_TEMPLATES, SEED_EDU_TOPICS } from './seed-templates';
import { normalizeTemplate } from './template-schema';
import { safeLocalStorageSet } from './storage-monitor';

const LS_KEYS = {
  templates: 'NES_TEMPLATES_V1',
  sessions: 'NES_SESSIONS_V1',
  qaActions: 'NES_QA_ACTIONS_V1',
  eduSessions: 'NES_EDU_SESSIONS_V1',
  orientationRecords: 'NES_ORIENTATION_V1',
  eduLibrary: 'NES_EDU_LIBRARY_V3', // Updated version to trigger merge of new IPCP topics
  staffDirectory: 'NES_STAFF_DIR_V1',
  adminOwners: 'NES_ADMIN_OWNERS_V1',
  facilityName: 'NES_FACILITY_NAME_V1',
  facilityUnits: 'NES_FACILITY_UNITS_V1',
};

// Default admin owners
const DEFAULT_OWNERS: AdminOwners = {
  qapiLead: 'QAPI Coordinator',
  don: 'Director of Nursing',
  ip: 'Infection Preventionist',
  educator: 'Staff Educator',
  hr: 'HR/Staffing',
  unitMgr: 'Unit Manager',
  admin: 'Administrator'
};


function safeWrite(key: string, payload: unknown): void {
  const result = safeLocalStorageSet(key, JSON.stringify(payload));
  if (!result.success) {
    window.dispatchEvent(new CustomEvent('hub-storage-error', { detail: result.error }));
  }
}

// Templates - merge seed templates with user data to ensure new templates are available
export function loadTemplates(): AuditTemplate[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.templates);
    if (!raw) {
      const seeded = SEED_TEMPLATES.map((template, index) => normalizeTemplate(template, index));
      saveTemplates(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = SEED_TEMPLATES.map((template, index) => normalizeTemplate(template, index));
      saveTemplates(seeded);
      return seeded;
    }

    const normalizedParsed = parsed.map((template, index) => normalizeTemplate(template, index));
    
    // Merge: keep user's existing templates, add any new seed templates they don't have
    const existingIds = new Set(normalizedParsed.map((t: AuditTemplate) => t.id));
    const newSeedTemplates = SEED_TEMPLATES.filter(t => !existingIds.has(t.id))
      .map((template, index) => normalizeTemplate(template, normalizedParsed.length + index));
    
    if (newSeedTemplates.length > 0) {
      const merged = [...normalizedParsed, ...newSeedTemplates];
      saveTemplates(merged);
      return merged;
    }
    
    return normalizedParsed;
  } catch {
    return SEED_TEMPLATES.map((template, index) => normalizeTemplate(template, index));
  }
}

export function saveTemplates(templates: AuditTemplate[]): void {
  safeWrite(LS_KEYS.templates, templates);
}

// Sessions
export function loadSessions(): AuditSession[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.sessions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: AuditSession[]): void {
  safeWrite(LS_KEYS.sessions, sessions);
}

// QA Actions
export function loadQaActions(): QaAction[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.qaActions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQaActions(actions: QaAction[]): void {
  safeWrite(LS_KEYS.qaActions, actions);
}

// Education Sessions
export function loadEduSessions(): EducationSession[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.eduSessions);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEduSessions(sessions: EducationSession[]): void {
  safeWrite(LS_KEYS.eduSessions, sessions);
}

// Orientation Records
export function loadOrientationRecords(): OrientationRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.orientationRecords);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrientationRecords(records: OrientationRecord[]): void {
  safeWrite(LS_KEYS.orientationRecords, records);
}

// Education Library - merge seed topics with user data to ensure new topics are available
export function loadEduLibrary(): EduTopic[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.eduLibrary);
    if (!raw) {
      saveEduLibrary(SEED_EDU_TOPICS);
      return SEED_EDU_TOPICS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveEduLibrary(SEED_EDU_TOPICS);
      return SEED_EDU_TOPICS;
    }
    
    // Merge: keep user's existing topics, add any new seed topics they don't have
    const existingIds = new Set(parsed.map((t: EduTopic) => t.id));
    const newSeedTopics = SEED_EDU_TOPICS.filter(t => !existingIds.has(t.id));
    
    if (newSeedTopics.length > 0) {
      const merged = [...parsed, ...newSeedTopics];
      saveEduLibrary(merged);
      return merged;
    }
    
    return parsed;
  } catch {
    return SEED_EDU_TOPICS;
  }
}

export function saveEduLibrary(library: EduTopic[]): void {
  safeWrite(LS_KEYS.eduLibrary, library);
}

// Staff Directory
export function loadStaffDirectory(): { rows: StaffMember[]; asOf: string } {
  try {
    const raw = localStorage.getItem(LS_KEYS.staffDirectory);
    if (!raw) return { rows: [], asOf: '' };
    const parsed = JSON.parse(raw);
    return {
      rows: Array.isArray(parsed?.rows) ? parsed.rows : [],
      asOf: parsed?.asOf || ''
    };
  } catch {
    return { rows: [], asOf: '' };
  }
}

export function saveStaffDirectory(data: { rows: StaffMember[]; asOf: string }): void {
  safeWrite(LS_KEYS.staffDirectory, data);
}

// Admin Owners
export function loadAdminOwners(): AdminOwners {
  try {
    const raw = localStorage.getItem(LS_KEYS.adminOwners);
    if (!raw) return DEFAULT_OWNERS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_OWNERS, ...parsed };
  } catch {
    return DEFAULT_OWNERS;
  }
}

export function saveAdminOwners(owners: AdminOwners): void {
  safeWrite(LS_KEYS.adminOwners, owners);
}

// Facility Name
export function loadFacilityName(): string {
  try {
    return localStorage.getItem(LS_KEYS.facilityName) || 'My Healthcare Facility';
  } catch {
    return 'My Healthcare Facility';
  }
}

export function saveFacilityName(name: string): void {
  try {
    safeWrite(LS_KEYS.facilityName, name);
  } catch {
    // Ignore storage errors (e.g., blocked storage) to prevent runtime crashes.
  }
}

// Facility Units - Hierarchical structure
import type { FacilityUnit } from '@/types/facility-units';

const DEFAULT_UNITS: FacilityUnit[] = [
  { id: 'unit_2', name: 'Unit 2', wings: ['East Unit 2', 'West Unit 2'] },
  { id: 'unit_3', name: 'Unit 3', wings: ['East Unit 3', 'West Unit 3'] },
  { id: 'unit_4', name: 'Unit 4', wings: ['East Unit 4', 'West Unit 4'] },
  { id: 'rehab', name: 'Rehab', wings: [] },
  { id: 'memory_care', name: 'Memory Care', wings: [] },
];

export function loadFacilityUnits(): FacilityUnit[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.facilityUnits);
    if (!raw) return DEFAULT_UNITS;
    const parsed = JSON.parse(raw);
    
    // Handle legacy flat array format - migrate to new structure
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (typeof parsed[0] === 'string') {
        // Legacy format: convert strings to simple units without wings
        return DEFAULT_UNITS;
      }
      return parsed;
    }
    return DEFAULT_UNITS;
  } catch {
    return DEFAULT_UNITS;
  }
}

export function saveFacilityUnits(units: FacilityUnit[]): void {
  safeWrite(LS_KEYS.facilityUnits, units);
}

// Generate demo data for preview
export function generateDemoData(): {
  sessions: AuditSession[];
  qaActions: QaAction[];
  eduSessions: EducationSession[];
} {
  const sessions: AuditSession[] = [];
  const qaActions: QaAction[] = [];
  const eduSessions: EducationSession[] = [];
  
  const templates = SEED_TEMPLATES;
  const units = ['1A', '1B', '2A', '2B', '3A'];
  const today = new Date();
  
  // Generate sessions for the last 30 days
  for (let d = 0; d < 30; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const ymd = date.toISOString().slice(0, 10);
    
    // 1-2 sessions per day
    const sessionsPerDay = Math.floor(Math.random() * 2) + 1;
    
    for (let s = 0; s < sessionsPerDay; s++) {
      const tpl = templates[Math.floor(Math.random() * templates.length)];
      const unit = units[Math.floor(Math.random() * units.length)];
      const sessionId = `${tpl.id.slice(0, 4).toUpperCase()}-${ymd.replace(/-/g, '')}-${unit}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
      
      // Generate 3-8 samples
      const sampleCount = Math.floor(Math.random() * 6) + 3;
      const samples = [];
      
      for (let i = 0; i < sampleCount; i++) {
        const answers: Record<string, string> = {};
        let hasCriticalFail = Math.random() < 0.15;
        
        for (const q of tpl.sampleQuestions) {
          if (q.type === 'patientCode') {
            answers[q.key] = `P${String(Math.floor(Math.random() * 900) + 100)}`;
          } else if (q.type === 'yn') {
            if (hasCriticalFail && tpl.criticalFailKeys.includes(q.key)) {
              answers[q.key] = 'no';
              hasCriticalFail = false;
            } else {
              answers[q.key] = Math.random() < 0.85 ? 'yes' : 'no';
            }
          } else if (q.type === 'select' && q.options) {
            answers[q.key] = q.options[Math.floor(Math.random() * q.options.length)];
          }
        }
        
        const result = {
          pct: Math.floor(Math.random() * 30) + 70,
          pass: Math.random() < 0.8,
          criticalFails: [] as string[],
          actionNeeded: [] as { key: string; label: string; reason: string }[],
          max: 100,
          got: 85
        };
        
        if (!result.pass) {
          const critKey = tpl.criticalFailKeys[0];
          const q = tpl.sampleQuestions.find(x => x.key === critKey);
          if (q) {
            result.criticalFails.push(critKey);
            result.actionNeeded.push({ key: critKey, label: q.label, reason: 'Critical fail' });
          }
        }
        
        samples.push({
          id: `smp_${Math.random().toString(16).slice(2, 10)}`,
          answers,
          result
        });
      }
      
      sessions.push({
        id: `sess_${Math.random().toString(16).slice(2, 10)}`,
        templateId: tpl.id,
        templateTitle: tpl.title,
        createdAt: date.toISOString(),
        header: {
          status: 'complete',
          sessionId,
          auditDate: ymd,
          auditor: 'Demo User',
          unit
        },
        samples
      });
    }
  }
  
  // Generate QA Actions from failed samples
  let actionCount = 0;
  for (const sess of sessions) {
    for (const smp of sess.samples) {
      if (!smp.result.pass && actionCount < 25) {
        const action = smp.result.actionNeeded[0];
        if (action) {
          const status = Math.random() < 0.5 ? 'complete' : (Math.random() < 0.7 ? 'in_progress' : 'open');
          const createdDate = new Date(sess.createdAt);
          const dueDate = new Date(createdDate);
          dueDate.setDate(dueDate.getDate() + 14);
          
          qaActions.push({
            id: `qa_${Math.random().toString(16).slice(2, 10)}`,
            createdAt: sess.createdAt,
            status: status as 'open' | 'in_progress' | 'complete',
            templateId: sess.templateId,
            templateTitle: sess.templateTitle,
            unit: sess.header.unit,
            auditDate: sess.header.auditDate,
            sessionId: sess.header.sessionId,
            sample: smp.answers.patient_code || '',
            issue: action.label,
            reason: action.reason,
            topic: action.label.includes('order') ? 'Order Verification' : 'Equipment Compliance',
            summary: `Address ${action.label}`,
            owner: ['QAPI Lead', 'Unit Manager', 'Educator'][Math.floor(Math.random() * 3)],
            dueDate: dueDate.toISOString().slice(0, 10),
            completedAt: status === 'complete' ? new Date(dueDate.getTime() - Math.random() * 7 * 86400000).toISOString().slice(0, 10) : '',
            notes: '',
            ftagTags: [],
            nydohTags: [],
            reAuditDueDate: '',
            reAuditCompletedAt: '',
            reAuditSessionRef: '',
            reAuditTemplateId: '',
            ev_policyReviewed: status === 'complete',
            ev_educationProvided: status === 'complete' || status === 'in_progress',
            ev_competencyValidated: status === 'complete',
            ev_correctiveAction: status === 'complete',
            ev_monitoringInPlace: status === 'complete',
            linkedEduSessionId: '',
            linkedEducationSessions: [],
            staffAudited: smp.staffAudited || '',
            staffRole: ''
          });
          actionCount++;
        }
      }
    }
  }
  
  // Generate Education Sessions
  const eduTopics = ['Hand Hygiene Refresher', 'Fall Prevention Update', 'Oxygen Safety Training', 'Infection Control Review', 'Documentation Standards'];
  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const status = Math.random() < 0.7 ? 'completed' : 'planned';
    
    eduSessions.push({
      id: `edu_${Math.random().toString(16).slice(2, 10)}`,
      createdAt: date.toISOString(),
      status: status as 'planned' | 'completed',
      topic: eduTopics[Math.floor(Math.random() * eduTopics.length)],
      summary: 'Staff education session',
      audience: 'Nursing Staff',
      instructor: 'Staff Educator',
      unit: units[Math.floor(Math.random() * units.length)],
      scheduledDate: date.toISOString().slice(0, 10),
      completedDate: status === 'completed' ? date.toISOString().slice(0, 10) : '',
      notes: '',
      templateTitle: '',
      templateId: '',
      issue: '',
      linkedQaActionId: ''
    });
  }
  
  return { sessions, qaActions, eduSessions };
}
