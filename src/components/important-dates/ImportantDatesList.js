import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { countdownDays, yearsPassed } from '../../services/importantDate';
import { typeMeta, countdownText } from '../../utils/importantDateMeta';
import { priorityMeta } from '../../utils/scheduleMeta';
import { formatDisplay } from '../../utils/date';

function ImportantDateCard({ item, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const ty = typeMeta(item.type, Colors, t);
  const pri = priorityMeta(item.priority, Colors, t);
  const days = countdownDays(item);
  const cd = countdownText(days, Colors, t);
  const reminderOn = Number(item.reminder_enabled) === 1;
  const isAnnual = (item.reminder_type || 'annual') === 'annual';
  const years = yearsPassed(item);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/important-date/${item.id}`)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      {/* Top row: type badge + priority + bell */}
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: hexToRgba(ty.color, 0.12) }]}>
          <Ionicons name={ty.icon} size={12} color={ty.color} />
          <Text style={[styles.typeText, { color: ty.color, fontFamily: Fonts.bold }]}>{ty.label}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={[styles.priorityBadge, { backgroundColor: hexToRgba(pri.color, 0.12) }]}>
            <Text style={[styles.priorityText, { color: pri.color, fontFamily: Fonts.bold }]}>
              {pri.label}
            </Text>
          </View>
          {reminderOn ? <Ionicons name="notifications" size={16} color={Colors.purple} /> : null}
        </View>
      </View>

      {/* Name */}
      <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Details row */}
      <View style={styles.detailRow}>
        <View style={styles.detailLeft}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={[styles.detailText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {formatDisplay(item.date)}
          </Text>
          {isAnnual && years != null ? (
            <Text style={[styles.yearText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {t('importantDate.yearCount', { count: years + 1 })}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.countdown, { color: cd.color, fontFamily: Fonts.bold }]}>{cd.text}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ImportantDatesList({ items = [], search = '', filter = 'all', loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const query = String(search || '').trim().toLowerCase();
  const filtered = safeItems.filter((item) => {
    if (filter !== 'all' && item?.type !== filter) return false;
    if (query && !String(item?.name || '').toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={hexToRgba(Colors.purple, 0.3)} />
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {loading ? t('common.loading') : t('importantDate.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <ImportantDateCard key={item.id} item={item} isLast={i === filtered.length - 1} />
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  typeText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  priorityText: {
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  name: {
    fontSize: 17,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,120,120,0.12)',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  detailText: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  yearText: {
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  countdown: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
