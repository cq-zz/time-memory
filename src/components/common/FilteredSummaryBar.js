import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

export default function FilteredSummaryBar({
  label,
  value,
  activeCount,
  activeLabel,
  totalCount,
}) {
  const { Colors, Fonts, Radius } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors.card,
          borderColor: Colors.cardBorder,
          borderRadius: Radius.md,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: Colors.purpleTint }]}>
        <Ionicons name="filter-outline" size={15} color={Colors.purple} />
      </View>

      <View style={styles.valueBlock}>
        <Text style={[styles.eyebrow, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          {label}
        </Text>
        <Text
          style={[styles.value, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: Colors.cardBorder }]} />

      <View style={styles.countBlock}>
        <Text style={[styles.count, { color: Colors.green, fontFamily: Fonts.bold }]}>
          {activeCount}
        </Text>
        <Text style={[styles.countLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {activeLabel}
        </Text>
      </View>

      <View style={styles.countBlock}>
        <Text style={[styles.count, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {totalCount}
        </Text>
        <Text style={[styles.countLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('common.total')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  valueBlock: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  divider: {
    width: 1,
    height: 28,
    marginHorizontal: 10,
  },
  countBlock: {
    minWidth: 38,
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    lineHeight: 17,
  },
  countLabel: {
    fontSize: 9,
    lineHeight: 12,
  },
});
