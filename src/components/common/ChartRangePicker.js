import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import useAlert from '../../hooks/useAlert';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const fmtYm = (y, m) => `${y}-${String(m).padStart(2, '0')}`;

/**
 * Start ~ end range picker for charts (bottom sheet).
 * yearOnly=true renders two year columns; otherwise two month columns.
 * Year range follows the global Year Range setting.
 */
export default function ChartRangePicker({
  startYear,
  startMonth,
  endYear,
  endMonth,
  yearOnly = false,
  onConfirm,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();
  const [open, setOpen] = useState(false);

  const [locStartYear, setLocStartYear] = useState(startYear);
  const [locStartMonth, setLocStartMonth] = useState(startMonth);
  const [locEndYear, setLocEndYear] = useState(endYear);
  const [locEndMonth, setLocEndMonth] = useState(endMonth);

  const displayText = useMemo(() => {
    if (yearOnly) return `${startYear} - ${endYear}`;
    return `${fmtYm(startYear, startMonth)} ~ ${fmtYm(endYear, endMonth)}`;
  }, [startYear, startMonth, endYear, endMonth, yearOnly]);

  const handleOpen = useCallback(() => {
    setLocStartYear(startYear);
    setLocStartMonth(startMonth);
    setLocEndYear(endYear);
    setLocEndMonth(endMonth);
    setOpen(true);
  }, [startYear, startMonth, endYear, endMonth]);

  const handleConfirm = useCallback(() => {
    const sy = locStartYear, ey = locEndYear;
    const sm = yearOnly ? null : locStartMonth;
    const em = yearOnly ? null : locEndMonth;
    if (ey < sy || (!yearOnly && ey === sy && (em || 0) < (sm || 1))) {
      alert(t('common.tip'), t('common.dateRangeInvalid'));
      return;
    }
    onConfirm({ startYear: sy, startMonth: sm, endYear: ey, endMonth: em });
    setOpen(false);
  }, [locStartYear, locStartMonth, locEndYear, locEndMonth, yearOnly, onConfirm, alert]);

  return (
    <View style={styles.wrap}>
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
                  {t('common.selectPeriod')}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                    {t('common.confirm')}
                  </Text>
                </Pressable>
              </View>

              {yearOnly ? (
                <YearRangePicker
                  startYear={locStartYear}
                  endYear={locEndYear}
                  onStartChange={setLocStartYear}
                  onEndChange={setLocEndYear}
                />
              ) : (
                <View style={styles.body}>
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
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function YearRangePicker({ startYear, endYear, onStartChange, onEndChange }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const years = [];
  for (let y = yearStart; y <= yearEnd; y++) years.push(y);

  const handleStartTap = (y) => {
    onStartChange(y);
    if (endYear < y) onEndChange(y);
  };

  const handleEndTap = (y) => {
    onEndChange(y);
    if (startYear > y) onStartChange(y);
  };

  const startYears = years.filter((y) => endYear === null || y <= endYear);
  const endYears = years.filter((y) => startYear === null || y >= startYear);

  return (
    <View style={styles.body}>
      <View style={styles.dualCol}>
        <View style={styles.colHalf}>
          <Text style={[styles.colHalfLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('common.startYear')}
          </Text>
          <ScrollView style={styles.yearColScroll} showsVerticalScrollIndicator={false} bounces={false}>
            {startYears.map((y) => (
              <Pressable
                key={y}
                style={[
                  styles.yearColChip,
                  {
                    backgroundColor: startYear === y ? Colors.purple : Colors.iconBg,
                    borderColor: startYear === y ? Colors.purple : Colors.cardBorder,
                    borderRadius: Radius.md,
                  },
                ]}
                onPress={() => handleStartTap(y)}
              >
                <Text
                  style={[
                    styles.yearColChipText,
                    { color: startYear === y ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <View style={[styles.colDivider, { backgroundColor: Colors.cardBorder }]} />
        <View style={styles.colHalf}>
          <Text style={[styles.colHalfLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('common.endYear')}
          </Text>
          <ScrollView style={styles.yearColScroll} showsVerticalScrollIndicator={false} bounces={false}>
            {endYears.map((y) => (
              <Pressable
                key={y}
                style={[
                  styles.yearColChip,
                  {
                    backgroundColor: endYear === y ? Colors.purple : Colors.iconBg,
                    borderColor: endYear === y ? Colors.purple : Colors.cardBorder,
                    borderRadius: Radius.md,
                  },
                ]}
                onPress={() => handleEndTap(y)}
              >
                <Text
                  style={[
                    styles.yearColChipText,
                    { color: endYear === y ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

function MonthRangeColumn({ label, year, month, onYearChange, onMonthChange, clampMinYear, clampMaxYear, clampMinMonth, clampMaxMonth }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const [viewYear, setViewYear] = useState(year);

  const monthNames = t('calendar.monthsShort', { returnObjects: true });

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
  for (let i = 0; i < months.length; i += 4) rows.push(months.slice(i, i + 4));

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
              row.length < 4 &&
              Array.from({ length: 4 - row.length }).map((_, i) => (
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
    alignSelf: 'stretch',
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
    maxHeight: '80%',
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
    marginBottom: 8,
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
  dualCol: {
    flexDirection: 'row',
    minHeight: 260,
    maxHeight: 420,
  },
  colHalf: {
    flex: 1,
  },
  colDivider: {
    width: 1,
    marginHorizontal: 12,
  },
  yearColScroll: {
    flex: 1,
  },
  yearColChip: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  yearColChipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
