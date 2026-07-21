import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/utils/theme';
import RemindersHeader from '../../src/components/reminders/RemindersHeader';
import RemindersSearch from '../../src/components/reminders/RemindersSearch';
import ReminderList from '../../src/components/reminders/ReminderList';

export default function RemindersScreen() {
  const { Colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top']}>
      <RemindersHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <RemindersSearch />
        <ReminderList />
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
    paddingTop: 16,
    paddingBottom: 32,
    gap: 32,
  },
});
