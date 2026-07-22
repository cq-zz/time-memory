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
        {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
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
  expiryDateText,
  currentValueText,
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
        <View style={styles.row}>
          <StatCard label={t('asset.expiryDate')} value={expiryDateText} />
          <StatCard label={t('detail.currentValue')} value={currentValueText} />
        </View>
      </View>

      {/* Owned / companion time hero card */}
      <View
        style={[
          styles.ownedCard,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={styles.ownedTop}>
          <Text style={[styles.ownedLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{t('detail.owned')}</Text>
          <View style={[styles.ownedIconBox, { backgroundColor: Colors.iconBg, borderRadius: Radius.circle }]}>
            <Ionicons name="hourglass-outline" size={20} color={Colors.textPrimary} />
          </View>
        </View>
        <Text
          style={[styles.ownedValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}
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
    gap: 16,
  },
  gridBlock: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
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
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  ownedCard: {
    padding: 16,
    gap: 6,
    borderWidth: 1,
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
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownedValue: {
    fontSize: 20,
    lineHeight: 26,
  },
});
