import { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { listBills, billSummary } from '../../src/services/bill';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import YearMonthPicker from '../../src/components/common/YearMonthPicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import BillsList from '../../src/components/bill/BillsList';

const BILL_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'expense', labelKey: 'bills.expense' },
  { key: 'income', labelKey: 'bills.income' },
];

function SummaryCard({ label, total, count, color, icon, currency }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  return (
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <View style={[styles.summaryIcon, { backgroundColor: hexToRgba(color, 0.12) }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.summaryLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{label}</Text>
      <Text style={[styles.summaryTotal, { color: Colors.textPrimary, fontFamily: Fonts.bold }]} numberOfLines={1} adjustsFontSizeToFit>
        {formatMoney(total, currency)}
      </Text>
      <Text style={[styles.summaryCount, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
        {count}
      </Text>
    </View>
  );
}

export default function BillsScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const now = new Date();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      setItems(await listBills());
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Summary reflects the selected period (year/month), ignoring search/type.
  const summary = useMemo(() => {
    const periodBills = items.filter((b) => {
      if (year != null && b.consumption_date && Number(b.consumption_date.slice(0, 4)) !== year) return false;
      if (month != null && b.consumption_date && Number(b.consumption_date.slice(5, 7)) !== month) return false;
      return true;
    });
    return billSummary(periodBills);
  }, [items, year, month]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.bills')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Index 0 — period summary (scrolls away) */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <SummaryCard
              label={t('bills.totalExpense')}
              total={summary.expenseTotal}
              count={summary.expenseCount}
              color={Colors.rose}
              icon="trending-down-outline"
              currency={currency}
            />
            <SummaryCard
              label={t('bills.totalIncome')}
              total={summary.incomeTotal}
              count={summary.incomeCount}
              color={Colors.green}
              icon="trending-up-outline"
              currency={currency}
            />
          </View>
        </View>

        {/* Index 1 — sticky filter bar (date + search + type) */}
        <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
          <YearMonthPicker
            year={year}
            month={month}
            style={styles.dateFilter}
            onChange={({ year: y, month: m }) => {
              setYear(y);
              setMonth(m);
            }}
          />
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filters={BILL_FILTERS}
            placeholder={t('bills.searchPlaceholder')}
          />
        </View>

        {/* Index 2 — list */}
        <View style={styles.listSection}>
          <BillsList items={items} year={year} month={month} search={search} filter={filter} loading={loading} />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/bill/form')}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 112,
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dateFilter: {
    marginBottom: 12,
  },
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  summaryTotal: {
    fontSize: 20,
    lineHeight: 26,
  },
  summaryCount: {
    fontSize: 11,
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
