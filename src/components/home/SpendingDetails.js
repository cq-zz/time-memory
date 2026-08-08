import { useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import SpendingDetail, { PeriodPicker, getWeekNumber } from './SpendingDetail';

const DIMENSIONS = ['year', 'month', 'week', 'day'];

/* ── Combined spending details (expense + income) with shared controls ── */
export default function SpendingDetails({ bills = [] }) {
  const { Colors, Fonts, Radius } = useTheme();
  const { t } = useTranslation();
  const weekStartDay = useSettingsStore((s) => s.settings.weekStartDay);

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();
  const curWeek = useMemo(() => getWeekNumber(now, weekStartDay), [weekStartDay]);

  const [dimension, setDimension] = useState('week');
  const [year, setYear] = useState(curYear);
  const [month, setMonth] = useState(curMonth);
  const [day, setDay] = useState(null);
  const [week, setWeek] = useState(curWeek);

  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    setWeek(null);
    if (dim === 'year') {
      setYear(curYear);
      setMonth(null);
      setDay(null);
    } else if (dim === 'week') {
      setYear(curYear);
      setMonth(null);
      setDay(null);
      setWeek(curWeek);
    } else if (dim === 'day') {
      setYear(curYear);
      setMonth(curMonth);
      setDay(curDay);
    } else {
      // month
      setYear(curYear);
      setMonth(curMonth);
      setDay(null);
    }
  }, [curYear, curMonth, curDay, curWeek]);

  const handlePeriodChange = useCallback((y, m, d, w) => {
    setYear(y);
    setMonth(m);
    setDay(d);
    if (w !== undefined) setWeek(w);
  }, []);

  const dimLabel = (dim) => {
    if (dim === 'day') return t('home.dayDimension');
    if (dim === 'week') return t('home.weekDimension');
    if (dim === 'month') return t('home.monthDimension');
    return t('home.yearDimension');
  };

  return (
    <View style={styles.wrapper}>
      {/* Shared big title */}
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('spendingDetail.title')}
      </Text>

      {/* Hint */}
      <Text style={[styles.hint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
        {t('spendingDetail.hint')}
      </Text>

      {/* Shared controls */}
      <View style={styles.controls}>
        <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
          {DIMENSIONS.map((dim) => {
            const active = dimension === dim;
            return (
              <Pressable
                key={dim}
                style={[styles.segBtn, active && { backgroundColor: Colors.purple, borderRadius: Radius.pill }]}
                onPress={() => handleDimensionChange(dim)}
              >
                <Text style={[styles.segBtnText, { color: active ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold }]}>
                  {dimLabel(dim)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <PeriodPicker
          dimension={dimension}
          year={year}
          month={month}
          day={day}
          week={week}
          onChange={handlePeriodChange}
        />
      </View>

      {/* Expense sub-section */}
      <View style={styles.subSection}>
        <Text style={[styles.subTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('spendingDetail.expenseTitle')}
        </Text>
        <SpendingDetail bills={bills} billType="expense" year={year} month={month} day={day} week={week} dimension={dimension} hideControls hideTitle />
      </View>

      {/* Income sub-section */}
      <View style={styles.subSection}>
        <Text style={[styles.subTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('spendingDetail.incomeTitle')}
        </Text>
        <SpendingDetail bills={bills} billType="income" year={year} month={month} day={day} week={week} dimension={dimension} hideControls hideTitle />
      </View>
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
  hint: {
    fontSize: 11,
    lineHeight: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmented: {
    flexDirection: 'row',
    padding: 2,
    gap: 2,
  },
  segBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  segBtnText: {
    fontSize: 12,
    lineHeight: 18,
  },
  subSection: {
    gap: 8,
  },
  subTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
});