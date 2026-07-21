import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function DurablesStats() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={[styles.pageTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          Durables
        </Text>
        <Text style={[styles.trackingLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          LIFESPAN TRACKING
        </Text>
      </View>

      {/* Featured stat card */}
      <View style={[styles.statCard, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
        <View style={styles.statContent}>
          <Text style={[styles.statLabel, { color: Colors.white, fontFamily: Fonts.bold }]}>
            IN-USE TOTAL VALUE
          </Text>
          <Text style={[styles.statValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            $24,850
          </Text>
        </View>
        <View style={styles.pillsWrap}>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: 'rgba(74, 168, 104, 0.2)' }]}>
              <Text style={[styles.pillText, { color: Colors.green, fontFamily: Fonts.bold }]}>
                32 ITEMS IN-USE
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: Colors.white10 }]}>
              <Text style={[styles.pillText, { color: 'rgba(255, 255, 255, 0.7)', fontFamily: Fonts.bold }]}>
                142 TOTAL ITEMS
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  trackingLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  statCard: {
    padding: 24,
    borderRadius: 32,
  },
  statContent: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  pillsWrap: {
    paddingTop: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
