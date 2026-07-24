/**
 * Web fallback for the Timemory data layer.
 * Mirrors the full API surface of db.js, but persists to AsyncStorage
 * (localStorage) instead of SQLite — expo-sqlite's web implementation
 * requires a WASM binary that Metro cannot resolve.
 *
 * Layout: settings under one JSON object key; each module table as a
 * JSON array under `timemory.data.<table>`.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'timemory.settings';
const tableKey = (table) => `timemory.data.${table}`;

export const DATA_TABLES = [
  'durables',
  'assets',
  'bills',
  'schedules',
  'diaries',
  'important_dates',
  'check_ins',
  'budgets',
];

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function readTable(table) {
  return readJson(tableKey(table), []);
}

async function writeTable(table, rows) {
  await AsyncStorage.setItem(tableKey(table), JSON.stringify(rows));
}

// ── Settings (key-value) ──────────────────────────

/** Read all settings rows as [{ key, value }] (value = JSON string). */
export async function loadSettingsRows() {
  const obj = await readJson(SETTINGS_KEY, {});
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

/** Persist a single setting. `value` must already be a JSON string. */
export async function saveSettingRow(key, value) {
  try {
    const obj = await readJson(SETTINGS_KEY, {});
    obj[key] = value;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(obj));
  } catch (e) {
    console.warn('[db.web] persist failed:', e);
  }
}

// ── Mood check-ins ────────────────────────────────

/** All check-in records as [{ check_date, mood, created_at }], oldest first. */
export async function getAllCheckIns() {
  const rows = await readTable('check_ins');
  return [...rows].sort((a, b) => (a.check_date < b.check_date ? -1 : 1));
}

/** Insert or update the mood for a given date (YYYY-MM-DD). */
export async function upsertCheckIn(checkDate, mood) {
  try {
    const rows = await readTable('check_ins');
    const idx = rows.findIndex((r) => r.check_date === checkDate);
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], mood };
    } else {
      rows.push({ check_date: checkDate, mood, created_at: new Date().toISOString() });
    }
    await writeTable('check_ins', rows);
  } catch (e) {
    console.warn('[db.web] check-in persist failed:', e);
  }
}

/** Remove a mood check-in for a given date (YYYY-MM-DD). */
export async function deleteCheckIn(checkDate) {
  const rows = await readTable('check_ins');
  await writeTable('check_ins', rows.filter((row) => row.check_date !== checkDate));
}

// ── Generic row access (import / export / reset) ──

/** All rows of a module table. `table` must be one of DATA_TABLES. */
export async function getAllRows(table) {
  return readTable(table);
}

/** Insert one row given as a plain object. */
export async function insertRow(table, obj) {
  const rows = await readTable(table);
  rows.push(obj);
  await writeTable(table, rows);
}

/** Move every row whose `category` equals fromKey over to toKey (default 'other'). */
export async function reassignCategory(table, fromKey, toKey = 'other') {
  const rows = await readTable(table);
  let changed = false;
  const updated = rows.map((r) => {
    if (r.category === fromKey) {
      changed = true;
      return { ...r, category: toKey };
    }
    return r;
  });
  if (changed) await writeTable(table, updated);
}

/** One row by primary key, or null when absent. */
export async function getRowById(table, id) {
  const rows = await readTable(table);
  return rows.find((r) => r.id === id) || null;
}

/** Patch the row with the given id; `obj` maps column → new value. */
export async function updateRow(table, id, obj) {
  const rows = await readTable(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rows[idx] = { ...rows[idx], ...obj };
  await writeTable(table, rows);
}

/** Delete the row with the given id. */
export async function deleteRow(table, id) {
  const rows = await readTable(table);
  await writeTable(table, rows.filter((r) => r.id !== id));
}

/** Wipe every module table and all settings except explicitly preserved keys. */
export async function clearAllData(keepSettingsKeys = []) {
  await AsyncStorage.multiRemove(DATA_TABLES.map(tableKey));
  const rows = await loadSettingsRows();
  const keep = new Set(keepSettingsKeys);
  await AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(Object.fromEntries(rows.filter((row) => keep.has(row.key)).map((row) => [row.key, row.value]))),
  );
}

/** SQLite is unavailable on web — callers needing raw SQL must guard. */
export function getDb() {
  return Promise.reject(new Error('SQLite is not available on web'));
}

export function importDatabase() {
  return Promise.reject(new Error('SQLite is not available on web'));
}

export async function getDbFilePath() {
  throw new Error('SQLite is not available on web');
}

export async function getDbPath() {
  throw new Error('SQLite is not available on web');
}

export async function closeDb() {
  throw new Error('SQLite is not available on web');
}
