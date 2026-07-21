/**
 * Date helpers shared across modules. All persisted dates are local-time
 * `YYYY-MM-DD` strings (date-only) or ISO strings (datetime fields).
 */

const MS_DAY = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

const pad2 = (n) => String(n).padStart(2, '0');

/** Today's date as a local `YYYY-MM-DD` string. */
export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Parse a `YYYY-MM-DD` (or ISO) string into a local Date at midnight; null if invalid. */
export function parseDate(str) {
  if (!str || !DATE_RE.test(str)) return null;
  const [y, m, d] = str.slice(0, 10).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole days between two date strings (b − a); null if either is invalid. */
export function daysBetween(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / MS_DAY);
}

/** Days from today until `dateStr` (negative when in the past); null if invalid. */
export function daysUntil(dateStr) {
  return daysBetween(todayStr(), dateStr);
}

/** True when `dateStr` is strictly before today. */
export function isPast(dateStr) {
  const d = daysUntil(dateStr);
  return d !== null && d < 0;
}

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Format `YYYY-MM-DD` as `Mar 08, 2014`; returns '--' when empty/invalid. */
export function formatDisplay(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '--';
  return `${MONTHS_SHORT[d.getMonth()]} ${pad2(d.getDate())}, ${d.getFullYear()}`;
}
