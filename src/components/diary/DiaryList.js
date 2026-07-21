import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { WEATHER_OPTIONS } from '../../utils/constant';
import { formatDisplay } from '../../utils/date';

const ACCENT_CYCLE = ['#F28B50', '#6B5CE7', '#4A90D9', '#E86B8A', '#E8B830', '#6BAA90'];

const WEATHER_EMOJI = {};
WEATHER_OPTIONS.forEach((w) => {
  WEATHER_EMOJI[w.key] = w.emoji;
});

export function weatherLabel(key, t) {
  if (!key) return '';
  return t(`diary.weather${key.charAt(0).toUpperCase()}${key.slice(1)}`);
}

function DiaryCard({ item, index, onPress }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];
  const emoji = WEATHER_EMOJI[item.weather] || '';
  const isPrivate = Number(item.is_private) === 1;
  const hasImage = Boolean(item.image) && !imageError;
  const isBroken = Boolean(item.image) && imageError;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(item)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        index > 0 && styles.cardGap,
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.bar, { backgroundColor: accent }]} />

      {/* Icon chip: thumbnail / broken hint / book icon */}
      <View style={[styles.chip, { backgroundColor: hexToRgba(accent, 0.12), borderRadius: Radius.sm }]}>
        {hasImage ? (
          <Image
            source={{ uri: item.image }}
            style={styles.chipImage}
            contentFit="cover"
            onError={() => setImageError(true)}
          />
        ) : isBroken ? (
          <Text style={[styles.brokenHint, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
            {t('diary.imageBroken')}
          </Text>
        ) : (
          <Ionicons name="book-outline" size={22} color={accent} />
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {isPrivate ? <Ionicons name="lock-closed" size={13} color={Colors.textTertiary} /> : null}
        </View>
        <Text style={[styles.date, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {formatDisplay(item.date)}
        </Text>
        {emoji ? (
          <Text style={[styles.weather, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {emoji} {weatherLabel(item.weather, t)}
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={16} color={hexToRgba(accent, 0.5)} />
    </TouchableOpacity>
  );
}

/**
 * Diary list with year/month filtering.
 * Tapping a card calls onPressItem(item) — the page decides whether to
 * gate private entries behind the password modal.
 */
export default function DiaryList({ items, year, month, loading, onPressItem }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (year != null && item.date && Number(item.date.slice(0, 4)) !== year) return false;
    if (month != null && item.date && Number(item.date.slice(5, 7)) !== month) return false;
    return true;
  });

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[styles.count, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {t('common.count', { count: filtered.length })}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={48} color={hexToRgba(ACCENT_CYCLE[0], 0.3)} />
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {loading ? t('common.loading') : t('diary.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <DiaryCard key={item.id} item={item} index={i} onPress={onPressItem} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  count: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 16,
    paddingRight: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardGap: {
    marginTop: 16,
  },
  bar: {
    width: 3,
    height: 48,
    borderRadius: 2,
  },
  chip: {
    width: 56,
    aspectRatio: 3 / 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipImage: {
    width: '100%',
    height: '100%',
  },
  brokenHint: {
    fontSize: 7,
    maxWidth: 48,
    textAlign: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  date: {
    fontSize: 12,
    lineHeight: 17,
  },
  weather: {
    fontSize: 12,
    lineHeight: 17,
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
