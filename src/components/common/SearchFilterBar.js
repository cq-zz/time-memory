import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

/**
 * Reusable search box + filter-chip row for list screens.
 * `filters` is [{ key, labelKey }] — labelKey is translated via i18n.
 * `beforeSearch` — optional React node rendered to the left of the search input, on the same row.
 */
export default function SearchFilterBar({ search, onSearchChange, filter, onFilterChange, filters, placeholder, beforeSearch }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Search row: optional beforeSearch + input */}
      <View style={styles.searchRow}>
        {beforeSearch}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.cardBorder,
              borderRadius: Radius.pill,
            },
          ]}
        >
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={onSearchChange}
          />
          {search.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
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
  container: {},
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 34,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
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
