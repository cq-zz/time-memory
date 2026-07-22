import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import { listDurables } from '../../src/services/durable';
import { listAssets } from '../../src/services/asset';
import { listSchedules } from '../../src/services/schedule';
import { listBills } from '../../src/services/bill';
import { getBudgetByYear } from '../../src/services/budget';
import { getReminders } from '../../src/utils/reminders';
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

const EMPTY = { durables: [], assets: [], schedules: [], bills: [], budget: null, reminders: [] };

export default function HomeScreen() {
  const { Colors } = useTheme();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const [data, setData] = useState(EMPTY);

  // Refresh every time the tab gains focus — module CRUD, reminder lead
  // days and data resets all happen on other tabs. Also refresh when the
  // currency changes, since money lists are filtered by current currency.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        listDurables(),
        listAssets(),
        listSchedules(),
        listBills(),
        getBudgetByYear(String(new Date().getFullYear())),
        getReminders(),
      ])
        .then(([durables, assets, schedules, bills, budget, reminders]) => {
          if (active) setData({ durables, assets, schedules, bills, budget, reminders });
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [currency])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top']}>
      <HomeHeader />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard />
        <StatsGrid durables={data.durables} schedules={data.schedules} assets={data.assets} />
        <AssetBalanceCard durables={data.durables} assets={data.assets} />
        <BudgetCard budget={data.budget} bills={data.bills} />
        <TrendsCard bills={data.bills} />
        <MonthlyRecordsCard bills={data.bills} />
        <CategoryBreakdown bills={data.bills} />
        <RemindersTimeline
          reminders={data.reminders}
          onPressItem={(item) => router.push(item.route)}
          onViewAll={() => router.push('/reminders')}
        />
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
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
});
