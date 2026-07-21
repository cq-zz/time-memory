import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';

/**
 * Category picker shared by module forms. Options come from category
 * management (enabled built-ins + customs, "other" pinned last).
 * `type` selects the category set ('item' | 'asset'); `label` is the field
 * label shown above the grid.
 */
export default function CategoryPicker({ selected, onSelect, type = 'item', label }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const categoryState = useCategoryStore();

  const options = getMergedCategories(categoryState, type).filter((c) => c.enabled);
  const ns = BUILTIN_NS[type];

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{label}</Text>
      <View style={styles.grid}>
        {options.map((cat) => {
          const isActive = cat.key === selected;
          const catLabel = cat.isBuiltin ? t(`${ns}.${cat.key}`) : cat.name;
          return (
            <TouchableOpacity
              key={cat.key}
              activeOpacity={0.7}
              onPress={() => onSelect(cat.key)}
              style={styles.catItem}
            >
              <View style={[styles.catCircle, { backgroundColor: isActive ? Colors.purple : Colors.iconBg }]}>
                <Ionicons
                  name={cat.icon || 'pricetag-outline'}
                  size={22}
                  color={isActive ? Colors.white : Colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.catLabel,
                  { color: isActive ? Colors.textPrimary : Colors.textSecondary, fontFamily: Fonts.bold },
                ]}
                numberOfLines={1}
              >
                {catLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  catItem: {
    width: '21%',
    alignItems: 'center',
    gap: 6,
  },
  catCircle: {
    width: 56,
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
