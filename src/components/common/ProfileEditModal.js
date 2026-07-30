import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useProfileStore, NICKNAME_MAX } from '../../store/profile';
import { showToast } from './Toast';
import ImageUploadField from './ImageUploadField';
import FormInput from './FormInput';

/**
 * Personal settings centered dialog — avatar upload (camera / gallery / URL
 * via ImageUploadField) + nickname. Saves to the profile store, which every
 * header / hero component subscribes to.
 */
export default function ProfileEditModal({ visible, onClose }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const avatar = useProfileStore((s) => s.avatar);
  const nickname = useProfileStore((s) => s.nickname);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [draftAvatar, setDraftAvatar] = useState('');
  const [draftNickname, setDraftNickname] = useState('');

  useEffect(() => {
    if (visible) {
      setDraftAvatar(avatar);
      setDraftNickname(nickname);
    }
  }, [visible, avatar, nickname]);

  const handleSave = async () => {
    try {
      await updateProfile({ avatar: draftAvatar, nickname: draftNickname.trim() });
      onClose();
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView automaticOffset behavior="padding" style={styles.flex}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose}>
          <Pressable
            style={[
              styles.card,
              { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
              Shadows.dark,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                {t('profile.editProfile')}
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.content}>
              <ImageUploadField
                value={draftAvatar}
                onChange={setDraftAvatar}
                placeholder={t('settings.avatar')}
                height={160}
              />

              <FormInput
                label={t('settings.nickname')}
                placeholder={t('settings.nicknamePlaceholder')}
                value={draftNickname}
                onChangeText={(v) => setDraftNickname(v.slice(0, NICKNAME_MAX))}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl },
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>
                {t('common.saveRecord')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
  },
  content: {
    gap: 16,
  },
  saveBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
