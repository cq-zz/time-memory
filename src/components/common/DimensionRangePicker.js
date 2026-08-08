import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import ChartRangePicker from './ChartRangePicker';
import { PeriodPicker } from '../home/SpendingDetail';

/**
 * Dimension toggle (全部/年/月/周) + date range picker.
 * Capsule buttons use flexWrap: when the row is too wide, they
 * automatically wrap to the next line so nothing overflows.
 */
export default function DimensionRangePicker({
  dimension = 'month',
  startYear,
  startMonth,
  endYear,
  endMonth,
  year,
  week,
  onDimensionChange,
  onRangeChange,
  onWeekChange,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  const DIMENSIONS = ['all', 'year', 'month', 'week'];

  const dimLabel = (dim) => {
    if (dim === 'all') return t('common.all');
    if (dim === 'week') return t('home.weekDimension');
    if (dim === 'month') return t('home.monthDimension');
    return t('home.yearDimension');
  };

  return (
    <View style={styles.wrap}>
      {/* Dimension toggle capsules */}
      <View style={[styles.segmented, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
        {DIMENSIONS.map((dim) => {
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
                {dimLabel(dim)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Date range picker — hidden when "all" is selected */}
      {dimension !== 'all' && dimension !== 'week' && (
        <ChartRangePicker
          startYear={startYear}
          startMonth={startMonth}
          endYear={endYear}
          endMonth={endMonth}
          yearOnly={dimension === 'year'}
          onConfirm={onRangeChange}
        />
      )}
      {/* Single week picker (same as spending detail) */}
      {dimension === 'week' && (
        <PeriodPicker
          dimension="week"
          year={year}
          month={null}
          day={null}
          week={week}
          onChange={(y, m, d, w) => onWeekChange(y, w)}
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