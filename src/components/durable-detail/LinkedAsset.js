import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function LinkedAsset({ linkedAsset }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.heading}>
        <Ionicons name="link-outline" size={18} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          Linked Asset
        </Text>
      </View>

      {/* Card */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={[styles.thumb, { backgroundColor: Colors.iconBg, borderRadius: Radius.xl }]}>
          <Ionicons name={linkedAsset.icon} size={26} color={Colors.textSecondary} />
        </View>

        <View style={styles.textCol}>
          <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
            {linkedAsset.title}
          </Text>
          <Text style={[styles.subtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {linkedAsset.subtitle}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingText: {
    fontSize: 20,
    lineHeight: 28,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
  },
});
