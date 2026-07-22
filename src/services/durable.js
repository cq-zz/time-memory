/**
 * Durable (物品) domain layer.
 * Thin service over the platform db (SQLite native / AsyncStorage web) that
 * owns CRUD plus the derived values the UI shows (companion duration, daily
 * average cost, total cost, repair-record parsing). Field names match the
 * old project's `durables` table exactly.
 */
import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { todayStr, daysBetween, daysUntil, isPast } from '../utils/date';
import { inCurrentCurrency } from '../store/settings';

const TABLE = 'durables';

// ── repair_record (JSON text column) ──────────────
// Shape: { expenses: [{name,cost,category,date}], incomes: [...], transferAmount }
// A legacy plain array is treated as expenses.

export function parseRepairRecord(raw) {
  const empty = { expenses: [], incomes: [], transferAmount: 0 };
  if (!raw) return empty;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return { ...empty, expenses: parsed };
    return {
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      incomes: Array.isArray(parsed.incomes) ? parsed.incomes : [],
      transferAmount: parsed.transferAmount || 0,
    };
  } catch {
    return empty;
  }
}

const sumBillAmount = (bills) =>
  (bills || []).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

// ── Derived values (pure — take a row) ────────────

/** Effective status: an in_use item past its expiry_date reads as disposed. */
export function effectiveStatus(row) {
  if (row.status === 'in_use' && row.expiry_date && isPast(row.expiry_date)) {
    return 'disposed';
  }
  return row.status || 'in_use';
}

/** Days the item has been (or was) a companion; null when unknown. */
export function companionDays(row) {
  if (!row.purchase_date) return null;
  if (row.status === 'in_use') return daysBetween(row.purchase_date, todayStr());
  // disposed: prefer the real end date when present
  if (row.expiry_date) return daysBetween(row.purchase_date, row.expiry_date);
  return null;
}

/**
 * Total cost spread over the days owned; null when not computable.
 * (purchase + linked expense bills − linked income bills) / daysOwned.
 */
export function dailyAvg(row, relatedBills = []) {
  const days = companionDays(row);
  if (!days || days <= 0) return null;
  return totalCost(row, relatedBills) / days;
}

/**
 * purchase_price + linked expense bills − linked income bills.
 * Related expenses/incomes are bills associated via source/source_id
 * (first-version model; no repair_record write-back).
 */
export function totalCost(row, relatedBills = []) {
  const expenses = relatedBills.filter((b) => b.bill_type !== 'income');
  const incomes = relatedBills.filter((b) => b.bill_type === 'income');
  return (Number(row.purchase_price) || 0) + sumBillAmount(expenses) - sumBillAmount(incomes);
}

/**
 * Expected lifespan in days. `expected_lifespan` is stored as an end-date
 * string (YYYY-MM-DD); a bare positive number is tolerated as years.
 * Returns null when not derivable.
 */
export function expectedLifespanDays(row) {
  const el = row.expected_lifespan;
  if (!el) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(el)) {
    const d = daysBetween(row.purchase_date, el);
    return d != null && d > 0 ? d : null;
  }
  const n = Number(el);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 365) : null;
}

/** Total cost spread over the expected lifespan; null when not derivable. */
export function expectedDailyAvg(row, relatedBills = []) {
  const days = expectedLifespanDays(row);
  if (!days || days <= 0) return null;
  return totalCost(row, relatedBills) / days;
}

/** Companion progress against the expected lifespan, 0–100; null if unknown. */
export function lifespanPercent(row) {
  const used = companionDays(row);
  const total = expectedLifespanDays(row);
  if (used == null || !total || total <= 0) return null;
  return Math.max(0, Math.min(100, (used / total) * 100));
}

// ── CRUD ──────────────────────────────────────────

/** All durables of the current currency, newest purchase_date first. */
export async function listDurables() {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  return rows.sort((a, b) => (b.purchase_date || '').localeCompare(a.purchase_date || ''));
}

export async function getDurable(id) {
  return getRowById(TABLE, id);
}

/** Resolve the linked asset row for a durable (null when unlinked/missing/other currency). */
export async function getLinkedAsset(row) {
  const linkedId = row?.linked_asset_id;
  if (!linkedId) return null;
  const asset = await getRowById('assets', linkedId);
  return asset && inCurrentCurrency(asset) ? asset : null;
}

/**
 * Insert (no id) or update (with id). `values` is a plain object of columns.
 * Timestamps are managed here so callers never set them.
 */
export async function saveDurable(values, id) {
  const now = new Date().toISOString();
  if (id) {
    await updateRow(TABLE, id, { ...values, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...values, created_at: now, updated_at: now });
  return newId;
}

export async function removeDurable(id) {
  return deleteRow(TABLE, id);
}

/** Aggregate for the list stats card: in-use value, in-use count, total count (current currency only). */
export async function durableStats(currency) {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  let inUseValue = 0;
  let inUseCount = 0;
  rows.forEach((r) => {
    if (effectiveStatus(r) === 'in_use') {
      inUseValue += Number(r.purchase_price) || 0;
      inUseCount += 1;
    }
  });
  return { inUseValue, inUseCount, totalCount: rows.length, currency };
}

export { daysUntil };
