import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, icon, iconColor, dotColor }) {
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
        {icon ? <Ionicons name={icon} size={16} color={iconColor} /> : null}
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
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

export default function ImportantDateStatsGrid({
  dateText,
  typeLabel,
  typeIcon,
  typeColor,
  priorityLabel,
  priorityColor,
  reminderOn,
  reminderTypeText,
  reminderDaysText,
  yearsText,
}) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label={t('detail.date')} value={dateText} />
        <StatCard label={t('detail.type')} value={typeLabel} icon={typeIcon} iconColor={typeColor} />
      </View>
      <View style={styles.row}>
        <StatCard label={t('detail.priority')} value={priorityLabel} dotColor={priorityColor} />
        <StatCard
          label={t('detail.reminder')}
          value={reminderOn ? t('common.enable') : t('common.disabled')}
          icon={reminderOn ? 'notifications' : 'notifications-off-outline'}
          iconColor={reminderOn ? Colors.purple : Colors.textSecondary}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          label={t('importantDate.reminderType')}
          value={reminderTypeText}
          icon="repeat-outline"
          iconColor={Colors.purple}
        />
        <StatCard
          label={t('importantDate.reminderDaysBefore')}
          value={reminderDaysText}
          icon="time-outline"
          iconColor={Colors.purple}
        />
      </View>

      <View
        style={[
          styles.yearsCard,
          { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
          Shadows.card,
        ]}
      >
        <View style={styles.yearsTop}>
          <Text style={[styles.yearsLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('detail.years')}
          </Text>
          <View style={[styles.yearsIconBox, { backgroundColor: Colors.iconBg, borderRadius: Radius.circle }]}>
            <Ionicons name="hourglass-outline" size={20} color={Colors.textPrimary} />
          </View>
        </View>
        <Text
          style={[styles.yearsValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {yearsText}
        </Text>
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
    width: 9,
    height: 9,
    borderRadius: 9999,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 22,
    flexShrink: 1,
  },
  yearsCard: {
    padding: 16,
    gap: 12,
    borderWidth: 1,
  },
  yearsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearsLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  yearsIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearsValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
