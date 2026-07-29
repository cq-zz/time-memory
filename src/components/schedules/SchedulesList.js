import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { effectiveStatus, progress, patchSchedule } from '../../services/schedule';
import { statusMeta, priorityMeta, nextStatus, dateRangeText } from '../../utils/scheduleMeta';

const datePart = (value) => (typeof value === 'string' ? value.slice(0, 10) : '');

function ScheduleCard({ item, isLast, onChanged }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const status = effectiveStatus(item);
  const sta = statusMeta(status, Colors, t);
  const pri = priorityMeta(item.priority, Colors, t);
  const prog = progress(item);
  const reminderOn = Number(item.reminder_enabled) === 1;
  const progPercent = prog.total > 0 ? prog.done / prog.total : 0;

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
      {/* Top row: title + status pill (right) */}
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={cycleStatus}
          style={[styles.statusPill, { backgroundColor: hexToRgba(sta.color, 0.12) }]}
        >
          <Ionicons name={sta.icon} size={12} color={sta.color} />
          <Text style={[styles.statusText, { color: sta.color, fontFamily: Fonts.semiBold }]}>
            {sta.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Middle: left icon + right info */}
      <View style={styles.middle}>
        <View style={[styles.iconBox, { backgroundColor: hexToRgba(pri.color, 0.1), borderRadius: Radius.md }]}>
          <Ionicons name="calendar-outline" size={28} color={pri.color} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.priorityLabel, { color: pri.color, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {pri.label}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
              {dateRangeText(item)}
            </Text>
          </View>
          {prog.total > 0 ? (
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {prog.done}/{prog.total} {t('schedule.checklist') || 'checklist'}
            </Text>
          ) : null}
        </View>

        <Switch
          value={reminderOn}
          onValueChange={toggleReminder}
          trackColor={{ false: Colors.lightGray, true: hexToRgba(Colors.purple, 0.4) }}
          thumbColor={reminderOn ? Colors.purple : Colors.card}
          style={styles.switch}
        />
      </View>

      {/* Bottom: checklist progress bar */}
      {prog.total > 0 ? (
        <View style={[styles.track, { backgroundColor: Colors.avatarBg, borderRadius: Radius.pill }]}>
          <View
            style={[
              styles.fill,
              { backgroundColor: sta.color, borderRadius: Radius.pill, width: `${progPercent * 100}%` },
            ]}
          />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function SchedulesList({ items, year, month, search, filter, loading, onChanged }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
    if (year != null) {
      const periodStart = month
        ? `${year}-${String(month).padStart(2, '0')}-01`
        : `${year}-01-01`;
      const periodEndExclusive = month
        ? month === 12
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, '0')}-01`
        : `${year + 1}-01-01`;
      const scheduleStart = datePart(item.start_date || item.end_date);
      const scheduleEnd = datePart(item.end_date || item.start_date);
      if (
        scheduleStart &&
        scheduleEnd &&
        (scheduleStart >= periodEndExclusive || scheduleEnd < periodStart)
      ) {
        return false;
      }
    }
    if (search && !(item.title || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
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
  card: {
    padding: 14,
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
    gap: 8,
  },
  name: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.6,
  },
  middle: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  priorityLabel: {
    fontSize: 20,
    lineHeight: 26,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  switch: {
    flexShrink: 0,
  },
  track: {
    height: 6,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
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
