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
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import { YEAR_MIN, YEAR_MAX, MIN_YEAR_DEFAULT, MAX_YEAR_DEFAULT } from '../../utils/constant';
import { showToast } from '../common/Toast';

/**
 * Year Range editor — bounds every year picker in the app.
 * Rules: both required, YEAR_MIN..YEAR_MAX, min cannot exceed max.
 */
export default function YearRangeModal({ visible, onClose }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [minDraft, setMinDraft] = useState('');
  const [maxDraft, setMaxDraft] = useState('');
  const [error, setError] = useState('');

  // Prefill drafts each time the modal opens.
  useEffect(() => {
    if (visible) {
      setMinDraft(String(yearStart || MIN_YEAR_DEFAULT));
      setMaxDraft(String(yearEnd || MAX_YEAR_DEFAULT));
      setError('');
    }
  }, [visible]);

  const handleConfirm = async () => {
    const minTrim = minDraft.trim();
    const maxTrim = maxDraft.trim();

    if (minTrim === '' || maxTrim === '') {
      setError(t('butler.yearBothRequired'));
      return;
    }

    const minVal = Number(minTrim);
    const maxVal = Number(maxTrim);

    if (!Number.isInteger(minVal) || !Number.isInteger(maxVal)) {
      setError(t('butler.yearWhole'));
      return;
    }
    if (minVal < YEAR_MIN || minVal > YEAR_MAX || maxVal < YEAR_MIN || maxVal > YEAR_MAX) {
      setError(t('butler.yearBetween', { min: YEAR_MIN, max: YEAR_MAX }));
      return;
    }
    if (minVal > maxVal) {
      setError(t('butler.yearOrder'));
      return;
    }

    try {
      await updateSetting('yearStart', minVal);
      await updateSetting('yearEnd', maxVal);
      onClose();
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  const inputStyle = (hasError) => [
    styles.inputWrap,
    {
      backgroundColor: Colors.bg,
      borderColor: hasError ? Colors.rose : Colors.grayDot,
      borderRadius: Radius.sm,
    },
  ];

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
              {t('butler.yearRangeTitle')}
            </Text>
            <Text style={[styles.hint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {t('butler.yearRangeHint')}
            </Text>

            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                  {t('butler.minYearField')}
                </Text>
                <View style={inputStyle(error !== '')}>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
                    value={minDraft}
                    onChangeText={(text) => {
                      setMinDraft(text);
                      setError('');
                    }}
                    placeholder={String(MIN_YEAR_DEFAULT)}
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <Text style={[styles.dash, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>—</Text>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
                  {t('butler.maxYearField')}
                </Text>
                <View style={inputStyle(error !== '')}>
                  <TextInput
                    style={[styles.input, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
                    value={maxDraft}
                    onChangeText={(text) => {
                      setMaxDraft(text);
                      setError('');
                    }}
                    placeholder={String(MAX_YEAR_DEFAULT)}
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            {error !== '' && (
              <Text style={[styles.error, { color: Colors.rose, fontFamily: Fonts.semiBold }]}>
                {error}
              </Text>
            )}

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
                  {t('common.cancel')}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmBtn,
                  { backgroundColor: Colors.purple },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleConfirm}
              >
                <Text style={[styles.confirmText, { color: Colors.white, fontFamily: Fonts.bold }]}>
                  {t('common.confirm')}
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
  fields: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  field: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  inputWrap: {
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontSize: 17,
    padding: 0,
  },
  dash: {
    fontSize: 16,
    marginBottom: 18,
  },
  error: {
    fontSize: 12,
    lineHeight: 17,
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
