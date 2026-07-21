import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, hexToRgba } from '../../utils/theme';

const ICON_MAP = {
  error: { icon: 'alert-circle-outline', colorKey: 'rose' },
  success: { icon: 'checkmark-circle-outline', colorKey: 'green' },
  warning: { icon: 'warning-outline', colorKey: 'orange' },
  tip: { icon: 'information-circle-outline', colorKey: 'purple' },
  confirm: { icon: 'warning-outline', colorKey: 'rose' },
};

/**
 * General-purpose alert modal.
 * buttons: [{ text, onPress, style: 'cancel' }] — last non-cancel button renders primary.
 * 3+ buttons stack vertically (action-sheet style).
 */
export default function AlertModal({ visible, onClose, title, message, type = 'tip', buttons }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  const config = ICON_MAP[type] || ICON_MAP.tip;
  const accentColor = Colors[config.colorKey];

  const resolvedButtons = useMemo(() => {
    if (buttons && buttons.length > 0) return buttons;
    return [{ text: 'Confirm', onPress: onClose }];
  }, [buttons, onClose]);

  const isActionSheet = resolvedButtons.length >= 3;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            {
              backgroundColor: Colors.card,
              borderColor: Colors.cardBorder,
              borderRadius: Radius.xl,
            },
            Shadows.dark,
          ]}
          onPress={() => {}}
        >
          <View style={[styles.iconWrap, { backgroundColor: hexToRgba(accentColor, 0.1) }]}>
            <Ionicons name={config.icon} size={28} color={accentColor} />
          </View>
          {title ? (
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {title}
            </Text>
          ) : null}
          {message ? (
            <Text style={[styles.message, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {message}
            </Text>
          ) : null}
          <View
            style={[
              styles.actions,
              isActionSheet || resolvedButtons.length === 1 ? styles.actionsColumn : null,
            ]}
          >
            {resolvedButtons.map((btn, i) => {
              const isPrimary = i === resolvedButtons.length - 1;
              const isCancel = btn.style === 'cancel';
              return (
                <Pressable
                  key={i}
                  style={({ pressed }) => [
                    styles.btn,
                    !isActionSheet && resolvedButtons.length > 1 && styles.btnFlex,
                    isPrimary && !isCancel
                      ? { backgroundColor: Colors.purple }
                      : isCancel
                        ? { backgroundColor: 'transparent' }
                        : { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={async () => {
                    await btn.onPress?.();
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.btnText,
                      { fontFamily: Fonts.semiBold },
                      isPrimary && !isCancel
                        ? { color: Colors.white, fontFamily: Fonts.bold }
                        : isCancel
                          ? { color: Colors.textTertiary }
                          : { color: Colors.textSecondary },
                    ]}
                  >
                    {btn.text}
                  </Text>
                </Pressable>
              );
            })}
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
  message: {
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
  actionsColumn: {
    flexDirection: 'column',
  },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFlex: {
    flex: 1,
  },
  btnText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
