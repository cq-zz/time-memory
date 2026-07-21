import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { effectiveStatus, progress, patchSchedule } from '../../services/schedule';
import { statusMeta, priorityMeta, nextStatus, dateRangeText } from '../../utils/scheduleMeta';

function ScheduleCard({ item, isLast, onChanged }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const status = effectiveStatus(item);
  const sta = statusMeta(status, Colors, t);
  const pri = priorityMeta(item.priority, Colors, t);
  const prog = progress(item);
  const reminderOn = Number(item.reminder_enabled) === 1;

  const cycleStatus = async () => {
    await patchSchedule(item.id, { status: nextStatus(status) });
    onChanged();
  };

  const toggleReminder = async (value) => {
    await patchSchedule(item.id, { reminder_enabled: value });
    onChanged();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/schedule/${item.id}`)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      {/* Top row: priority badge + reminder bell */}
      <View style={styles.topRow}>
        <View style={[styles.priorityBadge, { backgroundColor: hexToRgba(pri.color, 0.12) }]}>
          <View style={[styles.priorityDot, { backgroundColor: pri.color }]} />
          <Text style={[styles.priorityText, { color: pri.color, fontFamily: Fonts.bold }]}>
            {pri.label}
          </Text>
        </View>
        {reminderOn ? <Ionicons name="notifications" size={18} color={Colors.purple} /> : null}
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Date range + checklist progress */}
      <View style={styles.metaRow}>
        <View style={styles.metaLeft}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {dateRangeText(item)}
          </Text>
        </View>
        {prog.total > 0 ? (
          <Text style={[styles.progressText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {prog.done}/{prog.total}
          </Text>
        ) : null}
      </View>

      {/* Bottom row: status pill (tap to cycle) + reminder switch */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={cycleStatus}
          style={[styles.statusPill, { backgroundColor: hexToRgba(sta.color, 0.12) }]}
        >
          <Ionicons name={sta.icon} size={14} color={sta.color} />
          <Text style={[styles.statusText, { color: sta.color, fontFamily: Fonts.bold }]}>
            {sta.label}
          </Text>
        </TouchableOpacity>

        <Switch
          value={reminderOn}
          onValueChange={toggleReminder}
          trackColor={{ false: Colors.lightGray, true: hexToRgba(Colors.purple, 0.4) }}
          thumbColor={reminderOn ? Colors.purple : Colors.card}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function SchedulesList({ items, search, filter, loading, onChanged }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
    if (search && !(item.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.count, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {t('common.count', { count: filtered.length })}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {loading ? t('common.loading') : t('schedule.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <ScheduleCard key={item.id} item={item} isLast={i === filtered.length - 1} onChanged={onChanged} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  count: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  cardGap: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 9999,
  },
  priorityText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  title: {
    fontSize: 17,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  progressText: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,120,120,0.12)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
