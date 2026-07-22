import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, dotColor, icon }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {label}
      </Text>
      <View style={styles.statValueRow}>
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        {icon ? <Ionicons name={icon} size={16} color={Colors.textPrimary} /> : null}
        <Text
          style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ScheduleStatsGrid({
  priorityLabel,
  priorityColor,
  dateRangeText,
  checklistText,
  reminderOn,
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label={t('detail.priority')} value={priorityLabel} dotColor={priorityColor} />
        <StatCard label={t('detail.dateRange')} value={dateRangeText} />
      </View>
      <View style={styles.row}>
        <StatCard label={t('detail.checklist')} value={checklistText} />
        <StatCard
          label={t('detail.reminder')}
          value={reminderOn ? t('common.enable') : t('common.disabled')}
          icon={reminderOn ? 'notifications' : 'notifications-off-outline'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 9999,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
});
