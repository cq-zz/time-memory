import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { hexToRgba, useTheme } from '../../utils/theme';

export default function HeroCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { borderRadius: Radius.xl }, Shadows.dark]}>
      <LinearGradient
        colors={[Colors.inkDeep, hexToRgba(Colors.purple, 0.78)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.circleOuter, { borderColor: Colors.white10 }]} />
      <View style={[styles.circleInner, { borderColor: Colors.white10 }]} />
      <View style={[styles.sparkleOrb, { backgroundColor: Colors.white10, borderColor: Colors.white10 }]}>
        <Ionicons name="hourglass-outline" size={28} color={Colors.white} />
      </View>
      <Text style={[styles.monogram, { color: Colors.white10, fontFamily: Fonts.bold }]}>TM</Text>

      <View style={styles.content}>
        <View style={styles.kickerRow}>
          <View style={[styles.kickerDot, { backgroundColor: Colors.peach }]} />
          <Text style={[styles.kicker, { color: Colors.white60, fontFamily: Fonts.bold }]}>
            {t('home.heroKicker')}
          </Text>
        </View>
        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {t('home.heroSlogan')}
        </Text>
        <Text style={[styles.subtitle, { color: Colors.white60, fontFamily: Fonts.regular }]}>
          {t('home.heroSubtitle')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 150,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  content: {
    width: '70%',
    padding: 20,
    gap: 8,
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kickerDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  kicker: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.1,
  },
  sparkleOrb: {
    position: 'absolute',
    right: 28,
    top: 30,
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  monogram: {
    position: 'absolute',
    right: 24,
    bottom: -18,
    fontSize: 76,
    lineHeight: 88,
    letterSpacing: -6,
  },
  circleOuter: {
    position: 'absolute',
    top: -66,
    right: -66,
    width: 220,
    height: 220,
    borderRadius: 9999,
    borderWidth: 1,
  },
  circleInner: {
    position: 'absolute',
    top: -44,
    right: -44,
    width: 176,
    height: 176,
    borderRadius: 9999,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
});
