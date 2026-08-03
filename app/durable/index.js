import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { formatMoney, useSettingsStore } from '../../src/store/settings';
import { effectiveStatus, listDurables } from '../../src/services/durable';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ModuleOverviewCard from '../../src/components/common/ModuleOverviewCard';
import DurablesStats from '../../src/components/durables/DurablesStats';
import MonthRangePicker from '../../src/components/common/MonthRangePicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import ItemsList from '../../src/components/durables/ItemsList';

const pad = (n) => String(n).padStart(2, '0');

function inMonthRange(dateStr, startYear, startMonth, endYear, endMonth) {
  if (startYear == null && endYear == null) return true;
  const prefix = (dateStr || '').slice(0, 7);
  if (startYear != null && startMonth != null) {
    if (prefix < `${startYear}-${pad(startMonth)}`) return false;
  }
  if (endYear != null && endMonth != null) {
    if (prefix > `${endYear}-${pad(endMonth)}`) return false;
  }
  return true;
}

const DURABLE_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'in_use', labelKey: 'durable.inUse' },
  { key: 'disposed', labelKey: 'durable.disposed' },
];

export default function DurablesScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const [items, setItems] = useState([]);
  const [startYear, setStartYear] = useState(null);
  const [startMonth, setStartMonth] = useState(null);
  const [endYear, setEndYear] = useState(null);
  const [endMonth, setEndMonth] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await listDurables());
    } finally {
      setLoading(false);
    }
  }, [currency]);

  // Reload every time the screen gains focus (after add/edit/delete).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (!inMonthRange(item.purchase_date, startYear, startMonth, endYear, endMonth)) return false;
      if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
      if (query && !(item.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
    const inUse = filtered.filter((item) => effectiveStatus(item) === 'in_use');
    return {
      inUseValue: inUse.reduce((sum, item) => sum + (Number(item.purchase_price) || 0), 0),
      inUseCount: inUse.length,
      totalCount: filtered.length,
    };
  }, [items, search, filter, startYear, startMonth, endYear, endMonth]);

  const allStats = useMemo(() => {
    const inUseCount = items.filter((item) => effectiveStatus(item) === 'in_use').length;
    return {
      inUseValue: items.reduce(
        (sum, item) => effectiveStatus(item) === 'in_use'
          ? sum + (Number(item.purchase_price) || 0)
          : sum,
        0,
      ),
      inUseCount,
      archivedCount: items.length - inUseCount,
    };
  }, [items]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.durable')} />

      <View style={styles.overviewSection}>
        <ModuleOverviewCard
          label={t('durable.inUseTotalValue')}
          value={formatMoney(allStats.inUseValue, currency)}
          activeCount={allStats.inUseCount}
          activeLabel={t('durable.inUse')}
          archivedCount={allStats.archivedCount}
          archivedLabel={t('durable.disposed')}
        />
      </View>

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
          filters={DURABLE_FILTERS}
          placeholder={t('durable.searchPlaceholder')}
        />
      </View>

      <View style={styles.statsSection}>
        <DurablesStats stats={stats} currency={currency} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <ItemsList
            items={items}
            startYear={startYear}
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
            search={search}
            filter={filter}
            currency={currency}
            loading={loading}
          />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/durable/form')}
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
  overviewSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 6,
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