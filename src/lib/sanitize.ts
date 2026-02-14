/**
 * Sanitize user input to prevent XSS attacks
 * Strips HTML tags and encodes special characters
 */
export function sanitizeText(input: string): string {
  if (!input) return '';

  const stripped = input.replace(/<[^>]*>/g, '');
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize multi-line text (preserves newlines)
 */
export function sanitizeMultiline(input: string): string {
  if (!input) return '';
  return input
    .split('\n')
    .map((line) => sanitizeText(line))
    .join('\n');
}

/**
 * Sanitize for URL context (additional encoding)
 */
export function sanitizeUrl(input: string): string {
  if (!input) return '';
  try {
    const url = new URL(input);
    return url.href;
  } catch {
    return '';
  }
}

/**
 * Strip all HTML tags (aggressive sanitization)
 */
export function stripHtml(input: string): string {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '');
}

