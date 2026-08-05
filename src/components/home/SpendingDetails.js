import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import SpendingDetail, { PeriodPicker } from './SpendingDetail';

/* ── Combined spending details (expense + income) with shared controls ── */
export default function SpendingDetails({ bills = [] }) {
  const { Colors, Fonts, Radius } = useTheme();
  const { t } = useTranslation();

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();

  const [dimension, setDimension] = useState('month');
  const [year, setYear] = useState(curYear);
  const [month, setMonth] = useState(curMonth);
  const [day, setDay] = useState(null);

  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    if (dim === 'year') {
      setYear(curYear);
      setMonth(null);
      setDay(null);
    } else if (dim === 'day') {
      setYear(curYear);
      setMonth(curMonth);
      setDay(curDay);
    } else {
      setYear(curYear);
      setMonth(curMonth);
      setDay(null);
    }
  }, [curYear, curMonth, curDay]);

  const handlePeriodChange = useCallback((y, m, d) => {
    setYear(y);
    setMonth(m);
    setDay(d);
  }, []);

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
          {['year', 'month', 'day'].map((dim) => {
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

      {/* Expense sub-section */}
      <View style={styles.subSection}>
        <Text style={[styles.subTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('spendingDetail.expenseTitle')}
        </Text>
        <SpendingDetail bills={bills} billType="expense" year={year} month={month} day={day} dimension={dimension} hideControls hideTitle />
      </View>

      {/* Income sub-section */}
      <View style={styles.subSection}>
        <Text style={[styles.subTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('spendingDetail.incomeTitle')}
        </Text>
        <SpendingDetail bills={bills} billType="income" year={year} month={month} day={day} dimension={dimension} hideControls hideTitle />
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