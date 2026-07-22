import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function ModuleStatsCard({ label, value, pills = [] }) {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: Colors.inkDeep }, Shadows.dark]}>
      <View style={styles.content}>
        <Text style={[styles.label, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: Colors.white, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <View style={styles.pillsWrap}>
        <View style={styles.pillsRow}>
          {pills.map((pill, index) => (
            <View
              key={pill.key ?? index}
              style={[styles.pill, { backgroundColor: pill.backgroundColor ?? Colors.white10 }]}
            >
              <Text
                style={[
                  styles.pillText,
                  {
                    color: pill.color ?? 'rgba(255, 255, 255, 0.7)',
                    fontFamily: Fonts.bold,
                  },
                ]}
              >
                {pill.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 32,
  },
  content: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    opacity: 0.7,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.64,
  },
  pillsWrap: {
    paddingTop: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 9999,
  },
  pillText: {
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
});
