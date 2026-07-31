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
  return Number.isFinite(days) ? Math.max(1, days) : null;
}

/** Expected total lifespan in days (purchase → expiry); null when no expiry_date. */
export function expectedLifespanDays(row) {
  if (!row.purchase_date || !row.expiry_date) return null;
  const d = daysBetween(row.purchase_date, row.expiry_date);
  return Number.isFinite(d) && d > 0 ? d : null;
}

/** Percentage of lifespan consumed (0–100); null when not computable. */
export function lifespanPercent(row) {
  const used = companionDays(row);
  const total = expectedLifespanDays(row);
  if (used == null || !total || total <= 0) return null;
  return Math.max(0, Math.min(100, (used / total) * 100));
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
 * Automatically syncs a linked bill record for the asset.
 */
export async function saveAsset(values, id) {
  const now = new Date().toISOString();
  let savedId;
  if (id) {
    await updateRow(TABLE, id, { ...values, updated_at: now });
    savedId = id;
  } else {
    const newId = genId();
    await insertRow(TABLE, { id: newId, ...values, created_at: now, updated_at: now });
    savedId = newId;
  }
  // Sync linked bill — fire-and-forget (don't block the save)
  syncBillForAsset({ id: savedId, ...values }).catch(() => {});
  return savedId;
}

export async function removeAsset(id) {
  // Also remove the linked bill when the asset is deleted
  try {
    const allBills = await getAllRows('bills');
    const linkedBill = allBills.find((b) => b.source === 'asset' && b.source_id === id);
    if (linkedBill) await deleteRow('bills', linkedBill.id);
  } catch { /* non-critical */ }
  return deleteRow(TABLE, id);
}

/**
 * Create or update the bill record that is auto-linked to an asset.
 * The bill records the purchase as an expense — amount = purchase_price,
 * date = purchase_date. If purchase_price is 0 the bill is removed.
 * Exported so the import flow in DataManagement can call it too.
 */
export async function syncBillForAsset(asset) {
  const purchasePrice = Number(asset.purchase_price) || 0;
  const allBills = await getAllRows('bills');
  const linkedBill = allBills.find((b) => b.source === 'asset' && b.source_id === asset.id);

  if (purchasePrice <= 0) {
    if (linkedBill) await deleteRow('bills', linkedBill.id);
    return;
  }

  const billData = {
    name: asset.name,
    bill_type: 'expense',
    amount: purchasePrice,
    category: asset.category || '',
    consumption_date: asset.purchase_date || '',
    currency: asset.currency || '',
    source: 'asset',
    source_id: asset.id,
    notes: '',
  };

  if (linkedBill) {
    await updateRow('bills', linkedBill.id, { ...billData, updated_at: new Date().toISOString() });
  } else {
    const newId = genId();
    const now = new Date().toISOString();
    await insertRow('bills', { id: newId, ...billData, created_at: now, updated_at: now });
  }
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
