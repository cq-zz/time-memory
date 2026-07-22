import { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { listDurables, effectiveStatus as durableStatus } from '../../services/durable';
import { listAssets, effectiveStatus as assetStatus, displayValue } from '../../services/asset';

function Glow({ size, color, opacity, style }) {
  return (
    <View style={[{ position: 'absolute', width: size, height: size }, style]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={`glow-${color}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#glow-${color})`} />
      </Svg>
    </View>
  );
}

export default function FinancialSummary() {
  const { Colors, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const currency = useSettingsStore((s) => s.settings.currency);
  const [summary, setSummary] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([listDurables(), listAssets()])
        .then(([durables, assets]) => {
          if (!active) return;
          const total =
            durables
              .filter((r) => durableStatus(r) === 'in_use')
              .reduce((sum, r) => sum + (Number(r.purchase_price) || 0), 0) +
            assets
              .filter((r) => assetStatus(r) === 'active')
              .reduce((sum, r) => sum + displayValue(r), 0);
          const hasData =
            durables.some((r) => durableStatus(r) === 'in_use') ||
            assets.some((r) => assetStatus(r) === 'active');
          setSummary({ total, hasData });
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
      {/* Decorative glows */}
      <Glow size={128} color="#F28B50" opacity={0.25} style={{ top: -48, right: -40 }} />
      <Glow size={96} color={Colors.purple} opacity={0.25} style={{ bottom: -24, left: -32 }} />

      <View style={styles.content}>
        <Text style={[styles.label, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
          {t('butler.totalAssetValue').toUpperCase()}
        </Text>
        <Text style={[styles.amount, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {summary?.hasData ? formatMoney(summary.total, currency) : '--'}
        </Text>
        <Text
          style={[styles.desc, { color: Colors.white60, fontFamily: Fonts.regular }]}
          numberOfLines={1}
        >
          {t('butler.totalAssetValueHint')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 32,
    overflow: 'hidden',
  },
  content: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    opacity: 0.6,
  },
  amount: {
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: -0.72,
  },
  desc: {
    fontSize: 11,
    lineHeight: 16,
  },
});
