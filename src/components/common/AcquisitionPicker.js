import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { ACQUISITION_METHODS } from '../../utils/constant';

const methodKey = (ns, key) => `${ns}.acquisition${key.charAt(0).toUpperCase()}${key.slice(1)}`;

/**
 * Acquisition-method chip picker shared by durable/asset forms.
 * `ns` is the i18n namespace ('durable' | 'asset') holding acquisition* keys.
 */
export default function AcquisitionPicker({ selected, onSelect, ns = 'durable' }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {t(`${ns}.acquisitionLabel`)} *
      </Text>
      <View style={styles.row}>
        {ACQUISITION_METHODS.map((m) => {
          const isActive = m.key === selected;
          return (
            <TouchableOpacity
              key={m.key}
              activeOpacity={0.7}
              onPress={() => onSelect(m.key)}
              style={[
                styles.btn,
                {
                  borderRadius: Radius.pill,
                  backgroundColor: isActive ? Colors.inkDeep : Colors.card,
                  borderColor: isActive ? Colors.inkDeep : Colors.grayDot,
                },
              ]}
            >
              <Text
                style={[
                  styles.btnText,
                  { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
                ]}
              >
                {t(methodKey(ns, m.key))}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  btn: {
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
