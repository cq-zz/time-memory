import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { useSettingsStore, inCurrentCurrency } from '../store/settings';

const TABLE = 'budgets';

/** All budgets of the current currency, newest year first. */
export async function listBudgets() {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  return rows.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
}

/** Current-currency totals used by the budget overview card. */
export async function budgetStats() {
  const rows = await listBudgets();
  return rows.reduce(
    (stats, row) => ({
      totalCount: stats.totalCount + 1,
      expenseBudget: stats.expenseBudget + (Number(row.expense_budget) || 0),
      incomeTarget: stats.incomeTarget + (Number(row.income_target) || 0),
    }),
    { totalCount: 0, expenseBudget: 0, incomeTarget: 0 },
  );
}

export async function getBudget(id) {
  return getRowById(TABLE, id);
}

/** The current-currency budget for a given year (one record per year), or null. */
export async function getBudgetByYear(year) {
  const rows = (await getAllRows(TABLE)).filter(inCurrentCurrency);
  return rows.find((r) => String(r.year) === String(year)) || null;
}

/**
 * Create or update a budget (one record per year).
 * - year is required; creating a duplicate year throws 'yearDuplicate'
 * - expense_budget and income_target must both be > 0
 * Throws an Error with a message key on validation failure.
 */
export async function saveBudget(values, id) {
  const now = new Date().toISOString();
  const fields = { ...values };
  if (!fields.year) throw new Error('yearRequired');
  const expense = Number(fields.expense_budget);
  const income = Number(fields.income_target);
  if (!Number.isFinite(expense) || expense <= 0) throw new Error('expenseRequired');
  if (!Number.isFinite(income) || income <= 0) throw new Error('incomeRequired');
  fields.expense_budget = expense;
  fields.income_target = income;
  fields.year = String(fields.year);
  fields.currency = useSettingsStore.getState().settings.currency;

  // A currency can only have one plan per year, including when editing.
  const existing = await getBudgetByYear(fields.year);
  if (existing && String(existing.id) !== String(id || '')) throw new Error('yearDuplicate');

  if (id) {
    await updateRow(TABLE, id, { ...fields, updated_at: now });
    return id;
  }
  const newId = genId();
  await insertRow(TABLE, { id: newId, ...fields, created_at: now, updated_at: now });
  return newId;
}

export async function removeBudget(id) {
  return deleteRow(TABLE, id);
}
