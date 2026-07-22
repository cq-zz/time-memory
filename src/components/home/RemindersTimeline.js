import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { reminderModuleMeta } from '../../utils/reminders';
import { formatDisplay } from '../../utils/date';

const MAX_ITEMS = 5;

function TimelineDot({ color, glowing }) {
  const { Colors, Shadows } = useTheme();

  if (glowing) {
    return (
      <View style={[styles.glowDot, { backgroundColor: Colors.inkDeep, borderColor: Colors.white }]}>
        <View style={[styles.glowInner, Shadows.card]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: color, borderColor: Colors.white },
        Shadows.card,
      ]}
    />
  );
}

function ReminderCard({ item, time, timeColor, meta, active, onPress }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  if (active) {
    return (
      <TouchableOpacity
        style={[styles.activeCard, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={styles.cardTopRow}>
          <Text style={[styles.timeText, { color: Colors.orange, fontFamily: Fonts.bold }]}>
            {time}
          </Text>
          <Ionicons name="notifications" size={15} color={Colors.white40} />
        </View>
        <Text style={[styles.cardTitle, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.activeDesc, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            {meta}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.timeText, { color: timeColor, fontFamily: Fonts.bold }]}>{time}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
      </View>
      <Text style={[styles.cardTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
        {item.title}
      </Text>
      {meta ? (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {meta}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function RemindersTimeline({ reminders = [], onPressItem, onViewAll }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const items = reminders.slice(0, MAX_ITEMS);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {t('home.todaysReminders')}
        </Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={[styles.viewAll, { color: Colors.orange, fontFamily: Fonts.bold }]}>
            {t('home.viewAll')}
          </Text>
        </TouchableOpacity>
      </View>

      {!items.length ? (
        <View style={[styles.emptyCard, { backgroundColor: Colors.card, borderColor: Colors.cardBorder }]}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {t('reminder.noReminder')} · {t('reminder.noReminderDesc')}
          </Text>
        </View>
      ) : (
        <View style={styles.timeline}>
          {/* Vertical line */}
          <View style={[styles.verticalLine, { backgroundColor: Colors.cardBorder }]} />

          {items.map((item, i) => {
            const meta = reminderModuleMeta(item.module, Colors, t);
            const isLast = i === items.length - 1;
            const time = item.expired
              ? t('home.overdue')
              : item.daysLeft === 0
                ? t('home.todayDue')
                : t('home.inDaysShort', { count: item.daysLeft });
            const timeColor = item.expired
              ? Colors.orange
              : item.daysLeft === 0
                ? Colors.orange
                : Colors.purple;

            return (
              <View key={item.id} style={[styles.itemWrap, isLast && styles.itemWrapLast]}>
                <TimelineDot glowing={item.expired} color={meta.color} />
                <ReminderCard
                  item={item}
                  active={item.expired}
                  time={time}
                  timeColor={timeColor}
                  meta={`${meta.label} · ${formatDisplay(item.date)}`}
                  onPress={() => onPressItem?.(item)}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  viewAll: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  emptyCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  timeline: {
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 19,
    top: 16,
    width: 2,
    height: '88%',
  },
  itemWrap: {
    paddingLeft: 40,
    paddingBottom: 32,
    position: 'relative',
  },
  itemWrapLast: {
    paddingBottom: 0,
  },
  dot: {
    position: 'absolute',
    left: 15,
    top: 20,
    width: 10,
    height: 10,
    borderRadius: 9999,
    borderWidth: 2,
  },
  glowDot: {
    position: 'absolute',
    left: 8,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  activeCard: {
    padding: 16,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 22,
  },
  activeDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
