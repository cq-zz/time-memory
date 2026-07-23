import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

/** Search input and module filter chips for the reminders screen. */
export default function RemindersSearch({ search, onSearchChange, filter, onFilterChange }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  const FILTERS = [
    { key: 'all', label: t('common.all') },
    { key: 'schedule', label: t('nav.schedule') },
    { key: 'durable', label: t('nav.durable') },
    { key: 'asset', label: t('nav.asset') },
    { key: 'important-date', label: t('nav.importantDate') },
  ];

  return (
    <View style={styles.container}>
      {/* Search input */}
      <View style={[styles.searchBox, { backgroundColor: Colors.card, borderRadius: Radius.xl }, Shadows.dark]}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
          placeholder={t('reminder.searchPlaceholder')}
          placeholderTextColor="rgba(116, 120, 120, 0.6)"
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
        {FILTERS.map((f) => {
          const isActive = f.key === filter;
          return (
            <TouchableOpacity
              key={f.key}
              activeOpacity={0.7}
              onPress={() => onFilterChange(f.key)}
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
                {f.label}
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
