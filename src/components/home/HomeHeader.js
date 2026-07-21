import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function HomeHeader() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      {/* Left: avatar + nickname */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          <Ionicons name="person" size={20} color={Colors.textSecondary} />
        </View>
        <Text style={[styles.nickname, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          Marimar
        </Text>
      </View>

      {/* Right: online status */}
      <View style={styles.right}>
        <View style={[styles.onlineDot, { backgroundColor: Colors.green }]} />
        <Text style={[styles.sysText, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
          SYS ONLINE
        </Text>
      </View>
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
  nickname: {
    fontSize: 20,
    lineHeight: 28,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  sysText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
