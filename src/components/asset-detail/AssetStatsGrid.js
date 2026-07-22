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

export default function AssetStatsGrid({
  categoryLabel,
  categoryIcon,
  sourceText,
  purchaseDateText,
  purchasePriceText,
  companionText,
}) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* 2x2 stats grid */}
      <View style={styles.gridBlock}>
        <View style={styles.row}>
          <StatCard label={t('detail.category')} value={categoryLabel} icon={categoryIcon} iconColor={Colors.purple} />
          <StatCard label={t('detail.source')} value={sourceText} />
        </View>
        <View style={styles.row}>
          <StatCard label={t('detail.purchaseDate')} value={purchaseDateText} />
          <StatCard label={t('detail.price')} value={purchasePriceText} />
        </View>
      </View>

      {/* Owned / companion time hero card */}
      <View style={[styles.ownedCard, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
        <View style={styles.ownedTop}>
          <Text style={[styles.ownedLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>{t('detail.owned')}</Text>
          <View style={[styles.ownedIconBox, { backgroundColor: Colors.white10, borderRadius: Radius.circle }]}>
            <Ionicons name="hourglass-outline" size={22} color={Colors.white} />
          </View>
        </View>
        <Text
          style={[styles.ownedValue, { color: Colors.white, fontFamily: Fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {companionText}
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
  ownedCard: {
    padding: 24,
    gap: 12,
  },
  ownedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownedLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ownedIconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
