import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, dotColor }) {
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
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label="PRIORITY" value={priorityLabel} dotColor={priorityColor} />
        <StatCard label="DATE RANGE" value={dateRangeText} />
      </View>
      <View style={styles.row}>
        <StatCard label="CHECKLIST" value={checklistText} />
        <View
          style={[
            styles.statCard,
            { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl },
            Shadows.dark,
          ]}
        >
          <Text style={[styles.statLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
            REMINDER
          </Text>
          <View style={styles.statValueRow}>
            <Ionicons
              name={reminderOn ? 'notifications' : 'notifications-off-outline'}
              size={18}
              color={Colors.white}
            />
            <Text
              style={[styles.statValue, { color: Colors.white, fontFamily: Fonts.semiBold }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {reminderOn ? t('common.enable') : t('common.disabled')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    height: 90,
    padding: 20,
    gap: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
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
    fontSize: 20,
    lineHeight: 28,
    flexShrink: 1,
  },
});
