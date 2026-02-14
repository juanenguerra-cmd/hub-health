import { createElement } from 'react';

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and encodes special characters
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize multi-line text (preserve newlines)
 */
export function sanitizeMultiline(input: string): string {
  if (!input) return '';
  return input
    .split('\n')
    .map((line) => sanitizeText(line))
    .join('\n');
}

/**
 * Safe render for potentially unsafe content
 */
export function SafeText({ children }: { children: string }) {
  return createElement('span', { dangerouslySetInnerHTML: { __html: sanitizeText(children) } });
}
