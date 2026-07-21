import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

/**
 * Reusable search box + filter-chip row for list screens.
 * `filters` is [{ key, labelKey }] — labelKey is translated via i18n.
 */
export default function SearchFilterBar({ search, onSearchChange, filter, onFilterChange, filters, placeholder }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
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
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.chipsRow}>
        {filters.map(({ key, labelKey }) => {
          const isActive = filter === key;
          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              onPress={() => onFilterChange(key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? Colors.inkDeep : Colors.card,
                  borderColor: isActive ? Colors.inkDeep : Colors.cardBorder,
                  borderRadius: Radius.pill,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive ? Colors.white : Colors.textSecondary,
                    fontFamily: isActive ? Fonts.semiBold : Fonts.regular,
                  },
                ]}
              >
                {t(labelKey)}
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
  chipText: {
    fontSize: 12,
    lineHeight: 16,
  },
});
