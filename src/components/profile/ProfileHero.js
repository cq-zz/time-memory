import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function ProfileHero() {
  const { Colors, Fonts, Shadows } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: Colors.avatarBg, borderColor: Colors.white }, Shadows.dark]}>
        <Ionicons name="person" size={56} color={Colors.textSecondary} />
      </View>
      <Text style={[styles.handle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
        @marimar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 48,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  handle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
