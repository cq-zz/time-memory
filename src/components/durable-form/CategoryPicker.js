import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const CATEGORIES = [
  { label: 'HOME', icon: 'home-outline' },
  { label: 'TECH', icon: 'desktop-outline' },
  { label: 'FASHION', icon: 'shirt-outline' },
  { label: 'OTHER', icon: 'ellipsis-horizontal-outline' },
];

export default function CategoryPicker({ selected, onSelect }) {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>CATEGORY</Text>
      <View style={styles.row}>
        {CATEGORIES.map((cat, i) => {
          const isActive = i === selected;
          return (
            <TouchableOpacity
              key={cat.label}
              activeOpacity={0.7}
              onPress={() => onSelect(i)}
              style={styles.catItem}
            >
              <View style={[styles.catCircle, { backgroundColor: isActive ? Colors.purple : Colors.iconBg }]}>
                <Ionicons name={cat.icon} size={22} color={isActive ? Colors.white : Colors.textSecondary} />
              </View>
              <Text
                style={[
                  styles.catLabel,
                  { color: isActive ? Colors.textPrimary : Colors.textSecondary, fontFamily: Fonts.bold },
                ]}
              >
                {cat.label}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catItem: {
    alignItems: 'center',
    gap: 8,
  },
  catCircle: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
});
