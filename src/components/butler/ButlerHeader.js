import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.card]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={24} color={Colors.textSecondary} />
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
  avatarImg: {
    width: '100%',
    height: '100%',
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
