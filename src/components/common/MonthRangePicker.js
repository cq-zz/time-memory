import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import useAlert from '../../hooks/useAlert';

const pad = (n) => String(n).padStart(2, '0');
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const fmtYm = (y, m) => `${y}/${pad(m)}`;

/**
 * Month-range picker (bottom sheet) — follows ChartRangePicker month-mode style.
 * Always shows dual-column start/end with year nav + month grid.
 * Supports clear-to-null for "query all".
 */
export default function MonthRangePicker({
  startYear,
  startMonth,
  endYear,
  endMonth,
  onChange,
  style,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();
  const [open, setOpen] = useState(false);

  const hasStart = startYear != null && startMonth != null;
  const hasEnd = endYear != null && endMonth != null;
  const hasRange = hasStart || hasEnd;

  const displayText = useMemo(() => {
    if (!hasRange) return t('common.all');
    const startStr = hasStart ? fmtYm(startYear, startMonth) : '';
    const endStr = hasEnd ? fmtYm(endYear, endMonth) : '';
    if (hasStart && hasEnd) return `${startStr} ~ ${endStr}`;
    if (hasStart) return `${startStr} ${t('common.dateRangeFrom')}`;
    return `${t('common.dateRangeTo')} ${endStr}`;
  }, [hasStart, hasEnd, startYear, startMonth, endYear, endMonth, t]);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleConfirm = useCallback((result) => {
    onChange(result);
    setOpen(false);
  }, [onChange]);

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.triggerRow}>
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
        {hasRange && (
          <Pressable
            style={({ pressed }) => [
              styles.clearBtn,
              { backgroundColor: Colors.purpleTint, borderRadius: Radius.pill },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onChange({ startYear: null, startMonth: null, endYear: null, endMonth: null })}
          >
            <Ionicons name="close-circle" size={18} color={Colors.purple} />
          </Pressable>
        )}
      </View>

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
                  {t('common.selectDateRange')}
                </Text>
                <Pressable onPress={() => handleConfirm({ startYear: startYear, startMonth: startMonth, endYear: endYear, endMonth: endMonth })}>
                  <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                    {t('common.confirm')}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.body}>
                <PickerPanel
                  startYear={startYear}
                  startMonth={startMonth}
                  endYear={endYear}
                  endMonth={endMonth}
                  onConfirm={handleConfirm}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function PickerPanel({ startYear, startMonth, endYear, endMonth, onConfirm }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const [locStartYear, setLocStartYear] = useState(startYear ?? curYear);
  const [locStartMonth, setLocStartMonth] = useState(startMonth ?? curMonth);
  const [locEndYear, setLocEndYear] = useState(endYear ?? curYear);
  const [locEndMonth, setLocEndMonth] = useState(endMonth ?? curMonth);

  const handleClear = useCallback(() => {
    onConfirm({ startYear: null, startMonth: null, endYear: null, endMonth: null });
  }, [onConfirm]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      startYear: locStartYear,
      startMonth: locStartMonth,
      endYear: locEndYear,
      endMonth: locEndMonth,
    });
  }, [locStartYear, locStartMonth, locEndYear, locEndMonth, onConfirm]);

  return (
    <>
      <View style={styles.dualCol}>
        <View style={styles.colHalf}>
          <MonthRangeColumn
            label={t('common.startDate')}
            year={locStartYear}
            month={locStartMonth}
            onYearChange={setLocStartYear}
            onMonthChange={(m) => {
              setLocStartMonth(m);
              if (locStartYear === locEndYear && m > locEndMonth) setLocEndMonth(m);
            }}
            clampMaxYear={locEndYear}
            clampMaxMonth={locEndMonth}
          />
        </View>
        <View style={[styles.colDivider, { backgroundColor: Colors.cardBorder }]} />
        <View style={styles.colHalf}>
          <MonthRangeColumn
            label={t('common.endDate')}
            year={locEndYear}
            month={locEndMonth}
            onYearChange={setLocEndYear}
            onMonthChange={(m) => {
              setLocEndMonth(m);
              if (locStartYear === locEndYear && m < locStartMonth) setLocStartMonth(m);
            }}
            clampMinYear={locStartYear}
            clampMinMonth={locStartMonth}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.clearBtn2,
          { borderColor: Colors.cardBorder, borderRadius: Radius.pill },
          pressed && { opacity: 0.7 },
        ]}
        onPress={handleClear}
      >
        <Ionicons name="close-circle-outline" size={18} color={Colors.textSecondary} />
        <Text style={[styles.clearBtnText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('common.clearFilter')}
        </Text>
      </Pressable>
    </>
  );
}

