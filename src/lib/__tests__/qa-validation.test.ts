import { describe, expect, it } from 'vitest';
import { validateQaActionClosure } from '@/lib/qa-validation';
import type { QaAction } from '@/types/nurse-educator';

const createMockQaAction = (overrides: Partial<QaAction> = {}): QaAction => ({
  id: 'qa_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: 'open',
  templateId: 'tpl_1',
  templateTitle: 'Hand Hygiene',
  unit: 'Unit 2',
  auditDate: '2026-01-01',
  sessionId: 'S-1',
  sample: 'A',
  issue: 'Competency gap',
  reason: 'Missed protocol',
  topic: '',
  summary: '',
  owner: '',
  dueDate: '2026-01-15',
  completedAt: '',
  notes: '',
  ftagTags: [],
  nydohTags: [],
  reAuditDueDate: '',
  reAuditCompletedAt: '',
  reAuditSessionRef: '',
  reAuditTemplateId: '',
  ev_policyReviewed: false,
  ev_educationProvided: false,
  ev_competencyValidated: false,
  ev_correctiveAction: false,
  ev_monitoringInPlace: false,
  linkedEduSessionId: '',
  linkedEducationSessions: [],
  staffAudited: 'Staff A',
  ...overrides,
});

describe('validateQaActionClosure', () => {
  it('should require at least one evidence item', () => {
    const action = createMockQaAction({
      ev_policyReviewed: false,
      ev_educationProvided: false,
      ev_competencyValidated: false,
      ev_correctiveAction: false,
      ev_monitoringInPlace: false,
    });
    const result = validateQaActionClosure(action);
    expect(result.canClose).toBe(false);
    expect(result.errors).toContain('At least one evidence item must be documented');
  });

  it('should flag missing re-audit when required', () => {
    const action = createMockQaAction({
      ev_policyReviewed: true,
      reAuditDueDate: '2026-02-01',
      reAuditResults: undefined,
    });
    const result = validateQaActionClosure(action);
    expect(result.errors).toContain('Re-audit required but not completed');
  });
});
