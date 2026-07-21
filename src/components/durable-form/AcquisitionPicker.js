import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../utils/theme';

const METHODS = ['PURCHASE', 'GIFT/OTHER'];

export default function AcquisitionPicker({ selected, onSelect }) {
  const { Colors, Radius, Fonts } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        ACQUISITION METHOD
      </Text>
      <View style={styles.row}>
        {METHODS.map((method, i) => {
          const isActive = i === selected;
          return (
            <TouchableOpacity
              key={method}
              activeOpacity={0.7}
              onPress={() => onSelect(i)}
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
                {method}
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
    gap: 12,
  },
  btn: {
    flex: 1,
    height: 48,
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
