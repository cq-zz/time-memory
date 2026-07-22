import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';

export default function DurablesStats({ stats, currency }) {
  const { Colors, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();

  const value = stats ? formatMoney(stats.inUseValue, currency) : '--';
  const inUseCount = stats ? stats.inUseCount : '--';
  const totalCount = stats ? stats.totalCount : '--';

  return (
    <View style={styles.container}>
      {/* Featured stat card */}
      <View style={[styles.statCard, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
        <View style={styles.statContent}>
          <Text style={[styles.statLabel, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('durable.inUseTotalValue')}
          </Text>
          <Text style={[styles.statValue, { color: Colors.white, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {value}
          </Text>
        </View>
        <View style={styles.pillsWrap}>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: 'rgba(74, 168, 104, 0.2)' }]}>
              <Text style={[styles.pillText, { color: Colors.green, fontFamily: Fonts.bold }]}>
                {t('durable.inUsePill', { count: inUseCount })}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: Colors.white10 }]}>
              <Text style={[styles.pillText, { color: 'rgba(255, 255, 255, 0.7)', fontFamily: Fonts.bold }]}>
                {t('durable.totalPill', { count: totalCount })}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  statCard: {
    padding: 24,
    borderRadius: 32,
  },
  statContent: {
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  pillsWrap: {
    paddingTop: 16,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
