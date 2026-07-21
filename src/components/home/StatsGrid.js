import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const STATS = [
  { value: '142', label: 'DURABLES', icon: 'cube-outline', color: '#1A1A1A' },
  { value: '08', label: 'SCHEDULES', icon: 'calendar-outline', color: '#6B5CE7' },
  { value: '32', label: 'ASSETS', icon: 'wallet-outline', color: '#F28B50' },
  { value: '94%', label: 'COMPLETION', icon: 'checkmark-circle-outline', color: '#4AA868' },
];

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

export default function StatsGrid() {
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
