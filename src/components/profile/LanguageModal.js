import { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, LANGUAGES, languageMeta } from '../../store/settings';
import { showToast } from '../common/Toast';
import WheelColumn from '../common/WheelColumn';

const LANGUAGE_ITEMS = LANGUAGES.map((l) => ({ value: l.code, label: l.label }));

/**
 * Language picker (bottom sheet + scroll wheel). The confirmed code is
 * written to the global settings store — updateSetting('language') applies
 * it to i18n immediately and persists it. The sheet mounts on demand so
 * the wheel scrolls to the current language each time it opens.
 */
export default function LanguageModal({ visible, onClose }) {
  const { Colors, Fonts } = useTheme();
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

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
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

          <View style={styles.pickerBody}>
            <WheelColumn
              items={LANGUAGE_ITEMS}
              selected={selected}
              onChange={setSelected}
              width={180}
            />
          </View>
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
  pickerBody: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
