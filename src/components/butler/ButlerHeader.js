import { Image, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useProfileStore } from '../../store/profile';

export default function ButlerHeader() {
  const { Colors, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const avatar = useProfileStore((s) => s.avatar);
  const nickname = useProfileStore((s) => s.nickname);

  return (
    <View style={styles.container}>
      {/* Left: avatar + greeting */}
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg }, Shadows.card]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={20} color={Colors.textSecondary} />
          )}
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('butler.goodMorning')}
          </Text>
          <Text style={[styles.greeting, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
            {t('profile.hello', { name: nickname || t('common.newUser') })}
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  textCol: {
    gap: 0,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 18,
    lineHeight: 24,
  },
});
