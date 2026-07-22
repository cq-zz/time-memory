import { useState } from 'react';
import { Image, Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useProfileStore } from '../../store/profile';
import { showToast } from '../common/Toast';
import ImagePreviewModal from '../common/ImagePreviewModal';

/**
 * Profile hero — large avatar + handle. Tapping the avatar opens a full
 * preview (ImagePreviewModal); without an avatar the tap shows a hint.
 */
export default function ProfileHero() {
  const { Colors, Fonts, Shadows } = useTheme();
  const { t } = useTranslation();
  const avatar = useProfileStore((s) => s.avatar);
  const nickname = useProfileStore((s) => s.nickname);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleAvatarPress = () => {
    if (!avatar) {
      showToast(t('profile.noAvatarHint'));
      return;
    }
    setPreviewOpen(true);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleAvatarPress} activeOpacity={0.85}>
        <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.dark]}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImg} />
          ) : (
            <Ionicons name="person" size={56} color={Colors.textSecondary} />
          )}
        </View>
      </Pressable>
      <Text style={[styles.handle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
        @{nickname || t('common.newUser')}
      </Text>

      {previewOpen && avatar ? (
        <ImagePreviewModal imageUri={avatar} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 48,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  handle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
