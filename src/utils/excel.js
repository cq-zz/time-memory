/**
 * Excel import / export definitions for every data module.
 * Each EXPORT_MODULES entry knows its table, date field, English headers,
 * how to flatten a DB row (toRow) and how to parse a sheet row back
 * (fromRow). DataManagement.js drives the file I/O around these.
 */
import * as XLSX from 'xlsx';
import i18n from '../i18n';
import {
  MOODS,
  DEFAULT_CURRENCY,
  CURRENCIES,
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
const formatExcelDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const ENUM_TEXT_ZH = {
  Purchase: '购买', Gift: '赠送', Reward: '奖励', Inherit: '继承', Homemade: '自制', Other: '其他',
  'In Use': '使用中', Disposed: '已处置', Active: '持有中',
  Expense: '支出', Income: '收入', High: '高', Medium: '中', Low: '低',
  'Not Started': '未开始', 'In Progress': '进行中', Done: '已完成', Incomplete: '未完成',
  Sunny: '晴', 'Clear Night': '晴夜', 'Partly Cloudy': '局部多云', Cloudy: '多云',
  Overcast: '阴', Drizzle: '小雨', Rainy: '雨', Thunderstorm: '雷暴', Snowy: '雪',
  Sleet: '雨夹雪', Hail: '冰雹', Foggy: '雾', Hazy: '霾', Windy: '大风',
  Tornado: '龙卷风', Rainbow: '彩虹',
  Birthday: '生日', Anniversary: '纪念日', Remembrance: '追忆',
  Annual: '每年', 'One-time': '一次性',
  Loved: '甜蜜', Excited: '兴奋', Joyful: '开怀', Grateful: '感恩', Amazed: '震撼',
  Happy: '开心', Peaceful: '平静', Relaxed: '放松', Amused: '得意', Proud: '自豪',
  Hopeful: '期盼', Thoughtful: '沉思', Neutral: '一般', Sleepy: '困', Anxious: '焦虑',
  Disappointed: '失落', Stressed: '压力', Sad: '难过', Angry: '生气', Exhausted: '累垮',
  Yes: '是', No: '否', Item: '物品', Asset: '资产', DoneState: '已完成', PendingState: '未完成',
};

const localizedEnumText = (text, language = i18n.language) =>
  language === 'zh-CN' ? ENUM_TEXT_ZH[text] || text : text;

const labelOf = (options, key) => {
  const o = options.find((x) => x.key === key);
  return o ? localizedEnumText(o.label) : key || '';
};

/** Case-insensitive label-or-key lookup. Returns fallback when empty, null when invalid. */
const keyOf = (options, raw, fallback) => {
  const t = String(raw ?? '').trim().toLowerCase();
  if (!t) return fallback;
  const o = options.find(
    (x) =>
      x.label.toLowerCase() === t ||
      localizedEnumText(x.label, 'zh-CN').toLowerCase() === t ||
      x.key.toLowerCase() === t,
  );
  return o ? o.key : null;
};

const optionLabels = (options) => options.map((o) => localizedEnumText(o.label)).join(' / ');
const enumHeader = (title, values) => `${title} (${values.join('/')})`;
const optionHeader = (title, options) => enumHeader(title, options.map((option) => option.label));
const CURRENCY_HEADER = enumHeader('Currency', CURRENCIES.map((currency) => currency.code));
const YES_NO_HEADER = enumHeader('Reminder', ['Yes', 'No']);
const BILLING_OBJECT_TYPES = [
  { key: 'item', label: 'Item' },
  { key: 'asset', label: 'Asset' },
];

const HEADER_LABELS = {
  Name: { en: 'Name', 'zh-CN': '名称' }, Title: { en: 'Title', 'zh-CN': '标题' },
  Category: { en: 'Category', 'zh-CN': '类别' }, 'Acquisition Method': { en: 'Acquisition Method', 'zh-CN': '获取方式' },
  'Purchase Date': { en: 'Acquisition Date', 'zh-CN': '获取日期' }, Value: { en: 'Value', 'zh-CN': '价值' },
  Status: { en: 'Status', 'zh-CN': '状态' }, 'Expected Lifespan': { en: 'Expected Lifespan', 'zh-CN': '预计使用寿命' },
  'Expiry Date': { en: 'Expiry Date', 'zh-CN': '到期日期' }, Currency: { en: 'Currency', 'zh-CN': '币种' },
  'Linked Asset': { en: 'Linked Asset', 'zh-CN': '关联资产' }, 'Image URL': { en: 'Image URL', 'zh-CN': '图片链接' },
  Notes: { en: 'Notes', 'zh-CN': '备注' }, 'Created At': { en: 'Created At', 'zh-CN': '创建时间' },
  'Current Price': { en: 'Current Price', 'zh-CN': '当前价值' }, 'Updated At': { en: 'Updated At', 'zh-CN': '更新时间' },
  Type: { en: 'Type', 'zh-CN': '类型' }, Amount: { en: 'Amount', 'zh-CN': '金额' },
  'Consumption Date': { en: 'Consumption Date', 'zh-CN': '日期' }, 'Billing Object Type': { en: 'Billing Object Type', 'zh-CN': '记账对象类型' },
  'Billing Object': { en: 'Billing Object', 'zh-CN': '记账对象' }, 'Receipt Image URL': { en: 'Receipt Image URL', 'zh-CN': '凭证图片链接' },
  Priority: { en: 'Priority', 'zh-CN': '优先级' }, 'Start Date': { en: 'Start Date', 'zh-CN': '开始日期' },
  'End Date': { en: 'End Date', 'zh-CN': '结束日期' }, Reminder: { en: 'Reminder', 'zh-CN': '提醒' },
  'Days Before': { en: 'Days Before', 'zh-CN': '提前天数' }, Checklist: { en: 'Checklist', 'zh-CN': '清单' },
  Date: { en: 'Date', 'zh-CN': '日期' }, Weather: { en: 'Weather', 'zh-CN': '天气' },
  Content: { en: 'Content', 'zh-CN': '内容' }, 'Reminder Type': { en: 'Reminder Type', 'zh-CN': '提醒类型' },
  Year: { en: 'Year', 'zh-CN': '年份' }, 'Expense Budget': { en: 'Expense Budget', 'zh-CN': '支出预算' },
  'Income Target': { en: 'Income Target', 'zh-CN': '收入目标' }, Mood: { en: 'Mood', 'zh-CN': '心情' },
  Score: { en: 'Score', 'zh-CN': '分值' },
};
const LEGACY_HEADER_LABELS = {
  'Purchase Date': ['Purchase Date', '购买日期'],
  Value: ['Purchase Price', 'Price', '购买价格', '取得成本'],
  'Current Price': ['Current Value', '当前估值'],
  'Consumption Date': ['消费日期'],
  Checklist: ['检查清单', '检查清'],
};

function splitHeader(header) {
  const text = String(header ?? '').trim();
  const match = text.match(/^(.*?)\s*(\([^)]*\))\s*$/);
  return match
    ? { base: match[1].trim(), suffix: match[2] }
    : { base: text, suffix: '' };
}

