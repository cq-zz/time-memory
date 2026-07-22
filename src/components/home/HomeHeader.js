import { Image, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useProfileStore } from '../../store/profile';

export default function HomeHeader() {
  const { Colors, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const avatar = useProfileStore((s) => s.avatar);
  const nickname = useProfileStore((s) => s.nickname);

  return (
    <View style={styles.container}>
      {/* Left: avatar + nickname */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={20} color={Colors.textSecondary} />
          )}
        </View>
        <Text style={[styles.nickname, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {nickname || t('common.newUser')}
        </Text>
      </View>

      {/* Right: online status */}
      <View style={styles.right}>
        <View style={[styles.onlineDot, { backgroundColor: Colors.green }]} />
        <Text style={[styles.sysText, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
          {t('home.sysOnline')}
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
  avatarImg: {
    width: '100%',
    height: '100%',
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
