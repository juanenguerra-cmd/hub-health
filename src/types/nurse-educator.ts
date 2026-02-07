// Nurse Educator Suite - Core Types

export interface AuditTemplate {
  id: string;
  title: string;
  version: string;
  category: string;
  placementTags: string[];
  ftagTags: string[];
  nydohTags: string[];
  purpose: {
    summary: string;
    risk: string;
    evidenceToShow: string;
  };
  references: TemplateReference[];
  passingThreshold: number;
  criticalFailKeys: string[];
  sessionQuestions: TemplateQuestion[];
  sampleQuestions: TemplateQuestion[];
  archived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
  replacedByTemplateId?: string;
}

export interface TemplateReference {
  system: string;
  code: string;
  title: string;
  whyItMatters: string;
}

export interface TemplateQuestion {
  key: string;
  label: string;
  type: 'text' | 'select' | 'yn' | 'patientCode' | 'number' | 'date';
  options?: string[];
  required: boolean;
  score: number;
  criticalFailIf?: string;
}

export interface AuditSession {
  id: string;
  templateId: string;
  templateTitle: string;
  createdAt: string;
  header: SessionHeader;
  samples: AuditSample[];
}

export interface SessionHeader {
  status: 'draft' | 'in_progress' | 'complete';
  sessionId: string;
  auditDate: string;
  auditor: string;
  unit: string;
  immediateAction?: string;
  immediateActionDate?: string;
  followUpAction?: string;
  followUpActionDate?: string;
  [key: string]: string;
}

export interface AuditSample {
  id: string;
  answers: Record<string, string>;
  result: SampleResult;
  staffAudited?: string; // Optional: staff member being audited for this sample
  immediateAction?: string;
  immediateActionDate?: string;
  followUpAction?: string;
  followUpActionDate?: string;
}

export interface SampleResult {
  pct: number;
  pass: boolean;
  criticalFails: string[];
  actionNeeded: ActionItem[];
  max: number;
  got: number;
}

export interface ActionItem {
  key: string;
  label: string;
  reason: string;
}

export interface QaAction {
  id: string;
  createdAt: string;
  status: 'open' | 'in_progress' | 'complete';
  templateId: string;
  templateTitle: string;
  unit: string;
  auditDate: string;
  sessionId: string;
  sample: string;
  issue: string;
  reason: string;
  topic: string;
  summary: string;
  owner: string;
  dueDate: string;
  completedAt: string;
  notes: string;
  ftagTags: string[];
  nydohTags: string[];
  // Re-audit fields
  reAuditDueDate: string;
  reAuditCompletedAt: string;
  reAuditSessionRef: string;
  reAuditTemplateId: string;
  // Evidence checklist
  ev_policyReviewed: boolean;
  ev_educationProvided: boolean;
  ev_competencyValidated: boolean;
  ev_correctiveAction: boolean;
  ev_monitoringInPlace: boolean;
  // Linked education
  linkedEduSessionId: string;
  // Staff being audited
  staffAudited?: string;
}

export interface EducationSession {
  id: string;
  createdAt: string;
  status: 'planned' | 'completed';
  topic: string;
  summary: string;
  audience: string;
  instructor: string;
  unit: string;
  scheduledDate: string;
  completedDate: string;
  notes: string;
  templateTitle: string;
  templateId: string;
  issue: string;
  linkedQaActionId: string;
  category?: string;
  attendees?: string[];
}

export interface OrientationRecord {
  id: string;
  date: string;
  weekStart: string;
  orientee: string;
  department: string;
  position: string;
  hireDate: string;
  status: 'active' | 'completed' | 'terminated';
  terminationDate: string;
  retention30: boolean;
  retention60: boolean;
  retention90: boolean;
  notes: string;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  lastSeenUploadAt: string;
}

export interface AdminOwners {
  qapiLead: string;
  don: string;
  ip: string;
  educator: string;
  hr: string;
  unitMgr: string;
  admin: string;
}

export interface EduTopic {
  id: string;
  topic: string;
  description: string;
  purpose: string;
  disciplines: string;
  ftags: string;
  nysdohRegs: string;
  facilityPolicy: string;
  archived?: boolean;
  archivedAt?: string;
  triggerAuditId?: string;
  evidenceArtifacts?: string[];
}

export interface CompetencySkill {
  id: string;
  code: string;
  title: string;
  disciplines: string[];
  platform: 'Mastered' | 'C';
  keywords: string[];
}

// Analytics types
export interface TrendDataPoint {
  date: string;
  samples: number;
  critical: number;
  compliance: number;
}

export interface ClosedLoopStats {
  total: number;
  open: number;
  prog: number;
  done: number;
  closureRate: number;
  closed7: number;
  closed14: number;
  closed30: number;
  overdueCount: number;
  avgCloseDays: number;
  byOwner: Record<string, OwnerStats>;
  byUnit: Record<string, OwnerStats>;
}

export interface OwnerStats {
  open: number;
  in_progress: number;
  complete: number;
  overdue: number;
}

export interface SessionSummary {
  sessions: number;
  samples: number;
  passing: number;
  compliance: number;
  criticalFails: number;
  criticalRate: number;
  byTool: ToolSummary[];
  byUnit: UnitSummary[];
  critItems: CritItem[];
  actionItems: ActionSummaryItem[];
}

export interface ToolSummary {
  title: string;
  total: number;
  passing: number;
  rate: number;
  criticals: number;
}

export interface UnitSummary {
  unit: string;
  total: number;
  pass: number;
  rate: number;
}

export interface CritItem {
  key: string;
  label: string;
  count: number;
}

export interface ActionSummaryItem {
  issue: string;
  template: string;
  count: number;
}

// Filter state
export interface DashboardFilters {
  range: string;
  unit: string;
  tool: string;
}

export interface ActionsFilters {
  range: string;
  status: string;
  tool: string;
  search: string;
}

export interface EducationFilters {
  status: string;
  search: string;
  fromYmd: string;
  toYmd: string;
}

export interface AnalyticsFilters {
  fromYmd: string;
  toYmd: string;
  unit: string;
  range: string;
}

// App State
export interface AppState {
  activeTab: string;
  templates: AuditTemplate[];
  sessions: AuditSession[];
  qaActions: QaAction[];
  eduSessions: EducationSession[];
  orientationRecords: OrientationRecord[];
  eduLibrary: EduTopic[];
  staffDirectory: { rows: StaffMember[]; asOf: string };
  adminOwners: AdminOwners;
  dashFilters: DashboardFilters;
  actionsFilters: ActionsFilters;
  eduFilters: EducationFilters;
  analyticsFilters: AnalyticsFilters;
  facilityName: string;
}
