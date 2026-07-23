import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

export default function HeroCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
      {/* Decorative circles */}
      <View style={[styles.circleOuter, { borderColor: Colors.white05 }]} />
      <View style={[styles.circleInner, { borderColor: Colors.white10 }]} />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
        style={[styles.title, { color: Colors.white, fontFamily: Fonts.bold }]}
      >
        {t('home.heroSlogan')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    paddingBottom: 14,
    overflow: 'hidden',
  },
  circleOuter: {
    position: 'absolute',
    top: -48,
    right: -48,
    width: 192,
    height: 192,
    borderRadius: 9999,
    borderWidth: 1,
  },
  circleInner: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 160,
    height: 160,
    borderRadius: 9999,
    borderWidth: 1,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
  },
});
