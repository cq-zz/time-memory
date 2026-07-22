import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { effectiveStatus as durableStatus } from '../../services/durable';
import { effectiveStatus as scheduleStatus } from '../../services/schedule';
import { effectiveStatus as assetStatus } from '../../services/asset';

function StatCard({ value, label, icon, color }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.cardBorder,
          borderRadius: Radius.xl,
        },
        Shadows.card,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.iconBg }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.value, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StatsGrid({ durables = [], schedules = [], assets = [] }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();

  const durableCount = durables.filter((r) => durableStatus(r) === 'in_use').length;
  const activeSchedules = schedules.filter((r) => {
    const s = scheduleStatus(r);
    return s !== 'done' && s !== 'incomplete';
  }).length;
  const assetCount = assets.filter((r) => assetStatus(r) === 'active').length;
  const done = schedules.filter((r) => scheduleStatus(r) === 'done').length;
  const completion = schedules.length ? `${Math.round((done / schedules.length) * 100)}%` : '--';

  const STATS = [
    { value: String(durableCount), label: t('home.statDurables'), icon: 'cube-outline', color: Colors.textPrimary },
    { value: String(activeSchedules), label: t('home.statSchedules'), icon: 'calendar-outline', color: '#A05C82' },
    { value: String(assetCount), label: t('home.statAssets'), icon: 'wallet-outline', color: '#F28B50' },
    { value: completion, label: t('home.statCompletion'), icon: 'checkmark-circle-outline', color: '#4AA868' },
  ];

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard {...STATS[0]} />
        <StatCard {...STATS[1]} />
      </View>
      <View style={styles.row}>
        <StatCard {...STATS[2]} />
        <StatCard {...STATS[3]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    lineHeight: 34,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
