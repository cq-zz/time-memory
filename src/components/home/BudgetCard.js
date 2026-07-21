import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function BudgetCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const progress = 0.72;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.inkDeep,
          borderColor: Colors.white05,
          borderRadius: Radius.xl,
        },
        Shadows.dark,
      ]}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
          Annual Budget
        </Text>
        <Text style={[styles.badge, { color: Colors.green, fontFamily: Fonts.bold }]}>
          ON TRACK
        </Text>
      </View>

      {/* Progress section */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            Total Expense vs Budget
          </Text>
          <Text style={[styles.progressValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            72%
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: Colors.white10 }]}>
          <View style={[styles.fill, { backgroundColor: Colors.purple, width: `${progress * 100}%` }]} />
        </View>
      </View>

      {/* Budget pills */}
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: Colors.white05 }]}>
          <Text style={[styles.pillLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            BUDGET
          </Text>
          <Text style={[styles.pillValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            $45,000
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: Colors.white05, borderColor: Colors.white10, borderWidth: 1 }]}>
          <Text style={[styles.pillLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            REMAINING
          </Text>
          <Text style={[styles.pillValue, { color: Colors.green, fontFamily: Fonts.bold }]}>
            $12,600
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  badge: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  progressSection: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    lineHeight: 22,
  },
  progressValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  track: {
    height: 12,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 9999,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
  },
  pill: {
    flex: 1,
    padding: 12,
    borderRadius: 48,
    gap: 4,
  },
  pillLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  pillValue: {
    fontSize: 16,
    lineHeight: 28,
  },
});
