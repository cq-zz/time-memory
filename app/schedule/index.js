import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { effectiveStatus, listSchedules } from '../../src/services/schedule';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ModuleStatsCard from '../../src/components/common/ModuleStatsCard';
import YearMonthPicker from '../../src/components/common/YearMonthPicker';
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
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
      if (year != null) {
        const periodStart = month
          ? `${year}-${String(month).padStart(2, '0')}-01`
          : `${year}-01-01`;
        const periodEndExclusive = month
          ? month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, '0')}-01`
          : `${year + 1}-01-01`;
        const scheduleStart = String(item.start_date || item.end_date || '').slice(0, 10);
        const scheduleEnd = String(item.end_date || item.start_date || '').slice(0, 10);
        if (
          scheduleStart &&
          scheduleEnd &&
          (scheduleStart >= periodEndExclusive || scheduleEnd < periodStart)
        ) {
          return false;
        }
      }
      if (query && !(item.title || '').toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, year, month, search, filter]);

  const inProgressCount = filteredItems.filter((item) => effectiveStatus(item) === 'in_progress').length;
  const doneCount = filteredItems.filter((item) => effectiveStatus(item) === 'done').length;

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
          filters={SCHEDULE_FILTERS}
          placeholder={t('schedule.searchPlaceholder')}
        />
      </View>

      <View style={styles.statsSection}>
        <ModuleStatsCard
          compact
          label={t('schedule.totalPlans')}
          value={filteredItems.length}
          pills={[
            {
              key: 'inProgress',
              label: t('schedule.inProgressPill', { count: inProgressCount }),
              backgroundColor: 'rgba(74, 168, 104, 0.2)',
              color: Colors.green,
            },
            { key: 'done', label: t('schedule.donePill', { count: doneCount }) },
          ]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <SchedulesList
            items={items}
            year={year}
            month={month}
            search={search}
            filter={filter}
            loading={loading}
            onChanged={load}
          />
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
