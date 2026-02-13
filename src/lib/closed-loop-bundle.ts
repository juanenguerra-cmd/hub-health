import type { EducationSession, QaAction } from '@/types/nurse-educator';

export type BundleSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ClosedLoopBundleInput {
  templateId: string;
  templateTitle: string;
  findingLabel: string;
  findingReason: string;
  auditDate: string;
  sessionId: string;
  sampleId: string;
  severity?: BundleSeverity;
  unit?: string;
  topic?: string;
  staffAudited?: string;
  staffRole?: string;
  owner?: string;
  ftagTags?: string[];
  nydohTags?: string[];
  now?: Date;
}

export interface ClosedLoopBundleResult {
  caseId: string;
  qaAction: QaAction;
  educationDraft: EducationSession;
  reAuditDueDate: string;
}

const DUE_POLICY: Record<BundleSeverity, number> = {
  critical: 2,
  high: 7,
  medium: 14,
  low: 30,
};

const addDays = (date: Date, days: number): string => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

export function createClosedLoopBundle(input: ClosedLoopBundleInput): ClosedLoopBundleResult {
  const now = input.now ?? new Date();
  const severity = input.severity ?? 'medium';
  const caseId = `CASE-${now.getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const qaId = `qa_${crypto.randomUUID().slice(0, 8)}`;
  const eduId = `edu_${crypto.randomUUID().slice(0, 8)}`;
  const dueDate = addDays(now, DUE_POLICY[severity]);

  const qaAction: QaAction = {
    id: qaId,
    caseId,
    severity,
    createdAt: now.toISOString(),
    status: 'open',
    templateId: input.templateId,
    templateTitle: input.templateTitle,
    unit: input.unit || '',
    auditDate: input.auditDate,
    sessionId: input.sessionId,
    sample: input.sampleId,
    issue: input.findingLabel,
    reason: input.findingReason,
    topic: input.topic || input.findingLabel,
    summary: `Closed-loop bundle created from finding: ${input.findingLabel}`,
    owner: input.owner || '',
    dueDate,
    completedAt: '',
    notes: '',
    ftagTags: input.ftagTags || [],
    nydohTags: input.nydohTags || [],
    reAuditDueDate: dueDate,
    reAuditCompletedAt: '',
    reAuditSessionRef: '',
    reAuditTemplateId: input.templateId,
    ev_policyReviewed: false,
    ev_educationProvided: false,
    ev_competencyValidated: false,
    ev_correctiveAction: false,
    ev_monitoringInPlace: false,
    linkedEduSessionId: eduId,
    linkedEducationSessions: [eduId],
    staffAudited: input.staffAudited || '',
    staffRole: input.staffRole || '',
  };

  const educationDraft: EducationSession = {
    id: eduId,
    caseId,
    createdAt: now.toISOString(),
    status: 'planned',
    topic: input.topic || input.findingLabel,
    summary: `Education draft linked to case ${caseId}`,
    audience: input.staffRole || 'Nursing',
    instructor: input.owner || '',
    unit: input.unit || '',
    scheduledDate: dueDate,
    completedDate: '',
    notes: '',
    templateTitle: input.templateTitle,
    templateId: input.templateId,
    issue: input.findingLabel,
    linkedQaActionId: qaId,
  };

  return { caseId, qaAction, educationDraft, reAuditDueDate: dueDate };
}
