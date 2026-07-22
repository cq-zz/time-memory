import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../store/categories';
import { effectiveStatus, companionDays, displayValue } from '../../services/asset';
import { formatDisplay } from '../../utils/date';

function AssetCard({ item, currency, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const categoryState = useCategoryStore();

  const cat = resolveCategoryMeta(categoryState, 'asset', item.category, t);
  const status = effectiveStatus(item);
  const active = status === 'active';
  const days = companionDays(item);
  const years = days != null ? days / 365 : null;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/asset/${item.id}`)}
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
              { backgroundColor: active ? 'rgba(74, 168, 104, 0.15)' : 'rgba(120,120,120,0.15)' },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: active ? Colors.green : Colors.textSecondary }]} />
            <Text
              style={[
                styles.statusText,
                { color: active ? Colors.green : Colors.textSecondary, fontFamily: Fonts.semiBold },
              ]}
            >
              {active ? t('asset.active') : t('asset.disposed')}
            </Text>
          </View>
        </View>

        <Text style={[styles.price, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
          {formatMoney(displayValue(item), currency)}
        </Text>
      </View>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {formatDisplay(item.purchase_date)}
        </Text>
        <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {years != null ? `${years.toFixed(1)} ${t('common.years')}` : '--'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AssetsList({ items, year, month, search, filter, currency, loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && effectiveStatus(item) !== filter) return false;
    if (year != null && item.purchase_date && Number(item.purchase_date.slice(0, 4)) !== year) return false;
    if (month != null && item.purchase_date && Number(item.purchase_date.slice(5, 7)) !== month) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {loading ? t('common.loading') : t('asset.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => (
          <AssetCard key={item.id} item={item} currency={currency} isLast={i === filtered.length - 1} />
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
  price: {
    fontSize: 18,
    lineHeight: 24,
    maxWidth: 110,
    textAlign: 'right',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,120,120,0.12)',
  },
  metaText: {
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.6,
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
