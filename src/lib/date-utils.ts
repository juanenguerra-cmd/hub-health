/**
 * Validate and normalize date to ISO YYYY-MM-DD format
 * Returns empty string if invalid
 */
export function validateAndNormalizeDate(input: string): string {
  if (!input) return '';

  // Remove time component if present
  const dateOnly = input.split('T')[0];

  // Validate format YYYY-MM-DD
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoPattern.test(dateOnly)) return '';

  // Validate date is real and matches requested date components
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  if (date.toISOString().slice(0, 10) !== dateOnly) return '';

  // Ensure normalized output
  return dateOnly;
}

/**
 * Safe date comparison (handles empty strings)
 */
export function isDateBefore(date1: string, date2: string): boolean {
  const d1 = validateAndNormalizeDate(date1);
  const d2 = validateAndNormalizeDate(date2);
  if (!d1 || !d2) return false;
  return d1 < d2;
}

/**
 * Safe overdue check
 */
export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'complete') return false;
  const today = new Date().toISOString().split('T')[0];
  return isDateBefore(dueDate, today);
}
