import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';

export default function LinkedAsset({ asset, currency }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  if (!asset) return null;

  const value = asset.current_price != null && asset.current_price !== ''
    ? asset.current_price
    : asset.purchase_price;

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.heading}>
        <Ionicons name="link-outline" size={18} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('durable.linkedAsset')}
        </Text>
      </View>

      {/* Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={[styles.thumb, { backgroundColor: Colors.iconBg, borderRadius: Radius.xl }]}>
          <Ionicons name="wallet-outline" size={26} color={Colors.textSecondary} />
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.regular }]} numberOfLines={1}>
            {asset.name}
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {value != null && value !== '' ? formatMoney(value, currency) : '--'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingText: {
    fontSize: 20,
    lineHeight: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
});
