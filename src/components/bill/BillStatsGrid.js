import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, icon, iconColor }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>{label}</Text>
      <View style={styles.valueRow}>
        {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
        <Text
          style={[styles.value, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function BillStatsGrid({ categoryLabel, categoryIcon, dateText }) {
  const { Colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <View style={styles.row}>
          <StatCard
            label={t('bills.category')}
            value={categoryLabel}
            icon={categoryIcon || 'pricetag-outline'}
            iconColor={Colors.purple}
          />
          <StatCard
            label={t('bills.time')}
            value={dateText}
            icon="calendar-outline"
            iconColor={Colors.purple}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 16 },
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, padding: 14, gap: 4, borderWidth: 1, justifyContent: 'center' },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
});
