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
import MonthRangePicker from '../../src/components/common/MonthRangePicker';
import SearchFilterBar from '../../src/components/common/SearchFilterBar';
import DiaryList from '../../src/components/diary/DiaryList';
import DiaryStats from '../../src/components/diary/DiaryStats';
import PasswordModal from '../../src/components/common/PasswordModal';

export default function DiaryScreen() {
  const { Colors, Shadows } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const now = new Date();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
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
  }, [items, search]);

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
            startYear={startYear}
            startMonth={startMonth}
            endYear={endYear}
            endMonth={endMonth}
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