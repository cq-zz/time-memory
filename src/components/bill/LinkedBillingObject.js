import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

export default function LinkedBillingObject({ source, sourceId, name }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  if (!source || !sourceId) return null;

  const isAsset = source === 'asset';
  const path = isAsset ? `/asset/${sourceId}` : `/durable/${sourceId}`;

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Ionicons name="link-outline" size={18} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('bills.billingObject')}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="link"
        onPress={() => router.push(path)}
        style={[
          styles.card,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: Colors.iconBg, borderRadius: Radius.xl }]}>
          <Ionicons name={isAsset ? 'diamond-outline' : 'cube-outline'} size={26} color={Colors.textSecondary} />
        </View>
        <Text
          style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}
          numberOfLines={1}
        >
          {name || '--'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 16 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headingText: { fontSize: 20, lineHeight: 28 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  iconBox: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  name: { flex: 1, fontSize: 16, lineHeight: 22 },
});