function MonthRangeColumn({ label, year, month, onYearChange, onMonthChange, clampMinYear, clampMaxYear, clampMinMonth, clampMaxMonth }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const [viewYear, setViewYear] = useState(year);

  const monthNames = (t('calendar.monthsShort', { returnObjects: true }) || []).map((l) => l.replace('月', ''));

  useEffect(() => {
    if (clampMaxYear !== undefined && viewYear > clampMaxYear) setViewYear(clampMaxYear);
    if (clampMinYear !== undefined && viewYear < clampMinYear) setViewYear(clampMinYear);
  }, [clampMinYear, clampMaxYear]);

  const effMin = clampMinYear !== undefined ? Math.max(clampMinYear, yearStart) : yearStart;
  const effMax = clampMaxYear !== undefined ? Math.min(clampMaxYear, yearEnd) : yearEnd;

  const months = MONTHS.filter((m) => {
    if (clampMaxYear !== undefined && viewYear === clampMaxYear && clampMaxMonth !== undefined && m > clampMaxMonth) return false;
    if (clampMinYear !== undefined && viewYear === clampMinYear && clampMinMonth !== undefined && m < clampMinMonth) return false;
    return true;
  });

  const rows = [];
  for (let i = 0; i < months.length; i += 3) rows.push(months.slice(i, i + 3));

  return (
    <View style={styles.colHalfInner}>
      <Text style={[styles.colHalfLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {label}
      </Text>
      <View style={styles.yearNav}>
        <Pressable
          onPress={() => setViewYear((y) => Math.max(y - 1, effMin))}
          style={[styles.yearNavBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
        >
          <Ionicons name="chevron-back" size={14} color={Colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => onYearChange(viewYear)}>
          <Text
            style={[
              styles.yearNavTitle,
              { color: Colors.textPrimary, fontFamily: Fonts.bold },
              year === viewYear && { color: Colors.purple },
            ]}
          >
            {viewYear}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewYear((y) => Math.min(y + 1, effMax))}
          style={[styles.yearNavBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
        >
          <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.monthGrid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.monthRow}>
            {row.map((m) => {
              const isActive = year === viewYear && month === m;
              return (
                <Pressable
                  key={m}
                  style={[
                    styles.monthCell,
                    {
                      backgroundColor: isActive ? Colors.purple : Colors.iconBg,
                      borderColor: isActive ? Colors.purple : Colors.cardBorder,
                      borderRadius: Radius.md,
                    },
                  ]}
                  onPress={() => {
                    onYearChange(viewYear);
                    onMonthChange(m);
                  }}
                >
                  <Text
                    style={[
                      styles.monthCellText,
                      { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
                    ]}
                  >
                    {monthNames[m - 1]}
                  </Text>
                </Pressable>
              );
            })}
            {ri === rows.length - 1 &&
              row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`e-${i}`} style={styles.monthCellEmpty} />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  triggerText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  clearBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dualCol: {
    flexDirection: 'row',
    minHeight: 260,
  },
  colHalf: {
    flex: 1,
  },
  colDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  colHalfInner: {
    paddingTop: 8,
  },
  colHalfLabel: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  yearNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yearNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  yearNavTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  monthGrid: {
    gap: 6,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 6,
  },
  monthCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
  },
  monthCellText: {
    fontSize: 13,
    lineHeight: 18,
  },
  monthCellEmpty: {
    flex: 1,
  },
  clearBtn2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  clearBtnText: {
    fontSize: 14,
    lineHeight: 20,
  },
});