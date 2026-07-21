import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../utils/theme';

export default function AssetBalanceCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

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
        TOTAL ASSET VALUE
      </Text>
      <Text style={[styles.amount, { color: Colors.white, fontFamily: Fonts.bold }]}>
        $124,509.32
      </Text>
      <View style={styles.descWrap}>
        <Text style={[styles.desc, { color: Colors.white40, fontFamily: Fonts.regular }]}>
          Total purchase price of all active items{'\n'}and assets.
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
