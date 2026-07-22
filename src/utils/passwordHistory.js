/**
 * Password operation history (ported from the legacy project).
 * Records every set / change / reset of the private-diary password with a
 * timestamp, newest first. Persisted as a JSON list in the cross-platform
 * settings layer (key `security.passwordHistory`) so it survives on both
 * native (SQLite) and web (AsyncStorage).
 */
import { loadSettingsRows, saveSettingRow } from '../store/db';

const HISTORY_KEY = 'security.passwordHistory';

/**
 * Log a password operation.
 * @param {"set"|"change"|"reset"} type
 */
export async function logPasswordAction(type) {
  const record = {
    type,
    time: formatTime(new Date()),
  };
  const list = await readList();
  list.unshift(record);
  try {
    await saveSettingRow(HISTORY_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('[passwordHistory] persist failed:', e);
  }
}

/**
 * All password operation records, newest first.
 * @returns {Promise<Array<{type: string, time: string}>>}
 */
export async function getPasswordHistory() {
  return readList();
}

/** Wipe all password operation records. */
export async function clearPasswordHistory() {
  try {
    await saveSettingRow(HISTORY_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('[passwordHistory] clear failed:', e);
  }
}

async function readList() {
  try {
    const rows = await loadSettingsRows();
    const row = rows.find((r) => r.key === HISTORY_KEY);
    if (!row) return [];
    const list = JSON.parse(row.value);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Format a date as yyyy-MM-dd HH:mm (local time). */
function formatTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}
