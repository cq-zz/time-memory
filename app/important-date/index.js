import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { importantDateStats, listImportantDates } from '../../src/services/importantDate';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import ImportantDatesList from '../../src/components/important-dates/ImportantDatesList';
import ImportantDatesStats from '../../src/components/important-dates/ImportantDatesStats';

const TYPE_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'birthday', labelKey: 'importantDate.typeBirthday' },
  { key: 'anniversary', labelKey: 'importantDate.typeAnniversary' },
  { key: 'remembrance', labelKey: 'importantDate.typeRemembrance' },
  { key: 'other', labelKey: 'importantDate.typeOther' },
];

export default function ImportantDatesScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [rows, summary] = await Promise.all([listImportantDates(), importantDateStats()]);
      setItems(rows);
      setStats(summary);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.importantDate')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.statsSection}>
          <ImportantDatesStats stats={stats} />
        </View>

        <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filters={TYPE_FILTERS}
            placeholder={t('importantDate.searchPlaceholder')}
          />
        </View>

        {/* Index 1 — list */}
        <View style={styles.listSection}>
          <ImportantDatesList items={items} search={search} filter={filter} loading={loading} />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/important-date/form')}
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
