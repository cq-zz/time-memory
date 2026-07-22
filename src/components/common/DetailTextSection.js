import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function DetailTextSection({ title, text, gap = 12 }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  if (!text) return null;

  return (
    <View style={[styles.section, { gap }]}>
      <Text style={[styles.title, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {title}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <Text style={[styles.text, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
});
