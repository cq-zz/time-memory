import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const FILTERS = ['All Items', 'In-Use', 'Archived', 'Date Range'];

export default function SearchFilters() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const [active, setActive] = useState(0);

  return (
    <View style={styles.container}>
      {/* Date range row */}
      <View style={styles.dateRow}>
        <View style={styles.dateLeft}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={[styles.dateText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            Oct 2023 - Oct 2024
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={[styles.changeText, { color: Colors.purple, fontFamily: Fonts.semiBold }]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search input */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: Colors.card,
            borderColor: Colors.cardBorder,
            borderRadius: Radius.pill,
          },
          Shadows.card,
        ]}
      >
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
          placeholder="Search your durables..."
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {FILTERS.map((label, i) => {
          const isActive = i === active;
          const isDate = label === 'Date Range';
          return (
            <TouchableOpacity
              key={label}
              activeOpacity={0.7}
              onPress={() => setActive(i)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? Colors.inkDeep : Colors.card,
                  borderColor: isActive ? Colors.inkDeep : Colors.cardBorder,
                  borderRadius: Radius.pill,
                },
              ]}
            >
              {isDate && (
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={isActive ? Colors.white : Colors.textSecondary}
                  style={styles.chipIcon}
                />
              )}
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive ? Colors.white : Colors.textSecondary,
                    fontFamily: isActive ? Fonts.semiBold : Fonts.regular,
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 18,
  },
  changeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 56,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
