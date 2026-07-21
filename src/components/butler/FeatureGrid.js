import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useMoodStore } from '../../store/mood';
import { moodMeta } from '../../utils/constant';
import { showToast } from '../common/Toast';
import BudgetModal from './BudgetModal';
import MoodCalendarModal from './MoodCalendarModal';

/**
 * Function modules grid — compact cards: icon + name on the first row,
 * module stats on the second. Includes Annual Budget (moved out of
 * MANAGEMENT) and Mood Records (opens the check-in calendar).
 */
const FEATURES = [
  { id: 'durables', title: 'Durables', icon: 'cube-outline', color: '#6B5CE7', href: '/durable' },
  { id: 'assets', title: 'Assets', icon: 'wallet-outline', color: '#4AA868', href: '/asset' },
  { id: 'bills', title: 'Bills', icon: 'receipt-outline', color: '#F28B50', href: '/bill' },
  { id: 'schedules', title: 'Schedules', icon: 'calendar-outline', color: '#4A90D9', href: '/schedule' },
  { id: 'important', title: 'Important', icon: 'heart-outline', color: '#E86B6B', href: '/important-date' },
  { id: 'diary', title: 'Diary', icon: 'book-outline', color: '#8B7AE8', href: '/diary' },
  { id: 'budget', title: 'Annual Budget', icon: 'flag-outline', color: '#F28B50', href: '/budget' },
  { id: 'mood', title: 'Mood Records', icon: 'happy-outline', color: '#4AA868', href: '/mood' },
];

function FeatureCard({ title, icon, color, stat, onPress }) {
  const { Colors, Fonts, Radius } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.md }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.row1}>
        <View style={[styles.iconBox, { backgroundColor: `${color}1A` }]}>
          <Ionicons name={icon} size={15} color={color} />
        </View>
        <Text
          style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <Text style={[styles.stat, { color: Colors.textSecondary, fontFamily: Fonts.regular }]} numberOfLines={1}>
        {stat}
      </Text>
    </TouchableOpacity>
  );
}

export default function FeatureGrid() {
  const { Colors, Fonts } = useTheme();
  const router = useRouter();
  const annualBudget = useSettingsStore((s) => s.settings.annualBudget);
  const currency = useSettingsStore((s) => s.settings.currency);
  const todayMood = useMoodStore((s) => s.todayMood);

  const [budgetOpen, setBudgetOpen] = useState(false);
  const [moodCalendarOpen, setMoodCalendarOpen] = useState(false);

  const mood = moodMeta(todayMood);
  const stats = {
    durables: '42 Items tracked',
    assets: '8 Portfolios',
    bills: '3 Unpaid',
    schedules: 'Next: 14:00',
    important: 'Anniversary',
    diary: '58 Entries',
    budget: annualBudget > 0 ? formatMoney(annualBudget, currency) : 'Not set',
    mood: mood ? `${mood.emoji} ${mood.label}` : 'Not checked in',
  };

  const handlePress = (id) => {
    if (id === 'budget') return setBudgetOpen(true);
    if (id === 'mood') return setMoodCalendarOpen(true);
    const feature = FEATURES.find((f) => f.id === id);
    if (feature?.href) return router.push(feature.href);
    showToast('Coming soon');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        FUNCTION MODULES
      </Text>

      <View style={styles.grid}>
        {FEATURES.map((f) => (
          <FeatureCard
            key={f.id}
            title={f.title}
            icon={f.icon}
            color={f.color}
            stat={stats[f.id]}
            onPress={() => handlePress(f.id)}
          />
        ))}
      </View>

      <BudgetModal visible={budgetOpen} onClose={() => setBudgetOpen(false)} />
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
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  stat: {
    fontSize: 11,
    lineHeight: 16,
    paddingLeft: 36,
  },
});
