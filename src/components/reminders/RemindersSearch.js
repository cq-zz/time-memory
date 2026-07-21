import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const FILTERS = ['All', 'Schedule', 'Durable', 'Asset', 'Date'];

export default function RemindersSearch() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const [active, setActive] = useState(0);

  return (
    <View style={styles.container}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>Reminders</Text>
        <Text style={[styles.total, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>12 TOTAL</Text>
      </View>

      {/* Search input */}
      <View style={[styles.searchBox, { backgroundColor: Colors.card, borderRadius: Radius.xl }, Shadows.dark]}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
          placeholder="Search tasks or assets..."
          placeholderTextColor="rgba(116, 120, 120, 0.6)"
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {FILTERS.map((label, i) => {
          const isActive = i === active;
          return (
            <TouchableOpacity
              key={label}
              activeOpacity={0.7}
              onPress={() => setActive(i)}
              style={[
                styles.chip,
                { backgroundColor: isActive ? Colors.inkDeep : Colors.card, borderRadius: Radius.circle },
                !isActive && Shadows.dark,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  total: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  chipsRow: {
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
