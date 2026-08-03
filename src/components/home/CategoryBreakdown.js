import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';

const SIZE = 90;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const PALETTE = ['#A05C82', '#F28B50', '#4AA868', '#E86B6B', '#4A90D9'];

/** Month key YYYY-MM for given offset from current month. */
function monthKey(offsetMonths) {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth() + 1 + offsetMonths;
  const adj = new Date(y, m - 1, 1);
  return `${adj.getFullYear()}-${String(adj.getMonth() + 1).padStart(2, '0')}`;
}

/** Compute category totals for a given month key. */
function categoryTotals(bills, billType, month) {
  const totals = new Map();
  let sum = 0;
  (bills || [])
    .filter((b) => b.bill_type === billType && (b.consumption_date || '').slice(0, 7) === month)
    .forEach((b) => {
      const amount = Number(b.amount) || 0;
      const cat = b.category || 'other';
      totals.set(cat, (totals.get(cat) || 0) + amount);
      sum += amount;
    });
  return { totals, sum };
}

/** Current-month bills of one type → category segments with MoM delta. */
function buildSegments(bills, billType, labelOf) {
  const curMonth = monthKey(0);
  const prevMonth = monthKey(-1);

  const { totals: cur, sum: curSum } = categoryTotals(bills, billType, curMonth);
  if (!curSum) return [];

  const { totals: prev } = categoryTotals(bills, billType, prevMonth);
  const prevSum = [...prev.values()].reduce((a, b) => a + b, 0);

  return [...cur.entries()].sort((a, b) => b[1] - a[1]).map(([cat, amount], i) => {
    const pct = parseFloat(((amount / curSum) * 100).toFixed(2));
    let mom = null; // null = new category, number = pct-point change
    if (prev.has(cat) && prevSum > 0) {
      const prevPct = (prev.get(cat) / prevSum) * 100;
      mom = parseFloat((pct - prevPct).toFixed(1));
    }
    return {
      name: labelOf(cat),
      pct,
      mom,
      color: PALETTE[i % PALETTE.length],
    };
  });
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
  const { t } = useTranslation();

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
        showsVerticalScrollIndicator={segments.length > 4}
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
              <View style={styles.legendRight}>
                <Text style={[styles.legendPct, { color: Colors.textDark, fontFamily: Fonts.bold }]}>
                  {seg.pct}%
                </Text>
                {seg.mom !== null ? (
                  <Text
                    style={[
                      styles.momChange,
                      {
                        color: seg.mom > 0 ? Colors.green : seg.mom < 0 ? Colors.rose : Colors.textSecondary,
                        fontFamily: Fonts.regular,
                      },
                    ]}
                  >
                    {seg.mom > 0 ? '+' : ''}{seg.mom}%
                  </Text>
                ) : (
                  <Text style={[styles.momNew, { color: Colors.green, fontFamily: Fonts.bold }]}>
                    {t('home.momNew')}
                  </Text>
                )}
              </View>
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
      <Text style={[styles.sectionHint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
        {t('home.categoryBreakdownHint')}
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
  sectionHint: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: -4,
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
    textAlign: 'center',
  },
  legend: {
    flex: 1,
    maxHeight: 120,
  },
  legendContent: {
    gap: 4,
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
  legendRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  legendName: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  legendPct: {
    fontSize: 12,
    lineHeight: 18,
  },
  momChange: {
    fontSize: 10,
    lineHeight: 18,
  },
  momNew: {
    fontSize: 10,
    lineHeight: 18,
  },
});