/**
 * Timemory SQLite foundation (native platforms).
 * Singleton database handle + schema bootstrap.
 * All data modules (durables, assets, bills, schedules, diaries,
 * important dates, mood check-ins) share this instance.
 *
 * Web resolves ./db.web.js instead (AsyncStorage-backed) — expo-sqlite's web
 * implementation needs WASM that Metro cannot bundle.
 */
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'timemory.db';

/** Every module table — used by schema bootstrap and Reset (clear all). */
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

const SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS durables (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    acquisition_method TEXT,
    purchase_date TEXT,
    purchase_price REAL,
    status TEXT DEFAULT 'in_use',
    expected_lifespan TEXT,
    expiry_date TEXT,
    linked_asset_id TEXT,
    repair_record TEXT,
    currency TEXT,
    notes TEXT,
    image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    acquisition_method TEXT,
    status TEXT DEFAULT 'active',
    purchase_date TEXT,
    purchase_price REAL,
    current_price REAL,
    expiry_date TEXT,
    repair_record TEXT,
    currency TEXT,
    notes TEXT,
    image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    bill_type TEXT DEFAULT 'expense',
    amount REAL,
    category TEXT,
    consumption_date TEXT,
    currency TEXT,
    source TEXT,
    source_id TEXT,
    notes TEXT,
    receipt_image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    priority TEXT,
    status TEXT DEFAULT 'not_started',
    start_date TEXT,
    end_date TEXT,
    reminder_enabled INTEGER DEFAULT 0,
    checklist TEXT,
    notes TEXT,
    image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS diaries (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT,
    date TEXT,
    weather TEXT,
    content TEXT,
    is_private INTEGER DEFAULT 0,
    image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS important_dates (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    date TEXT,
    type TEXT,
    category TEXT,
    priority TEXT,
    reminder_type TEXT DEFAULT 'annual',
    reminder_enabled INTEGER DEFAULT 0,
    reminder_days_before INTEGER DEFAULT 1,
    notes TEXT,
    image TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY NOT NULL,
    year TEXT NOT NULL,
    expense_budget REAL DEFAULT 0,
    income_target REAL DEFAULT 0,
    currency TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS check_ins (
    check_date TEXT PRIMARY KEY NOT NULL,
    mood TEXT NOT NULL,
    created_at TEXT
  );
`;

let dbPromise = null;

/**
 * Columns added after the first schema version. CREATE TABLE IF NOT EXISTS
 * never alters an existing database, so databases created before the V2
 * schema are topped up here (ALTER TABLE ADD COLUMN is additive and safe).
 */
const MIGRATION_COLUMNS = {
  durables: ['updated_at TEXT'],
  bills: ['updated_at TEXT'],
  schedules: ['updated_at TEXT'],
  diaries: ['is_private INTEGER DEFAULT 0', 'updated_at TEXT'],
  important_dates: [
    'priority TEXT',
    "reminder_type TEXT DEFAULT 'annual'",
    'reminder_days_before INTEGER DEFAULT 1',
    'updated_at TEXT',
  ],
};

async function ensureColumns(db) {
  for (const [table, defs] of Object.entries(MIGRATION_COLUMNS)) {
    const info = await db.getAllAsync(`PRAGMA table_info(${table})`);
    const existing = new Set(info.map((c) => c.name));
    for (const def of defs) {
      const name = def.split(' ')[0];
      if (!existing.has(name)) {
        await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${def}`);
      }
    }
  }
}

/**
 * Returns a promise of the singleton database instance.
 * Opens the DB on first call and ensures the schema exists.
 */
export function getDb() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync(SCHEMA_SQL);
      await ensureColumns(db);
      return db;
    });
  }
  return dbPromise;
}

// ── Settings (key-value) ──────────────────────────

/** Read all settings rows as [{ key, value }] (value = JSON string). */
export async function loadSettingsRows() {
  const db = await getDb();
  return db.getAllAsync('SELECT key, value FROM settings');
}

/** Persist a single setting. `value` must already be a JSON string. */
export async function saveSettingRow(key, value) {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}

// ── Mood check-ins ────────────────────────────────

/** All check-in records as [{ check_date, mood, created_at }], oldest first. */
export async function getAllCheckIns() {
  const db = await getDb();
  return db.getAllAsync('SELECT check_date, mood, created_at FROM check_ins ORDER BY check_date');
}

/** Insert or update the mood for a given date (YYYY-MM-DD). */
export async function upsertCheckIn(checkDate, mood) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO check_ins (check_date, mood, created_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(check_date) DO UPDATE SET mood = excluded.mood`,
    [checkDate, mood]
  );
}

// ── Generic row access (import / export / reset) ──

/** All rows of a module table. `table` must be one of DATA_TABLES. */
export async function getAllRows(table) {
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM ${table}`);
}

/** Insert one row given as a plain object (columns taken from keys). */
export async function insertRow(table, obj) {
  const db = await getDb();
  const keys = Object.keys(obj);
  const placeholders = keys.map(() => '?').join(', ');
  await db.runAsync(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    keys.map((k) => obj[k])
  );
}

/** Move every row whose `category` equals fromKey over to toKey (default 'other'). */
export async function reassignCategory(table, fromKey, toKey = 'other') {
  const db = await getDb();
  await db.runAsync(`UPDATE ${table} SET category = ? WHERE category = ?`, [toKey, fromKey]);
}

/** One row by primary key, or null when absent. */
export async function getRowById(table, id) {
  const db = await getDb();
  const rows = await db.getAllAsync(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

/** Patch the row with the given id; `obj` maps column → new value. */
export async function updateRow(table, id, obj) {
  const db = await getDb();
  const keys = Object.keys(obj);
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...keys.map((k) => obj[k]), id]);
}

/** Delete the row with the given id. */
export async function deleteRow(table, id) {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

/** Wipe every module table (settings are kept). */
export async function clearAllData() {
  const db = await getDb();
  for (const table of DATA_TABLES) {
    await db.runAsync(`DELETE FROM ${table}`);
  }
}
