import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function ProfileHeader() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          <Ionicons name="person" size={20} color={Colors.textSecondary} />
        </View>
        <Text style={[styles.greeting, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          Hello, Marimar!
        </Text>
      </View>

      <TouchableOpacity style={styles.menuBtn} activeOpacity={0.7}>
        <Ionicons name="menu" size={20} color={Colors.textDark} />
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
  greeting: {
    fontSize: 20,
    lineHeight: 28,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
