import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import { listDurables, durableStats } from '../../src/services/durable';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import DurablesStats from '../../src/components/durables/DurablesStats';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import ItemsList from '../../src/components/durables/ItemsList';

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
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rows, st] = await Promise.all([listDurables(), durableStats()]);
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
      <ModuleHeader title={t('nav.durable')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DurablesStats stats={stats} currency={currency} />
        <SearchFilterBar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          filters={DURABLE_FILTERS}
          placeholder={t('durable.searchPlaceholder')}
        />
        <ItemsList items={items} search={search} filter={filter} currency={currency} loading={loading} />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 112,
    gap: 24,
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
