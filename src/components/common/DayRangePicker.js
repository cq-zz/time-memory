import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import WheelColumn from './WheelColumn';
import useAlert from '../../hooks/useAlert';

const pad = (n) => String(n).padStart(2, '0');

const DIM_KEYS = ['all', 'day'];
const DIM_LABELS = { all: 'common.all', day: 'home.dayDimension' };

function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

/**
 * Day-range date picker (bottom sheet, dual date columns).
 * 
 * Props:
 * - dimension: 'all' | 'day'
 * - startDate: string | null — 'YYYY-MM-DD' or null
 * - endDate: string | null — 'YYYY-MM-DD' or null
 * - onDimensionChange: (dim: 'all' | 'day') => void
 * - onRangeChange: ({ startDate, endDate }) => void
 */
export default function DayRangePicker({
  dimension = 'all',
  startDate,
  endDate,
  onDimensionChange,
  onRangeChange,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const [open, setOpen] = useState(false);

  // Parse external dates into draft
  const parseDate = (d) => {
    if (!d) return { year: yearEnd, month: 1, day: 1 };
    const [y, m, dy] = d.split('-').map(Number);
    return { year: y || yearEnd, month: m || 1, day: dy || 1 };
  };

  const [draftStart, setDraftStart] = useState(() => parseDate(startDate));
  const [draftEnd, setDraftEnd] = useState(() => parseDate(endDate));

  // Sync draft when opening
  const handleOpen = useCallback(() => {
    setDraftStart(parseDate(startDate));
    setDraftEnd(parseDate(endDate));
    setOpen(true);
  }, [startDate, endDate]);

  // Build year items filtered by constraints
  const startYearItems = useMemo(() => {
    const items = [];
    for (let y = yearStart; y <= draftEnd.year; y++) {
      items.push({ value: y, label: String(y) });
    }
    return items;
  }, [yearStart, draftEnd.year]);

  const endYearItems = useMemo(() => {
    const items = [];
    for (let y = draftStart.year; y <= yearEnd; y++) {
      items.push({ value: y, label: String(y) });
    }
    return items;
  }, [yearEnd, draftStart.year]);

  // Build month items filtered by constraints
  const startMonthItems = useMemo(() => {
    const items = [];
    const maxM = draftStart.year === draftEnd.year ? draftEnd.month : 12;
    for (let m = 1; m <= maxM; m++) {
      items.push({ value: m, label: pad(m) });
    }
    return items;
  }, [draftStart.year, draftEnd.year, draftEnd.month]);

  const endMonthItems = useMemo(() => {
    const items = [];
    const minM = draftStart.year === draftEnd.year ? draftStart.month : 1;
    for (let m = minM; m <= 12; m++) {
      items.push({ value: m, label: pad(m) });
    }
    return items;
  }, [draftStart.year, draftEnd.year, draftStart.month]);

  // Build day items filtered by constraints
  const startDayItems = useMemo(() => {
    const items = [];
    const maxDay = daysInMonth(draftStart.year, draftStart.month);
    const maxD = (draftStart.year === draftEnd.year && draftStart.month === draftEnd.month)
      ? draftEnd.day : maxDay;
    for (let d = 1; d <= Math.min(maxD, maxDay); d++) {
      items.push({ value: d, label: pad(d) });
    }
    return items;
  }, [draftStart.year, draftStart.month, draftEnd.year, draftEnd.month, draftEnd.day]);

  const endDayItems = useMemo(() => {
    const items = [];
    const maxDay = daysInMonth(draftEnd.year, draftEnd.month);
    const minD = (draftStart.year === draftEnd.year && draftStart.month === draftEnd.month)
      ? draftStart.day : 1;
    for (let d = minD; d <= maxDay; d++) {
      items.push({ value: d, label: pad(d) });
    }
    return items;
  }, [draftStart.year, draftStart.month, draftStart.day, draftEnd.year, draftEnd.month]);

  // Clamp day when year/month changes (e.g. switching to Feb)
  const safeStartDay = useMemo(() => {
    const maxDay = daysInMonth(draftStart.year, draftStart.month);
    const maxD = (draftStart.year === draftEnd.year && draftStart.month === draftEnd.month)
      ? draftEnd.day : maxDay;
    return Math.min(draftStart.day, Math.min(maxD, maxDay));
  }, [draftStart.year, draftStart.month, draftStart.day, draftEnd.year, draftEnd.month, draftEnd.day]);

  const safeEndDay = useMemo(() => {
    const maxDay = daysInMonth(draftEnd.year, draftEnd.month);
    const minD = (draftStart.year === draftEnd.year && draftStart.month === draftEnd.month)
      ? draftStart.day : 1;
    return Math.max(draftEnd.day, minD);
  }, [draftStart.year, draftStart.month, draftStart.day, draftEnd.year, draftEnd.month, draftEnd.day]);

  // Update start with clamping
  const updateStartYear = useCallback((y) => {
    setDraftStart((prev) => {
      let month = prev.month;
      let day = prev.day;
      if (y === draftEnd.year && month > draftEnd.month) month = draftEnd.month;
      const maxDay = daysInMonth(y, month);
      const maxD = (y === draftEnd.year && month === draftEnd.month) ? draftEnd.day : maxDay;
      if (day > Math.min(maxD, maxDay)) day = Math.min(maxD, maxDay);
      return { year: y, month, day };
    });
  }, [draftEnd.year, draftEnd.month, draftEnd.day]);

  const updateStartMonth = useCallback((m) => {
    setDraftStart((prev) => {
      let day = prev.day;
      const maxDay = daysInMonth(prev.year, m);
      const maxD = (prev.year === draftEnd.year && m === draftEnd.month) ? draftEnd.day : maxDay;
      if (day > Math.min(maxD, maxDay)) day = Math.min(maxD, maxDay);
      return { ...prev, month: m, day };
    });
  }, [draftEnd.year, draftEnd.month, draftEnd.day]);

  const updateStartDay = useCallback((d) => {
    setDraftStart((prev) => ({ ...prev, day: d }));
  }, []);

  const updateEndYear = useCallback((y) => {
    setDraftEnd((prev) => {
      let month = prev.month;
      let day = prev.day;
      if (y === draftStart.year && month < draftStart.month) month = draftStart.month;
      const maxDay = daysInMonth(y, month);
      const minD = (y === draftStart.year && month === draftStart.month) ? draftStart.day : 1;
      if (day < minD) day = minD;
      return { year: y, month, day };
    });
  }, [draftStart.year, draftStart.month, draftStart.day]);

  const updateEndMonth = useCallback((m) => {
    setDraftEnd((prev) => {
      let day = prev.day;
      const maxDay = daysInMonth(prev.year, m);
      const minD = (prev.year === draftStart.year && m === draftStart.month) ? draftStart.day : 1;
      if (day < minD) day = minD;
      if (day > maxDay) day = maxDay;
      return { ...prev, month: m, day };
    });
  }, [draftStart.year, draftStart.month, draftStart.day]);

  const updateEndDay = useCallback((d) => {
    setDraftEnd((prev) => ({ ...prev, day: d }));
  }, []);

  const handleConfirm = useCallback(() => {
    const s = `${draftStart.year}-${pad(draftStart.month)}-${pad(safeStartDay)}`;
    const e = `${draftEnd.year}-${pad(draftEnd.month)}-${pad(safeEndDay)}`;
    if (s > e) {
      alert(t('common.tip'), t('schedule.endDateBeforeStart'));
      return;
    }
    onRangeChange({ startDate: s, endDate: e });
    setOpen(false);
  }, [draftStart, draftEnd, safeStartDay, safeEndDay, onRangeChange, alert]);

  // Display text for the pill
  const displayText = useMemo(() => {
    if (!startDate && !endDate) return t('common.selectDateRange');
    const s = startDate || '--';
    const e = endDate || '--';
    return `${s}~${e}`;
  }, [startDate, endDate, t]);

  return (
    <View style={styles.wrap}>
      {/* Dimension toggle */}
      <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
        {DIM_KEYS.map((dim) => {
          const active = dimension === dim;
          return (
            <Pressable
              key={dim}
              style={[
                styles.segBtn,
                active && { backgroundColor: Colors.purple, borderRadius: Radius.pill },
              ]}
              onPress={() => onDimensionChange(dim)}
            >
              <Text
                style={[
                  styles.segBtnText,
                  { color: active ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
                ]}
              >
                {t(DIM_LABELS[dim])}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date range pill — hidden when "all" */}
      {dimension !== 'all' && (
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
      )}

      {/* Bottom-sheet date range picker */}
      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable
              style={[styles.overlay, { backgroundColor: Colors.overlay }]}
              onPress={() => setOpen(false)}
            />
            <View style={[styles.panel, { backgroundColor: Colors.card }]}>
              <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                  {t('common.selectDateRange')}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                    {t('common.confirm')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.pickerBody}>
                <View style={styles.dualCol}>
                  {/* Start date column */}
                  <View style={styles.colHalf}>
                    <Text style={[styles.colLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                      {t('common.startDate')}
                    </Text>
                    <View style={styles.colsRow}>
                      <WheelColumn
                        items={startYearItems}
                        selected={draftStart.year}
                        onChange={updateStartYear}
                        width={64}
                      />
                      <WheelColumn
                        items={startMonthItems}
                        selected={draftStart.month}
                        onChange={updateStartMonth}
                        width={52}
                      />
                      <WheelColumn
                        items={startDayItems}
                        selected={safeStartDay}
                        onChange={updateStartDay}
                        width={52}
                      />
                    </View>
                  </View>

                  <View style={[styles.colDivider, { backgroundColor: Colors.cardBorder }]} />

                  {/* End date column */}
                  <View style={styles.colHalf}>
                    <Text style={[styles.colLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                      {t('common.endDate')}
                    </Text>
                    <View style={styles.colsRow}>
                      <WheelColumn
                        items={endYearItems}
                        selected={draftEnd.year}
                        onChange={updateEndYear}
                        width={64}
                      />
                      <WheelColumn
                        items={endMonthItems}
                        selected={draftEnd.month}
                        onChange={updateEndMonth}
                        width={52}
                      />
                      <WheelColumn
                        items={endDayItems}
                        selected={safeEndDay}
                        onChange={updateEndDay}
                        width={52}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  triggerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  // ── Bottom sheet ──
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerBtnConfirm: {
    fontSize: 15,
    lineHeight: 22,
  },
  pickerBody: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dualCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colHalf: {
    flex: 1,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  },
  colLabel: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  colsRow: {
    flexDirection: 'row',
    gap: 4,
  },
});