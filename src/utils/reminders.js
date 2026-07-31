/**
 * Reminder aggregation — combines the four reminder sources (plans, item
 * expiry, asset expiry, important dates) into one sorted list. Pure
 * in-app computation (no system notifications), matching the old project.
 *
 * Rules per source:
 * - schedules: reminder_enabled, raw status NOT done/incomplete. Three phases:
 *   'upcoming' (today < start_date): show when start_date - today <= n;
 *     text: "X天后开始"
 *   'active' (start_date <= today < end_date): always show (方案A);
 *     text: "剩余X天" / "今天到期"
 *   'expired' (today >= end_date): always show;
 *     text: "已逾期"
 * - durables: raw status in_use with expiry_date; daysLeft <=
 *   durableRemindDays (expired always shows). Text:
 *   "X天后过期" / "今天到期" / "已过期"
 * - assets: active with expiry_date; daysLeft <= assetRemindDays.
 *   Text: "X天后失效" / "今天失效" / "已失效"
 * - important_dates: reminder_enabled; per-row reminder_days_before lead;
 *   annual rolls to the next occurrence. Only shows when daysLeft >= 0.
 *   Text: "距离X天" / "就是今天"
 */
import { listSchedules } from '../services/schedule';
import { listDurables } from '../services/durable';
import { listAssets } from '../services/asset';
import { listImportantDates, countdownDays } from '../services/importantDate';
import { daysUntil, todayStr } from './date';
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

    // Exclude by raw status: done / incomplete are terminal states
    const rawStatus = row.status || 'not_started';
    if (rawStatus === 'done' || rawStatus === 'incomplete') return;

    // Both dates required for three-phase logic
    if (!row.start_date || !row.end_date) return;

    const today = todayStr();
    const startDays = daysUntil(row.start_date);
    const endDays = daysUntil(row.end_date);
    if (startDays === null || endDays === null) return;

    const before =
      row.reminder_days_before != null
        ? Number(row.reminder_days_before)
        : Number(settings?.scheduleRemindDays) || 1;

    let phase, daysLeft, showDate;

    if (row.start_date > today) {
      // ── 未开始: today < start_date ──
      phase = 'upcoming';
      daysLeft = startDays;
      showDate = row.start_date;
      // Only show when start_date - today <= n
      if (daysLeft > before) return;
    } else if (row.end_date > today) {
      // ── 进行中: start_date <= today < end_date ──
      // 方案A: always show
      phase = 'active';
      daysLeft = endDays;
      showDate = row.end_date;
    } else {
      // ── 已逾期: today >= end_date ──
      // Always show
      phase = 'expired';
      daysLeft = endDays;
      showDate = row.end_date;
    }

    items.push({
      id: `schedule:${row.id}`,
      module: 'schedule',
      title: row.title || '',
      date: showDate,
      daysLeft,
      expired: daysLeft < 0,
      phase,
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
    // Important dates only remind when the date hasn't passed (daysLeft >= 0)
    if (daysLeft < 0) return;
    const before = row.reminder_days_before != null ? Number(row.reminder_days_before) : 1;
    if (daysLeft > before) return;
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

/** Human status for a reminder item (module-specific text). */
export function reminderStatusText(item, t) {
  switch (item.module) {
    case 'schedule': {
      if (item.phase === 'upcoming') return t('reminder.startsIn', { count: item.daysLeft });
      if (item.expired) return t('reminder.overdueBy', { count: -item.daysLeft });
      if (item.daysLeft === 0) return t('reminder.dueToday');
      return t('reminder.endsIn', { count: item.daysLeft });
    }
    case 'durable': {
      if (item.expired) return t('reminder.expired');
      if (item.daysLeft === 0) return t('reminder.dueToday');
      return t('reminder.expiresIn', { count: item.daysLeft });
    }
    case 'asset': {
      if (item.expired) return t('reminder.assetExpired');
      if (item.daysLeft === 0) return t('reminder.dueToday');
      return t('reminder.assetExpiresIn', { count: item.daysLeft });
    }
    default: { // important-date
      if (item.daysLeft === 0) return t('reminder.isToday');
      return t('reminder.daysAway', { count: item.daysLeft });
    }
  }
}

/** Compact time label for the home timeline (shorter than reminderStatusText). */
export function reminderTimelineText(item, t) {
  switch (item.module) {
    case 'schedule': {
      if (item.expired) return t('home.overdue');
      if (item.daysLeft === 0) return t('home.todayDue');
      if (item.phase === 'upcoming') return t('home.startsIn', { count: item.daysLeft });
      return t('home.endsIn', { count: item.daysLeft });
    }
    case 'durable': {
      if (item.expired) return t('home.expired');
      if (item.daysLeft === 0) return t('home.todayDue');
      return t('home.expiresIn', { count: item.daysLeft });
    }
    case 'asset': {
      if (item.expired) return t('home.assetExpired');
      if (item.daysLeft === 0) return t('home.todayDue');
      return t('home.assetExpiresIn', { count: item.daysLeft });
    }
    default: { // important-date
      if (item.daysLeft === 0) return t('home.isToday');
      return t('home.daysAway', { count: item.daysLeft });
    }
  }
}
