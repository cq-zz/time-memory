import { getAllRows, getRowById, insertRow, updateRow, deleteRow } from '../store/db';
import { genId } from '../utils/id';
import { useSettingsStore } from '../store/settings';

const TABLE = 'budgets';

/** All budgets, newest year first. */
export async function listBudgets() {
  const rows = await getAllRows(TABLE);
  return rows.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
}

export async function getBudget(id) {
  return getRowById(TABLE, id);
}

/** The budget for a given year (one record per year), or null. */
export async function getBudgetByYear(year) {
  const rows = await getAllRows(TABLE);
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

  // Duplicate-year guard when creating a new record.
  if (!id) {
    const existing = await getBudgetByYear(fields.year);
    if (existing) throw new Error('yearDuplicate');
  }

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
