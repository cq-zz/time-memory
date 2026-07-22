import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../store/categories';
import {
  effectiveStatus,
  companionDays,
  expectedLifespanDays,
  lifespanPercent,
} from '../../services/durable';

function ItemCard({ item, currency, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const categoryState = useCategoryStore();

  const cat = resolveCategoryMeta(categoryState, 'item', item.category, t);
  const status = effectiveStatus(item);
  const inUse = status === 'in_use';
  const days = companionDays(item);
  const lifespanDays = expectedLifespanDays(item);
  const percent = lifespanPercent(item);
  const progress = percent != null ? percent / 100 : null;
  const barColor = progress == null ? Colors.textSecondary : progress > 0.8 ? Colors.rose : Colors.green;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/durable/${item.id}`)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      <View style={styles.cardTop}>
        {/* Image / icon fallback */}
        <View style={[styles.image, { backgroundColor: Colors.avatarBg, borderRadius: Radius.xl }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.imageInner} resizeMode="cover" />
          ) : (
            <Ionicons name={cat.icon} size={36} color={Colors.textSecondary} />
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.categoryRow}>
            <Ionicons name={cat.icon} size={12} color={Colors.textSecondary} />
            <Text style={[styles.categoryText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {cat.label}
            </Text>
          </View>

          <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
            {item.name}
          </Text>

          <View
            style={[
              styles.statusPill,
              { backgroundColor: inUse ? 'rgba(74, 168, 104, 0.15)' : 'rgba(120,120,120,0.15)' },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: inUse ? Colors.green : Colors.textSecondary }]} />
            <Text
              style={[
                styles.statusText,
                { color: inUse ? Colors.green : Colors.textSecondary, fontFamily: Fonts.semiBold },
              ]}
            >
              {inUse ? t('durable.inUse') : t('durable.disposed')}
            </Text>
          </View>
        </View>

        <View style={styles.priceCol}>
          <Text style={[styles.priceLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('durable.purchasePrice')}
          </Text>
          <Text style={[styles.price, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
            {formatMoney(item.purchase_price, currency)}
          </Text>
        </View>
      </View>

      {/* Lifespan */}
      <View style={styles.lifespanBlock}>
        <View style={styles.lifespanRow}>
          <Text style={[styles.lifespanLabel, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {t('durable.companionDuration')}
          </Text>
          <Text style={[styles.lifespanValue, { color: barColor, fontFamily: Fonts.semiBold }]}>
            {days != null
              ? `${days}${lifespanDays ? ` / ${lifespanDays}` : ''} ${t('common.days')}`
              : '--'}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: Colors.avatarBg, borderRadius: Radius.pill }]}>
          <View
            style={[
              styles.fill,
              {
                backgroundColor: barColor,
                borderRadius: Radius.pill,
                width: `${(progress ?? 0) * 100}%`,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const pad = (n) => String(n).padStart(2, '0');

export default function ItemsList({ items, year, month, search, filter, currency, loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  // year=null → all; month=null → whole year; otherwise match YYYY-MM prefix.
  const datePrefix = year != null ? (month != null ? `${year}-${pad(month)}` : `${year}`) : null;

  const filtered = items.filter((item) => {
    if (datePrefix && !(item.purchase_date || '').startsWith(datePrefix)) return false;
    if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
    if (search && !(item.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {loading ? t('common.loading') : t('durable.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <ItemCard key={item.id} item={item} currency={currency} isLast={i === filtered.length - 1} />
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
  },
  cardGap: {
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageInner: {
    width: 96,
    height: 96,
  },
  info: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
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
  priceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    maxWidth: 110,
  },
  priceLabel: {
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'right',
  },
  lifespanBlock: {
    marginTop: 16,
    gap: 8,
  },
  lifespanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lifespanLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  lifespanValue: {
    fontSize: 12,
    lineHeight: 16,
  },
  track: {
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
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
