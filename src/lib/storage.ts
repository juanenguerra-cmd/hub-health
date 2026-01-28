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
import { SEED_TEMPLATES } from './seed-templates';

const LS_KEYS = {
  templates: 'NES_TEMPLATES_V1',
  sessions: 'NES_SESSIONS_V1',
  qaActions: 'NES_QA_ACTIONS_V1',
  eduSessions: 'NES_EDU_SESSIONS_V1',
  orientationRecords: 'NES_ORIENTATION_V1',
  eduLibrary: 'NES_EDU_LIBRARY_V1',
  staffDirectory: 'NES_STAFF_DIR_V1',
  adminOwners: 'NES_ADMIN_OWNERS_V1',
  facilityName: 'NES_FACILITY_NAME_V1',
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

// Seed education library
const SEED_EDU_LIBRARY: EduTopic[] = [
  { id: 'edu_topic_hand_hygiene', topic: 'Hand Hygiene — 5 Moments + Glove Change', disciplines: 'All staff', purpose: 'Reduce cross-contamination and HAI risk.', description: 'Review WHO 5 Moments, glove change rules, sanitizer vs soap/water.', ftags: 'F880', nysdohRegs: '10 NYCRR 415.19', facilityPolicy: '' },
  { id: 'edu_topic_infection_precautions', topic: 'Transmission-Based Precautions — Signage + PPE Flow', disciplines: 'Nursing; CNA; All staff', purpose: 'Ensure correct isolation practices.', description: 'When to initiate precautions, don/doff sequence, room setup.', ftags: 'F880', nysdohRegs: '10 NYCRR 415.19', facilityPolicy: '' },
  { id: 'edu_topic_oxygen_safety', topic: 'Oxygen Safety — Orders, Labeling, Tubing Changes', disciplines: 'Nursing; CNA', purpose: 'Prevent hypoxia events and equipment contamination.', description: 'Verify orders, match delivery device/rate, weekly tubing labels.', ftags: 'F880', nysdohRegs: '10 NYCRR 415.19', facilityPolicy: '' },
  { id: 'edu_topic_falls', topic: 'Fall Prevention — Interventions + Rounds', disciplines: 'Nursing; CNA', purpose: 'Reduce fall risk and injury severity.', description: 'High-risk interventions, purposeful rounding, call light reach.', ftags: 'F689', nysdohRegs: '10 NYCRR 415.26', facilityPolicy: '' },
  { id: 'edu_topic_documentation', topic: 'Documentation Quality — Notifications + Follow-through', disciplines: 'Nursing', purpose: 'Ensure timely provider notification and complete charting.', description: 'Change of condition documentation, MD/Family notifications.', ftags: 'F842;F865', nysdohRegs: '10 NYCRR 415.10; 415.11', facilityPolicy: '' },
];

// Templates
export function loadTemplates(): AuditTemplate[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.templates);
    if (!raw) {
      saveTemplates(SEED_TEMPLATES);
      return SEED_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_TEMPLATES;
  } catch {
    return SEED_TEMPLATES;
  }
}

export function saveTemplates(templates: AuditTemplate[]): void {
  localStorage.setItem(LS_KEYS.templates, JSON.stringify(templates));
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
  localStorage.setItem(LS_KEYS.sessions, JSON.stringify(sessions));
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
  localStorage.setItem(LS_KEYS.qaActions, JSON.stringify(actions));
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
  localStorage.setItem(LS_KEYS.eduSessions, JSON.stringify(sessions));
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
  localStorage.setItem(LS_KEYS.orientationRecords, JSON.stringify(records));
}

// Education Library
export function loadEduLibrary(): EduTopic[] {
  try {
    const raw = localStorage.getItem(LS_KEYS.eduLibrary);
    if (!raw) {
      saveEduLibrary(SEED_EDU_LIBRARY);
      return SEED_EDU_LIBRARY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_EDU_LIBRARY;
  } catch {
    return SEED_EDU_LIBRARY;
  }
}

export function saveEduLibrary(library: EduTopic[]): void {
  localStorage.setItem(LS_KEYS.eduLibrary, JSON.stringify(library));
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
  localStorage.setItem(LS_KEYS.staffDirectory, JSON.stringify(data));
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
  localStorage.setItem(LS_KEYS.adminOwners, JSON.stringify(owners));
}

// Facility Name
export function loadFacilityName(): string {
  return localStorage.getItem(LS_KEYS.facilityName) || 'My Healthcare Facility';
}

export function saveFacilityName(name: string): void {
  localStorage.setItem(LS_KEYS.facilityName, name);
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
            linkedEduSessionId: ''
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
