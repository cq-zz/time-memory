import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../src/utils/theme';
import { getReminders } from '../../src/utils/reminders';
import RemindersHeader from '../../src/components/reminders/RemindersHeader';
import RemindersSearch from '../../src/components/reminders/RemindersSearch';
import ReminderList from '../../src/components/reminders/ReminderList';

export default function RemindersScreen() {
  const { Colors } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Recompute on every tab focus — reminder lead days and module data
  // may have changed elsewhere (butler settings, module CRUD, resets).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getReminders()
        .then((list) => {
          if (active) setItems(list);
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const keyword = search.trim().toLowerCase();
  const visible = items.filter((item) => {
    if (filter !== 'all' && item.module !== filter) return false;
    if (keyword && !(item.title || '').toLowerCase().includes(keyword)) return false;
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top']}>
      <RemindersHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <RemindersSearch
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
        />
        <ReminderList items={visible} onPressItem={(item) => router.push(item.route)} />
      </ScrollView>
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
    paddingTop: 0,
    paddingBottom: 32,
    gap: 32,
  },
});
