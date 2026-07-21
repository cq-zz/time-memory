import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

/**
 * Read-only checklist viewer. There is no editing UI (by design); items only
 * arrive via import. Returns null when the checklist is empty.
 */
export default function ChecklistSection({ items }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  if (!items || items.length === 0) return null;
  const done = items.filter((i) => i.done).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          CHECKLIST
        </Text>
        <Text style={[styles.progress, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {done}/{items.length}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        {items.map((item, i) => (
          <View
            key={item.id || i}
            style={[styles.itemRow, i !== items.length - 1 && { borderBottomColor: Colors.cardBorder, borderBottomWidth: 1 }]}
          >
            <Ionicons
              name={item.done ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={item.done ? Colors.green : Colors.grayDot}
            />
            <Text
              style={[
                styles.itemText,
                {
                  color: item.done ? Colors.textSecondary : Colors.textPrimary,
                  fontFamily: Fonts.regular,
                  textDecorationLine: item.done ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  progress: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
