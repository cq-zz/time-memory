import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useProfileStore, NICKNAME_MAX } from '../../store/profile';
import { showToast } from './Toast';
import ImageUploadField from './ImageUploadField';
import FormInput from './FormInput';

/**
 * Personal settings bottom sheet — avatar upload (camera / gallery / URL via
 * ImageUploadField) + nickname. Saves to the profile store, which every
 * header / hero component subscribes to.
 */
export default function ProfileEditModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: Colors.card, borderRadius: Radius.xl }]}
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

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          </ScrollView>

          <View style={styles.footer}>
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
  },
  content: {
    paddingHorizontal: 20,
    gap: 20,
    paddingBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
