/**
 * Local notification service — schedules system notifications for
 * reminder events (item expiry, asset expiry, plan start/overdue,
 * important dates). All scheduling is local; no remote push service.
 *
 * Architecture:
 * - On app open / data change: cancel all, recompute, reschedule
 * - Each notification carries { id, module, route } in its data payload
 * - Tap → dismiss notification, navigate to detail, update badge
 * - Badge = count of currently presented notifications
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { listSchedules } from './schedule';
import { listDurables } from './durable';
import { listAssets } from './asset';
import { listImportantDates, countdownDays } from './importantDate';
import { daysUntil, todayStr } from '../utils/date';
import { useSettingsStore } from '../store/settings';

// ── Android channel ────────────────────────────────
const CHANNEL_ID = 'timemory-reminders';

// ── Notification ID prefix ─────────────────────────
const PREFIX = 'tm:';

// ── Setup ──────────────────────────────────────────

/** Configure how notifications behave when the app is in the foreground. */
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/** Create Android notification channel (required before scheduling). */
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  const channels = await Notifications.getNotificationChannelsAsync();
  if (channels.some((c) => c.id === CHANNEL_ID)) return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    description: 'Item expiry, asset expiry, plan & event reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7C5CFC',
  });
}

/** Request notification permissions. Returns true if granted. */
export async function requestPermissions() {
  await ensureChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Notification content builders ──────────────────

function enTitle(item) {
  switch (item.module) {
    case 'schedule':
      return item.phase === 'upcoming' ? 'Plan Starting Soon' : item.expired ? 'Plan Overdue' : 'Plan Due';
    case 'durable':
      return item.expired ? 'Item Expired' : 'Item Expiring Soon';
    case 'asset':
      return item.expired ? 'Asset Expired' : 'Asset Expiring Soon';
    case 'important-date':
      return 'Important Date';
    default:
      return 'Reminder';
  }
}

function zhTitle(item) {
  switch (item.module) {
    case 'schedule':
      return item.phase === 'upcoming' ? '计划即将开始' : item.expired ? '计划已逾期' : '计划即将到期';
    case 'durable':
      return item.expired ? '物品已过期' : '物品即将过期';
    case 'asset':
      return item.expired ? '资产已失效' : '资产即将失效';
    case 'important-date':
      return '重要日子提醒';
    default:
      return '提醒';
  }
}

function enBody(item) {
  const name = item.title || '';
  const d = item.daysLeft;
  const ad = Math.abs(d);
  const s = ad === 1 ? '' : 's';
  switch (item.module) {
    case 'schedule':
      if (item.phase === 'upcoming') return `${name} starts in ${d} day${s}`;
      if (item.expired) return `${name} is ${ad} day${s} overdue`;
      return d === 0 ? `${name} ends today` : `${name} ends in ${d} day${s}`;
    case 'durable':
      if (item.expired) return `${name} expired ${ad} day${s} ago`;
      return d === 0 ? `${name} expires today` : `${name} expires in ${d} day${s}`;
    case 'asset':
      if (item.expired) return `${name} expired ${ad} day${s} ago`;
      return d === 0 ? `${name} expires today` : `${name} expires in ${d} day${s}`;
    case 'important-date':
      return d === 0 ? `${name} is today` : `${name} is in ${d} day${s}`;
    default:
      return '';
  }
}

function zhBody(item) {
  const name = item.title || '';
  const d = item.daysLeft;
  switch (item.module) {
    case 'schedule':
      if (item.phase === 'upcoming') return `「${name}」将在${d}天后开始`;
      if (item.expired) return `「${name}」已逾期${-d}天`;
      return d === 0 ? `「${name}」今天到期` : `「${name}」${d}天后结束`;
    case 'durable':
      if (item.expired) return `「${name}」已过期${-d}天`;
      return d === 0 ? `「${name}」今天过期` : `「${name}」${d}天后过期`;
    case 'asset':
      if (item.expired) return `「${name}」已失效${-d}天`;
      return d === 0 ? `「${name}」今天失效` : `「${name}」${d}天后失效`;
    case 'important-date':
      return d === 0 ? `「${name}」就是今天` : `距离「${name}」还有${d}天`;
    default:
      return '';
  }
}

// ── Build notification items from raw data ─────────

/**
 * Compute all notification items from the four source tables.
 * Returns { id, module, title, triggerDate, daysLeft, phase, route }.
 * Only items with a future trigger date are included.
 */
async function buildNotificationItems() {
  const settings = useSettingsStore.getState().settings;
  const [schedules, durables, assets, importantDates] = await Promise.all([
    listSchedules(),
    listDurables(),
    listAssets(),
    listImportantDates(),
  ]);

  const items = [];
  const today = todayStr();
  const lead = {
    durable: Number(settings.durableRemindDays) || 0,
    asset: Number(settings.assetRemindDays) || 0,
  };

  // ── Schedules ──
  (schedules || []).forEach((row) => {
    if (!Number(row.reminder_enabled)) return;
    const rawStatus = row.status || 'not_started';
    if (rawStatus === 'done' || rawStatus === 'incomplete') return;
    if (!row.start_date || !row.end_date) return;

    const startDays = daysUntil(row.start_date);
    const endDays = daysUntil(row.end_date);
    if (startDays === null || endDays === null) return;

    const before = row.reminder_days_before != null
      ? Number(row.reminder_days_before)
      : 1;

    let triggerDate, phase, daysLeft;

    if (row.start_date > today) {
      // Upcoming
      phase = 'upcoming';
      daysLeft = startDays;
      // Trigger: `before` days before start_date
      const d = new Date(row.start_date);
      d.setDate(d.getDate() - before);
      triggerDate = d.toISOString().split('T')[0];
    } else if (row.end_date > today) {
      // Active
      phase = 'active';
      daysLeft = endDays;
      triggerDate = row.end_date;
    } else {
      // Expired/ends today: trigger on today
      phase = 'expired';
      daysLeft = endDays;
      triggerDate = today;
    }

    // Only schedule if trigger date is not in the past
    if (triggerDate < today) return;

    items.push({
      id: `schedule:${row.id}`,
      module: 'schedule',
      title: row.title || '',
      triggerDate,
      daysLeft,
      phase,
      route: `/schedule/${row.id}`,
    });
  });

  // ── Durables ──
  (durables || []).forEach((row) => {
    if ((row.status || 'in_use') !== 'in_use' || !row.expiry_date) return;
    const daysLeft = daysUntil(row.expiry_date);
    if (daysLeft === null) return;

    // Trigger date = expiry_date - lead_days
    const triggerDate = new Date(row.expiry_date);
    triggerDate.setDate(triggerDate.getDate() - lead.durable);
    let triggerStr = triggerDate.toISOString().split('T')[0];

    // If the lead-time notification would have fired in the past,
    // but the item is still relevant (expired or expiring today),
    // fire on today instead of skipping entirely.
    if (triggerStr < today) {
      if (daysLeft <= 0) {
        triggerStr = today;
      } else {
        return;
      }
    }

    items.push({
      id: `durable:${row.id}`,
      module: 'durable',
      title: row.name || '',
      triggerDate: triggerStr,
      daysLeft,
      expired: daysLeft < 0,
      route: `/durable/${row.id}`,
    });
  });

  // ── Assets ──
  (assets || []).forEach((row) => {
    if ((row.status || 'active') !== 'active' || !row.expiry_date) return;
    const daysLeft = daysUntil(row.expiry_date);
    if (daysLeft === null) return;

    const triggerDate = new Date(row.expiry_date);
    triggerDate.setDate(triggerDate.getDate() - lead.asset);
    let triggerStr = triggerDate.toISOString().split('T')[0];

    // Same fallback: if lead-time notification is in the past but
    // the asset is still relevant, fire on today.
    if (triggerStr < today) {
      if (daysLeft <= 0) {
        triggerStr = today;
      } else {
        return;
      }
    }

    items.push({
      id: `asset:${row.id}`,
      module: 'asset',
      title: row.name || '',
      triggerDate: triggerStr,
      daysLeft,
      expired: daysLeft < 0,
      route: `/asset/${row.id}`,
    });
  });

  // ── Important Dates ──
  (importantDates || []).forEach((row) => {
    if (!Number(row.reminder_enabled)) return;
    const daysLeft = countdownDays(row);
    if (daysLeft === null || daysLeft < 0) return;

    const before = row.reminder_days_before != null
      ? Number(row.reminder_days_before)
      : 1;

    // 1) Lead-time notification (N days before the date)
    const leadTrigger = new Date(row.date);
    leadTrigger.setDate(leadTrigger.getDate() - before);
    const leadStr = leadTrigger.toISOString().split('T')[0];
    if (leadStr >= today) {
      items.push({
        id: `important-date:${row.id}`,
        module: 'important-date',
        title: row.name || '',
        triggerDate: leadStr,
        daysLeft,
        expired: false,
        route: `/important-date/${row.id}`,
      });
    }

    // 2) On-the-day notification (when today IS the important date)
    if (daysLeft === 0) {
      items.push({
        id: `important-date:${row.id}:today`,
        module: 'important-date',
        title: row.name || '',
        triggerDate: today,
        daysLeft: 0,
        expired: false,
        route: `/important-date/${row.id}`,
      });
    }
  });

  return items;
}

// ── Schedule / Cancel ──────────────────────────────

/**
 * Cancel all scheduled notifications, recompute from current data,
 * and schedule new ones. Also updates the badge.
 */
export async function scheduleAllNotifications() {
  const settings = useSettingsStore.getState().settings;
  if (!settings.notificationsEnabled) {
    await cancelAllNotifications();
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  try {
    // Cancel all existing — both scheduled (future) and presented (currently showing)
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();

    const items = await buildNotificationItems();
    const now = new Date();
    const today = todayStr();
    let badgeCount = 0;

    for (const item of items) {
      const lang = settings.language || 'en';
      const title = lang === 'zh-CN' ? zhTitle(item) : enTitle(item);
      const body = lang === 'zh-CN' ? zhBody(item) : enBody(item);

      const [y, m, d] = item.triggerDate.split('-').map(Number);
      const triggerDate = new Date(y, m - 1, d, 9, 0, 0);

      if (item.triggerDate === today) {
        // Today's notification: present immediately since the 9:00 AM
        // trigger time may have already passed. Schedule with a DATE
        // trigger 1 second from now so the notification fires immediately
        // while keeping our custom identifier for proper dismissal handling.
        const immediateTrigger = new Date(Date.now() + 1000);
        await Notifications.scheduleNotificationAsync({
          identifier: `${PREFIX}${item.id}`,
          content: {
            title,
            body,
            data: {
              id: item.id,
              module: item.module,
              route: item.route,
            },
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: immediateTrigger,
          },
        });
        badgeCount++;
      } else if (triggerDate > now) {
        // Future notification: schedule at 9:00 AM on the trigger date
        await Notifications.scheduleNotificationAsync({
          identifier: `${PREFIX}${item.id}`,
          content: {
            title,
            body,
            data: {
              id: item.id,
              module: item.module,
              route: item.route,
            },
            sound: 'default',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
        badgeCount++;
      }
      // Past trigger dates are silently skipped
    }

    // Set badge directly from the count of scheduled/presented items
    // instead of relying on getPresentedNotificationsAsync() which has
    // a timing gap for immediately-presented notifications.
    await Notifications.setBadgeCountAsync(badgeCount);
  } catch (e) {
    console.warn('[notifications] schedule failed:', e);
  }
}

/** Cancel all scheduled notifications and clear badge. */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
    await Notifications.setBadgeCountAsync(0);
  } catch (e) {
    console.warn('[notifications] cancel failed:', e);
  }
}

// ── Badge ──────────────────────────────────────────

/** Set badge to the number of currently presented notifications. */
export async function updateBadge() {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    await Notifications.setBadgeCountAsync(presented.length);
  } catch (e) {
    console.warn('[notifications] badge update failed:', e);
  }
}

// ── Tap handler ────────────────────────────────────

let _responseSubscription = null;

/**
 * Handle a notification response (tap/dismiss).
 * Dismisses the notification, navigates to the detail route,
 * and updates the badge.
 */
function handleNotificationResponse(response) {
  const data = response.notification?.request?.content?.data;
  if (!data) return;

  // Dismiss the tapped notification
  const identifier = response.notification?.request?.identifier;
  if (identifier) {
    Notifications.dismissNotificationAsync(identifier).catch(() => {});
  }

  // Navigate to detail page
  if (data.route) {
    // Small delay to let the app finish mounting
    setTimeout(() => {
      try {
        router.push(data.route);
      } catch (e) {
        console.warn('[notifications] navigation failed:', e);
      }
    }, 300);
  }

  // Update badge
  updateBadge();
}

/**
 * Set up notification response listener.
 * Returns the subscription so the caller can clean up.
 */
export function setupNotificationResponseListener() {
  // Handle cold start (app opened from notification).
  // getLastNotificationResponse may not be available in all expo-notifications
  // versions, so wrap in try-catch to avoid crashing the app.
  try {
    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      handleNotificationResponse(lastResponse);
    }
  } catch (e) {
    console.warn('[notifications] getLastNotificationResponse unavailable:', e.message);
  }

  // Handle while app is running
  _responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      handleNotificationResponse(response);
    }
  );

  return _responseSubscription;
}

/** Clean up the response listener. */
export function removeNotificationResponseListener() {
  if (_responseSubscription) {
    _responseSubscription.remove();
    _responseSubscription = null;
  }
}

// ── Init ───────────────────────────────────────────

/**
 * Initialize the notification system:
 * 1. Set up foreground handler
 * 2. Request permissions
 * 3. Schedule notifications
 */
export async function initNotifications() {
  setupNotificationHandler();

  const settings = useSettingsStore.getState().settings;
  if (!settings.notificationsEnabled) return;

  const granted = await requestPermissions();
  if (granted) {
    await scheduleAllNotifications();
  }
}

// ── Debounced reschedule for data changes ──────────

let _rescheduleTimer = null;

/**
 * Debounced reschedule. Call after any data mutation.
 * Waits `delay` ms before scheduling to batch rapid changes.
 */
export function debouncedReschedule(delay = 1500) {
  if (_rescheduleTimer) clearTimeout(_rescheduleTimer);
  _rescheduleTimer = setTimeout(() => {
    scheduleAllNotifications();
  }, delay);
}

/** Immediate reschedule (skip debounce). */
export function rescheduleNow() {
  if (_rescheduleTimer) clearTimeout(_rescheduleTimer);
  return scheduleAllNotifications();
}