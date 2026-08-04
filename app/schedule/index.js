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
import DayRangePicker from '../../src/components/common/DayRangePicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import SchedulesList from '../../src/components/schedules/SchedulesList';

const datePart = (value) => (typeof value === 'string' ? value.slice(0, 10) : '');

const pad = (n) => String(n).padStart(2, '0');

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

function inScheduleDayRange(item, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const sStart = datePart(item.start_date || item.end_date);
  const sEnd = datePart(item.end_date || item.start_date);
  if (startDate && sEnd < startDate) return false;
  if (endDate && sStart > endDate) return false;
  return true;
}

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
  const [dimension, setDimension] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (dimension === 'day' && !inScheduleDayRange(item, startDate, endDate)) return false;
      if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
      if (query && !(item.title || '').toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, search, filter, dimension, startDate, endDate]);

  const inProgressCount = filteredItems.filter((item) => effectiveStatus(item) === 'in_progress').length;
  const doneCount = filteredItems.filter((item) => effectiveStatus(item) === 'done').length;
  const completionRate = filteredItems.length > 0
    ? Math.round((doneCount / filteredItems.length) * 100)
    : 0;

  const load = useCallback(async () => {
    try {
      setItems(await listSchedules());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
      <ModuleHeader title={t('nav.schedule')} />

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
          filters={SCHEDULE_FILTERS}
          placeholder={t('schedule.searchPlaceholder')}
        />
      </View>

      <View style={styles.statsSection}>
        <ModuleStatsCard
          compact
          metrics={[
            {
              key: 'total',
              label: t('schedule.totalPlans'),
              value: filteredItems.length,
            },
            {
              key: 'completionRate',
              label: t('schedule.completionRate'),
              value: `${completionRate}%`,
            },
          ]}
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
            dimension={dimension}
            startDate={startDate}
            endDate={endDate}
            search={search}
            filter={filter}
            loading={loading}
            onChanged={load}
          />
        </View>
      </ScrollView>

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