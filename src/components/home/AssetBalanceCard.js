import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { effectiveStatus as durableStatus } from '../../services/durable';
import { effectiveStatus as assetStatus, displayValue } from '../../services/asset';

export default function AssetBalanceCard({ durables = [], assets = [] }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);

  const inUse = durables.filter((r) => durableStatus(r) === 'in_use');
  const active = assets.filter((r) => assetStatus(r) === 'active');
  const total =
    inUse.reduce((sum, r) => sum + (Number(r.purchase_price) || 0), 0) +
    active.reduce((sum, r) => sum + displayValue(r), 0);
  const hasData = inUse.length > 0 || active.length > 0;

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
      {/* Glass effect gradient */}
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.glassEffect}
      />

      <Text style={[styles.label, { color: Colors.white60, fontFamily: Fonts.bold }]}>
        {t('home.assetValue').toUpperCase()}
      </Text>
      <Text style={[styles.amount, { color: Colors.white, fontFamily: Fonts.bold }]}>
        {hasData ? formatMoney(total, currency) : '--'}
      </Text>
      <View style={styles.descWrap}>
        <Text style={[styles.desc, { color: Colors.white40, fontFamily: Fonts.regular }]}>
          {t('home.assetValueHint')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    paddingBottom: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassEffect: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 210,
    height: 184,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.32,
    textAlign: 'center',
  },
  descWrap: {
    paddingTop: 4,
    alignItems: 'center',
  },
  desc: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
