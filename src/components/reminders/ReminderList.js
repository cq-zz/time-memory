import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { reminderModuleMeta, reminderStatusText } from '../../utils/reminders';

/**
 * Reminders tab list — groups the aggregated reminder items into
 * OVERDUE / TODAY / UPCOMING sections. Tapping a card opens the
 * source module's detail page.
 */
function ReminderCard({ item, onPress }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const meta = reminderModuleMeta(item.module, Colors, t);

  const statusColor = item.expired ? Colors.rose : item.daysLeft === 0 ? Colors.orange : Colors.green;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.avatarBg, borderRadius: Radius.md },
        Shadows.dark,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={[styles.iconBox, { backgroundColor: hexToRgba(meta.color, 0.1), borderRadius: Radius.sm }]}>
        <Ionicons name={meta.icon} size={26} color={meta.color} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.typeRow}>
            <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
            <Text style={[styles.typeText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {meta.label}
            </Text>
          </View>
          <Text style={[styles.status, { color: statusColor, fontFamily: Fonts.bold }]}>
            {reminderStatusText(item, t)}
          </Text>
        </View>

        <Text style={[styles.cardTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ReminderList({ items = [], onPressItem }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <View style={[styles.emptyIcon, { backgroundColor: Colors.iconBg }]}>
          <Ionicons name="notifications-off-outline" size={28} color={Colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {t('reminder.noReminder')}
        </Text>
        <Text style={[styles.emptyDesc, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('reminder.noReminderDesc')}
        </Text>
      </View>
    );
  }

  const groups = [
    { label: t('reminder.groupOverdue'), items: items.filter((i) => i.expired) },
    { label: t('reminder.groupToday'), items: items.filter((i) => !i.expired && i.daysLeft === 0) },
    { label: t('reminder.groupUpcoming'), items: items.filter((i) => !i.expired && i.daysLeft > 0) },
  ].filter((g) => g.items.length > 0);

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.label} style={styles.group}>
          <Text style={[styles.groupLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {group.label}
          </Text>
          <View style={styles.groupItems}>
            {group.items.map((item) => (
              <ReminderCard key={item.id} item={item} onPress={() => onPressItem?.(item)} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 32,
  },
  group: {
    gap: 16,
  },
  groupLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  groupItems: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  status: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
