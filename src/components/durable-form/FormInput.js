import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function FormInput({ label, placeholder, value, onChangeText, multiline }) {
  const { Colors, Radius, Fonts } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{label}</Text>
      <View
        style={[
          styles.inputBox,
          { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm },
          multiline && styles.textArea,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: Colors.textPrimary, fontFamily: Fonts.regular },
            multiline && styles.textAreaInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(116, 120, 120, 0.6)"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 4 : undefined}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  inputBox: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
  },
  textArea: {
    minHeight: 120,
    paddingVertical: 14,
    justifyContent: 'flex-start',
  },
  textAreaInput: {
    textAlignVertical: 'top',
    minHeight: 92,
  },
});
