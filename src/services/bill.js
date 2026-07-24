/**
 * Bills (账单) domain layer.
 * Bills associate with durables/assets through the `source` / `source_id`
 * columns (no repair_record write-back in the first version). The durable /
 * asset detail pages read their related expenses & incomes via
 * `listBillsBySource`.
 */
import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { useSettingsStore, inCurrentCurrency } from '../store/settings';

const TABLE = 'bills';

/** All bills of the current currency, newest first (consumption_date desc, then created_at desc). */
export async function listBills() {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  return rows.sort(
    (a, b) =>
      (b.consumption_date || '').localeCompare(a.consumption_date || '') ||
      (b.created_at || '').localeCompare(a.created_at || '')
  );
}

export async function getBill(id) {
  return getRowById(TABLE, id);
}

/**
 * Create or update a bill.
 * - name and consumption date are required, amount must be > 0
 * - bill_type defaults to 'expense'
 * - currency is stamped from the current setting
 * Throws an Error with a message key on validation failure.
 */
export async function saveBill(values, id) {
  const now = new Date().toISOString();
  const fields = { ...values };
  if (!fields.name || !fields.name.trim()) throw new Error('nameRequired');
  if (!fields.consumption_date || !String(fields.consumption_date).trim()) {
    throw new Error('dateRequired');
  }
  const amount = Number(fields.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('amountInvalid');
  fields.name = fields.name.trim();
  fields.consumption_date = String(fields.consumption_date).trim();
  fields.amount = amount;
  fields.bill_type = fields.bill_type === 'income' ? 'income' : 'expense';
  fields.currency = useSettingsStore.getState().settings.currency;

  if (id) {
    await updateRow(TABLE, id, { ...fields, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...fields, created_at: now, updated_at: now });
  return newId;
}

export async function removeBill(id) {
  return deleteRow(TABLE, id);
}

/** Pure helper: expense / income totals + counts for a set of bills. */
export function billSummary(bills) {
  const summary = {
    expenseTotal: 0,
    incomeTotal: 0,
    expenseCount: 0,
    incomeCount: 0,
  };
  (bills || []).forEach((b) => {
    const amount = Number(b.amount) || 0;
    if (b.bill_type === 'income') {
      summary.incomeTotal += amount;
      summary.incomeCount += 1;
    } else {
      summary.expenseTotal += amount;
      summary.expenseCount += 1;
    }
  });
  return summary;
}

/** All bills of the current currency linked to a given durable/asset via source_id, newest first. */
export async function listBillsBySource(sourceId) {
  if (!sourceId) return [];
  const rows = await getAllRows(TABLE);
  return rows
    .filter((b) => b.source_id === sourceId && inCurrentCurrency(b))
    .sort((a, b) => (b.consumption_date || '').localeCompare(a.consumption_date || ''));
}
