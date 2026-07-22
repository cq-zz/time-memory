import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { diaryStats, listDiaries } from '../../src/services/diary';
import { hasPassword } from '../../src/utils/password';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import YearMonthPicker from '../../src/components/common/YearMonthPicker';
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(null);
  const [search, setSearch] = useState('');
  const [hasPwd, setHasPwd] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);

  const load = useCallback(async () => {
    try {
      const [rows, summary] = await Promise.all([listDiaries(), diaryStats()]);
      setItems(rows);
      setStats(summary);
      setHasPwd(await hasPassword());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
      >
        <View style={styles.statsSection}>
          <DiaryStats stats={stats} />
        </View>

        <View style={[styles.stickyBar, { backgroundColor: Colors.bg, borderBottomColor: Colors.cardBorder }]}>
          <YearMonthPicker
            year={year}
            month={month}
            style={styles.dateFilter}
            onChange={({ year: y, month: m }) => {
              setYear(y);
              setMonth(m);
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

        {/* Index 1 — list */}
        <View style={styles.listSection}>
          <DiaryList
            items={items}
            year={year}
            month={month}
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
  },
  dateFilter: {
    marginBottom: 12,
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
