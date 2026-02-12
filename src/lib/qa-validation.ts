import type { QaAction } from '@/types/nurse-educator';

export function validateQaActionClosure(action: QaAction): {
  canClose: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const evidenceCount = [
    action.ev_policyReviewed,
    action.ev_educationProvided,
    action.ev_competencyValidated,
    action.ev_correctiveAction,
    action.ev_monitoringInPlace
  ].filter(Boolean).length;

  if (evidenceCount === 0) {
    errors.push('At least one evidence item must be documented');
  }

  if (action.reAuditDueDate && !action.reAuditResults) {
    errors.push('Re-audit required but not completed');
  }

  if (action.reAuditResults && !action.reAuditResults.passed) {
    warnings.push('Re-audit did not pass - issue may not be resolved');
  }

  if (action.issue.toLowerCase().includes('competency') && (action.linkedEducationSessions || []).length === 0) {
    warnings.push('Competency issue should link to education session');
  }

  return {
    canClose: errors.length === 0,
    errors,
    warnings
  };
}