function localizedHeader(header) {
  const { base, suffix } = splitHeader(header);
  const language = i18n.language === 'zh-CN' ? 'zh-CN' : 'en';
  const localizedSuffix =
    language === 'zh-CN' && suffix
      ? `(${suffix.slice(1, -1).split('/').map((value) => localizedEnumText(value, language)).join('/')})`
      : suffix;
  return `${HEADER_LABELS[base]?.[language] || base}${localizedSuffix}`;
}

const yesNo = (value) => localizedEnumText(value ? 'Yes' : 'No');
const booleanValue = (value) => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return 0;
  if (['yes', '是', 'true', '1'].includes(normalized)) return 1;
  if (['no', '否', 'false', '0'].includes(normalized)) return 0;
  return null;
};
const EXAMPLE_TEXT_ZH = {
  electronics: '电子产品',
  gold: '黄金',
  food: '餐饮',
  family: '家庭',
  'Sony WH-1000XM5': '索尼 WH-1000XM5 耳机',
  Headphones: '头戴式耳机',
  'Gold Bar 100g': '100 克金条',
  Groceries: '日常采购',
  'Weekly shopping': '每周采购',
  'Quarterly review': '季度复盘',
  '1. Pending: Prepare slides': '1. 未完成：准备演示文稿',
  'A good start': '美好的一天',
  'Feeling productive today.': '今天效率很高。',
  Birthday: '生日',
};

