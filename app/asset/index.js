import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import { listAssets, assetStats } from '../../src/services/asset';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import AssetsStats from '../../src/components/assets/AssetsStats';
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
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rows, st] = await Promise.all([listAssets(), assetStats()]);
      setItems(rows);
      setStats(st);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the screen gains focus (after add/edit/delete).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.asset')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        {/* Index 0 — stats (scrolls away) */}
        <View style={styles.statsSection}>
          <AssetsStats stats={stats} currency={currency} />
        </View>

        {/* Index 1 — sticky filter bar (search + status) */}
        <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filters={ASSET_FILTERS}
            placeholder={t('asset.searchPlaceholder')}
          />
        </View>

        {/* Index 2 — list */}
        <View style={styles.listSection}>
          <AssetsList items={items} search={search} filter={filter} currency={currency} loading={loading} />
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
  statsSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  listSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
