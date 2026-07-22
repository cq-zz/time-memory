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
      <View style={[styles.iconBlock, { backgroundColor: Colors.iconBg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={styles.copy}>
        <Text
          style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text style={[styles.value, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {value}
        </Text>
      </View>
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
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    padding: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBlock: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  value: {
    fontSize: 21,
    lineHeight: 24,
  },
  label: {
    fontSize: 12.5,
    lineHeight: 16,
  },
});
