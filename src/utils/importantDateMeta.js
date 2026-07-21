/**
 * Important-date display metadata shared by list and detail screens.
 * Takes theme `Colors` and i18n `t` so it stays reactive.
 */

/** Type → { label, color, icon } for badges. */
export function typeMeta(type, Colors, t) {
  switch (type) {
    case 'birthday':
      return { label: t('importantDate.typeBirthday'), color: Colors.rose, icon: 'gift-outline' };
    case 'anniversary':
      return { label: t('importantDate.typeAnniversary'), color: Colors.orange, icon: 'heart-outline' };
    case 'remembrance':
      return { label: t('importantDate.typeRemembrance'), color: Colors.purple, icon: 'flower-outline' };
    default:
      return { label: t('importantDate.typeOther'), color: Colors.textSecondary, icon: 'star-outline' };
  }
}

/**
 * Countdown → { text, color } for the "days away / today / passed" display.
 * `days` may be null (no date) → '--'.
 */
export function countdownText(days, Colors, t) {
  if (days === null || days === undefined) return { text: '--', color: Colors.textSecondary };
  if (days < 0) return { text: t('importantDate.passed', { count: Math.abs(days) }), color: Colors.rose };
  if (days === 0) return { text: t('importantDate.today'), color: Colors.orange };
  return { text: t('importantDate.daysLeft', { count: days }), color: Colors.purple };
}
