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
      {/* Top row: name + status pill (right) */}
      <View style={styles.topRow}>
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
          <Text style={[styles.statusText, { color: inUse ? Colors.green : Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {inUse ? t('durable.inUse') : t('durable.disposed')}
          </Text>
        </View>
      </View>

      {/* Middle: left image + right info */}
      <View style={styles.middle}>
        <View style={[styles.image, { backgroundColor: Colors.avatarBg, borderRadius: Radius.md }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.imageInner} resizeMode="cover" />
          ) : (
            <Ionicons name={cat.icon} size={32} color={Colors.textSecondary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.price, { color: Colors.textPrimary, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {formatMoney(item.purchase_price, currency)}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name={cat.icon} size={11} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {cat.label}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {days != null
              ? `${t('durable.companionDuration')} ${days}${lifespanDays ? ` / ${lifespanDays}` : ''} ${t('common.days')}`
              : '--'}
          </Text>
          {lifespanDays ? (
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
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const pad = (n) => String(n).padStart(2, '0');

export default function ItemsList({ items, year, month, search, filter, currency, loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

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
  price: {
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
