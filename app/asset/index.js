import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, Pressable, View } from 'react-native';
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
import DayRangePicker from '../../src/components/common/DayRangePicker';
import CategoryFilterModal from '../../src/components/common/CategoryFilterModal';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import AssetsList from '../../src/components/assets/AssetsList';

function inDayRange(dateStr, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const d = (dateStr || '').slice(0, 10);
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}

const pad = (n) => String(n).padStart(2, '0');

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

const ASSET_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'active', labelKey: 'asset.active' },
  { key: 'disposed', labelKey: 'asset.disposed' },
];

export default function AssetsScreen() {
  const { Colors, Radius, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  const [items, setItems] = useState([]);
  const [dimension, setDimension] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await listAssets());
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (dimension === 'day' && !inDayRange(item.purchase_date, startDate, endDate)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
      if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
      if (query && !(item.name || '').toLowerCase().includes(query)) return false;
      return true;
    });
    const active = filtered.filter((item) => effectiveStatus(item) === 'active');
    return {
      totalValue: active.reduce((sum, item) => sum + displayValue(item), 0),
      activeCount: active.length,
      totalCount: filtered.length,
    };
  }, [items, search, filter, dimension, startDate, endDate, selectedCategories]);

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

  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    if (dim === 'day' && !startDate && !endDate) {
      const td = today();
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
          filters={ASSET_FILTERS}
          placeholder={t('asset.searchPlaceholder')}
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
            dimension={dimension}
            startDate={startDate}
            endDate={endDate}
            selectedCategories={selectedCategories}
            search={search}
            filter={filter}
            currency={currency}
            loading={loading}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/asset/form')}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>

      <CategoryFilterModal
        visible={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        type="asset"
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
  overviewSection: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingVertical: 6,
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