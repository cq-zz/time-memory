import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../utils/theme';

function CountMetric({ value, label, color, fonts }) {
  return (
    <View style={styles.countMetric}>
      <Text style={[styles.countValue, { color, fontFamily: fonts.bold }]}>{value}</Text>
      <Text
        style={[styles.countLabel, { color: 'rgba(255,255,255,0.58)', fontFamily: fonts.semiBold }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function ModuleOverviewCard({
  label,
  value,
  activeCount,
  activeLabel,
  archivedCount,
  archivedLabel,
}) {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
      <View style={styles.valueBlock}>
        <Text style={[styles.label, { color: Colors.white, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[styles.value, { color: Colors.white, fontFamily: Fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
        >
          {value}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: Colors.white10 }]} />

      <View style={styles.counts}>
        <CountMetric value={activeCount} label={activeLabel} color={Colors.green} fonts={Fonts} />
        <CountMetric value={archivedCount} label={archivedLabel} color={Colors.white} fonts={Fonts} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueBlock: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
    opacity: 0.68,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.44,
  },
  divider: {
    width: 1,
    height: 42,
    marginHorizontal: 14,
  },
  counts: {
    flexDirection: 'row',
    gap: 14,
  },
  countMetric: {
    minWidth: 38,
    alignItems: 'center',
  },
  countValue: {
    fontSize: 18,
    lineHeight: 24,
  },
  countLabel: {
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.3,
  },
});
