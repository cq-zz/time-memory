/**
 * Important-date (重要日子) domain layer.
 * Thin service over the platform db (SQLite native / AsyncStorage web) that
 * owns CRUD plus the derived countdown values the UI shows (days until the
 * next occurrence, years passed). Field names match the old project's
 * `important_dates` table exactly. `reminder_type` is 'annual' (recurs each
 * year) or 'once' (fires a single time).
 */
import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { parseDate, daysBetween, todayStr } from '../utils/date';

const TABLE = 'important_dates';
const MS_DAY = 86400000;

// ── Derived values (pure — take a row) ────────────

/**
 * Days until the next occurrence, or null when there is no date.
 * 'once' counts down to the original date (can go negative = passed).
 * 'annual' rolls the month/day forward to the next upcoming occurrence (>= 0).
 */
export function countdownDays(row) {
  const target = parseDate(row?.date);
  if (!target) return null;
  if ((row.reminder_type || 'annual') === 'once') {
    return daysBetween(todayStr(), row.date);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, target.getMonth(), target.getDate());
  }
  return Math.round((next.getTime() - today.getTime()) / MS_DAY);
}

/** Whole years elapsed since the date (for "Nth year" display); null if no date. */
export function yearsPassed(row) {
  const d = parseDate(row?.date);
  if (!d) return null;
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const mDiff = now.getMonth() - d.getMonth();
  if (mDiff < 0 || (mDiff === 0 && now.getDate() < d.getDate())) years -= 1;
  return Math.max(0, years);
}

// ── CRUD ──────────────────────────────────────────

/** All important dates sorted by soonest occurrence first. */
export async function listImportantDates() {
  const rows = await getAllRows(TABLE);
  return rows.sort((a, b) => {
    const da = countdownDays(a);
    const db = countdownDays(b);
    return (da ?? 999999) - (db ?? 999999);
  });
}

/** Summary values used by the module overview card. */
export async function importantDateStats() {
  const rows = await getAllRows(TABLE);
  const upcoming = rows.filter((row) => {
    const days = countdownDays(row);
    return days != null && days >= 0 && days <= 30;
  });
  return {
    totalCount: rows.length,
    upcomingCount: upcoming.length,
    nextDays: rows.reduce((min, row) => {
      const days = countdownDays(row);
      return days != null && days >= 0 ? Math.min(min, days) : min;
    }, Infinity),
  };
}

export async function getImportantDate(id) {
  return getRowById(TABLE, id);
}

/** Insert (no id) or update (with id). Timestamps managed here. */
export async function saveImportantDate(values, id) {
  const now = new Date().toISOString();
  const fields = { ...values };
  fields.reminder_enabled = fields.reminder_enabled ? 1 : 0;
  const reminderDays = Number(fields.reminder_days_before);
  if (
    fields.reminder_enabled &&
    (!Number.isInteger(reminderDays) || reminderDays < 0 || reminderDays > 365)
  ) {
    throw new Error('reminderDaysInvalid');
  }
  fields.reminder_days_before = fields.reminder_enabled ? reminderDays : 0;
  if (id) {
    await updateRow(TABLE, id, { ...fields, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...fields, created_at: now, updated_at: now });
  return newId;
}

/** Partial update (e.g. reminder toggle). Adds updated_at. */
export async function patchImportantDate(id, patch) {
  const fields = { ...patch };
  if (fields.reminder_enabled !== undefined) fields.reminder_enabled = fields.reminder_enabled ? 1 : 0;
  return updateRow(TABLE, id, { ...fields, updated_at: new Date().toISOString() });
}

export async function removeImportantDate(id) {
  return deleteRow(TABLE, id);
}
