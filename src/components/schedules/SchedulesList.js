import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { effectiveStatus, patchSchedule } from '../../services/schedule';
import { statusMeta, priorityMeta, nextStatus, dateRangeText } from '../../utils/scheduleMeta';

const datePart = (value) => (typeof value === 'string' ? value.slice(0, 10) : '');

function ScheduleCard({ item, isLast, onChanged }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const status = effectiveStatus(item);
  const sta = statusMeta(status, Colors, t);
  const pri = priorityMeta(item.priority, Colors, t);
  const reminderOn = Number(item.reminder_enabled) === 1;

  const cycleStatus = async () => {
    await patchSchedule(item.id, { status: nextStatus(status) });
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
          <View style={[styles.reminderBadge, { backgroundColor: reminderOn ? hexToRgba(Colors.purple, 0.12) : hexToRgba(Colors.textSecondary, 0.08) }]}>
            <Ionicons name={reminderOn ? 'notifications' : 'notifications-off-outline'} size={11} color={reminderOn ? Colors.purple : Colors.textSecondary} />
            <Text style={[styles.reminderText, { color: reminderOn ? Colors.purple : Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {reminderOn ? t('common.enable') : t('common.disabled')}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="flash-outline" size={11} color={pri.color} />
            <Text style={[styles.metaText, { color: pri.color, fontFamily: Fonts.bold }]} numberOfLines={1}>
              {pri.label}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
              {dateRangeText(item)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const pad = (n) => String(n).padStart(2, '0');

function inScheduleRange(item, startYear, startMonth, endYear, endMonth) {
  if (startYear == null && endYear == null) return true;
  const sStart = datePart(item.start_date || item.end_date);
  const sEnd = datePart(item.end_date || item.start_date);

  if (startYear != null && startMonth != null) {
    const periodStart = `${startYear}-${pad(startMonth)}-01`;
    if (sEnd && sEnd < periodStart) return false;
  }
  if (endYear != null && endMonth != null) {
    const periodEndExclusive = endMonth === 12
      ? `${endYear + 1}-01-01`
      : `${endYear}-${pad(endMonth + 1)}-01`;
    if (sStart && sStart >= periodEndExclusive) return false;
  }
  return true;
}

export default function SchedulesList({ items, startYear, startMonth, endYear, endMonth, search, filter, loading, onChanged }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
    if (!inScheduleRange(item, startYear, startMonth, endYear, endMonth)) return false;
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
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  reminderText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
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
