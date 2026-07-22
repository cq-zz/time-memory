import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';

const SIZE = 80;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const PALETTE = ['#A05C82', '#F28B50', '#4AA868', '#E86B6B', '#4A90D9'];

/** Current-month bills of one type → category segments sorted by amount. */
function buildSegments(bills, billType, labelOf) {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const totals = new Map();
  let sum = 0;
  (bills || [])
    .filter((b) => b.bill_type === billType && (b.consumption_date || '').slice(0, 7) === key)
    .forEach((b) => {
      const amount = Number(b.amount) || 0;
      const cat = b.category || 'other';
      totals.set(cat, (totals.get(cat) || 0) + amount);
      sum += amount;
    });
  if (!sum) return [];

  return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([cat, amount], i) => ({
    name: labelOf(cat),
    pct: Math.round((amount / sum) * 100),
    color: PALETTE[i % PALETTE.length],
  }));
}

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

function BreakdownCard({ title, segments, emptyText }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
        Shadows.card,
      ]}
    >
      <DonutChart segments={segments} centerLabel={title} />
      <ScrollView
        style={styles.legend}
        contentContainerStyle={styles.legendContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={segments.length > 3}
      >
        {segments.length ? (
          segments.map((seg) => (
            <View key={seg.name} style={styles.legendRow}>
              <View style={styles.legendLeft}>
                <View style={[styles.dot, { backgroundColor: seg.color }]} />
                <Text
                  numberOfLines={1}
                  style={[styles.legendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}
                >
                  {seg.name}
                </Text>
              </View>
              <Text style={[styles.legendPct, { color: Colors.textDark, fontFamily: Fonts.bold }]}>
                {seg.pct}%
              </Text>
            </View>
          ))
        ) : (
          <Text
            numberOfLines={2}
            style={[styles.legendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}
          >
            {emptyText}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

export default function CategoryBreakdown({ bills = [] }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const categoryState = useCategoryStore();
  const billCategories = getMergedCategories(categoryState, 'bill');

  const labelOf = (key) => {
    if (key === '__other__') return t('home.otherSegment');
    const cat = billCategories.find((c) => c.key === key);
    if (!cat) return key;
    return cat.isBuiltin ? t(`${BUILTIN_NS.bill}.${key}`) : cat.name;
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('home.categoryBreakdown')}
      </Text>
      <View style={styles.cards}>
        <BreakdownCard
          title={t('home.incomeDonut')}
          segments={buildSegments(bills, 'income', labelOf)}
          emptyText={t('home.noChartData')}
        />
        <BreakdownCard
          title={t('home.expenseDonut')}
          segments={buildSegments(bills, 'expense', labelOf)}
          emptyText={t('home.noChartData')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  cards: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    gap: 12,
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
    maxHeight: SIZE,
  },
  legendContent: {
    gap: 8,
    paddingRight: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flex: 1,
    minWidth: 0,
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
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  legendPct: {
    fontSize: 14,
    lineHeight: 22,
  },
});
