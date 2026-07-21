import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { verifyPassword } from '../../utils/password';

/**
 * Reusable password-verification modal (private diary entries, security
 * settings, etc.). Verifies against the stored SHA-256 hash.
 *
 * Props:
 * - visible: boolean
 * - onClose: () => void
 * - onSuccess: () => void — called after the password verifies
 */
export default function PasswordModal({ visible, onClose, onSuccess }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPwd('');
      setError('');
    }
  }, [visible]);

  const handleConfirm = async () => {
    if (!pwd) {
      setError(t('settings.passwordRequired'));
      return;
    }
    const ok = await verifyPassword(pwd);
    if (!ok) {
      setError(t('settings.oldPasswordWrong'));
      return;
    }
    onSuccess();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.card,
            {
              backgroundColor: Colors.card,
              borderRadius: Radius.xl,
              borderColor: Colors.cardBorder,
            },
            Shadows.dark,
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
            <Ionicons name="lock-closed" size={24} color={Colors.purple} />
          </View>

          <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {t('diary.privateDiary')}
          </Text>
          <Text style={[styles.desc, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {t('diary.privateDiaryHint')}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: Colors.bg,
                borderRadius: Radius.sm,
                borderColor: error ? Colors.rose : Colors.grayDot,
                color: Colors.textPrimary,
                fontFamily: Fonts.regular,
              },
            ]}
            secureTextEntry
            placeholder="••••••"
            placeholderTextColor={Colors.textTertiary}
            value={pwd}
            onChangeText={(v) => {
              setPwd(v);
              setError('');
            }}
            autoFocus
          />
          {error ? (
            <Text style={[styles.errorText, { color: Colors.rose, fontFamily: Fonts.semiBold }]}>
              {error}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnCancel,
                { backgroundColor: Colors.bg, borderColor: Colors.grayDot },
                pressed && { opacity: 0.8 },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.btnCancelText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnConfirm,
                { backgroundColor: Colors.purple },
                pressed && { opacity: 0.8 },
              ]}
              onPress={handleConfirm}
            >
              <Text style={[styles.btnConfirmText, { fontFamily: Fonts.semiBold }]}>
                {t('common.confirm')}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
  },
  btnConfirm: {},
  btnConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
