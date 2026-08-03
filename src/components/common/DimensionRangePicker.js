import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ChartRangePicker from './ChartRangePicker';

/**
 * Dimension toggle (年/月) + date range picker.
 * When dimension is 'year', ChartRangePicker opens in yearOnly mode.
 * When dimension is 'month', it opens in year-month mode.
 */
export default function DimensionRangePicker({
  dimension = 'month',
  startYear,
  startMonth,
  endYear,
  endMonth,
  onDimensionChange,
  onRangeChange,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      {/* Dimension toggle */}
      <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
        {['year', 'month'].map((dim) => {
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
                  {
                    color: active ? Colors.white : Colors.textSecondary,
                    fontFamily: Fonts.bold,
                  },
                ]}
              >
                {dim === 'month' ? t('home.monthDimension') : t('home.yearDimension')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date range picker */}
      <ChartRangePicker
        startYear={startYear}
        startMonth={startMonth}
        endYear={endYear}
        endMonth={endMonth}
        yearOnly={dimension === 'year'}
        onConfirm={onRangeChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
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