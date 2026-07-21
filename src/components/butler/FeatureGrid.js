import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const FEATURES = [
  { title: 'Durables', subtitle: '42 Items tracked', icon: 'cube-outline', color: '#6B5CE7', bg: 'rgba(107, 92, 231, 0.1)', href: '/durable' },
  { title: 'Assets', subtitle: '8 Portfolios', icon: 'wallet-outline', color: '#4AA868', bg: 'rgba(74, 168, 104, 0.1)' },
  { title: 'Bills', subtitle: '3 Unpaid', icon: 'receipt-outline', color: '#F28B50', bg: 'rgba(242, 139, 80, 0.1)' },
  { title: 'Schedules', subtitle: 'Next: 14:00', icon: 'calendar-outline', color: '#1A1A1A', bg: 'rgba(198, 191, 255, 0.3)' },
  { title: 'Important', subtitle: 'Anniversary', icon: 'heart-outline', color: '#E86B6B', bg: 'rgba(232, 107, 107, 0.1)' },
  { title: 'Diary', subtitle: '58 Entries', icon: 'book-outline', color: '#1A1A1A', bg: 'rgba(26, 26, 26, 0.05)' },
];

function FeatureCard({ title, subtitle, icon, color, bg, href }) {
  const { Colors, Fonts } = useTheme();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}
      activeOpacity={0.7}
      onPress={href ? () => router.push(href) : undefined}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function FeatureGrid() {
  return (
    <View style={styles.grid}>
      {[0, 2, 4].map((i) => (
        <View key={i} style={styles.row}>
          <FeatureCard {...FEATURES[i]} />
          <FeatureCard {...FEATURES[i + 1]} />
        </View>
      ))}
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
    height: 128,
    padding: 16,
    borderWidth: 1,
    borderRadius: 32,
    justifyContent: 'space-between',
  },
  iconBox: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
});
