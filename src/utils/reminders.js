/**
 * Reminder aggregation — combines the four reminder sources (plans, item
 * expiry, asset expiry, important dates) into one sorted list. Pure
 * in-app computation (no system notifications), matching the old project.
 *
 * Rules per source:
 * - schedules: reminder_enabled, not done, target = start_date; shows when
 *   daysLeft <= the plan's reminder_days_before (expired always shows)
 * - durables: raw status in_use with expiry_date; daysLeft <=
 *   durableRemindDays (expired always shows)
 * - assets: active with expiry_date; daysLeft <= assetRemindDays
 * - important_dates: reminder_enabled; per-row reminder_days_before lead;
 *   annual rolls to the next occurrence, once can expire
 */
import { listSchedules, effectiveStatus as scheduleStatus } from '../services/schedule';
import { listDurables } from '../services/durable';
import { listAssets } from '../services/asset';
import { listImportantDates, countdownDays } from '../services/importantDate';
import { daysUntil } from './date';
import { useSettingsStore } from '../store/settings';

const MODULE_ORDER = { schedule: 0, durable: 1, asset: 2, 'important-date': 3 };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

/**
 * Pure aggregation. Takes the four row lists + settings, returns sorted
 * reminder items: { id, module, title, date, daysLeft, expired, priority, route }.
 */
export function buildReminders({ schedules, durables, assets, importantDates, settings }) {
  const items = [];
  const lead = {
    durable: Number(settings?.durableRemindDays) || 0,
    asset: Number(settings?.assetRemindDays) || 0,
  };

  (schedules || []).forEach((row) => {
    if (!Number(row.reminder_enabled)) return;
    if (scheduleStatus(row) === 'done') return;
    if (!row.start_date) return;
    const daysLeft = daysUntil(row.start_date);
    if (daysLeft === null) return;
    const before =
      row.reminder_days_before != null
        ? Number(row.reminder_days_before)
        : Number(settings?.scheduleRemindDays) || 1;
    if (daysLeft >= 0 && daysLeft > before) return;
    items.push({
      id: `schedule:${row.id}`,
      module: 'schedule',
      title: row.title || '',
      date: row.start_date,
      daysLeft,
      expired: daysLeft < 0,
      priority: row.priority || 'medium',
      route: `/schedule/${row.id}`,
    });
  });

  (durables || []).forEach((row) => {
    // Reminder eligibility follows the persisted business status. An expired
    // in-use item has an effective display status of disposed, but its overdue
    // reminder must remain visible until the user explicitly archives it.
    if ((row.status || 'in_use') !== 'in_use' || !row.expiry_date) return;
    const daysLeft = daysUntil(row.expiry_date);
    if (daysLeft === null) return;
    if (daysLeft >= 0 && daysLeft > lead.durable) return;
    items.push({
      id: `durable:${row.id}`,
      module: 'durable',
      title: row.name || '',
      date: row.expiry_date,
      daysLeft,
      expired: daysLeft < 0,
      priority: null,
      route: `/durable/${row.id}`,
    });
  });

  (assets || []).forEach((row) => {
    if ((row.status || 'active') !== 'active' || !row.expiry_date) return;
    const daysLeft = daysUntil(row.expiry_date);
    if (daysLeft === null) return;
    if (daysLeft >= 0 && daysLeft > lead.asset) return;
    items.push({
      id: `asset:${row.id}`,
      module: 'asset',
      title: row.name || '',
      date: row.expiry_date,
      daysLeft,
      expired: daysLeft < 0,
      priority: null,
      route: `/asset/${row.id}`,
    });
  });

  (importantDates || []).forEach((row) => {
    if (!Number(row.reminder_enabled)) return;
    const daysLeft = countdownDays(row);
    if (daysLeft === null) return;
    const before = row.reminder_days_before != null ? Number(row.reminder_days_before) : 1;
    if (daysLeft >= 0 && daysLeft > before) return;
    items.push({
      id: `important-date:${row.id}`,
      module: 'important-date',
      title: row.name || '',
      date: row.date,
      daysLeft,
      expired: daysLeft < 0,
      priority: row.priority || null,
      route: `/important-date/${row.id}`,
    });
  });

  return items.sort((a, b) => {
    if (a.expired !== b.expired) return a.expired ? -1 : 1;
    if (a.daysLeft !== b.daysLeft) return a.daysLeft - b.daysLeft;
    const pa = a.priority ? PRIORITY_ORDER[a.priority] ?? 9 : 9;
    const pb = b.priority ? PRIORITY_ORDER[b.priority] ?? 9 : 9;
    if (pa !== pb) return pa - pb;
    return MODULE_ORDER[a.module] - MODULE_ORDER[b.module];
  });
}

/** Load all four sources and aggregate with the current settings. */
export async function getReminders() {
  const [schedules, durables, assets, importantDates] = await Promise.all([
    listSchedules(),
    listDurables(),
    listAssets(),
    listImportantDates(),
  ]);
  const settings = useSettingsStore.getState().settings;
  return buildReminders({ schedules, durables, assets, importantDates, settings });
}

/** Display meta (icon / color / label) for a reminder's source module. */
export function reminderModuleMeta(module, Colors, t) {
  switch (module) {
    case 'schedule':
      return { icon: 'calendar-outline', color: Colors.purple, label: t('nav.schedule') };
    case 'durable':
      return { icon: 'cube-outline', color: Colors.green, label: t('nav.durable') };
    case 'asset':
      return { icon: 'wallet-outline', color: Colors.orange, label: t('nav.asset') };
    default:
      return { icon: 'heart-outline', color: Colors.rose, label: t('nav.importantDate') };
  }
}

/** Human status for a reminder item ("3 DAYS LEFT" / "DUE TODAY" / "2D OVERDUE"). */
export function reminderStatusText(item, t) {
  if (item.expired) return t('reminder.overdueBy', { count: -item.daysLeft });
  if (item.daysLeft === 0) return t('reminder.dueToday');
  return t('reminder.daysLeft', { count: item.daysLeft });
}
