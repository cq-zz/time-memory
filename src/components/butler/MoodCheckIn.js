import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../utils/theme';
import { MOODS } from '../../utils/constant';
import { useMoodStore } from '../../store/mood';
import { showToast } from '../common/Toast';

/**
 * Daily mood check-in. Moods come from utils/constant.js (each carries a
 * 1-5 score). Horizontal scroll when the list overflows; tapping saves the
 * mood for today and tapping again re-selects (updates) it.
 */
export default function MoodCheckIn() {
  const { Colors, Fonts, Radius } = useTheme();
  const todayMood = useMoodStore((s) => s.todayMood);
  const saveMood = useMoodStore((s) => s.saveMood);

  const handleSelect = async (mood) => {
    try {
      await saveMood(mood.key);
      showToast(`${mood.emoji} ${mood.label} · Score ${mood.score}/5`);
    } catch (e) {
      console.warn('[mood] save failed:', e);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
      <View style={styles.headRow}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          HOW ARE YOU FEELING TODAY?
        </Text>
        {todayMood ? (
          <Text style={[styles.hint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            Tap to change
          </Text>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {MOODS.map((mood) => {
          const isActive = mood.key === todayMood;
          return (
            <TouchableOpacity
              key={mood.key}
              style={[
                styles.chip,
                { borderRadius: Radius.sm },
                isActive
                  ? { backgroundColor: Colors.purpleTint, borderColor: Colors.purple, borderWidth: 1 }
                  : { borderWidth: 1, borderColor: 'transparent' },
              ]}
              activeOpacity={0.7}
              onPress={() => handleSelect(mood)}
            >
              <Text style={[styles.emoji, isActive && styles.emojiActive]}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.label,
                  { color: Colors.textSecondary, fontFamily: Fonts.regular },
                  isActive && { color: Colors.purple, fontFamily: Fonts.semiBold },
                ]}
                numberOfLines={1}
              >
                {mood.label}
              </Text>
              <Text style={[styles.score, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                {mood.score}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 32,
    gap: 14,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  hint: {
    fontSize: 11,
    lineHeight: 14,
  },
  row: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 10,
    paddingHorizontal: 10,
    minWidth: 64,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  emojiActive: {
    fontSize: 28,
    lineHeight: 34,
  },
  label: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  score: {
    fontSize: 9,
    lineHeight: 12,
    opacity: 0.7,
  },
});
