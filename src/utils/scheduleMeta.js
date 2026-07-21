/**
 * Schedule display metadata shared by the list and detail screens.
 * Functions take the theme `Colors` and i18n `t` so they stay reactive.
 */
import { formatDisplay } from './date';

/** Status → { label, color, icon } for pills/badges. */
export function statusMeta(status, Colors, t) {
  switch (status) {
    case 'in_progress':
      return { label: t('schedule.inProgress'), color: Colors.orange, icon: 'sync-outline' };
    case 'done':
      return { label: t('schedule.done'), color: Colors.green, icon: 'checkmark-circle-outline' };
    case 'incomplete':
      return { label: t('schedule.incomplete'), color: Colors.rose, icon: 'alert-circle-outline' };
    default:
      return { label: t('schedule.notStarted'), color: Colors.textSecondary, icon: 'time-outline' };
  }
}

/** Priority → { label, color } for the corner badge. */
export function priorityMeta(priority, Colors, t) {
  switch (priority) {
    case 'high':
      return { label: t('schedule.priorityHigh'), color: Colors.rose };
    case 'low':
      return { label: t('schedule.priorityLow'), color: Colors.green };
    default:
      return { label: t('schedule.priorityMedium'), color: Colors.orange };
  }
}

/** Quick-action status cycle: not_started/incomplete → in_progress → done → not_started. */
export function nextStatus(current) {
  if (current === 'in_progress') return 'done';
  if (current === 'done') return 'not_started';
  return 'in_progress';
}

/** Compact "start – end" display; '--' when neither is set. */
export function dateRangeText(row) {
  const s = formatDisplay(row?.start_date);
  const e = formatDisplay(row?.end_date);
  if (s === '--' && e === '--') return '--';
  if (e === '--' || s === e) return s;
  return `${s} – ${e}`;
}
