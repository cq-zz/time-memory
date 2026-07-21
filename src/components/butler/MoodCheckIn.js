import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../utils/theme';

const MOODS = ['🤩', '😊', '😐', '😕', '😤'];

export default function MoodCheckIn() {
  const { Colors, Fonts } = useTheme();
  const [selected, setSelected] = useState(1);

  return (
    <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        HOW ARE YOU FEELING TODAY?
      </Text>

      <View style={styles.emojiRow}>
        {MOODS.map((mood, i) => {
          const isActive = i === selected;
          return (
            <TouchableOpacity
              key={mood}
              style={styles.emojiBtn}
              activeOpacity={0.7}
              onPress={() => setSelected(i)}
            >
              <Text style={[styles.emoji, isActive && styles.emojiActive]}>{mood}</Text>
              {isActive ? (
                <View style={[styles.activeDot, { backgroundColor: Colors.orange }]} />
              ) : (
                <View style={[styles.dot, { backgroundColor: Colors.lightGray }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 32,
    gap: 16,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  emojiBtn: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
  },
  emojiActive: {
    fontSize: 30,
    lineHeight: 36,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
    shadowColor: '#F28B50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
});
