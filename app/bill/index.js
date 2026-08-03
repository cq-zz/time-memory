import { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { listBills, billSummary } from '../../src/services/bill';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ModuleStatsCard from '../../src/components/common/ModuleStatsCard';
import MonthRangePicker from '../../src/components/common/MonthRangePicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import BillsList from '../../src/components/bill/BillsList';

const BILL_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'expense', labelKey: 'bills.expense' },
  { key: 'income', labelKey: 'bills.income' },
];

export default function BillsScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const now = new Date();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
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

  const summary = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filteredBills = items.filter((b) => {
      if (filter !== 'all' && b.bill_type !== filter) return false;
      if (query && !(b.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
    return billSummary(filteredBills);
  }, [items, search, filter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.bills')} />

      <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
        <MonthRangePicker
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
          style={styles.dateFilter}
          onChange={({ startYear: sy, startMonth: sm, endYear: ey, endMonth: em }) => {
            setStartYear(sy);
            setStartMonth(sm);
            setEndYear(ey);
            setEndMonth(em);
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

      <View style={styles.statsSection}>
        <ModuleStatsCard
          metrics={[
            {
              key: 'expense',
              label: t('bills.totalExpense'),
              value: formatMoney(summary.expenseTotal, currency),
              caption: t('bills.transactionCountPill', { count: summary.expenseCount }),
            },
            {
              key: 'income',
              label: t('bills.totalIncome'),
              value: formatMoney(summary.incomeTotal, currency),
              caption: t('bills.transactionCountPill', { count: summary.incomeCount }),
            },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <BillsList
            items={items}
            startYear={startYear}
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
            search={search}
            filter={filter}
            loading={loading}
          />
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
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dateFilter: {
    marginBottom: 12,
  },
  stickyBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  listSection: {
    paddingHorizontal: 16,
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