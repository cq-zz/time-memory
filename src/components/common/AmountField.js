import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../utils/theme';
import { sanitizeAmount } from '../../utils/money';
import FieldLabel from './FieldLabel';

export default function AmountField({
  label,
  value,
  onChangeText,
  symbol,
  required = true,
  placeholder = '0.00',
  hint,
  labelHint,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const fieldLabel = required ? `${label} *` : label;

  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <FieldLabel label={fieldLabel} />
        {labelHint ? (
          <Text style={[styles.labelHint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            ({labelHint})
          </Text>
        ) : null}
      </View>
      <View style={styles.amountRow}>
        <View
          style={[
            styles.currencyBlock,
            { backgroundColor: Colors.avatarBg, borderRadius: Radius.sm },
          ]}
        >
          <Text style={[styles.symbol, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {symbol}
          </Text>
        </View>
        <View
          style={[
            styles.inputBlock,
            { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm },
          ]}
        >
          <TextInput
            style={[styles.input, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
            placeholder={placeholder}
            placeholderTextColor={Colors.textSecondary}
            value={value}
            onChangeText={(nextValue) => onChangeText(sanitizeAmount(nextValue))}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
      {hint ? (
        <Text style={[styles.hint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelHint: {
    fontSize: 10,
    lineHeight: 14,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  currencyBlock: {
    height: 56,
    minWidth: 56,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBlock: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 16,
    lineHeight: 22,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
  },
});
