import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useMoodStore } from '../../store/mood';
import { moodMeta } from '../../utils/constant';
import { listDurables, effectiveStatus as durableStatus } from '../../services/durable';
import { listAssets, effectiveStatus as assetStatus } from '../../services/asset';
import { listBills } from '../../services/bill';
import { listSchedules, effectiveStatus as scheduleStatus } from '../../services/schedule';
import { listImportantDates } from '../../services/importantDate';
import { listDiaries } from '../../services/diary';
import { getBudgetByYear } from '../../services/budget';
import { showToast } from '../common/Toast';
import MoodCalendarModal from './MoodCalendarModal';

/**
 * Function modules grid — compact cards: icon + name on the first row,
 * module stats on the second. Includes Annual Plan (moved out of
 * MANAGEMENT) and Mood Records (opens the check-in calendar).
 */
const FEATURES = [
  { id: 'durables', titleKey: 'nav.durable', icon: 'cube-outline', color: '#A05C82', href: '/durable' },
  { id: 'assets', titleKey: 'nav.asset', icon: 'wallet-outline', color: '#4AA868', href: '/asset' },
  { id: 'bills', titleKey: 'nav.bills', icon: 'receipt-outline', color: '#F28B50', href: '/bill' },
  { id: 'schedules', titleKey: 'nav.schedule', icon: 'calendar-outline', color: '#4A90D9', href: '/schedule' },
  { id: 'important', titleKey: 'nav.importantDate', icon: 'heart-outline', color: '#E86B6B', href: '/important-date' },
  { id: 'diary', titleKey: 'nav.diary', icon: 'book-outline', color: '#8B7AE8', href: '/diary' },
  { id: 'budget', titleKey: 'home.annualBudget', icon: 'flag-outline', color: '#F28B50', href: '/budget' },
  { id: 'mood', titleKey: 'moodTrend.title', icon: 'happy-outline', color: '#4AA868', href: '/mood' },
];

function FeatureCard({ title, icon, color, stat, statLines, onPress }) {
  const { Colors, Fonts, Radius } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.md }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={styles.cardRight}>
        <Text
          style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {statLines ? (
          <View style={styles.statLines}>
            {statLines.map((line, i) => (
              <Text
                key={i}
                style={[styles.statMini, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}
                numberOfLines={1}
              >
                {line}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={[styles.stat, { color: Colors.textSecondary, fontFamily: Fonts.regular }]} numberOfLines={1}>
            {stat}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function FeatureGrid() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const todayMood = useMoodStore((s) => s.todayMood);

  const [moodCalendarOpen, setMoodCalendarOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const year = String(new Date().getFullYear());
      const monthKey = `${year}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
      Promise.all([
        listDurables(),
        listAssets(),
        listBills(),
        listSchedules(),
        listImportantDates(),
        listDiaries(),
        getBudgetByYear(year),
      ])
        .then(([durables, assets, bills, schedules, dates, diaries, budget]) => {
          if (!active) return;
          setStats({
            durables: t('home.featureItems', { count: durables.filter((d) => durableStatus(d) === 'in_use').length }),
            assets: t('home.featurePortfolios', { count: assets.filter((a) => assetStatus(a) === 'active').length }),
            bills: t('home.featureBills', { count: bills.filter((b) => (b.consumption_date || '').slice(0, 7) === monthKey).length }),
            schedules: t('home.featureActive', {
              count: schedules.filter((s) => {
                const st = scheduleStatus(s);
                return st !== 'done' && st !== 'incomplete';
              }).length,
            }),
            important: t('home.featureDates', { count: dates.length }),
            diary: t('home.featureEntries', { count: diaries.length }),
            budget: budget
              ? [
                  `${t('home.expense')} ${formatMoney(Number(budget.expense_budget) || 0, budget.currency || currency)}`,
                  `${t('home.income')} ${formatMoney(Number(budget.income_target) || 0, budget.currency || currency)}`,
                ]
              : null,
          });
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [currency, t])
  );

  const mood = moodMeta(todayMood);
  const statText = {
    ...(stats || {
      durables: '--',
      assets: '--',
      bills: '--',
      schedules: '--',
      important: '--',
      diary: '--',
      budget: null,
    }),
    mood: mood ? `${mood.emoji} ${t(`checkIn.mood.${todayMood}`)}` : t('home.featureNotCheckedIn'),
  };

  const handlePress = (id) => {
    if (id === 'mood') return setMoodCalendarOpen(true);
    const feature = FEATURES.find((f) => f.id === id);
    if (feature?.href) return router.push(feature.href);
    showToast(t('butler.comingSoon'));
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {t('butler.functionModules')}
      </Text>

      <View style={styles.grid}>
        {FEATURES.map((f) => {
          const budgetLines = f.id === 'budget' ? statText.budget : null;
          return (
            <FeatureCard
              key={f.id}
              title={t(f.titleKey)}
              icon={f.icon}
              color={f.color}
              stat={budgetLines ? null : statText[f.id] || t('home.featureNotSet')}
              statLines={budgetLines}
              onPress={() => handlePress(f.id)}
            />
          );
        })}
      </View>

      <MoodCalendarModal visible={moodCalendarOpen} onClose={() => setMoodCalendarOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRight: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
  },
  stat: {
    fontSize: 11,
    lineHeight: 15,
  },
  statLines: {
    gap: 1,
  },
  statMini: {
    fontSize: 9,
    lineHeight: 12,
  },
});
