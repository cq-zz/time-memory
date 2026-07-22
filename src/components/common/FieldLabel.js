import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

/**
 * Standard form field label — 12px bold, secondary text color.
 * A trailing " *" marks the field as required; the asterisk is rendered
 * in the rose accent so it stands out from the neutral label text.
 */
export default function FieldLabel({ label, style }) {
  const { Colors, Fonts } = useTheme();
  const raw = String(label ?? '');
  const required = raw.endsWith(' *');
  const base = required ? raw.slice(0, -2) : raw;

  return (
    <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }, style]}>
      {base}
      {required ? <Text style={{ color: Colors.rose }}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
