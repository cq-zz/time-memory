import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { hasPassword, setPassword, verifyPassword } from '../../utils/password';
import { logPasswordAction } from '../../utils/passwordHistory';
import { showToast } from './Toast';
import FormInput from './FormInput';

const MIN_LENGTH = 6;

/**
 * Security bottom sheet — set or change the private-diary lock password.
 * Not set yet: new password + confirm. Already set: current + new + confirm
 * (current must verify). Only the SHA-256 hash is persisted.
 *
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - onChanged: () => void — called after a successful save/reset so the
 *   caller can refresh its hasPassword state
 */
export default function SecurityModal({ visible, onClose, onChanged }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  const [pwdSet, setPwdSet] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      hasPassword().then(setPwdSet);
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setError('');
    }
  }, [visible]);

  const handleSave = async () => {
    if (saving) return;
    if (pwdSet && !oldPwd) {
      setError(t('settings.oldPasswordRequired'));
      return;
    }
    if (!newPwd) {
      setError(t('settings.passwordRequired'));
      return;
    }
    if (newPwd.length < MIN_LENGTH) {
      setError(t('settings.passwordTooShort'));
      return;
    }
    if (newPwd !== confirmPwd) {
      setError(t('settings.passwordMismatch'));
      return;
    }
    if (pwdSet && !(await verifyPassword(oldPwd))) {
      setError(t('settings.oldPasswordWrong'));
      return;
    }
    setSaving(true);
    try {
      const action = pwdSet ? 'change' : 'set';
      await setPassword(newPwd);
      await logPasswordAction(action);
      showToast(t('common.saved'));
      onChanged?.();
      onClose();
    } finally {
      setSaving(false);
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
            <View style={styles.headerLeft}>
              <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
                <Ionicons name="lock-closed" size={18} color={Colors.purple} />
              </View>
              <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                {pwdSet ? t('settings.changePassword') : t('settings.setPassword')}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {pwdSet ? (
              <FormInput
                label={t('settings.oldPassword')}
                placeholder="••••••"
                value={oldPwd}
                onChangeText={(v) => {
                  setOldPwd(v);
                  setError('');
                }}
                secure
              />
            ) : null}

            <FormInput
              label={t('settings.newPassword')}
              placeholder="••••••"
              value={newPwd}
              onChangeText={(v) => {
                setNewPwd(v);
                setError('');
              }}
              secure
            />

            <FormInput
              label={t('settings.confirmPassword')}
              placeholder="••••••"
              value={confirmPwd}
              onChangeText={(v) => {
                setConfirmPwd(v);
                setError('');
              }}
              secure
            />

            {error ? (
              <Text style={[styles.errorText, { color: Colors.rose, fontFamily: Fonts.semiBold }]}>
                {error}
              </Text>
            ) : null}

            <View style={[styles.notice, { backgroundColor: hexToRgba(Colors.orange, 0.1), borderRadius: Radius.sm }]}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.orange} />
              <Text style={[styles.noticeText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {t('settings.setPasswordNotice')}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl },
                pressed && { opacity: 0.85 },
                saving && { opacity: 0.6 },
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
    maxHeight: '85%',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
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
