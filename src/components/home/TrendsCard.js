import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

const CHART_W = 264;
const AXIS_W = 30;
const H = 112;
const PAD_Y = 12;
const Y_TICKS = 4;
const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

/** Abbreviate large numbers for Y-axis labels. */
function formatAxisValue(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return Math.round(val).toString();
}

/** Last N months (oldest → newest) as { key, label, income, expense }. */
function monthlySeries(bills, months = 6, monthLabels = MONTHS) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    buckets.push({ key, label: monthLabels[d.getMonth()], income: 0, expense: 0 });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  (bills || []).forEach((b) => {
    const bucket = index.get((b.consumption_date || '').slice(0, 7));
    if (!bucket) return;
    const amount = Number(b.amount) || 0;
    if (b.bill_type === 'income') bucket.income += amount;
    else bucket.expense += amount;
  });
  return buckets;
}

/** Smooth cubic path through the points (flat baseline when max is 0). */
function buildPath(values, max) {
  const step = CHART_W / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: max > 0 ? H - PAD_Y - (v / max) * (H - PAD_Y * 2) : H - PAD_Y,
  }));
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const cur = pts[i];
    const cx = (prev.x + cur.x) / 2;
    d += ` C ${cx} ${prev.y}, ${cx} ${cur.y}, ${cur.x} ${cur.y}`;
  }
  return d;
}

function TrendChart({ series }) {
  const { Colors, Fonts } = useTheme();
  const max = Math.max(...series.map((s) => s.income), ...series.map((s) => s.expense));

  // Build Y-axis ticks (top → bottom)
  const ticks = [];
  for (let i = 0; i <= Y_TICKS; i++) {
    const val = max > 0 ? (max / Y_TICKS) * i : 0;
    ticks.push({
      value: val,
      y: max > 0 ? H - PAD_Y - (val / max) * (H - PAD_Y * 2) : H - PAD_Y,
    });
  }
  ticks.reverse();

  return (
    <View style={{ flexDirection: 'row', height: H }}>
      {/* Y-axis labels */}
      <View style={{ width: AXIS_W, height: H }}>
        {ticks.map((tick, i) => (
          <Text
            key={i}
            style={[
              styles.axisLabel,
              {
                color: Colors.textSecondary,
                fontFamily: Fonts.bold,
                top: tick.y - 6,
              },
            ]}
          >
            {formatAxisValue(tick.value)}
          </Text>
        ))}
      </View>

      {/* Chart area */}
      <View style={{ flex: 1 }}>
        <Svg width="100%" height={H} viewBox={`0 0 ${CHART_W} ${H}`} fill="none">
          {/* Horizontal grid lines */}
          {ticks.map((tick, i) => (
            <Path
              key={`grid-${i}`}
              d={`M 0 ${tick.y} L ${CHART_W} ${tick.y}`}
              stroke={Colors.iconBg}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ))}
          {/* Income curve */}
          <Path
            d={buildPath(series.map((s) => s.income), max)}
            stroke={Colors.green}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Expense curve */}
          <Path
            d={buildPath(series.map((s) => s.expense), max)}
            stroke={Colors.rose}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

export default function TrendsCard({ bills = [] }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  // Strip "月" from Chinese month labels to match English (numbers only)
  const monthLabels = (t('calendar.monthsShort', { returnObjects: true }) || []).map((l) => l.replace('月', ''));
  const series = monthlySeries(bills, 6, monthLabels);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('home.financialTrends')}
      </Text>
      <Text style={[styles.sectionHint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
        {t('home.financialTrendsHint')}
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
          Shadows.card,
        ]}
      >
        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
            <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('home.income')}
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
            <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('home.expense')}
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartWrap}>
          <TrendChart series={series} />
        </View>

        {/* Month labels — aligned with chart area */}
        <View style={[styles.monthsRow, { paddingLeft: AXIS_W }]}>
          {series.map((s) => (
            <Text key={s.key} style={[styles.month, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {s.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
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
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
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
  axisLabel: {
    position: 'absolute',
    right: 4,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  chartWrap: {
    height: H,
    justifyContent: 'center',
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  month: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});