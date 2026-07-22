import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';

function summarizeYear(bills, year) {
  const inYear = (bills || []).filter((b) => (b.consumption_date || '').slice(0, 4) === year);
  const expense = inYear.filter((b) => b.bill_type !== 'income');
  const income = inYear.filter((b) => b.bill_type === 'income');
  return {
    expenseTotal: expense.reduce((s, b) => s + (Number(b.amount) || 0), 0),
    incomeTotal: income.reduce((s, b) => s + (Number(b.amount) || 0), 0),
    expenseCount: expense.length,
    incomeCount: income.length,
  };
}

export default function MonthlyRecordsCard({ bills = [] }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);

  const now = new Date();
  const current = summarizeYear(bills, String(now.getFullYear()));
  const elapsedMonths = now.getMonth() + 1;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('home.annualRecords')}
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: Colors.inkDeep,
            borderColor: Colors.white05,
            borderRadius: Radius.lg,
          },
          Shadows.dark,
        ]}
      >
        <View style={styles.recordRow}>
          <View style={styles.recordLeft}>
            <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
              {t('home.annualExpense')}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.recordValue, { color: Colors.white, fontFamily: Fonts.bold }]}
            >
              {current.expenseCount ? formatMoney(current.expenseTotal, currency) : '--'}
            </Text>
          </View>
          <View style={styles.recordRight}>
            <Text numberOfLines={1} style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
              {t('home.transactions', { count: current.expenseCount })}
            </Text>
            <Text numberOfLines={1} style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
              {current.expenseCount
                ? t('home.monthlyAvg', { amount: formatMoney(current.expenseTotal / elapsedMonths, currency) })
                : '--'}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: Colors.white10 }]} />

        <View style={styles.recordRow}>
          <View style={styles.recordLeft}>
            <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
              {t('home.annualIncome')}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.recordValue, { color: Colors.green, fontFamily: Fonts.bold }]}
            >
              {current.incomeCount ? formatMoney(current.incomeTotal, currency) : '--'}
            </Text>
          </View>
          <View style={styles.recordRight}>
            <Text numberOfLines={1} style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
              {t('home.transactions', { count: current.incomeCount })}
            </Text>
            <Text numberOfLines={1} style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
              {current.incomeCount
                ? t('home.monthlyAvg', { amount: formatMoney(current.incomeTotal / elapsedMonths, currency) })
                : '--'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recordLeft: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  recordLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  recordValue: {
    fontSize: 24,
    lineHeight: 30,
  },
  recordRight: {
    flexShrink: 1,
    minWidth: 0,
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  recordMeta: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  recordSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
});
