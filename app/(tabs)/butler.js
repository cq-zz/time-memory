import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/utils/theme';
import HomeHeader from '../../src/components/home/HomeHeader';
import MoodCheckIn from '../../src/components/butler/MoodCheckIn';
import FinancialSummary from '../../src/components/butler/FinancialSummary';
import FeatureGrid from '../../src/components/butler/FeatureGrid';
import ManagementSections from '../../src/components/butler/ManagementSections';

export default function ButlerScreen() {
  const { Colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top']}>
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <MoodCheckIn />
        <FinancialSummary />
        <FeatureGrid />
        <ManagementSections />
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
    gap: 24,
  },
});
