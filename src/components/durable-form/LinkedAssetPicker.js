import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function LinkedAssetPicker() {
  const { Colors, Radius, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm }]}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(107, 92, 231, 0.15)' }]}>
          <Ionicons name="link-outline" size={18} color={Colors.purple} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
            Linked Asset
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            NONE SELECTED
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    gap: 2,
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
});
