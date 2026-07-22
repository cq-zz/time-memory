/**
 * Asset (资产) domain layer.
 * Thin service over the platform db (SQLite native / AsyncStorage web) that
 * owns CRUD plus the derived values the UI shows (effective status, days
 * owned, display value, aggregate stats). Field names match the old project's
 * `assets` table exactly. Related expenses/incomes are bills associated via
 * source/source_id (see services/bill.js) — not stored on the asset row.
 */
import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { todayStr, daysBetween, isPast } from '../utils/date';
import { inCurrentCurrency } from '../store/settings';

const TABLE = 'assets';

// ── Derived values (pure — take a row) ────────────

/** Effective status: an active asset past its expiry_date reads as disposed. */
export function effectiveStatus(row) {
  if (row.status === 'active' && row.expiry_date && isPast(row.expiry_date)) {
    return 'disposed';
  }
  return row.status || 'active';
}

/** Days the asset has been (or was) held; null when unknown. */
export function companionDays(row) {
  if (!row.purchase_date) return null;
  let endDate;
  if (effectiveStatus(row) === 'active') {
    endDate = todayStr();
  } else if (row.expiry_date) {
    endDate = isPast(row.expiry_date) ? row.expiry_date : todayStr();
  } else {
    return null;
  }
  const days = daysBetween(row.purchase_date, endDate);
  return Number.isFinite(days) ? Math.max(0, days) : null;
}

/** The value to show for an asset: current_price, falling back to purchase_price. */
export function displayValue(row) {
  if (row.current_price != null && row.current_price !== '') {
    const cur = Number(row.current_price);
    if (Number.isFinite(cur)) return cur;
  }
  return Number(row.purchase_price) || 0;
}

// ── CRUD ──────────────────────────────────────────

/** All assets of the current currency, newest purchase_date first. */
export async function listAssets() {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  return rows.sort((a, b) => (b.purchase_date || '').localeCompare(a.purchase_date || ''));
}

export async function getAsset(id) {
  return getRowById(TABLE, id);
}

/**
 * Insert (no id) or update (with id). `values` is a plain object of columns.
 * Timestamps are managed here so callers never set them.
 */
export async function saveAsset(values, id) {
  const now = new Date().toISOString();
  if (id) {
    await updateRow(TABLE, id, { ...values, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...values, created_at: now, updated_at: now });
  return newId;
}

export async function removeAsset(id) {
  return deleteRow(TABLE, id);
}

/** Aggregate for the list stats card: total current value of active assets + counts (current currency only). */
export async function assetStats() {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  let totalValue = 0;
  let activeCount = 0;
  rows.forEach((r) => {
    if (effectiveStatus(r) === 'active') {
      totalValue += displayValue(r);
      activeCount += 1;
    }
  });
  return { totalValue, activeCount, totalCount: rows.length };
}
