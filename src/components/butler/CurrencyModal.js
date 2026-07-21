import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import { CURRENCIES } from '../../utils/constant';
import { showToast } from '../common/Toast';

/**
 * Currency picker (bottom sheet). The confirmed code is written to the
 * global settings store — every money display in the app reacts to it.
 */
export default function CurrencyModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
  const currency = useSettingsStore((s) => s.settings.currency);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [selected, setSelected] = useState(currency);

  // Sync the draft selection each time the sheet opens.
  useEffect(() => {
    if (visible) setSelected(currency);
  }, [visible]);

  const handleConfirm = async () => {
    await updateSetting('currency', selected);
    const meta = CURRENCIES.find((c) => c.code === selected);
    showToast(`Currency set to ${meta ? meta.label : selected}`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: Colors.card }]}>
          {/* Header */}
          <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Pressable onPress={onClose}>
              <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              Select Currency
            </Text>
            <Pressable onPress={handleConfirm}>
              <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                Confirm
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {CURRENCIES.map((c) => {
              const isActive = selected === c.code;
              return (
                <Pressable
                  key={c.code}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: isActive ? Colors.purpleTint : Colors.card,
                      borderColor: isActive ? Colors.purple : Colors.cardBorder,
                      borderRadius: Radius.sm,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setSelected(c.code)}
                >
                  <View
                    style={[
                      styles.radio,
                      { borderColor: isActive ? Colors.purple : Colors.grayDot },
                    ]}
                  >
                    {isActive && <View style={[styles.radioDot, { backgroundColor: Colors.purple }]} />}
                  </View>
                  <Text style={[styles.rowLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                    {c.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={Colors.purple} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '75%',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerBtnConfirm: {
    fontSize: 15,
    lineHeight: 22,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  rowLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
