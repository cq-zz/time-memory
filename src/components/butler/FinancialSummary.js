import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../utils/theme';

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

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
      {/* Decorative glows */}
      <Glow size={128} color="#F28B50" opacity={0.25} style={{ top: -48, right: -40 }} />
      <Glow size={96} color="#6B5CE7" opacity={0.25} style={{ bottom: -24, left: -32 }} />

      <View style={styles.content}>
        <Text style={[styles.label, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
          TOTAL ASSET VALUE
        </Text>
        <Text style={[styles.amount, { color: Colors.white, fontFamily: Fonts.bold }]}>
          $124,509.32
        </Text>
        <Text
          style={[styles.desc, { color: Colors.white60, fontFamily: Fonts.regular }]}
          numberOfLines={1}
        >
          Total purchase price of all active items and assets
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
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
