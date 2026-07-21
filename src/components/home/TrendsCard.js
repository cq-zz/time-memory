import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../utils/theme';

function TrendChart() {
  const { Colors } = useTheme();

  return (
    <Svg width="100%" height="136" viewBox="0 0 294 136" preserveAspectRatio="none" fill="none">
      {/* Income line */}
      <Path
        d="M0 104 C 28 96, 42 68, 70 64 C 98 60, 112 78, 140 70 C 168 62, 182 38, 210 34 C 238 30, 266 42, 294 22"
        stroke={Colors.green}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Expense line */}
      <Path
        d="M0 78 C 28 82, 42 96, 70 92 C 98 88, 112 102, 140 98 C 168 94, 182 108, 210 104 C 238 100, 266 110, 294 106"
        stroke={Colors.rose}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function TrendsCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const months = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        Financial Trends
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
            <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              Income
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
            <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              Expense
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrap}>
          <TrendChart />
        </View>

        {/* Month labels */}
        <View style={styles.monthsRow}>
          {months.map((m) => (
            <Text key={m} style={[styles.month, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {m}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 4,
    borderRadius: 9999,
  },
  legendText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  chartWrap: {
    paddingTop: 8,
    height: 136,
    justifyContent: 'center',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  month: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
