import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, icon, iconColor }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {label}
      </Text>
      <View style={styles.statValueRow}>
        {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
        <Text
          style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function DarkStatCard({ label, value }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
      <Text style={[styles.statLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>{label}</Text>
      <Text
        style={[styles.statValue, { color: Colors.white, fontFamily: Fonts.semiBold }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

export default function StatsGrid({
  categoryLabel,
  categoryIcon,
  purchaseDateText,
  dailyCostText,
  companionText,
  expectedDailyText,
  percent,
  lifespanNoteText,
}) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const hasProgress = percent != null;

  return (
    <View style={styles.container}>
      {/* 2x2 stats grid */}
      <View style={styles.gridBlock}>
        <View style={styles.row}>
          <StatCard label={t('detail.category')} value={categoryLabel} icon={categoryIcon} iconColor={Colors.purple} />
          <StatCard label={t('detail.purchaseDate')} value={purchaseDateText} />
        </View>
        <View style={styles.row}>
          <StatCard label={t('detail.dailyCost')} value={dailyCostText} />
          <DarkStatCard label={t('detail.companionTime')} value={companionText} />
        </View>
      </View>

      {/* Expected daily cost hero card */}
      <View
        style={[
          styles.dailyCard,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={styles.dailyTop}>
          <View style={styles.dailyLeft}>
            <Text style={[styles.dailyLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {t('detail.expectedDailyCost')}
            </Text>
            <View style={styles.dailyValueRow}>
              <Text style={[styles.dailyValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                {expectedDailyText}
              </Text>
              <Text style={[styles.dailyUnit, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {t('detail.perDay')}
              </Text>
            </View>
          </View>
          <View style={[styles.dailyIconBox, { backgroundColor: Colors.iconBg, borderRadius: Radius.circle }]}>
            <Ionicons name="trending-down" size={24} color={Colors.textPrimary} />
          </View>
        </View>

        <View style={[styles.dailyTrack, { backgroundColor: Colors.iconBg, borderRadius: Radius.pill }]}>
          <View
            style={[
              styles.dailyFill,
              {
                backgroundColor: Colors.purple,
                borderRadius: Radius.pill,
                width: `${hasProgress ? percent : 0}%`,
              },
            ]}
          />
        </View>

        <Text style={[styles.dailyNote, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {lifespanNoteText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  gridBlock: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    height: 90,
    padding: 20,
    gap: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 28,
    flexShrink: 1,
  },
  dailyCard: {
    padding: 24,
    gap: 8,
    borderWidth: 1,
  },
  dailyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
  },
  dailyLeft: {
    flex: 1,
    gap: 4,
  },
  dailyLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dailyValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  dailyValue: {
    fontSize: 28,
    lineHeight: 34,
  },
  dailyUnit: {
    fontSize: 14,
    lineHeight: 22,
  },
  dailyIconBox: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyTrack: {
    height: 4,
    overflow: 'hidden',
  },
  dailyFill: {
    height: 4,
  },
  dailyNote: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
