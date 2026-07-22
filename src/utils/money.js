/**
 * Money input helpers shared by every amount field in the app.
 */

/**
 * Sanitize free text into a valid money string:
 * keeps only digits and a single decimal point, with at most 2 decimals.
 * e.g. "12.345" -> "12.34", "1a.2.3" -> "1.23", "$5" -> "5".
 */
export function sanitizeAmount(text) {
  let v = String(text ?? '').replace(/[^0-9.]/g, '');
  const parts = v.split('.');
  if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
  const [int, dec] = v.split('.');
  return dec !== undefined ? `${int}.${dec.slice(0, 2)}` : v;
}
