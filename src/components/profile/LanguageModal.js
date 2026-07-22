import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, LANGUAGES, languageMeta } from '../../store/settings';
import { showToast } from '../common/Toast';

/**
 * Language picker (bottom sheet). The confirmed code is written to the
 * global settings store — updateSetting('language') applies it to i18n
 * immediately and persists it.
 */
export default function LanguageModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const language = useSettingsStore((s) => s.settings.language);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [selected, setSelected] = useState(language);

  // Sync the draft selection each time the sheet opens.
  useEffect(() => {
    if (visible) setSelected(language);
  }, [visible]);

  const handleConfirm = async () => {
    await updateSetting('language', selected);
    showToast(t('settings.languageSet', { label: languageMeta(selected).label }));
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
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('settings.selectLanguage')}
            </Text>
            <Pressable onPress={handleConfirm}>
              <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                {t('common.confirm')}
              </Text>
            </Pressable>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {LANGUAGES.map((l) => {
              const isActive = selected === l.code;
              return (
                <Pressable
                  key={l.code}
                  style={({ pressed }) => [
                    styles.row,
                    {
                      backgroundColor: isActive ? Colors.purpleTint : Colors.card,
                      borderColor: isActive ? Colors.purple : Colors.cardBorder,
                      borderRadius: Radius.sm,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                  onPress={() => setSelected(l.code)}
                >
                  <View style={[styles.radio, { borderColor: isActive ? Colors.purple : Colors.grayDot }]}>
                    {isActive && <View style={[styles.radioDot, { backgroundColor: Colors.purple }]} />}
                  </View>
                  <Text style={[styles.rowLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                    {l.label}
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
