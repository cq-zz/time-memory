import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function HeroCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
      {/* Decorative circles */}
      <View style={[styles.circleOuter, { borderColor: Colors.white05 }]} />
      <View style={[styles.circleInner, { borderColor: Colors.white10 }]} />

      <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.bold }]}>
        Track your life's{'\n'}precious moments.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    paddingBottom: 30,
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
    fontSize: 28,
    lineHeight: 35,
  },
});
