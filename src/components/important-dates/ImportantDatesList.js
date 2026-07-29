import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { countdownDays, yearsPassed } from '../../services/importantDate';
import { typeMeta, countdownText } from '../../utils/importantDateMeta';
import { formatDisplay } from '../../utils/date';

function ImportantDateCard({ item, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const ty = typeMeta(item.type, Colors, t);
  const days = countdownDays(item);
  const cd = countdownText(days, Colors, t);
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
      {/* Top row: name + type pill (right) */}
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: hexToRgba(ty.color, 0.12) }]}>
          <Ionicons name={ty.icon} size={11} color={ty.color} />
          <Text style={[styles.statusText, { color: ty.color, fontFamily: Fonts.semiBold }]}>
            {ty.label}
          </Text>
        </View>
      </View>

      {/* Middle: left icon + right info */}
      <View style={styles.middle}>
        <View style={[styles.iconBox, { backgroundColor: hexToRgba(ty.color, 0.1), borderRadius: Radius.md }]}>
          <Ionicons name={ty.icon} size={28} color={ty.color} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.countdown, { color: cd.color, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {cd.text}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {formatDisplay(item.date)}
            </Text>
          </View>
          {isAnnual && years != null ? (
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {t('importantDate.yearCount', { count: years + 1 })}
            </Text>
          ) : null}
        </View>
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
  countdown: {
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
