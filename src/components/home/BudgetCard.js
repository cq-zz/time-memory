import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';

function BudgetSection({
  title,
  target,
  actual,
  hasTarget,
  currency,
  color,
  overColor,
  remainingKey,
  overKey,
  t,
  Colors,
  Fonts,
}) {
  const ratio = hasTarget ? actual / target : 0;
  const percentage = hasTarget ? Math.round(ratio * 100) : null;
  const targetMinor = Math.round(target * 100);
  const actualMinor = Math.round(actual * 100);
  const differenceMinor = targetMinor - actualMinor;
  const difference = differenceMinor / 100;
  const isOver = hasTarget && differenceMinor < 0;
  const accent = isOver && overColor ? overColor : color;

  return (
    <View style={[styles.section, { backgroundColor: Colors.white05, borderColor: Colors.white10 }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
          {title}
        </Text>
        <View style={styles.targetWrap}>
          <Text style={[styles.targetLabel, { color: Colors.white40, fontFamily: Fonts.regular }]}>
            {t('home.targetTotal')}
          </Text>
          <Text style={[styles.targetValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {hasTarget ? formatMoney(target, currency) : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.progressMeta}>
        <Text style={[styles.progressLabel, { color: Colors.white60, fontFamily: Fonts.regular }]}>
          {t('home.completionProgress')}
        </Text>
        <Text style={[styles.progressValue, { color: accent, fontFamily: Fonts.bold }]}>
          {percentage == null ? '--' : `${percentage}%`}
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

      <Text style={[styles.remaining, { color: hasTarget ? accent : Colors.white40, fontFamily: Fonts.semiBold }]}>
        {hasTarget
          ? t(isOver ? overKey : remainingKey, { amount: formatMoney(Math.abs(difference), currency) })
          : t('home.noBudgetSet')}
      </Text>
    </View>
  );
}

export default function BudgetCard({ budget, bills = [] }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);

  const year = String(new Date().getFullYear());
  const expenseTarget = Number(budget?.expense_budget) || 0;
  const incomeTarget = Number(budget?.income_target) || 0;
  const spent = bills
    .filter((b) => b.bill_type === 'expense' && (b.consumption_date || '').slice(0, 4) === year)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const earned = bills
    .filter((b) => b.bill_type === 'income' && (b.consumption_date || '').slice(0, 4) === year)
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const displayCurrency = budget?.currency || currency;

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
      <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
        {t('home.annualBudget')}
      </Text>
      <BudgetSection
        title={t('home.annualExpenseBudget')}
        target={expenseTarget}
        actual={spent}
        hasTarget={expenseTarget > 0}
        currency={displayCurrency}
        color={Colors.orange}
        overColor={Colors.rose}
        remainingKey="home.expenseRemaining"
        overKey="home.expenseOver"
        t={t}
        Colors={Colors}
        Fonts={Fonts}
      />
      <BudgetSection
        title={t('home.annualIncomeTarget')}
        target={incomeTarget}
        actual={earned}
        hasTarget={incomeTarget > 0}
        currency={displayCurrency}
        color={Colors.green}
        remainingKey="home.incomeRemaining"
        overKey="home.incomeOver"
        t={t}
        Colors={Colors}
        Fonts={Fonts}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  section: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
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
    fontSize: 14,
    lineHeight: 20,
  },
  targetWrap: {
    alignItems: 'flex-end',
  },
  targetLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  targetValue: {
    fontSize: 16,
    lineHeight: 20,
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
