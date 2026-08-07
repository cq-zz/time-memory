/**
 * Schedule (计划) domain layer.
 * Thin service over the platform db (SQLite native / AsyncStorage web) that
 * owns CRUD plus the derived values the UI shows (effective status, checklist
 * progress, date range). Field names match the old project's `schedules`
 * table exactly. `checklist` is stored as a JSON string of {id,text,done}[].
 */
import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { todayStr } from '../utils/date';

const TABLE = 'schedules';

// ── Derived values (pure — take a row) ────────────

/**
 * Effective status. `todo` is a legacy alias for `not_started`. A plan that is
 * not done/incomplete and whose end_date has passed reads as `incomplete`.
 */
export function effectiveStatus(row) {
  let status = row.status || 'not_started';
  if (status === 'todo') status = 'not_started';
  if (status !== 'done' && status !== 'incomplete' && row.end_date) {
    if (row.end_date < todayStr()) return 'incomplete';
  }
  return status;
}

/** Parse the stored checklist JSON into an array (never throws). */
export function parseChecklist(row) {
  try {
    const raw = row?.checklist;
    const items = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** { done, total } counts for the checklist. */
export function progress(row) {
  const items = parseChecklist(row);
  return { done: items.filter((i) => i.done).length, total: items.length };
}

// ── CRUD ──────────────────────────────────────────

/** All schedules, newest created_at first. */
export async function listSchedules() {
  const rows = await getAllRows(TABLE);
  return rows.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

export async function getSchedule(id) {
  return getRowById(TABLE, id);
}

/**
 * Insert (no id) or update (with id). `values` is a plain object of columns;
 * a `checklist` array is stringified here so callers pass plain arrays.
 */
export async function saveSchedule(values, id) {
  const now = new Date().toISOString();
  const fields = { ...values };
  if (Array.isArray(fields.checklist)) fields.checklist = JSON.stringify(fields.checklist);
  fields.reminder_enabled = fields.reminder_enabled ? 1 : 0;
  let savedId;
  if (id) {
    await updateRow(TABLE, id, { ...fields, updated_at: now });
    savedId = id;
  } else {
    const newId = genId();
    await insertRow(TABLE, { id: newId, ...fields, created_at: now, updated_at: now });
    savedId = newId;
  }
  import('./notifications').then((m) => m.debouncedReschedule());
  return savedId;
}

/** Partial update (quick status / reminder toggles). Adds updated_at. */
export async function patchSchedule(id, patch) {
  const fields = { ...patch };
  if (Array.isArray(fields.checklist)) fields.checklist = JSON.stringify(fields.checklist);
  if (fields.reminder_enabled !== undefined) fields.reminder_enabled = fields.reminder_enabled ? 1 : 0;
  const result = await updateRow(TABLE, id, { ...fields, updated_at: new Date().toISOString() });
  import('./notifications').then((m) => m.debouncedReschedule());
  return result;
}

export async function removeSchedule(id) {
  const result = await deleteRow(TABLE, id);
  import('./notifications').then((m) => m.debouncedReschedule());
  return result;
}
