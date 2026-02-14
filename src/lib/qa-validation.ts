import type { QaAction } from '@/types/nurse-educator';

export function validateQaActionClosure(action: QaAction): {
  canClose: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // At least 2 evidence items required (stricter)
  const evidenceCount = [
    action.ev_policyReviewed,
    action.ev_educationProvided,
    action.ev_competencyValidated,
    action.ev_correctiveAction,
    action.ev_monitoringInPlace
  ].filter(Boolean).length;

  if (evidenceCount < 2) {
    errors.push('At least TWO evidence items must be documented for closure');
  }

  // Education provided must have linked session
  if (action.ev_educationProvided && (!action.linkedEducationSessions || action.linkedEducationSessions.length === 0)) {
    errors.push('Education checkbox marked but no education session linked');
  }

  // Re-audit validation
  if (action.reAuditDueDate && !action.reAuditResults) {
    errors.push('Re-audit scheduled but not completed');
  }

  if (action.reAuditResults && !action.reAuditResults.passed) {
    errors.push('Re-audit failed - action cannot be closed until re-audit passes');
  }

  // Competency issues require validation
  if (action.issue.toLowerCase().includes('competency') && !action.ev_competencyValidated) {
    errors.push('Competency-related issues require competency validation');
  }

  // Critical severity requires corrective action
  if (action.severity === 'critical' && !action.ev_correctiveAction) {
    errors.push('Critical severity requires documented corrective action');
  }

  return {
    canClose: errors.length === 0,
    errors,
    warnings
  };
}
