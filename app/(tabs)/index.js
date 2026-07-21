import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/utils/theme';
import HomeHeader from '../../src/components/home/HomeHeader';
import HeroCard from '../../src/components/home/HeroCard';
import StatsGrid from '../../src/components/home/StatsGrid';
import AssetBalanceCard from '../../src/components/home/AssetBalanceCard';
import BudgetCard from '../../src/components/home/BudgetCard';
import TrendsCard from '../../src/components/home/TrendsCard';
import MonthlyRecordsCard from '../../src/components/home/MonthlyRecordsCard';
import CategoryBreakdown from '../../src/components/home/CategoryBreakdown';
import RemindersTimeline from '../../src/components/home/RemindersTimeline';
import MoodTrend from '../../src/components/home/MoodTrend';

export default function HomeScreen() {
  const { Colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top']}>
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard />
        <StatsGrid />
        <AssetBalanceCard />
        <BudgetCard />
        <TrendsCard />
        <MonthlyRecordsCard />
        <CategoryBreakdown />
        <RemindersTimeline />
        <MoodTrend />
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
    gap: 16,
  },
});
