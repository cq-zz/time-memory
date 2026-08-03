import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import SpendingDetail from './SpendingDetail';

/* ── Combined spending details (expense + income) with shared controls ── */
export default function SpendingDetails({ bills = [] }) {
  const { Colors, Fonts, Radius } = useTheme();
  const { t } = useTranslation();

  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  const [dimension, setDimension] = useState('month');
  const [year, setYear] = useState(curYear);
  const [month, setMonth] = useState(curMonth);

  const handleDimensionChange = useCallback((dim) => {
    setDimension(dim);
    if (dim === 'year') {
      setYear(curYear);
      setMonth(null);
    } else {
      setYear(curYear);
      setMonth(curMonth);
    }
  }, [curYear, curMonth]);

  return (
    <View style={styles.wrapper}>
      {/* Shared big title */}
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {t('spendingDetail.title')}
      </Text>

      {/* Shared controls */}
      <View style={styles.controls}>
        <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
          {['year', 'month'].map((dim) => {
            const active = dimension === dim;
            return (
              <Pressable
                key={dim}
                style={[styles.segBtn, active && { backgroundColor: Colors.purple, borderRadius: Radius.pill }]}
                onPress={() => handleDimensionChange(dim)}
              >
                <Text style={[styles.segBtnText, { color: active ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold }]}>
                  {dim === 'month' ? t('home.monthDimension') : t('home.yearDimension')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Tables */}
      <SpendingDetail bills={bills} billType="expense" year={year} month={month} dimension={dimension} hideControls hideTitle />
      <SpendingDetail bills={bills} billType="income" year={year} month={month} dimension={dimension} hideControls hideTitle />
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
});