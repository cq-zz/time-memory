import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { listDiaries } from '../../src/services/diary';
import { hasPassword } from '../../src/utils/password';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import DayRangePicker from '../../src/components/common/DayRangePicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import DiaryList from '../../src/components/diary/DiaryList';
import DiaryStats from '../../src/components/diary/DiaryStats';
import PasswordModal from '../../src/components/common/PasswordModal';

const pad = (n) => String(n).padStart(2, '0');

function inDayRange(dateStr, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const d = (dateStr || '').slice(0, 10);
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}

const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
};

export default function DiaryScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const td = today();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimension, setDimension] = useState('day');
  const [startDate, setStartDate] = useState(td);
  const [endDate, setEndDate] = useState(td);
  const [search, setSearch] = useState('');
  const [hasPwd, setHasPwd] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const load = useCallback(async () => {
    try {
      const [rows, passwordSet] = await Promise.all([listDiaries(), hasPassword()]);
      setItems(rows);
      setHasPwd(passwordSet);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (dimension === 'day' && !inDayRange(item?.date, startDate, endDate)) return false;
      if (
        query &&
        !String(item?.title || '').toLowerCase().includes(query) &&
        !String(item?.content || '').toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
    const currentYear = String(new Date().getFullYear());
    return {
      totalCount: filtered.length,
      currentYearCount: filtered.filter((item) => String(item?.date || '').startsWith(currentYear)).length,
      privateCount: filtered.filter((item) => Number(item?.is_private) === 1).length,
    };
  }, [items, search, dimension, startDate, endDate]);

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

  const handlePressItem = (item) => {
    if (Number(item.is_private) === 1 && hasPwd) {
      setPendingItem(item);
      setPwdOpen(true);
    } else {
      router.push(`/diary/${item.id}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.diary')} />

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
          filter="all"
          onFilterChange={() => {}}
          filters={[]}
          placeholder={t('diary.searchPlaceholder')}
        />
      </View>

      <View style={styles.statsSection}>
        <DiaryStats stats={stats} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <DiaryList
            items={items}
            dimension={dimension}
            startDate={startDate}
            endDate={endDate}
            search={search}
            loading={loading}
            onPressItem={handlePressItem}
          />
        </View>
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/diary/form')}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>

      <PasswordModal
        visible={pwdOpen}
        onClose={() => setPwdOpen(false)}
        onSuccess={() => {
          setPwdOpen(false);
          if (pendingItem) router.push(`/diary/${pendingItem.id}`);
        }}
        title={t('diary.privateDiary')}
        description={t('diary.privateDiaryHint')}
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