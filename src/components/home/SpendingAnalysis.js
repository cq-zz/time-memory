import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';
import Svg, { Circle, Path } from 'react-native-svg';
import DimensionRangePicker from '../common/DimensionRangePicker';
import { getWeekNumber, getWeekDateRange, getWeeksInYear } from './SpendingDetail';

/* ── Chart constants ── */
const CHART_W = 264;
const AXIS_W = 30;
const CHART_H = 112;
const PAD_Y = 12;
const Y_TICKS = 4;
const DONUT_SIZE = 70;
const DONUT_STROKE = 8;
const DONUT_R = (DONUT_SIZE - DONUT_STROKE) / 2;
const DONUT_C = 2 * Math.PI * DONUT_R;
const PALETTE = ['#A05C82', '#F28B50', '#4AA868', '#E86B6B', '#4A90D9', '#8B7AE8', '#E8B830', '#6BAA90', '#D94452', '#4A90D9'];

/* ── Helpers ── */
const pad = (n) => String(n).padStart(2, '0');
const monthKey = (y, m) => `${y}-${pad(m)}`;

function formatAxisValue(val) {
  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return Math.round(val).toString();
}

function filterBills(bills, dim, start, end, startWeek, endWeek, weekStartDay) {
  if (dim === 'all') return bills || [];
  if (dim === 'week' && startWeek != null && endWeek != null) {
    // Convert week ranges to date ranges
    const sRange = getWeekDateRange(parseInt(start, 10), startWeek, weekStartDay);
    const eRange = getWeekDateRange(parseInt(end, 10), endWeek, weekStartDay);
    return (bills || []).filter((b) => {
      const d = (b.consumption_date || '').slice(0, 10);
      return d >= sRange.startDate && d <= eRange.endDate;
    });
  }
  return (bills || []).filter((b) => {
    const d = (b.consumption_date || '').slice(0, dim === 'year' ? 4 : 7);
    return d >= start && d <= end;
  });
}

