import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';

function monthKey(offset = 0) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function summarize(bills, key) {
  const inMonth = (bills || []).filter((b) => (b.consumption_date || '').slice(0, 7) === key);
  const expense = inMonth.filter((b) => b.bill_type !== 'income');
  const income = inMonth.filter((b) => b.bill_type === 'income');
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

  const cur = summarize(bills, monthKey(0));
  const prev = summarize(bills, monthKey(-1));
  const dayOfMonth = new Date().getDate();

  const mom = prev.expenseTotal > 0 ? ((cur.expenseTotal - prev.expenseTotal) / prev.expenseTotal) * 100 : null;
  const momUp = mom != null && mom >= 0;

  return (
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
      {/* Header */}
      <View style={styles.headerRow}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: Colors.white, fontFamily: Fonts.semiBold }]}
        >
          {t('home.monthlyRecords')}
        </Text>
        {mom != null ? (
          <View style={styles.momBadge}>
            <Ionicons name={momUp ? 'trending-up' : 'trending-down'} size={13} color={momUp ? Colors.rose : Colors.green} />
            <Text style={[styles.momText, { color: momUp ? Colors.rose : Colors.green, fontFamily: Fonts.bold }]}>
              {t('home.momChange', { sign: momUp ? '+' : '-', pct: Math.abs(mom).toFixed(1) })}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Expense area */}
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            {t('home.monthlyExpense')}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.recordValue, { color: Colors.white, fontFamily: Fonts.bold }]}
          >
            {cur.expenseCount ? formatMoney(cur.expenseTotal, currency) : '--'}
          </Text>
        </View>
        <View style={styles.recordRight}>
          <Text numberOfLines={1} style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            {t('home.transactions', { count: cur.expenseCount })}
          </Text>
          <Text numberOfLines={1} style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
            {cur.expenseCount
              ? t('home.dailyAvg', { amount: formatMoney(cur.expenseTotal / dayOfMonth, currency) })
              : '--'}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: Colors.white10 }]} />

      {/* Income area */}
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            {t('home.monthlyIncome')}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.recordValue, { color: Colors.green, fontFamily: Fonts.bold }]}
          >
            {cur.incomeCount ? formatMoney(cur.incomeTotal, currency) : '--'}
          </Text>
        </View>
        <View style={styles.recordRight}>
          <Text numberOfLines={1} style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            {t('home.transactions', { count: cur.incomeCount })}
          </Text>
          <Text numberOfLines={1} style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
            {cur.incomeCount
              ? t('home.dailyAvg', { amount: formatMoney(cur.incomeTotal / dayOfMonth, currency) })
              : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flexShrink: 1,
    fontSize: 18,
    lineHeight: 24,
  },
  momBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  momText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
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
