import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { listSchedules } from '../../src/services/schedule';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import SchedulesList from '../../src/components/schedules/SchedulesList';

const SCHEDULE_FILTERS = [
  { key: 'all', labelKey: 'common.all' },
  { key: 'not_started', labelKey: 'schedule.notStarted' },
  { key: 'in_progress', labelKey: 'schedule.inProgress' },
  { key: 'done', labelKey: 'schedule.done' },
  { key: 'incomplete', labelKey: 'schedule.incomplete' },
];

export default function SchedulesScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setItems(await listSchedules());
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time the screen gains focus (after add/edit/delete),
  // and after in-card quick actions (status cycle / reminder toggle).
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.schedule')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Index 0 — sticky filter bar (search + status) */}
        <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
          <SearchFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={setFilter}
            filters={SCHEDULE_FILTERS}
            placeholder={t('schedule.searchPlaceholder')}
          />
        </View>

        {/* Index 1 — list */}
        <View style={styles.listSection}>
          <SchedulesList items={items} search={search} filter={filter} loading={loading} onChanged={load} />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/schedule/form')}
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
  stickyBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
