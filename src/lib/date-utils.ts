/**
 * Validate and normalize date to ISO YYYY-MM-DD format
 * Returns empty string if invalid
 */
export function validateAndNormalizeDate(input: string): string {
  if (!input) return '';

  const dateOnly = input.split('T')[0];
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoPattern.test(dateOnly)) return '';

  const [year, month, day] = dateOnly.split('-').map(Number);
  if (year < 1900 || year > 2100) return '';
  if (month < 1 || month > 12) return '';
  if (day < 1 || day > 31) return '';

  const date = new Date(`${dateOnly}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  if (date.toISOString().slice(0, 10) !== dateOnly) return '';

  return dateOnly;
}

export function isDateBefore(date1: string, date2: string): boolean {
  const d1 = validateAndNormalizeDate(date1);
  const d2 = validateAndNormalizeDate(date2);
  if (!d1 || !d2) return false;
  return d1 < d2;
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'complete' || status === 'completed') return false;
  if (!dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return isDateBefore(dueDate, today);
}

export function isFutureDate(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return isDateBefore(today, date);
}

export function daysBetween(startDate: string, endDate: string): number {
  const d1 = validateAndNormalizeDate(startDate);
  const d2 = validateAndNormalizeDate(endDate);
  if (!d1 || !d2) return 0;

  const start = new Date(`${d1}T00:00:00Z`);
  const end = new Date(`${d2}T00:00:00Z`);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function addDays(date: string, days: number): string {
  const normalized = validateAndNormalizeDate(date);
  if (!normalized) return '';
  const d = new Date(`${normalized}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}