function buildTrendSeries(bills, dim, start, end, startWeek, endWeek, weekStartDay) {
  const series = [];
  if (dim === 'week' && startWeek != null && endWeek != null) {
    const sy = parseInt(start, 10);
    const ey = parseInt(end, 10);
    let y = sy, w = startWeek;
    while (y < ey || (y === ey && w <= endWeek)) {
      const key = `${y}-W${w}`;
      series.push({ key, label: `W${w}`, income: 0, expense: 0 });
      w++;
      const maxW = getWeeksInYear(y, weekStartDay);
      if (w > maxW) { w = 1; y++; }
    }
    const idx = new Map(series.map((s) => [s.key, s]));
    bills.forEach((b) => {
      const d = new Date(b.consumption_date || '');
      const wy = d.getFullYear();
      const wn = getWeekNumber(d, weekStartDay);
      const s = idx.get(`${wy}-W${wn}`);
      if (!s) return;
      const amt = Number(b.amount) || 0;
      if (b.bill_type === 'income') s.income += amt;
      else s.expense += amt;
    });
  } else if (dim === 'year') {
    const sy = parseInt(start, 10);
    const ey = parseInt(end, 10);
    for (let y = sy; y <= ey; y++) {
      series.push({ key: String(y), label: String(y), income: 0, expense: 0 });
    }
    const idx = new Map(series.map((s) => [s.key, s]));
    bills.forEach((b) => {
      const y = (b.consumption_date || '').slice(0, 4);
      const s = idx.get(y);
      if (!s) return;
      const amt = Number(b.amount) || 0;
      if (b.bill_type === 'income') s.income += amt;
      else s.expense += amt;
    });
  } else {
    const [sy, sm] = start.split('-').map(Number);
    const [ey, em] = end.split('-').map(Number);
    let y = sy, m = sm;
    while (y < ey || (y === ey && m <= em)) {
      const key = monthKey(y, m);
      series.push({ key, label: `${y}/${m}`, income: 0, expense: 0 });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    const idx = new Map(series.map((s) => [s.key, s]));
    bills.forEach((b) => {
      const s = idx.get((b.consumption_date || '').slice(0, 7));
      if (!s) return;
      const amt = Number(b.amount) || 0;
      if (b.bill_type === 'income') s.income += amt;
      else s.expense += amt;
    });
  }
  return series;
}

function buildPath(values, max) {
  const step = CHART_W / (values.length - 1);
  const pts = values.map((v, i) => ({
    x: i * step,
    y: max > 0 ? CHART_H - PAD_Y - (v / max) * (CHART_H - PAD_Y * 2) : CHART_H - PAD_Y,
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

/**
 * Pick which indices to show X-axis labels for.
 * Always shows first; evenly distributes the rest at a fixed interval.
 */
function tickIndices(total, maxTicks = 6) {
  if (total <= maxTicks) return Array.from({ length: total }, (_, i) => i);
  const step = Math.ceil((total - 1) / (maxTicks - 1));
  const indices = [];
  for (let i = 0; i < total; i += step) {
    indices.push(i);
  }
  return indices;
}

function categoryTotals(bills, billType) {
  const totals = new Map();
  let sum = 0;
  bills.forEach((b) => {
    if (b.bill_type !== billType) return;
    const amt = Number(b.amount) || 0;
    const cat = b.category || 'other';
    totals.set(cat, (totals.get(cat) || 0) + amt);
    sum += amt;
  });
  return { totals, sum };
}

function buildSegments(bills, billType, labelOf) {
  const { totals, sum } = categoryTotals(bills, billType);
  if (!sum) return [];
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount], i) => ({
      name: labelOf(cat),
      pct: parseFloat(((amount / sum) * 100).toFixed(2)),
      amount,
      color: PALETTE[i % PALETTE.length],
    }));
}

/* ── Trend Chart ── */
function TrendChart({ series }) {
  const { Colors, Fonts } = useTheme();
  const max = Math.max(...series.map((s) => s.income), ...series.map((s) => s.expense));

  const ticks = [];
  for (let i = 0; i <= Y_TICKS; i++) {
    const val = max > 0 ? (max / Y_TICKS) * i : 0;
    ticks.push({ value: val, y: max > 0 ? CHART_H - PAD_Y - (val / max) * (CHART_H - PAD_Y * 2) : CHART_H - PAD_Y });
  }
  ticks.reverse();

  return (
    <View style={{ flexDirection: 'row', height: CHART_H }}>
      <View style={{ width: AXIS_W, height: CHART_H }}>
        {ticks.map((tick, i) => (
          <Text key={i} style={[styles.axisLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold, top: tick.y - 6 }]}>
            {formatAxisValue(tick.value)}
          </Text>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} fill="none">
          {ticks.map((tick, i) => (
            <Path key={`g-${i}`} d={`M 0 ${tick.y} L ${CHART_W} ${tick.y}`} stroke={Colors.iconBg} strokeWidth="1" strokeDasharray="3 3" />
          ))}
          <Path d={buildPath(series.map((s) => s.income), max)} stroke={Colors.green} strokeWidth="2.5" strokeLinecap="round" />
          <Path d={buildPath(series.map((s) => s.expense), max)} stroke={Colors.rose} strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
      </View>
    </View>
  );
}

/* ── Donut Chart ── */
function DonutChart({ segments, centerLabel }) {
  const { Colors, Fonts } = useTheme();
  let acc = 0;
  return (
    <View style={styles.donutWrap}>
      <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}>
        <Circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={DONUT_R} stroke={Colors.iconBg} strokeWidth={DONUT_STROKE} fill="none" />
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * DONUT_C;
          const off = -((acc / 100) * DONUT_C);
          acc += seg.pct;
          return (
            <Circle key={i} cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={DONUT_R} stroke={seg.color} strokeWidth={DONUT_STROKE} fill="none"
              strokeDasharray={`${dash} ${DONUT_C}`} strokeDashoffset={off} strokeLinecap="butt"
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`} />
          );
        })}
      </Svg>
      <View style={styles.donutCenter}>
        <Text style={[styles.donutLabel, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{centerLabel}</Text>
      </View>
    </View>
  );
}

/* ── Main Component ── */
export default function SpendingAnalysis({ bills = [] }) {
  const { Colors, Fonts, Radius, Shadows } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);
  const categoryState = useCategoryStore();

  // Merge all three category types (bill/item/asset) for label lookup,
  // because bills can include auto-generated records from items/assets.
  // Bill namespace takes priority so that shared keys (e.g. "food") resolve
  // to bill-category labels (e.g. "餐饮") rather than item-category labels.
  const allCategories = useMemo(() => {
    const map = new Map();
    const types = ['bill', 'item', 'asset'];
    types.forEach((type) => {
      const cats = getMergedCategories(categoryState, type);
      cats.forEach((c) => {
        if (!map.has(c.key)) map.set(c.key, { ...c, _type: type });
      });
    });
    return map;
  }, [categoryState]);

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const weekStartDay = useSettingsStore((s) => s.settings.weekStartDay);
  const curWeek = useMemo(() => getWeekNumber(now, weekStartDay), [weekStartDay]);

  // Default: last 6 months
  const defaultStart = useMemo(() => {
    const d = new Date(curYear, curMonth - 6, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, []);
  const defaultEnd = useMemo(() => ({ year: curYear, month: curMonth }), []);

  const [dimension, setDimension] = useState('week');
  const [range, setRange] = useState({
    startYear: defaultStart.year,
    startMonth: defaultStart.month,
    endYear: defaultEnd.year,
    endMonth: defaultEnd.month,
  });
  const [weekYear, setWeekYear] = useState(curYear);
  const [weekNum, setWeekNum] = useState(curWeek);
  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    if (dim === 'all') {
      setRange({ startYear: null, startMonth: null, endYear: null, endMonth: null });
    } else if (dim === 'year') {
      setRange({ startYear: curYear, startMonth: null, endYear: curYear, endMonth: null });
    } else if (dim === 'week') {
      setWeekYear(curYear);
      setWeekNum(curWeek);
    } else {
      setRange({ startYear: defaultStart.year, startMonth: defaultStart.month, endYear: defaultEnd.year, endMonth: defaultEnd.month });
    }
  }, [defaultStart, defaultEnd, curYear, curWeek]);

  const handleRangeChange = useCallback((r) => {
    setRange(r);
  }, []);

  const handleWeekChange = useCallback((y, w) => {
    setWeekYear(y);
    setWeekNum(w);
  }, []);

  // Convert range to internal format. For 'all' dimension, compute effective range from data.
  const rangeStart = dimension === 'all' || dimension === 'week' ? '' : (dimension === 'year' ? String(range.startYear) : monthKey(range.startYear, range.startMonth));
  const rangeEnd = dimension === 'all' || dimension === 'week' ? '' : (dimension === 'year' ? String(range.endYear) : monthKey(range.endYear, range.endMonth));

  const labelOf = useCallback((key) => {
    if (key === '__other__') return t('home.otherSegment');
    const cat = allCategories.get(key);
    if (!cat) return key;
    return cat.isBuiltin ? t(`${BUILTIN_NS[cat._type]}.${key}`) : cat.name;
  }, [allCategories, t]);

  const filtered = useMemo(() => {
    if (dimension === 'week') {
      const range = getWeekDateRange(weekYear, weekNum, weekStartDay);
      return (bills || []).filter((b) => {
        const d = (b.consumption_date || '').slice(0, 10);
        return d >= range.startDate && d <= range.endDate;
      });
    }
    return filterBills(bills, dimension, rangeStart, rangeEnd, range.startWeek, range.endWeek, weekStartDay);
  }, [bills, dimension, rangeStart, rangeEnd, range.startWeek, range.endWeek, weekStartDay, weekYear, weekNum]);

  // Compute effective trend dimension & range for 'all' mode (use year dimension)
  const trendDim = dimension === 'all' ? 'year' : dimension;
  const { trendStart, trendEnd } = useMemo(() => {
    if (dimension !== 'all') return { trendStart: rangeStart, trendEnd: rangeEnd };
    if (filtered.length === 0) return { trendStart: String(curYear), trendEnd: String(curYear) };
    const dates = filtered.map((b) => b.consumption_date || '').filter((d) => d).sort();
    const first = dates[0]?.slice(0, 4) || String(curYear);
    const last = dates[dates.length - 1]?.slice(0, 4) || String(curYear);
    return { trendStart: first, trendEnd: last };
  }, [dimension, rangeStart, rangeEnd, filtered, curYear]);

  const summary = useMemo(() => {
    let incomeTotal = 0, expenseTotal = 0;
    filtered.forEach((b) => {
      const amt = Number(b.amount) || 0;
      if (b.bill_type === 'income') incomeTotal += amt;
      else expenseTotal += amt;
    });
    let periods = 1;
    if (dimension === 'all') {
      if (filtered.length > 0) {
        const dates = filtered.map((b) => b.consumption_date || '').filter((d) => d).sort();
        const first = dates[0]?.slice(0, 7);
        const last = dates[dates.length - 1]?.slice(0, 7);
        if (first && last) {
          const [fy, fm] = first.split('-').map(Number);
          const [ly, lm] = last.split('-').map(Number);
          periods = (ly - fy) * 12 + (lm - fm) + 1;
        }
      }
    } else if (dimension === 'week') {
      periods = 1;
    } else if (dimension === 'year') {
      periods = (range.endYear - range.startYear + 1) * 12;
    } else {
      periods = (range.endYear - range.startYear) * 12 + (range.endMonth - range.startMonth) + 1;
    }
    const ratio = incomeTotal > 0 ? parseFloat(((expenseTotal / incomeTotal) * 100).toFixed(1)) : null;
    return { incomeTotal, expenseTotal, periodAvg: periods > 0 ? expenseTotal / periods : 0, periods, ratio };
  }, [filtered, dimension, range, weekStartDay]);

  const trendSeries = useMemo(() => {
    if (dimension === 'week') return [];
    return buildTrendSeries(filtered, trendDim, trendStart, trendEnd, range.startWeek, range.endWeek, weekStartDay);
  }, [filtered, trendDim, trendStart, trendEnd, range.startWeek, range.endWeek, weekStartDay, dimension]);
  const showIndices = tickIndices(trendSeries.length, trendDim === 'month' ? 4 : 6);

  const incomeSegments = useMemo(() => buildSegments(filtered, 'income', labelOf), [filtered, labelOf]);
  const expenseSegments = useMemo(() => buildSegments(filtered, 'expense', labelOf), [filtered, labelOf]);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('butler.spendingAnalysis')}
      </Text>

      <DimensionRangePicker
        dimension={dimension}
        startYear={range.startYear}
        startMonth={range.startMonth}
        endYear={range.endYear}
        endMonth={range.endMonth}
        year={weekYear}
        week={weekNum}
        onDimensionChange={handleDimensionChange}
        onRangeChange={handleRangeChange}
        onWeekChange={handleWeekChange}
      />

      {/* Summary cards 2x2 */}
      {filtered.length > 0 && (
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.md }, Shadows.card]}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{t('butler.totalIncome')}</Text>
            <Text style={[styles.statValue, { color: Colors.green, fontFamily: Fonts.bold }]}>{formatMoney(summary.incomeTotal, currency)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.md }, Shadows.card]}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{t('butler.totalExpense')}</Text>
            <Text style={[styles.statValue, { color: Colors.rose, fontFamily: Fonts.bold }]}>{formatMoney(summary.expenseTotal, currency)}</Text>
          </View>
          {dimension !== 'week' && (
            <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.md }, Shadows.card]}>
              <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {t('butler.monthlyAvgExpense')}
              </Text>
              <Text style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>{formatMoney(summary.periodAvg, currency)}</Text>
            </View>
          )}
          <View style={[styles.statCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.md }, Shadows.card]}>
            <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{t('butler.incomeExpenseRatio')}</Text>
            <Text style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {summary.ratio != null ? `${summary.ratio}%` : '--'}
            </Text>
          </View>
        </View>
      )}

      {/* Trends chart */}
      {filtered.length > 0 && trendSeries.length > 1 && (
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg }, Shadows.card]}>
          <Text style={[styles.chartTitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('butler.incomeExpenseTrend')}
          </Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.green }]} />
              <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{t('home.income')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.rose }]} />
              <Text style={[styles.legendText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{t('home.expense')}</Text>
            </View>
          </View>
          <View style={{ height: CHART_H, justifyContent: 'center' }}>
            <TrendChart series={trendSeries} />
          </View>
          <View style={[styles.monthsRow, { paddingLeft: AXIS_W }]}>
            {trendSeries.map((s, i) => (
              <Text key={s.key} style={[styles.monthLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                {showIndices.includes(i) ? s.label : ''}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Category breakdown */}
      {filtered.length > 0 && (
        <View style={styles.donutCards}>
          <View style={[styles.donutCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg }, Shadows.card]}>
            <Text style={[styles.chartTitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{t('butler.expenseCategoryBreakdown')}</Text>
            <View style={styles.donutRow}>
              <DonutChart segments={expenseSegments} centerLabel={t('home.expenseDonut')} />
              <ScrollView style={styles.donutLegend} nestedScrollEnabled showsVerticalScrollIndicator={expenseSegments.length > 4}>
                {expenseSegments.length > 0 ? expenseSegments.map((seg) => (
                  <View key={seg.name} style={styles.donutLegendRow}>
                    <View style={styles.donutLegendLeft}>
                      <View style={[styles.dot, { backgroundColor: seg.color }]} />
                      <Text numberOfLines={1} style={[styles.donutLegendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{seg.name}</Text>
                    </View>
                    <Text style={[styles.donutLegendPct, { color: Colors.textDark, fontFamily: Fonts.bold }]}>
                      <Text style={[styles.donutLegendAmt, { color: Colors.textSecondary }]}>{formatMoney(seg.amount, currency)}</Text>  {seg.pct}%
                    </Text>
                  </View>
                )) : (
                  <Text style={[styles.donutLegendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{t('home.noChartData')}</Text>
                )}
              </ScrollView>
            </View>
          </View>
          <View style={[styles.donutCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg }, Shadows.card]}>
            <Text style={[styles.chartTitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{t('butler.incomeCategoryBreakdown')}</Text>
            <View style={styles.donutRow}>
              <DonutChart segments={incomeSegments} centerLabel={t('home.incomeDonut')} />
              <ScrollView style={styles.donutLegend} nestedScrollEnabled showsVerticalScrollIndicator={incomeSegments.length > 4}>
                {incomeSegments.length > 0 ? incomeSegments.map((seg) => (
                  <View key={seg.name} style={styles.donutLegendRow}>
                    <View style={styles.donutLegendLeft}>
                      <View style={[styles.dot, { backgroundColor: seg.color }]} />
                      <Text numberOfLines={1} style={[styles.donutLegendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{seg.name}</Text>
                    </View>
                    <Text style={[styles.donutLegendPct, { color: Colors.textDark, fontFamily: Fonts.bold }]}>
                      <Text style={[styles.donutLegendAmt, { color: Colors.textSecondary }]}>{formatMoney(seg.amount, currency)}</Text>  {seg.pct}%
                    </Text>
                  </View>
                )) : (
                  <Text style={[styles.donutLegendName, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>{t('home.noChartData')}</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      )}

      {filtered.length === 0 && (
        <View style={[styles.empty, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg }]}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {t('spendingDetail.noData')}
          </Text>
        </View>
      )}
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
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    padding: 12,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  chartTitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
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
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  monthLabel: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    flex: 1,
  },
  donutCards: {
    gap: 12,
  },
  donutCard: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donutWrap: {
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenter: {
    position: 'absolute',
    width: DONUT_SIZE,
    height: DONUT_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  donutLegend: {
    flex: 1,
    maxHeight: 100,
  },
  donutLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  donutLegendLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  donutLegendName: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  donutLegendPct: {
    fontSize: 11,
    lineHeight: 16,
  },
  donutLegendAmt: {
    fontSize: 10,
    lineHeight: 14,
  },
  empty: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});