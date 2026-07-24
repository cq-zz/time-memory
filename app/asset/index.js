import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { formatMoney, useSettingsStore } from '../../src/store/settings';
import { displayValue, effectiveStatus, listAssets } from '../../src/services/asset';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ModuleOverviewCard from '../../src/components/common/ModuleOverviewCard';
import AssetsStats from '../../src/components/assets/AssetsStats';
import YearMonthPicker from '../../src/components/common/YearMonthPicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import AssetsList from '../../src/components/assets/AssetsList';

const ASSET_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'active', labelKey: 'asset.active' },
  { key: 'disposed', labelKey: 'asset.disposed' },
];

export default function AssetsScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const [items, setItems] = useState([]);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await listAssets());
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
      if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
      if (year != null && item.purchase_date && Number(item.purchase_date.slice(0, 4)) !== year) return false;
      if (month != null && item.purchase_date && Number(item.purchase_date.slice(5, 7)) !== month) return false;
      if (query && !(item.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
    const active = filtered.filter((item) => effectiveStatus(item) === 'active');
    return {
      totalValue: active.reduce((sum, item) => sum + displayValue(item), 0),
      activeCount: active.length,
      totalCount: filtered.length,
    };
  }, [items, year, month, search, filter]);

  const allStats = useMemo(() => {
    const activeCount = items.filter((item) => effectiveStatus(item) === 'active').length;
    return {
      totalValue: items.reduce(
        (sum, item) => effectiveStatus(item) === 'active' ? sum + displayValue(item) : sum,
        0,
      ),
      activeCount,
      archivedCount: items.length - activeCount,
    };
  }, [items]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.asset')} />

      <View style={styles.overviewSection}>
        <ModuleOverviewCard
          label={t('asset.totalValue')}
          value={formatMoney(allStats.totalValue, currency)}
          activeCount={allStats.activeCount}
          activeLabel={t('asset.active')}
          archivedCount={allStats.archivedCount}
          archivedLabel={t('asset.disposed')}
        />
      </View>

      <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
        <YearMonthPicker
          year={year}
          month={month}
          showAllOption
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
          filters={ASSET_FILTERS}
          placeholder={t('asset.searchPlaceholder')}
        />
      </View>

      <View style={styles.statsSection}>
        <AssetsStats stats={stats} currency={currency} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <AssetsList
            items={items}
            year={year}
            month={month}
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
        onPress={() => router.push('/asset/form')}
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
