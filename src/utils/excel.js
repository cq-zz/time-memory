/**
 * Excel import / export definitions for every data module.
 * Each EXPORT_MODULES entry knows its table, date field, English headers,
 * how to flatten a DB row (toRow) and how to parse a sheet row back
 * (fromRow). DataManagement.js drives the file I/O around these.
 */
import * as XLSX from 'xlsx';
import {
  MOODS,
  DEFAULT_CURRENCY,
  ACQUISITION_METHODS,
  DURABLE_STATUS_OPTIONS,
  ASSET_STATUS_OPTIONS,
  BILL_TYPE_OPTIONS,
  SCHEDULE_PRIORITIES,
  SCHEDULE_STATUS_OPTIONS,
  WEATHER_OPTIONS,
  IMPORTANT_DATE_TYPES,
  REMINDER_TYPES,
} from './constant';

// ── Small helpers ─────────────────────────────────

const pad2 = (n) => String(n).padStart(2, '0');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const nowIso = () => new Date().toISOString();

const safe = (v) => (v === null || v === undefined ? '' : v);

const labelOf = (options, key) => {
  const o = options.find((x) => x.key === key);
  return o ? o.label : key || '';
};

/** Case-insensitive label-or-key lookup. Returns fallback when empty, null when invalid. */
const keyOf = (options, raw, fallback) => {
  const t = String(raw ?? '').trim().toLowerCase();
  if (!t) return fallback;
  const o = options.find((x) => x.label.toLowerCase() === t || x.key.toLowerCase() === t);
  return o ? o.key : null;
};

const optionLabels = (options) => options.map((o) => o.label).join(' / ');

/** Coerce a cell to YYYY-MM-DD (handles Excel serial-date numbers). */
function normalizeDate(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') {
    const ms = Math.round((v - 25569) * 86400 * 1000);
    const d = new Date(ms);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
  }
  return String(v).trim();
};

const validDate = (v) => v === '' || DATE_RE.test(v);

const validUrl = (v) => v === '' || /^https?:\/\//i.test(v);

function parseChecklist(raw) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// ── Module definitions ────────────────────────────

