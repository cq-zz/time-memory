import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { todayStr } from '../utils/date';

const TABLE = 'diaries';

/**
 * All diaries sorted by date DESC (then created_at DESC).
 * Future-dated entries are excluded (matches legacy behaviour).
 */
export async function listDiaries() {
  const rows = await getAllRows(TABLE);
  const today = todayStr();
  return rows
    .filter((r) => !r.date || r.date <= today)
    .sort(
      (a, b) =>
        (b.date || '').localeCompare(a.date || '') ||
        (b.created_at || '').localeCompare(a.created_at || '')
    );
}

/** Summary values used by the diary overview card. */
export async function diaryStats() {
  const rows = await listDiaries();
  const currentYear = todayStr().slice(0, 4);
  return {
    totalCount: rows.length,
    currentYearCount: rows.filter((row) => String(row?.date || '').startsWith(currentYear)).length,
    privateCount: rows.filter((row) => Number(row?.is_private) === 1).length,
  };
}

export async function getDiary(id) {
  return getRowById(TABLE, id);
}

/**
 * Create or update a diary entry.
 * - title is required
 * - date defaults to today; future dates are rejected
 * - is_private is normalised to 0/1
 * Throws an Error with a message key on validation failure.
 */
export async function saveDiary(values, id) {
  const now = new Date().toISOString();
  const fields = { ...values };
  if (!fields.title || !fields.title.trim()) throw new Error('titleRequired');
  if (!fields.date) fields.date = todayStr();
  if (fields.date > todayStr()) throw new Error('dateFuture');
  fields.title = fields.title.trim();
  fields.is_private = fields.is_private ? 1 : 0;

  if (id) {
    await updateRow(TABLE, id, { ...fields, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...fields, created_at: now, updated_at: now });
  return newId;
}

export async function removeDiary(id) {
  return deleteRow(TABLE, id);
}
