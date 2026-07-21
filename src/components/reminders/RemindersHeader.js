import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function RemindersHeader() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          <Ionicons name="person" size={20} color={Colors.textSecondary} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>WELCOME</Text>
          <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>Marimar</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.menuBtn, { backgroundColor: Colors.white }, Shadows.dark]} activeOpacity={0.7}>
        <Ionicons name="menu" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  textCol: {
    gap: 1,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  name: {
    fontSize: 20,
    lineHeight: 25,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