export const EXPORT_MODULES = [
  {
    id: 'durable',
    label: 'Durables',
    table: 'durables',
    dateField: 'purchase_date',
    headers: [
      'Name', 'Category', 'Acquisition Method', 'Purchase Date', 'Purchase Price',
      'Status', 'Expected Lifespan', 'Expiry Date', 'Currency', 'Image URL', 'Notes', 'Created At',
    ],
    example: [
      'Sony WH-1000XM5', 'electronics', 'Purchase', '2025-06-01', 349,
      'In Use', '60', '', 'USD', '', 'Headphones', nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), safe(item.category), labelOf(ACQUISITION_METHODS, item.acquisition_method),
      safe(item.purchase_date), safe(item.purchase_price ?? 0),
      labelOf(DURABLE_STATUS_OPTIONS, item.status), safe(item.expected_lifespan),
      safe(item.expiry_date), safe(item.currency), safe(item.image), safe(item.notes), safe(item.created_at),
    ],
    fromRow: (get) => {
      const name = String(get('Name') ?? '').trim();
      if (!name) return { error: 'Name is required' };
      const acqRaw = String(get('Acquisition Method') ?? '').trim();
      const acquisition = keyOf(ACQUISITION_METHODS, acqRaw, 'purchase');
      if (acquisition === null) return { error: `Invalid Acquisition Method "${acqRaw}" (use ${optionLabels(ACQUISITION_METHODS)})` };
      const purchaseDate = normalizeDate(get('Purchase Date'));
      if (!validDate(purchaseDate)) return { error: 'Purchase Date must be YYYY-MM-DD' };
      const statusRaw = String(get('Status') ?? '').trim();
      const status = keyOf(DURABLE_STATUS_OPTIONS, statusRaw, 'in_use');
      if (status === null) return { error: `Invalid Status "${statusRaw}" (use ${optionLabels(DURABLE_STATUS_OPTIONS)})` };
      const expiryDate = normalizeDate(get('Expiry Date'));
      if (!validDate(expiryDate)) return { error: 'Expiry Date must be YYYY-MM-DD' };
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      return {
        data: {
          name,
          category: String(get('Category') ?? '').trim(),
          acquisition_method: acquisition,
          purchase_date: purchaseDate || null,
          purchase_price: parseFloat(get('Purchase Price')) || 0,
          status,
          expected_lifespan: String(get('Expected Lifespan') ?? '').trim() || null,
          expiry_date: expiryDate || null,
          currency: String(get('Currency') ?? '').trim() || DEFAULT_CURRENCY,
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          repair_record: '{}',
          created_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'asset',
    label: 'Assets',
    table: 'assets',
    dateField: 'purchase_date',
    headers: [
      'Name', 'Category', 'Acquisition Method', 'Status', 'Purchase Date', 'Purchase Price',
      'Current Price', 'Expiry Date', 'Currency', 'Image URL', 'Notes', 'Created At', 'Updated At',
    ],
    example: [
      'Gold Bar 100g', 'gold', 'Purchase', 'Active', '2024-03-15', 6800,
      7450, '', 'USD', '', '', nowIso(), nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), safe(item.category), labelOf(ACQUISITION_METHODS, item.acquisition_method),
      labelOf(ASSET_STATUS_OPTIONS, item.status), safe(item.purchase_date), safe(item.purchase_price ?? 0),
      safe(item.current_price ?? 0), safe(item.expiry_date), safe(item.currency),
      safe(item.image), safe(item.notes), safe(item.created_at), safe(item.updated_at),
    ],
    fromRow: (get) => {
      const name = String(get('Name') ?? '').trim();
      if (!name) return { error: 'Name is required' };
      const acqRaw = String(get('Acquisition Method') ?? '').trim();
      const acquisition = keyOf(ACQUISITION_METHODS, acqRaw, 'purchase');
      if (acquisition === null) return { error: `Invalid Acquisition Method "${acqRaw}" (use ${optionLabels(ACQUISITION_METHODS)})` };
      const statusRaw = String(get('Status') ?? '').trim();
      const status = keyOf(ASSET_STATUS_OPTIONS, statusRaw, 'active');
      if (status === null) return { error: `Invalid Status "${statusRaw}" (use ${optionLabels(ASSET_STATUS_OPTIONS)})` };
      const purchaseDate = normalizeDate(get('Purchase Date'));
      if (!validDate(purchaseDate)) return { error: 'Purchase Date must be YYYY-MM-DD' };
      const expiryDate = normalizeDate(get('Expiry Date'));
      if (!validDate(expiryDate)) return { error: 'Expiry Date must be YYYY-MM-DD' };
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      return {
        data: {
          name,
          category: String(get('Category') ?? '').trim(),
          acquisition_method: acquisition,
          status,
          purchase_date: purchaseDate || null,
          purchase_price: parseFloat(get('Purchase Price')) || 0,
          current_price: parseFloat(get('Current Price')) || 0,
          expiry_date: expiryDate || null,
          currency: String(get('Currency') ?? '').trim() || DEFAULT_CURRENCY,
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          repair_record: '{}',
          created_at: nowIso(),
          updated_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'bills',
    label: 'Bills',
    table: 'bills',
    dateField: 'consumption_date',
    headers: [
      'Name', 'Type', 'Amount', 'Category', 'Consumption Date',
      'Currency', 'Receipt Image URL', 'Notes', 'Created At',
    ],
    example: [
      'Groceries', 'Expense', 86.5, 'food', '2025-07-01',
      'USD', '', 'Weekly shopping', nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), labelOf(BILL_TYPE_OPTIONS, item.bill_type), safe(item.amount ?? 0),
      safe(item.category), safe(item.consumption_date), safe(item.currency),
      safe(item.receipt_image), safe(item.notes), safe(item.created_at),
    ],
    fromRow: (get) => {
      const name = String(get('Name') ?? '').trim();
      if (!name) return { error: 'Name is required' };
      const amount = parseFloat(get('Amount'));
      if (Number.isNaN(amount)) return { error: `Amount must be a number, got "${get('Amount')}"` };
      const typeRaw = String(get('Type') ?? '').trim();
      const billType = keyOf(BILL_TYPE_OPTIONS, typeRaw, 'expense');
      if (billType === null) return { error: `Invalid Type "${typeRaw}" (use ${optionLabels(BILL_TYPE_OPTIONS)})` };
      const consumptionDate = normalizeDate(get('Consumption Date'));
      if (!validDate(consumptionDate)) return { error: 'Consumption Date must be YYYY-MM-DD' };
      const image = String(get('Receipt Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Receipt Image URL must start with http:// or https://' };
      return {
        data: {
          name,
          bill_type: billType,
          amount,
          category: String(get('Category') ?? '').trim(),
          consumption_date: consumptionDate || null,
          currency: String(get('Currency') ?? '').trim() || DEFAULT_CURRENCY,
          receipt_image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          source: '',
          source_id: null,
          created_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'schedule',
    label: 'Schedules',
    table: 'schedules',
    dateField: 'end_date',
    headers: [
      'Title', 'Priority', 'Status', 'Start Date', 'End Date',
      'Reminder', 'Checklist', 'Notes', 'Created At',
    ],
    example: [
      'Quarterly review', 'High', 'Not Started', '2025-07-10', '2025-07-15',
      'Yes', '1. [☐] Prepare slides', '', nowIso(),
    ],
    toRow: (item) => {
      const checklist = parseChecklist(item.checklist)
        .map((c, i) => `${i + 1}. [${c.done ? '✓' : '☐'}] ${c.text ?? ''}`)
        .join('\n');
      return [
        safe(item.title), labelOf(SCHEDULE_PRIORITIES, item.priority),
        labelOf(SCHEDULE_STATUS_OPTIONS, item.status), safe(item.start_date), safe(item.end_date),
        item.reminder_enabled ? 'Yes' : 'No', checklist, safe(item.notes), safe(item.created_at),
      ];
    },
    fromRow: (get) => {
      const title = String(get('Title') ?? '').trim();
      if (!title) return { error: 'Title is required' };
      const priorityRaw = String(get('Priority') ?? '').trim();
      const priority = keyOf(SCHEDULE_PRIORITIES, priorityRaw, 'medium');
      if (priority === null) return { error: `Invalid Priority "${priorityRaw}" (use ${optionLabels(SCHEDULE_PRIORITIES)})` };
      const statusRaw = String(get('Status') ?? '').trim();
      const status = keyOf(SCHEDULE_STATUS_OPTIONS, statusRaw, 'not_started');
      if (status === null) return { error: `Invalid Status "${statusRaw}" (use ${optionLabels(SCHEDULE_STATUS_OPTIONS)})` };
      const startDate = normalizeDate(get('Start Date'));
      if (!validDate(startDate)) return { error: 'Start Date must be YYYY-MM-DD' };
      const endDate = normalizeDate(get('End Date'));
      if (!validDate(endDate)) return { error: 'End Date must be YYYY-MM-DD' };
      return {
        data: {
          title,
          priority,
          status,
          start_date: startDate || null,
          end_date: endDate || null,
          reminder_enabled: String(get('Reminder') ?? '').trim().toLowerCase() === 'yes' ? 1 : 0,
          checklist: '[]',
          notes: String(get('Notes') ?? '').trim(),
          created_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'diary',
    label: 'Diary',
    table: 'diaries',
    dateField: 'date',
    headers: ['Title', 'Date', 'Weather', 'Content', 'Image URL', 'Created At'],
    example: [
      'A good start', '2025-07-01', 'Sunny', 'Feeling productive today.', '', nowIso(),
    ],
    toRow: (item) => {
      const weather = WEATHER_OPTIONS.find((w) => w.key === item.weather);
      return [
        safe(item.title), safe(item.date), weather ? weather.label : safe(item.weather),
        safe(item.content), safe(item.image), safe(item.created_at),
      ];
    },
    fromRow: (get) => {
      const date = normalizeDate(get('Date'));
      if (!validDate(date)) return { error: 'Date must be YYYY-MM-DD' };
      const weatherRaw = String(get('Weather') ?? '').trim();
      const weather = keyOf(WEATHER_OPTIONS, weatherRaw, null);
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      return {
        data: {
          title: String(get('Title') ?? '').trim(),
          date: date || null,
          weather: weather || weatherRaw || null,
          content: String(get('Content') ?? '').trim(),
          image: image || null,
          created_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'important-date',
    label: 'Important Dates',
    table: 'important_dates',
    dateField: 'date',
    headers: ['Name', 'Date', 'Type', 'Category', 'Priority', 'Reminder', 'Reminder Type', 'Days Before', 'Notes', 'Created At'],
    example: ['Birthday', '2025-09-12', 'Birthday', 'family', 'High', 'Yes', 'Annual', '1', '', nowIso()],
    toRow: (item) => [
      safe(item.name), safe(item.date), labelOf(IMPORTANT_DATE_TYPES, item.type),
      safe(item.category), labelOf(SCHEDULE_PRIORITIES, item.priority),
      item.reminder_enabled ? 'Yes' : 'No', labelOf(REMINDER_TYPES, item.reminder_type),
      safe(item.reminder_days_before), safe(item.notes), safe(item.created_at),
    ],
    fromRow: (get) => {
      const name = String(get('Name') ?? '').trim();
      if (!name) return { error: 'Name is required' };
      const date = normalizeDate(get('Date'));
      if (!validDate(date)) return { error: 'Date must be YYYY-MM-DD' };
      const typeRaw = String(get('Type') ?? '').trim();
      const type = keyOf(IMPORTANT_DATE_TYPES, typeRaw, 'other');
      if (type === null) return { error: `Invalid Type "${typeRaw}" (use ${optionLabels(IMPORTANT_DATE_TYPES)})` };
      const priorityRaw = String(get('Priority') ?? '').trim();
      const priority = keyOf(SCHEDULE_PRIORITIES, priorityRaw, 'medium');
      if (priority === null) return { error: `Invalid Priority "${priorityRaw}" (use ${optionLabels(SCHEDULE_PRIORITIES)})` };
      const reminderTypeRaw = String(get('Reminder Type') ?? '').trim();
      const reminderType = keyOf(REMINDER_TYPES, reminderTypeRaw, 'annual');
      if (reminderType === null) return { error: `Invalid Reminder Type "${reminderTypeRaw}" (use ${optionLabels(REMINDER_TYPES)})` };
      const daysRaw = String(get('Days Before') ?? '').trim();
      const daysBefore = daysRaw === '' ? 1 : parseInt(daysRaw, 10);
      if (Number.isNaN(daysBefore) || daysBefore < 0) return { error: 'Days Before must be a non-negative integer' };
      return {
        data: {
          name,
          date: date || null,
          type,
          category: String(get('Category') ?? '').trim(),
          priority,
          reminder_enabled: String(get('Reminder') ?? '').trim().toLowerCase() === 'yes' ? 1 : 0,
          reminder_type: reminderType,
          reminder_days_before: daysBefore,
          notes: String(get('Notes') ?? '').trim(),
          created_at: nowIso(),
        },
      };
    },
  },
  {
    id: 'mood',
    label: 'Mood Records',
    table: 'check_ins',
    dateField: 'check_date',
    headers: ['Date', 'Mood', 'Score', 'Created At'],
    example: ['2025-07-01', 'Happy (😊)', 5, nowIso()],
    toRow: (item) => {
      const mood = MOODS.find((m) => m.key === item.mood);
      return [
        safe(item.check_date),
        mood ? `${mood.label} (${mood.emoji})` : safe(item.mood),
        mood ? mood.score : '',
        safe(item.created_at),
      ];
    },
    fromRow: (get) => {
      const date = normalizeDate(get('Date'));
      if (!date) return { error: 'Date is required' };
      if (!DATE_RE.test(date)) return { error: 'Date must be YYYY-MM-DD' };
      const raw = String(get('Mood') ?? '').trim();
      if (!raw) return { error: 'Mood is required' };
      const lower = raw.toLowerCase();
      const mood = MOODS.find(
        (m) => m.key === lower || m.label.toLowerCase() === lower || raw.includes(m.emoji),
      );
      if (!mood) return { error: `Unknown mood "${raw}"` };
      return {
        data: {
          check_date: date,
          mood: mood.key,
          created_at: nowIso(),
        },
      };
    },
  },
];

export const moduleById = (id) => EXPORT_MODULES.find((m) => m.id === id) || null;

// ── Workbook helpers ──────────────────────────────

/** Build an xlsx workbook (single sheet) from module rows. */
export function buildWorkbook(mod, rows) {
  const aoa = [mod.headers, ...rows.map(mod.toRow)];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mod.label);
  return wb;
}

/** Build the template workbook (headers + one example row). */
export function buildTemplateWorkbook(mod) {
  const ws = XLSX.utils.aoa_to_sheet([mod.headers, mod.example]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mod.label);
  return wb;
}

/** Serialize a workbook to an ArrayBuffer (xlsx bytes). */
export function workbookToArray(wb) {
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

/** Read the first sheet of an xlsx buffer as [[...], ...] (header row first). */
export function readSheetRows(buffer) {
  const wb = XLSX.read(buffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

/** Header → cell accessor for one data row (exact header match). */
export function makeGetter(headers, row) {
  return (headerKey) => {
    const idx = headers.findIndex((h) => String(h ?? '').trim() === headerKey);
    if (idx < 0 || idx >= row.length) return '';
    return row[idx];
  };
}
