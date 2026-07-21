import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../utils/theme';

const SIZE = 96;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const INCOME_SEGMENTS = [
  { name: 'Salary', pct: 70, color: '#6B5CE7' },
  { name: 'Invest', pct: 20, color: '#FFB690' },
  { name: 'Other', pct: 10, color: '#DADADA' },
];

const EXPENSE_SEGMENTS = [
  { name: 'Rent', pct: 45, color: '#E86B6B' },
  { name: 'Food', pct: 35, color: '#F28B50' },
  { name: 'Transp', pct: 20, color: '#4AA868' },
];

function DonutChart({ segments, centerLabel }) {
  const { Colors, Fonts } = useTheme();
  let accumulated = 0;

  return (
    <View style={styles.donutWrap}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          stroke={Colors.iconBg}
          strokeWidth={STROKE}
          fill="none"
        />
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * C;
          const offset = -((accumulated / 100) * C);
          accumulated += seg.pct;
          return (
            <Circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={seg.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={`${dash} ${C}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
          );
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={[styles.donutLabel, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}

function BreakdownCard({ title, segments }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <DonutChart segments={segments} centerLabel={title} />
      <View style={styles.legend}>
        {segments.map((seg) => (
          <View key={seg.name} style={styles.legendRow}>
            <View style={styles.legendLeft}>
              <View style={[styles.dot, { backgroundColor: seg.color }]} />
              <Text style={[styles.legendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {seg.name}
              </Text>
            </View>
            <Text style={[styles.legendPct, { color: Colors.textDark, fontFamily: Fonts.bold }]}>
              {seg.pct}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function CategoryBreakdown() {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        Category Breakdown
      </Text>
      <View style={styles.cards}>
        <BreakdownCard title="INCOME" segments={INCOME_SEGMENTS} />
        <BreakdownCard title="EXPENSE" segments={EXPENSE_SEGMENTS} />
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
  cards: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    gap: 24,
  },
  donutWrap: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenter: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  legendName: {
    fontSize: 14,
    lineHeight: 22,
  },
  legendPct: {
    fontSize: 14,
    lineHeight: 22,
  },
});
