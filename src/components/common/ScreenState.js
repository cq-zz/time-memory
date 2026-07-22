import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function ScreenState({
  loading = false,
  message,
  icon = 'file-tray-outline',
  onBack,
  backLabel,
}) {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.purple} />
      ) : (
        <Ionicons name={icon} size={48} color={Colors.textTertiary} />
      )}
      {message ? (
        <Text
          style={[
            styles.message,
            {
              color: Colors.textSecondary,
              fontFamily: loading ? Fonts.regular : Fonts.semiBold,
            },
          ]}
        >
          {message}
        </Text>
      ) : null}
      {!loading && onBack && backLabel ? (
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.backLabel, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {backLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  backLabel: {
    fontSize: 14,
    lineHeight: 20,
  },
});
