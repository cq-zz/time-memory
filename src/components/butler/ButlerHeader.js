import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function ButlerHeader() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      {/* Left: avatar + greeting */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          <Ionicons name="person" size={24} color={Colors.textSecondary} />
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            GOOD MORNING
          </Text>
          <Text style={[styles.greeting, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
            Hello, Marimar!
          </Text>
        </View>
      </View>

      {/* Right: menu button */}
      <TouchableOpacity style={[styles.menuBtn, { backgroundColor: Colors.avatarBg }]} activeOpacity={0.7}>
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
    width: 48,
    height: 48,
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
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 20,
    lineHeight: 28,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
