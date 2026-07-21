import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const MOODS = [
  { emoji: '😔', offset: 36 },
  { emoji: '😐', offset: 16 },
  { emoji: '😠', offset: 52 },
  { emoji: '😄', offset: 8 },
  { emoji: '😊', offset: 0 },
];

export default function MoodTrend() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        Mood Trend
      </Text>

      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        {/* Emoji trend row */}
        <View style={styles.emojiRow}>
          {MOODS.map((mood, i) => (
            <View key={i} style={[styles.emojiCol, { paddingBottom: mood.offset }]}>
              <Text style={styles.emoji}>{mood.emoji}</Text>
            </View>
          ))}
        </View>

        {/* Insight row */}
        <TouchableOpacity style={styles.insightRow} activeOpacity={0.7}>
          <View style={styles.insightLeft}>
            <View style={[styles.insightIcon, { backgroundColor: 'rgba(242, 139, 80, 0.1)' }]}>
              <Ionicons name="flame" size={20} color={Colors.orange} />
            </View>
            <View style={styles.insightText}>
              <Text style={[styles.insightTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                High Focus
              </Text>
              <Text style={[styles.insightDesc, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                Peak productivity at 10 AM
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 24,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 128,
    paddingHorizontal: 8,
  },
  emojiCol: {
    justifyContent: 'flex-end',
  },
  emoji: {
    fontSize: 24,
    lineHeight: 30,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightText: {
    gap: 1,
  },
  insightTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  insightDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
