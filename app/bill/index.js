import { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { listBills, billSummary } from '../../src/services/bill';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ModuleStatsCard from '../../src/components/common/ModuleStatsCard';
import DayRangePicker from '../../src/components/common/DayRangePicker';
import CategoryFilterModal from '../../src/components/common/CategoryFilterModal';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import BillsList from '../../src/components/bill/BillsList';

const pad = (n) => String(n).padStart(2, '0');

function inDayRange(dateStr, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const d = (dateStr || '').slice(0, 10);
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}

const BILL_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'expense', labelKey: 'bills.expense' },
  { key: 'income', labelKey: 'bills.income' },
];

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

export default function BillsScreen() {
  const { Colors, Radius, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const td = today();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimension, setDimension] = useState('day');
  const [startDate, setStartDate] = useState(td);
  const [endDate, setEndDate] = useState(td);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);

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
      if (dimension === 'day' && !inDayRange(b.consumption_date, startDate, endDate)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(b.category)) return false;
      if (filter !== 'all' && b.bill_type !== filter) return false;
      if (query && !(b.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
    return billSummary(filteredBills);
  }, [items, search, filter, dimension, startDate, endDate, selectedCategories]);

  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    if (dim === 'day' && !startDate && !endDate) {
      setStartDate(td);
      setEndDate(td);
    }
  }, [startDate, endDate]);

  const handleRangeChange = useCallback(({ startDate: s, endDate: e }) => {
    setStartDate(s);
    setEndDate(e);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.bills')} />

      <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
        <DayRangePicker
          dimension={dimension}
          startDate={startDate}
          endDate={endDate}
          onDimensionChange={handleDimensionChange}
          onRangeChange={handleRangeChange}
        />
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          filters={BILL_FILTERS}
          placeholder={t('bills.searchPlaceholder')}
          beforeSearch={
            <Pressable
              style={({ pressed }) => [
                styles.categoryChip,
                {
                  backgroundColor: selectedCategories.length > 0 ? Colors.purpleTint : Colors.card,
                  borderColor: selectedCategories.length > 0 ? Colors.purple : Colors.cardBorder,
                  borderRadius: Radius.pill,
                },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setCategoryOpen(true)}
            >
              <Ionicons
                name="pricetag-outline"
                size={14}
                color={selectedCategories.length > 0 ? Colors.purple : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: selectedCategories.length > 0 ? Colors.purple : Colors.textSecondary,
                    fontFamily: Fonts.semiBold,
                  },
                ]}
                numberOfLines={1}
              >
                {selectedCategories.length > 0
                  ? `${t('common.category')} (${selectedCategories.length})`
                  : t('common.category')}
              </Text>
            </Pressable>
          }
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
            dimension={dimension}
            startDate={startDate}
            endDate={endDate}
            selectedCategories={selectedCategories}
            search={search}
            filter={filter}
            loading={loading}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/bill/form')}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>

      <CategoryFilterModal
        visible={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        type="all"
        selected={selectedCategories}
        onConfirm={setSelectedCategories}
      />
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
  stickyBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    lineHeight: 16,
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