function localizedExample(example) {
  if (i18n.language !== 'zh-CN') return example;
  return example.map((value) => {
    if (typeof value !== 'string') return value;
    return EXAMPLE_TEXT_ZH[value] || localizedEnumText(value);
  });
}

function formatTimestampColumns(headers, row) {
  return row.map((value, index) => {
    const { base } = splitHeader(headers[index]);
    return base === 'Created At' || base === 'Updated At' ? formatExcelDateTime(value) : value;
  });
}

const stringifyRow = (row) => row.map((value) => String(safe(value)));

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

const validDate = (v) => {
  if (v === '') return true;
  if (!DATE_RE.test(v)) return false;
  const [year, month, day] = v.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const validUrl = (v) => v === '' || /^https?:\/\//i.test(v);
const exportImageUrl = (v) => (/^https?:\/\//i.test(String(v || '').trim()) ? String(v).trim() : '');

function normalizeCurrency(raw) {
  const value = String(raw ?? '').trim().toUpperCase() || DEFAULT_CURRENCY;
  return CURRENCIES.some((currency) => currency.code === value) ? value : null;
}

function nonNegativeNumber(raw, fallback = 0) {
  const text = String(raw ?? '').trim();
  if (!text) return fallback;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

const importedTimestamp = (get, header = 'Created At', fallback = nowIso()) =>
  String(get(header) ?? '').trim() || fallback;

function parseChecklist(raw) {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function formatChecklist(raw) {
  return parseChecklist(raw)
    .map((item, index) => {
      const state = localizedEnumText(item.done ? 'DoneState' : 'PendingState');
      return `${index + 1}. ${state}: ${String(item.text ?? '').trim()}`;
    })
    .join('\n');
}

function parseImportedChecklist(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return [];
  return text.split(/\r?\n/).filter(Boolean).map((line) => {
    const cleaned = line.replace(/^\s*\d+[.)、]\s*/, '').trim();
    const legacy = cleaned.match(/^\[(✓|☐|x| )\]\s*(.*)$/i);
    if (legacy) return { text: legacy[2].trim(), done: ['✓', 'x'].includes(legacy[1].toLowerCase()) };
    const state = cleaned.match(/^(Done|Pending|已完成|未完成)\s*[:：|-]\s*(.*)$/i);
    if (state) return { text: state[2].trim(), done: /^(done|已完成)$/i.test(state[1]) };
    return { text: cleaned, done: false };
  }).filter((item) => item.text);
}

// ── Module definitions ────────────────────────────

export const EXPORT_MODULES = [
  {
    id: 'durable',
    label: 'Durables',
    table: 'durables',
    dateField: 'purchase_date',
    headers: [
      'Name', 'Category', optionHeader('Acquisition Method', ACQUISITION_METHODS), 'Purchase Date', 'Value',
      optionHeader('Status', DURABLE_STATUS_OPTIONS), 'Expected Lifespan', 'Expiry Date', CURRENCY_HEADER, 'Linked Asset', 'Image URL', 'Notes', 'Created At',
    ],
    example: [
      'Sony WH-1000XM5', 'electronics', 'Purchase', '2025-06-01', 349,
      'In Use', '60', '', 'USD', '', '', 'Headphones', nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), safe(item.category), labelOf(ACQUISITION_METHODS, item.acquisition_method),
      safe(item.purchase_date), safe(item.purchase_price ?? 0),
      labelOf(DURABLE_STATUS_OPTIONS, item.status), safe(item.expected_lifespan),
      safe(item.expiry_date), safe(item.currency), safe(item.linked_asset_name), exportImageUrl(item.image), safe(item.notes), safe(item.created_at),
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
      const currency = normalizeCurrency(get('Currency'));
      if (!currency) return { error: `Invalid Currency "${get('Currency')}"` };
      const value = nonNegativeNumber(get('Value'));
      if (value === null) return { error: 'Value must be a non-negative number' };
      return {
        data: {
          name,
          category: String(get('Category') ?? '').trim(),
          acquisition_method: acquisition,
          purchase_date: purchaseDate || null,
          purchase_price: value,
          status,
          expected_lifespan: String(get('Expected Lifespan') ?? '').trim() || null,
          expiry_date: expiryDate || null,
          currency,
          _linked_asset_name: String(get('Linked Asset') ?? '').trim(),
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          repair_record: '{}',
          created_at: importedTimestamp(get),
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
      'Name', 'Category', optionHeader('Acquisition Method', ACQUISITION_METHODS), optionHeader('Status', ASSET_STATUS_OPTIONS), 'Purchase Date', 'Value',
      'Current Price', 'Expiry Date', CURRENCY_HEADER, 'Image URL', 'Notes', 'Created At', 'Updated At',
    ],
    example: [
      'Gold Bar 100g', 'gold', 'Purchase', 'Active', '2024-03-15', 6800,
      7450, '', 'USD', '', '', nowIso(), nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), safe(item.category), labelOf(ACQUISITION_METHODS, item.acquisition_method),
      labelOf(ASSET_STATUS_OPTIONS, item.status), safe(item.purchase_date), safe(item.purchase_price ?? 0),
      safe(item.current_price ?? 0), safe(item.expiry_date), safe(item.currency),
      exportImageUrl(item.image), safe(item.notes), safe(item.created_at), safe(item.updated_at),
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
      const currency = normalizeCurrency(get('Currency'));
      if (!currency) return { error: `Invalid Currency "${get('Currency')}"` };
      const value = nonNegativeNumber(get('Value'));
      if (value === null) return { error: 'Value must be a non-negative number' };
      const currentPrice = nonNegativeNumber(get('Current Price'));
      if (currentPrice === null) return { error: 'Current Price must be a non-negative number' };
      return {
        data: {
          name,
          category: String(get('Category') ?? '').trim(),
          acquisition_method: acquisition,
          status,
          purchase_date: purchaseDate || null,
          purchase_price: value,
          current_price: currentPrice,
          expiry_date: expiryDate || null,
          currency,
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          repair_record: '{}',
          created_at: importedTimestamp(get),
          updated_at: importedTimestamp(get, 'Updated At'),
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
      'Name', optionHeader('Type', BILL_TYPE_OPTIONS), 'Amount', 'Category', 'Consumption Date',
      CURRENCY_HEADER, optionHeader('Billing Object Type', BILLING_OBJECT_TYPES), 'Billing Object', 'Receipt Image URL', 'Notes', 'Created At',
    ],
    example: [
      'Groceries', 'Expense', 86.5, 'food', '2025-07-01',
      'USD', '', '', '', 'Weekly shopping', nowIso(),
    ],
    toRow: (item) => [
      safe(item.name), labelOf(BILL_TYPE_OPTIONS, item.bill_type), safe(item.amount ?? 0),
      safe(item.category), safe(item.consumption_date), safe(item.currency),
      safe(item.source === 'durable' ? localizedEnumText('Item') : item.source === 'asset' ? localizedEnumText('Asset') : ''),
      safe(item.source_name), exportImageUrl(item.receipt_image), safe(item.notes), safe(item.created_at),
    ],
    fromRow: (get) => {
      const name = String(get('Name') ?? '').trim();
      if (!name) return { error: 'Name is required' };
      const amount = nonNegativeNumber(get('Amount'), null);
      if (amount === null) return { error: `Amount must be a non-negative number, got "${get('Amount')}"` };
      const typeRaw = String(get('Type') ?? '').trim();
      const billType = keyOf(BILL_TYPE_OPTIONS, typeRaw, 'expense');
      if (billType === null) return { error: `Invalid Type "${typeRaw}" (use ${optionLabels(BILL_TYPE_OPTIONS)})` };
      const consumptionDate = normalizeDate(get('Consumption Date'));
      if (!validDate(consumptionDate)) return { error: 'Consumption Date must be YYYY-MM-DD' };
      const sourceTypeRaw = String(get('Billing Object Type') ?? '').trim();
      const sourceType = keyOf(BILLING_OBJECT_TYPES, sourceTypeRaw, '');
      if (sourceType === null) return { error: 'Billing Object Type must be Item or Asset' };
      if (String(get('Billing Object') ?? '').trim() && !sourceType) {
        return { error: 'Billing Object Type is required when Billing Object is set' };
      }
      const image = String(get('Receipt Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Receipt Image URL must start with http:// or https://' };
      const currency = normalizeCurrency(get('Currency'));
      if (!currency) return { error: `Invalid Currency "${get('Currency')}"` };
      return {
        data: {
          name,
          bill_type: billType,
          amount,
          category: String(get('Category') ?? '').trim(),
          consumption_date: consumptionDate || null,
          currency,
          _source_type: sourceType,
          _source_name: String(get('Billing Object') ?? '').trim(),
          receipt_image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          source: '',
          source_id: null,
          created_at: importedTimestamp(get),
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
      'Title', optionHeader('Priority', SCHEDULE_PRIORITIES), optionHeader('Status', SCHEDULE_STATUS_OPTIONS), 'Start Date', 'End Date',
      YES_NO_HEADER, 'Days Before', 'Checklist', 'Image URL', 'Notes', 'Created At',
    ],
    example: [
      'Quarterly review', 'High', 'Not Started', '2025-07-10', '2025-07-15',
      'Yes', '1', '1. Pending: Prepare slides', '', '', nowIso(),
    ],
    toRow: (item) => [
        safe(item.title), labelOf(SCHEDULE_PRIORITIES, item.priority),
        labelOf(SCHEDULE_STATUS_OPTIONS, item.status), safe(item.start_date), safe(item.end_date),
        yesNo(item.reminder_enabled), safe(item.reminder_days_before),
        formatChecklist(item.checklist), exportImageUrl(item.image), safe(item.notes), safe(item.created_at),
      ],
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
      const daysRaw = String(get('Days Before') ?? '').trim();
      const reminderDaysBefore = daysRaw === '' ? 1 : Number(daysRaw);
      if (!Number.isInteger(reminderDaysBefore) || reminderDaysBefore < 0 || reminderDaysBefore > 365) {
        return { error: 'Days Before must be an integer from 0 to 365' };
      }
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      const reminderEnabled = booleanValue(get('Reminder'));
      if (reminderEnabled === null) return { error: 'Reminder must be Yes or No' };
      return {
        data: {
          title,
          priority,
          status,
          start_date: startDate || null,
          end_date: endDate || null,
          reminder_enabled: reminderEnabled,
          reminder_days_before: reminderDaysBefore,
          checklist: JSON.stringify(parseImportedChecklist(get('Checklist'))),
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          created_at: importedTimestamp(get),
        },
      };
    },
  },
  {
    id: 'diary',
    label: 'Diary',
    table: 'diaries',
    dateField: 'date',
    headers: ['Title', 'Date', optionHeader('Weather', WEATHER_OPTIONS), 'Content', 'Image URL', 'Created At'],
    example: [
      'A good start', '2025-07-01', 'Sunny', 'Feeling productive today.', '', nowIso(),
    ],
    toRow: (item) => {
      const weather = WEATHER_OPTIONS.find((w) => w.key === item.weather);
      return [
        safe(item.title), safe(item.date), weather ? localizedEnumText(weather.label) : safe(item.weather),
        safe(item.content), exportImageUrl(item.image), safe(item.created_at),
      ];
    },
    fromRow: (get) => {
      const date = normalizeDate(get('Date'));
      if (!validDate(date)) return { error: 'Date must be YYYY-MM-DD' };
      const weatherRaw = String(get('Weather') ?? '').trim();
      const weather = keyOf(WEATHER_OPTIONS, weatherRaw, null);
      if (weatherRaw && weather === null) return { error: `Invalid Weather "${weatherRaw}"` };
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      return {
        data: {
          title: String(get('Title') ?? '').trim(),
          date: date || null,
          weather: weather || weatherRaw || null,
          content: String(get('Content') ?? '').trim(),
          image: image || null,
          created_at: importedTimestamp(get),
        },
      };
    },
  },
  {
    id: 'important-date',
    label: 'Important Dates',
    table: 'important_dates',
    dateField: 'date',
    headers: [
      'Name', 'Date', optionHeader('Type', IMPORTANT_DATE_TYPES), 'Category',
      optionHeader('Priority', SCHEDULE_PRIORITIES), YES_NO_HEADER,
      optionHeader('Reminder Type', REMINDER_TYPES), 'Days Before', 'Image URL', 'Notes', 'Created At',
    ],
    example: ['Birthday', '2025-09-12', 'Birthday', 'family', 'High', 'Yes', 'Annual', '1', '', '', nowIso()],
    toRow: (item) => [
      safe(item.name), safe(item.date), labelOf(IMPORTANT_DATE_TYPES, item.type),
      safe(item.category), labelOf(SCHEDULE_PRIORITIES, item.priority),
      yesNo(item.reminder_enabled), labelOf(REMINDER_TYPES, item.reminder_type),
      safe(item.reminder_days_before), exportImageUrl(item.image), safe(item.notes), safe(item.created_at),
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
      const daysBefore = daysRaw === '' ? 1 : Number(daysRaw);
      if (!Number.isInteger(daysBefore) || daysBefore < 0 || daysBefore > 365) {
        return { error: 'Days Before must be an integer from 0 to 365' };
      }
      const image = String(get('Image URL') ?? '').trim();
      if (!validUrl(image)) return { error: 'Image URL must start with http:// or https://' };
      const reminderEnabled = booleanValue(get('Reminder'));
      if (reminderEnabled === null) return { error: 'Reminder must be Yes or No' };
      return {
        data: {
          name,
          date: date || null,
          type,
          category: String(get('Category') ?? '').trim(),
          priority,
          reminder_enabled: reminderEnabled,
          reminder_type: reminderType,
          reminder_days_before: daysBefore,
          image: image || null,
          notes: String(get('Notes') ?? '').trim(),
          created_at: importedTimestamp(get),
        },
      };
    },
  },
  {
    id: 'budget',
    label: 'Budgets',
    table: 'budgets',
    dateField: 'year',
    headers: ['Year', 'Expense Budget', 'Income Target', CURRENCY_HEADER, 'Created At'],
    example: [String(new Date().getFullYear()), 12000, 18000, DEFAULT_CURRENCY, nowIso()],
    toRow: (item) => [
      safe(item.year), safe(item.expense_budget ?? 0), safe(item.income_target ?? 0),
      safe(item.currency), safe(item.created_at),
    ],
    fromRow: (get) => {
      const year = String(get('Year') ?? '').trim();
      if (!/^\d{4}$/.test(year)) return { error: 'Year must be a four-digit number' };
      const expense = Number(get('Expense Budget') || 0);
      const income = Number(get('Income Target') || 0);
      if (!Number.isFinite(expense) || expense < 0 || !Number.isFinite(income) || income < 0) {
        return { error: 'Budget amounts must be non-negative numbers' };
      }
      if (expense <= 0 && income <= 0) return { error: 'At least one budget amount is required' };
      const currency = normalizeCurrency(get('Currency'));
      if (!currency) return { error: `Invalid Currency "${get('Currency')}"` };
      return {
        data: {
          year,
          expense_budget: expense,
          income_target: income,
          currency,
          created_at: importedTimestamp(get),
          updated_at: importedTimestamp(get),
        },
      };
    },
  },
  {
    id: 'mood',
    label: 'Mood Records',
    table: 'check_ins',
    dateField: 'check_date',
    headers: ['Date', enumHeader('Mood', MOODS.map((mood) => mood.label)), 'Score', 'Created At'],
    example: ['2025-07-01', 'Happy', 5, nowIso()],
    toRow: (item) => {
      const mood = MOODS.find((m) => m.key === item.mood);
      return [
        safe(item.check_date),
        mood ? localizedEnumText(mood.label) : safe(item.mood),
        mood ? mood.score : '',
        safe(item.created_at),
      ];
    },
    fromRow: (get) => {
      const date = normalizeDate(get('Date'));
      if (!date) return { error: 'Date is required' };
      if (!validDate(date)) return { error: 'Date must be YYYY-MM-DD' };
      const raw = String(get('Mood') ?? '').trim();
      if (!raw) return { error: 'Mood is required' };
      const lower = raw.toLowerCase();
      const mood = MOODS.find(
        (m) =>
          m.key === lower ||
          m.label.toLowerCase() === lower ||
          localizedEnumText(m.label, 'zh-CN').toLowerCase() === lower ||
          raw.includes(m.emoji),
      );
      if (!mood) return { error: `Unknown mood "${raw}"` };
      return {
        data: {
          check_date: date,
          mood: mood.key,
          created_at: importedTimestamp(get),
        },
      };
    },
  },
];

export const moduleById = (id) => EXPORT_MODULES.find((m) => m.id === id) || null;

// ── Workbook helpers ──────────────────────────────

/** Build an xlsx workbook (single sheet) from module rows. */
export function buildWorkbook(mod, rows) {
  const aoa = [
    mod.headers.map(localizedHeader),
    ...rows.map((row) => stringifyRow(formatTimestampColumns(mod.headers, mod.toRow(row)))),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, mod.label);
  return wb;
}

/** Build the template workbook (headers + one example row). */
export function buildTemplateWorkbook(mod) {
  const ws = XLSX.utils.aoa_to_sheet([
    mod.headers.map(localizedHeader),
    stringifyRow(formatTimestampColumns(mod.headers, localizedExample(mod.example))),
  ]);
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

function headerMatches(candidateHeader, headerKey) {
  const normalizedKey = splitHeader(headerKey).base;
  const candidate = splitHeader(candidateHeader).base;
  const labels = HEADER_LABELS[normalizedKey];
  return (
    candidate.toLocaleLowerCase() === normalizedKey.toLocaleLowerCase() ||
    Object.values(labels || {}).some(
      (label) => label.toLocaleLowerCase() === candidate.toLocaleLowerCase(),
    ) ||
    (LEGACY_HEADER_LABELS[normalizedKey] || []).some(
      (label) => label.toLocaleLowerCase() === candidate.toLocaleLowerCase(),
    )
  );
}

/** Return localized expected headers that are absent from an imported sheet. */
export function missingHeaders(mod, headers) {
  return mod.headers
    .filter((header) => !headers.some((candidate) => headerMatches(candidate, header)))
    .map(localizedHeader);
}

/** Header → cell accessor for one data row (localized and legacy headers supported). */
export function makeGetter(headers, row) {
  return (headerKey) => {
    const idx = headers.findIndex((header) => headerMatches(header, headerKey));
    if (idx < 0 || idx >= row.length) return '';
    return row[idx];
  };
}
