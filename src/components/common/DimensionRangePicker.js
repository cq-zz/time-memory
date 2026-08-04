import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ChartRangePicker from './ChartRangePicker';

/**
 * Dimension toggle (全部/年/月) + date range picker.
 * Capsule buttons use flexWrap: when the row is too wide, they
 * automatically wrap to the next line so nothing overflows.
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
      {/* Dimension toggle capsules */}
      <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
        {['all', 'year', 'month'].map((dim) => {
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
                {dim === 'all' ? t('common.all') : dim === 'month' ? t('home.monthDimension') : t('home.yearDimension')}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date range picker — hidden when "all" is selected */}
      {dimension !== 'all' && (
        <ChartRangePicker
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
          yearOnly={dimension === 'year'}
          onConfirm={onRangeChange}
        />
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
});