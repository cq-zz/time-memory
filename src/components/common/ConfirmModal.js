import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';

/**
 * Destructive-action confirmation modal (delete / reset / archive...).
 * onConfirm may be async — the confirm button shows a busy state while it runs.
 */
export default function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  icon = 'trash-outline',
}) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  }, [confirming, onConfirm]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
            Shadows.dark,
          ]}
          onPress={() => {}}
        >
          <View style={[styles.iconWrap, { backgroundColor: hexToRgba(Colors.rose, 0.1) }]}>
            <Ionicons name={icon} size={28} color={Colors.rose} />
          </View>
          <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {title}
          </Text>
          <Text style={[styles.description, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {description}
          </Text>
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelBtn,
                { backgroundColor: Colors.card, borderColor: Colors.cardBorder },
                pressed && { opacity: 0.7 },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                {cancelText || t('common.cancel')}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.confirmBtn,
                { backgroundColor: Colors.rose },
                pressed && { opacity: 0.85 },
                confirming && { opacity: 0.6 },
              ]}
              onPress={handleConfirm}
              disabled={confirming}
            >
              <Text style={[styles.confirmText, { color: Colors.white, fontFamily: Fonts.bold }]}>
                {confirming ? t('common.saving') : confirmText || t('common.delete')}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    lineHeight: 24,
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
