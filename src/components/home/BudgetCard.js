import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';

/**
 * Annual budget progress — compares the current year's expense bills
 * against the year's budget plan. Falls back to "--" without a budget.
 */
export default function BudgetCard({ budget, bills = [] }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);

  const year = String(new Date().getFullYear());
  const budgetAmount = Number(budget?.expense_budget) || 0;
  const spent = bills
    .filter((b) => b.bill_type === 'expense' && (b.consumption_date || '').slice(0, 4) === year)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const hasBudget = !!budget && budgetAmount > 0;
  const ratio = hasBudget ? spent / budgetAmount : 0;
  const pct = hasBudget ? Math.round(ratio * 100) : null;
  const remaining = budgetAmount - spent;
  const over = hasBudget && spent > budgetAmount;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.inkDeep,
          borderColor: Colors.white05,
          borderRadius: Radius.xl,
        },
        Shadows.dark,
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
          {t('home.annualBudget')}
        </Text>
        {hasBudget ? (
          <Text style={[styles.badge, { color: over ? Colors.rose : Colors.green, fontFamily: Fonts.bold }]}>
            {over ? t('home.overBudgetBadge') : t('home.onTrack')}
          </Text>
        ) : null}
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            {hasBudget ? t('home.expenseVsBudget') : t('home.noBudgetSet')}
          </Text>
          <Text style={[styles.progressValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {pct != null ? `${pct}%` : '--'}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: Colors.white10 }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: over ? Colors.rose : Colors.purple,
                width: `${Math.min(ratio, 1) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Budget pills */}
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: Colors.white05 }]}>
          <Text style={[styles.pillLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            {t('home.budgetPill')}
          </Text>
          <Text style={[styles.pillValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {hasBudget ? formatMoney(budgetAmount, budget.currency || currency) : '--'}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: Colors.white05, borderColor: Colors.white10, borderWidth: 1 }]}>
          <Text style={[styles.pillLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            {t('home.remainingPill')}
          </Text>
          <Text
            style={[
              styles.pillValue,
              { color: hasBudget && remaining < 0 ? Colors.rose : Colors.green, fontFamily: Fonts.bold },
            ]}
          >
            {hasBudget ? formatMoney(remaining, budget.currency || currency) : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  badge: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  progressSection: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    lineHeight: 22,
  },
  progressValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  track: {
    height: 12,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 9999,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
  },
  pill: {
    flex: 1,
    padding: 12,
    borderRadius: 48,
    gap: 4,
  },
  pillLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  pillValue: {
    fontSize: 16,
    lineHeight: 28,
  },
});
