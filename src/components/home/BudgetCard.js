import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';

function BudgetSection({
  title,
  target,
  actual,
  count,
  elapsedMonths,
  currency,
  targetLabel,
  color,
  overColor,
  remainingKey,
  overKey,
  t,
  Colors,
  Fonts,
  Shadows,
}) {
  const hasTarget = target > 0;
  const ratio = hasTarget ? actual / target : 0;
  const percentage = hasTarget ? Math.round(ratio * 100) : null;
  const targetMinor = Math.round(target * 100);
  const actualMinor = Math.round(actual * 100);
  const differenceMinor = targetMinor - actualMinor;
  const difference = differenceMinor / 100;
  const isOver = hasTarget && differenceMinor < 0;
  const accent = isOver && overColor ? overColor : color;

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: Colors.inkDeep, borderColor: Colors.white05 },
        Shadows.dark,
      ]}
    >
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: Colors.white40, fontFamily: Fonts.bold }]}>
          {title}
        </Text>
        <Text style={[styles.count, { color: Colors.white60, fontFamily: Fonts.regular }]}>
          {t('home.transactions', { count })}
        </Text>
      </View>

      <Text numberOfLines={1} style={[styles.actualValue, { color, fontFamily: Fonts.bold }]}>
        {count ? formatMoney(actual, currency) : '--'}
      </Text>
      {count > 0 && (
        <Text style={[styles.average, { color: Colors.white40, fontFamily: Fonts.regular }]}>
          {t('home.monthlyAvg', { amount: formatMoney(actual / elapsedMonths, currency) })}
        </Text>
      )}

      {hasTarget && (
        <View style={styles.targetSection}>
          <View style={styles.progressMeta}>
            <Text style={[styles.progressLabel, { color: Colors.white60, fontFamily: Fonts.regular }]}>
              {t(targetLabel)} · {formatMoney(target, currency)}
            </Text>
            <Text style={[styles.progressValue, { color: accent, fontFamily: Fonts.bold }]}>
              {percentage}%
            </Text>
          </View>
          <View style={[styles.track, { backgroundColor: Colors.white10 }]}>
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: accent,
                  width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.remaining, { color: accent, fontFamily: Fonts.semiBold }]}>
            {t(isOver ? overKey : remainingKey, { amount: formatMoney(Math.abs(difference), currency) })}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function BudgetCard({ budget, bills = [] }) {
  const { Colors, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);

  const year = String(new Date().getFullYear());
  const annualBills = bills.filter((b) => (b.consumption_date || '').slice(0, 4) === year);
  const expenses = annualBills.filter((b) => b.bill_type === 'expense');
  const income = annualBills.filter((b) => b.bill_type === 'income');
  const expenseTarget = Number(budget?.expense_budget) || 0;
  const incomeTarget = Number(budget?.income_target) || 0;
  const spent = expenses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const earned = income.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const displayCurrency = budget?.currency || currency;
  const elapsedMonths = new Date().getMonth() + 1;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('home.annualRecords')}
      </Text>
      <View style={styles.card}>
        <BudgetSection
          title={t('home.annualExpense')}
          target={expenseTarget}
          actual={spent}
          count={expenses.length}
          elapsedMonths={elapsedMonths}
          currency={displayCurrency}
          targetLabel="home.budgetTotal"
          color={Colors.orange}
          overColor={Colors.rose}
          remainingKey="home.expenseRemaining"
          overKey="home.expenseOver"
          t={t}
          Colors={Colors}
          Fonts={Fonts}
          Shadows={Shadows}
        />
        <BudgetSection
          title={t('home.annualIncome')}
          target={incomeTarget}
          actual={earned}
          count={income.length}
          elapsedMonths={elapsedMonths}
          currency={displayCurrency}
          targetLabel="home.targetTotal"
          color={Colors.green}
          remainingKey="home.incomeRemaining"
          overKey="home.incomeOver"
          t={t}
          Colors={Colors}
          Fonts={Fonts}
          Shadows={Shadows}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  card: {
    gap: 12,
  },
  section: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 24,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  count: {
    fontSize: 14,
    lineHeight: 22,
  },
  actualValue: {
    fontSize: 24,
    lineHeight: 30,
  },
  average: {
    marginTop: -4,
    fontSize: 14,
    lineHeight: 22,
  },
  targetSection: {
    marginTop: 4,
    gap: 8,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  progressValue: {
    fontSize: 13,
    lineHeight: 16,
  },
  track: {
    height: 8,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    borderRadius: 9999,
  },
  remaining: {
    fontSize: 12,
    lineHeight: 16,
  },
});
