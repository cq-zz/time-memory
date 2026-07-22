import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../utils/theme';

export default function FormSaveFooter({ label, savingLabel, saving = false, onPress }) {
  const { Colors, Radius, Fonts } = useTheme();

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: saving, busy: saving }}
        activeOpacity={0.8}
        disabled={saving}
        onPress={onPress}
        style={[
          styles.button,
          {
            backgroundColor: Colors.inkDeep,
            borderRadius: Radius.xl,
            opacity: saving ? 0.6 : 1,
          },
        ]}
      >
        {saving ? <ActivityIndicator size="small" color={Colors.white} /> : null}
        <Text style={[styles.label, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {saving ? savingLabel : label}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  button: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
  },
});
