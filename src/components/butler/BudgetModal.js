import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, currencyMeta } from '../../store/settings';
import { showToast } from '../common/Toast';

/**
 * Annual Budget editor — opened from the Function Modules grid.
 * Saves to the global settings store; every budget display reacts.
 */
export default function BudgetModal({ visible, onClose }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const annualBudget = useSettingsStore((s) => s.settings.annualBudget);
  const currency = useSettingsStore((s) => s.settings.currency);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [draft, setDraft] = useState('');
  const symbol = currencyMeta(currency).symbol;

  // Prefill the draft each time the sheet opens.
  useEffect(() => {
    if (visible) {
      setDraft(annualBudget > 0 ? String(annualBudget) : '');
    }
  }, [visible]);

  const handleSave = async () => {
    const trimmed = draft.trim();
    const value = Number(trimmed);
    if (trimmed === '' || Number.isNaN(value) || value < 0) {
      showToast('Please enter a valid amount');
      return;
    }
    await updateSetting('annualBudget', value);
    showToast('Annual budget saved');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoid}
        >
          <Pressable
            style={[
              styles.content,
              { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
              Shadows.dark,
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              Annual Budget
            </Text>
            <Text style={[styles.hint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              Set a yearly spending target. Leave empty or 0 to clear it.
            </Text>

            <View
              style={[
                styles.inputWrap,
                {
                  backgroundColor: Colors.bg,
                  borderColor: Colors.grayDot,
                  borderRadius: Radius.sm,
                },
              ]}
            >
              <Text style={[styles.symbol, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                {symbol}
              </Text>
              <TextInput
                style={[styles.input, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
                value={draft}
                onChangeText={setDraft}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="decimal-pad"
                returnKeyType="done"
                autoFocus
              />
            </View>

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
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.saveBtn,
                  { backgroundColor: Colors.purple },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleSave}
              >
                <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
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
  avoid: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    gap: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 4,
  },
  symbol: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    padding: 0,
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
  saveBtn: {
    flex: 1,
    height: 56,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
