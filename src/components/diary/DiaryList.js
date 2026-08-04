import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { WEATHER_OPTIONS } from '../../utils/constant';
import { formatDisplay } from '../../utils/date';

const WEATHER_EMOJI = {};
WEATHER_OPTIONS.forEach((w) => {
  WEATHER_EMOJI[w.key] = w.emoji;
});

export function weatherLabel(key, t) {
  if (typeof key !== 'string' || !key) return '';
  return t(`diary.weather${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

function DiaryCard({ item, isLast, onPress }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const emoji = WEATHER_EMOJI[item.weather] || '';
  const isPrivate = Number(item.is_private) === 1;
  const hasImage = Boolean(item.image) && !imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      {/* Top row: title + private pill (right) */}
      <View style={styles.topRow}>
        <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: isPrivate ? hexToRgba(Colors.purple, 0.12) : 'rgba(74, 168, 104, 0.15)' },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: isPrivate ? Colors.purple : Colors.green }]} />
          <Text style={[styles.statusText, { color: isPrivate ? Colors.purple : Colors.green, fontFamily: Fonts.semiBold }]}>
            {isPrivate ? t('diary.private') : t('diary.public')}
          </Text>
        </View>
      </View>

      {/* Middle: left image + right info */}
      <View style={styles.middle}>
        <View style={[styles.image, { backgroundColor: Colors.avatarBg, borderRadius: Radius.md }]}>
          {hasImage ? (
            <Image
              source={{ uri: item.image }}
              style={styles.imageInner}
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Ionicons name="book-outline" size={32} color={Colors.textSecondary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.dateText, { color: Colors.textPrimary, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {formatDisplay(item.date)}
          </Text>
          {emoji ? (
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {emoji} {weatherLabel(item.weather, t)}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function inDayRange(dateStr, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const d = (dateStr || '').slice(0, 10);
  if (startDate && d < startDate) return false;
  if (endDate && d > endDate) return false;
  return true;
}

/**
 * Diary list with day-range filtering.
 * Tapping a card calls onPressItem(item) — the page decides whether to
 * gate private entries behind the password modal.
 */
export default function DiaryList({ items = [], dimension, startDate, endDate, search = '', loading, onPressItem = () => {} }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const query = String(search || '').trim().toLowerCase();
  const filtered = safeItems.filter((item) => {
    const itemDate = typeof item?.date === 'string' ? item.date : '';
    if (dimension === 'day' && !inDayRange(itemDate, startDate, endDate)) return false;
    if (
      query &&
      !String(item?.title || '').toLowerCase().includes(query) &&
      !String(item?.content || '').toLowerCase().includes(query)
    ) return false;
    return true;
  });

  return (
    <View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={hexToRgba(Colors.orange, 0.3)} />
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {loading ? t('common.loading') : t('diary.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <DiaryCard
            key={item.id}
            item={item}
            isLast={i === filtered.length - 1}
            onPress={onPressItem}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 9999,
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
  image: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageInner: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 20,
    lineHeight: 26,
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
