import { useCallback, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';
import WheelColumn from '../common/WheelColumn';

const PALETTE = ['#A05C82', '#F28B50', '#4AA868', '#E86B6B', '#4A90D9', '#8B7AE8', '#E8B830', '#6BAA90', '#D94452', '#4A90D9'];

const pad = (n) => String(n).padStart(2, '0');

/* ── Helpers ── */
function filterBillsByPeriod(bills, year, month, day) {
  if (day != null) {
    const key = `${year}-${pad(month)}-${pad(day)}`;
    return (bills || []).filter((b) => (b.consumption_date || '').slice(0, 10) === key);
  }
  if (month != null) {
    const key = `${year}-${pad(month)}`;
    return (bills || []).filter((b) => (b.consumption_date || '').slice(0, 7) === key);
  }
  return (bills || []).filter((b) => (b.consumption_date || '').slice(0, 4) === String(year));
}

function categoryTotals(bills, billType) {
  const totals = new Map();
  bills.forEach((b) => {
    if (b.bill_type !== billType) return;
    const amt = Number(b.amount) || 0;
    const cat = b.category || 'other';
    totals.set(cat, (totals.get(cat) || 0) + amt);
  });
  return totals;
}

/* ── Wheel-based Period Picker ── */
export function PeriodPicker({ dimension, year, month, day, onChange }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (dimension === 'year') return String(year);
    if (dimension === 'day') return `${year}/${pad(month)}/${pad(day)}`;
    return `${year}/${pad(month)}`;
  }, [dimension, year, month, day]);

  const yearItems = useMemo(() => {
    const items = [];
    for (let y = yearStart; y <= yearEnd; y++) items.push({ value: y, label: String(y) });
    return items;
  }, [yearStart, yearEnd]);

  const monthItems = useMemo(() => {
    const names = (t('calendar.monthsShort', { returnObjects: true }) || []).map((l) => l.replace('月', ''));
    return Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: names[i] }));
  }, [t]);

  const [draftYear, setDraftYear] = useState(year);
  const [draftMonth, setDraftMonth] = useState(month || 1);
  const [draftDay, setDraftDay] = useState(day || 1);

  const handleOpen = useCallback(() => {
    setDraftYear(year);
    setDraftMonth(month || 1);
    setDraftDay(day || 1);
    setOpen(true);
  }, [year, month, day]);

  const handleConfirm = useCallback(() => {
    if (dimension === 'year') {
      onChange(draftYear, null, null);
    } else if (dimension === 'day') {
      onChange(draftYear, draftMonth, draftDay);
    } else {
      onChange(draftYear, draftMonth, null);
    }
    setOpen(false);
  }, [dimension, draftYear, draftMonth, draftDay, onChange]);

  // Day items: 1..daysInMonth based on draft year/month
  const dayItems = useMemo(() => {
    const days = new Date(draftYear, draftMonth, 0).getDate();
    return Array.from({ length: days }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  }, [draftYear, draftMonth]);

  // When month wraps, adjust day to valid range
  const safeDraftDay = useMemo(() => {
    const maxDay = new Date(draftYear, draftMonth, 0).getDate();
    return Math.min(draftDay, maxDay);
  }, [draftYear, draftMonth, draftDay]);

  const panelTitle = dimension === 'year'
    ? t('common.selectYear')
    : dimension === 'day'
      ? t('common.selectDate')
      : t('common.selectYearMonth');

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: Colors.purpleTint, borderRadius: Radius.pill },
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleOpen}
      >
        <Ionicons name="calendar-outline" size={16} color={Colors.purple} />
        <Text style={[styles.triggerText, { color: Colors.purple, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {displayText}
        </Text>
      </Pressable>

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={() => setOpen(false)} />
            <View style={[styles.panel, { backgroundColor: Colors.card }]}>
              <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                  {panelTitle}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                    {t('common.confirm')}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.pickerBody}>
                <View style={styles.colsRow}>
                  <WheelColumn
                    items={yearItems}
                    selected={draftYear}
                    onChange={setDraftYear}
                    width={dimension === 'year' ? 120 : dimension === 'day' ? 70 : 80}
                  />
                  {(dimension === 'month' || dimension === 'day') && (
                    <WheelColumn
                      items={monthItems}
                      selected={draftMonth}
                      onChange={setDraftMonth}
                      width={dimension === 'day' ? 70 : 80}
                    />
                  )}
                  {dimension === 'day' && (
                    <WheelColumn
                      items={dayItems}
                      selected={safeDraftDay}
                      onChange={setDraftDay}
                      width={70}
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/* ── Main Component ── */
export default function SpendingDetail({ bills = [], billType = 'expense', year: extYear, month: extMonth, day: extDay, dimension: extDimension, hideControls = false, hideTitle = false }) {
  const { Colors, Fonts, Radius, Shadows } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);
  const categoryState = useCategoryStore();

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();

  const hasExternal = extYear != null;

  const [internalDimension, setInternalDimension] = useState('month');
  const [internalYear, setInternalYear] = useState(curYear);
  const [internalMonth, setInternalMonth] = useState(curMonth);
  const [internalDay, setInternalDay] = useState(curDay);

  const dimension = hasExternal ? extDimension : internalDimension;
  const year = hasExternal ? extYear : internalYear;
  const month = hasExternal ? extMonth : internalMonth;
  const day = hasExternal ? extDay : internalDay;

  const allCategories = useMemo(() => {
    const map = new Map();
    ['bill', 'item', 'asset'].forEach((type) => {
      const cats = getMergedCategories(categoryState, type);
      cats.forEach((c) => { if (!map.has(c.key)) map.set(c.key, { ...c, _type: type }); });
    });
    return map;
  }, [categoryState]);

  const labelOf = useCallback((key) => {
    if (key === '__other__') return t('home.otherSegment');
    const cat = allCategories.get(key);
    if (!cat) return key;
    return cat.isBuiltin ? t(`${BUILTIN_NS[cat._type]}.${key}`) : cat.name;
  }, [allCategories, t]);

  const handleDimensionChange = useCallback((dim) => {
    setInternalDimension(dim);
    if (dim === 'year') {
      setInternalYear(curYear);
      setInternalMonth(null);
      setInternalDay(null);
    } else if (dim === 'day') {
      setInternalYear(curYear);
      setInternalMonth(curMonth);
      setInternalDay(curDay);
    } else {
      setInternalYear(curYear);
      setInternalMonth(curMonth);
      setInternalDay(null);
    }
  }, [curYear, curMonth, curDay]);

  const handlePeriodChange = useCallback((y, m, d) => {
    setInternalYear(y);
    setInternalMonth(m);
    setInternalDay(d);
  }, []);

  // Current period data
  const currentTotals = useMemo(
    () => categoryTotals(filterBillsByPeriod(bills, year, month, day), billType),
    [bills, year, month, day, billType]
  );

  // YoY (year-over-year) reference period
  const yoyTotals = useMemo(() => {
    if (dimension === 'year') {
      return categoryTotals(filterBillsByPeriod(bills, year - 1, null, null), billType);
    }
    if (dimension === 'day') {
      return categoryTotals(filterBillsByPeriod(bills, year - 1, month, day), billType);
    }
    return categoryTotals(filterBillsByPeriod(bills, year - 1, month, null), billType);
  }, [bills, dimension, year, month, day, billType]);

  // MoM (month-over-month) / previous period reference
  const momTotals = useMemo(() => {
    if (dimension === 'year') {
      return categoryTotals(filterBillsByPeriod(bills, year - 1, null, null), billType);
    }
    if (dimension === 'day') {
      // Previous day
      const prev = new Date(year, month - 1, day);
      prev.setDate(prev.getDate() - 1);
      return categoryTotals(filterBillsByPeriod(bills, prev.getFullYear(), prev.getMonth() + 1, prev.getDate()), billType);
    }
    const refMonth = month - 1;
    if (refMonth < 1) {
      return categoryTotals(filterBillsByPeriod(bills, year - 1, 12, null), billType);
    }
    return categoryTotals(filterBillsByPeriod(bills, year, refMonth, null), billType);
  }, [bills, dimension, year, month, day, billType]);

  // Build table rows
  const rows = useMemo(() => {
    const allKeys = new Set([...currentTotals.keys(), ...yoyTotals.keys(), ...momTotals.keys()]);
    const result = [];
    allKeys.forEach((cat) => {
      const amount = currentTotals.get(cat) || 0;
      const yoyAmount = yoyTotals.get(cat);
      const momAmount = momTotals.get(cat);
      const yoyDiff = yoyAmount != null ? amount - yoyAmount : null;
      const yoyPct = yoyAmount != null && yoyAmount > 0 ? (yoyDiff / yoyAmount) * 100 : null;
      const yoyIsNew = yoyAmount == null || (yoyAmount === 0 && amount > 0);
      const momDiff = momAmount != null ? amount - momAmount : null;
      const momPct = momAmount != null && momAmount > 0 ? (momDiff / momAmount) * 100 : null;
      const momIsNew = momAmount == null || (momAmount === 0 && amount > 0);
      result.push({
        cat, label: labelOf(cat), amount,
        yoyDiff, yoyPct, yoyIsNew, yoyAmount,
        momDiff, momPct, momIsNew, momAmount,
      });
    });
    result.sort((a, b) => b.amount - a.amount);
    return result;
  }, [currentTotals, yoyTotals, momTotals, labelOf]);

  // Summary
  const summary = useMemo(() => {
    const totalAmount = rows.reduce((s, r) => s + r.amount, 0);
    const totalYoyRef = rows.reduce((s, r) => s + (r.yoyAmount || 0), 0);
    const totalMomRef = rows.reduce((s, r) => s + (r.momAmount || 0), 0);
    const totalYoyPct = totalYoyRef > 0 ? ((totalAmount - totalYoyRef) / totalYoyRef) * 100 : null;
    const totalMomPct = totalMomRef > 0 ? ((totalAmount - totalMomRef) / totalMomRef) * 100 : null;
    const hasYoy = rows.some((r) => r.yoyPct != null || r.yoyIsNew);
    const hasMom = rows.some((r) => r.momPct != null || r.momIsNew);
    return { totalAmount, totalYoyPct, totalMomPct, hasYoy, hasMom };
  }, [rows]);

  const hasData = rows.length > 0;

  function diffText(pct, isNew) {
    if (isNew) return t('home.momNew');
    if (pct == null) return '--';
    if (pct > 0) return `↑ +${pct.toFixed(2)}%`;
    if (pct < 0) return `↓ ${Math.abs(pct).toFixed(2)}%`;
    return '--';
  }

  function diffColor(pct, isNew) {
    if (isNew) return Colors.purple;
    if (pct == null) return Colors.textSecondary;
    if (pct > 0) return Colors.rose;
    if (pct < 0) return Colors.green;
    return Colors.textSecondary;
  }

  return (
    <View style={styles.wrapper}>
      {!hideTitle && (
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {billType === 'expense' ? t('spendingDetail.expenseTitle') : t('spendingDetail.incomeTitle')}
        </Text>
      )}

      {/* Dimension + Period Picker — hidden when controlled externally */}
      {!hideControls && (
        <View style={styles.controls}>
          <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
            {['day', 'month', 'year'].map((dim) => {
              const active = dimension === dim;
              return (
                <Pressable
                  key={dim}
                  style={[styles.segBtn, active && { backgroundColor: Colors.purple, borderRadius: Radius.pill }]}
                  onPress={() => handleDimensionChange(dim)}
                >
                  <Text style={[styles.segBtnText, { color: active ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold }]}>
                    {dim === 'day' ? t('home.dayDimension') : dim === 'month' ? t('home.monthDimension') : t('home.yearDimension')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <PeriodPicker dimension={dimension} year={year} month={month} day={day} onChange={handlePeriodChange} />
        </View>
      )}

      {/* Table */}
      {hasData ? (
        <View style={[styles.tableCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg }, Shadows.card]}>
          {/* Header */}
          <View style={[styles.tableHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Text style={[styles.thCategory, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('spendingDetail.category')}
            </Text>
            <Text style={[styles.thAmount, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('spendingDetail.amount')}
            </Text>
            <Text style={[styles.thChange, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('spendingDetail.change')}
            </Text>
          </View>

          {/* Rows */}
          <ScrollView style={styles.tableBody} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {rows.map((row, i) => (
              <View key={row.cat} style={[styles.tableRow, i < rows.length - 1 && { borderBottomColor: Colors.cardBorder, borderBottomWidth: 1 }]}>
                <View style={styles.tdCategory}>
                  <View style={[styles.dot, { backgroundColor: PALETTE[i % PALETTE.length] }]} />
                  <Text numberOfLines={1} style={[styles.tdCategoryText, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
                    {row.label}
                  </Text>
                </View>
                <Text style={[styles.tdAmount, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                  {formatMoney(row.amount, currency)}
                </Text>
                <View style={styles.tdChange}>
                  <Text style={[styles.diffLine, { color: diffColor(row.yoyPct, row.yoyIsNew), fontFamily: Fonts.bold }]}>
                    {t('spendingDetail.yoy')} {diffText(row.yoyPct, row.yoyIsNew)}
                  </Text>
                  <Text style={[styles.diffLine, { color: diffColor(row.momPct, row.momIsNew), fontFamily: Fonts.bold }]}>
                    {t('spendingDetail.mom')} {diffText(row.momPct, row.momIsNew)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Summary */}
          <View style={[styles.summaryRow, { borderTopColor: Colors.cardBorder, backgroundColor: Colors.iconBg }]}>
            <Text style={[styles.tdCategory, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('spendingDetail.total')}
            </Text>
            <Text style={[styles.tdAmount, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {formatMoney(summary.totalAmount, currency)}
            </Text>
            <View style={styles.tdChange}>
              <Text style={[styles.diffLine, { color: diffColor(summary.totalYoyPct, false), fontFamily: Fonts.bold }]}>
                {t('spendingDetail.yoy')} {summary.hasYoy ? diffText(summary.totalYoyPct, false) : '--'}
              </Text>
              <Text style={[styles.diffLine, { color: diffColor(summary.totalMomPct, false), fontFamily: Fonts.bold }]}>
                {t('spendingDetail.mom')} {summary.hasMom ? diffText(summary.totalMomPct, false) : '--'}
              </Text>
            </View>
          </View>
        </View>
      ) : (
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
  wrapper: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segmented: {
    flexDirection: 'row',
    padding: 0,
    gap: 2,
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  segBtnText: {
    fontSize: 12,
    lineHeight: 18,
  },
  /* Trigger (pill style) */
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  triggerText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  /* Modal */
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    flexShrink: 1,
  },
  headerBtnCancel: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerBtnConfirm: {
    fontSize: 16,
    lineHeight: 24,
  },
  pickerBody: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  colsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  /* Table */
  tableCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  thCategory: {
    flex: 2.2,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.3,
  },
  thAmount: {
    flex: 1.2,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  thChange: {
    flex: 1.8,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  tableBody: {
    maxHeight: 320,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tdCategory: {
    flex: 2.2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  tdCategoryText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  tdAmount: {
    flex: 1.2,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
  },
  tdChange: {
    flex: 1.8,
    alignItems: 'flex-end',
    gap: 2,
  },
  diffLine: {
    fontSize: 10,
    lineHeight: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1.5,
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