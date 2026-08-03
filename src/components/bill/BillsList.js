import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta, resolveCategoryMetaAll } from '../../store/categories';
import { formatDisplay } from '../../utils/date';
import { isAutoSource, isAssetSource } from '../../utils/excel';
import { getDurable } from '../../services/durable';
import { getAsset } from '../../services/asset';

function BillCard({ item, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const categoryState = useCategoryStore();
  const currency = useSettingsStore((s) => s.settings.currency);

  const isIncome = item.bill_type === 'income';
  const amountColor = isIncome ? Colors.green : Colors.rose;

  // Auto-generated bills: resolve category across all types (item/bill/asset)
  // because the category may come from the originating item/asset.
  const auto = isAutoSource(item.source);
  const cat = auto
    ? resolveCategoryMetaAll(categoryState, item.category, t)
    : resolveCategoryMeta(categoryState, 'bill', item.category, t);
  const catLabel = cat.label;
  const catIcon = cat.icon || 'pricetag-outline';

  // Fetch source image for auto-generated bills
  const [sourceImage, setSourceImage] = useState('');
  useEffect(() => {
    if (!auto || !item.source_id) return;
    let active = true;
    const fetchImage = async () => {
      try {
        const src = isAssetSource(item.source) ? await getAsset(item.source_id) : await getDurable(item.source_id);
        if (active && src?.image) setSourceImage(src.image);
      } catch { /* ignore */ }
    };
    fetchImage();
    return () => { active = false; };
  }, [auto, item.source, item.source_id]);

  const hasSourceImage = auto && Boolean(sourceImage);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/bill/${item.id}`)}
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
          {item.name || '--'}
        </Text>
        <View style={[styles.statusPill, { backgroundColor: hexToRgba(amountColor, 0.12) }]}>
          <View style={[styles.statusDot, { backgroundColor: amountColor }]} />
          <Text style={[styles.statusText, { color: amountColor, fontFamily: Fonts.semiBold }]}>
            {isIncome ? t('bills.income') : t('bills.expense')}
          </Text>
        </View>
      </View>

      {/* Middle: left icon/image + right info */}
      <View style={styles.middle}>
        <View style={[styles.iconBox, { backgroundColor: hexToRgba(Colors.purple, 0.1), borderRadius: Radius.md }]}>
          {hasSourceImage ? (
            <Image source={{ uri: sourceImage }} style={styles.iconImage} contentFit="cover" />
          ) : (
            <Ionicons name={catIcon} size={28} color={Colors.purple} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[styles.amount, { color: amountColor, fontFamily: Fonts.bold }]} numberOfLines={1}>
            {isIncome ? '+' : '-'}{formatMoney(Number(item.amount) || 0, currency)}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name={catIcon} size={11} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {catLabel}
            </Text>
          </View>
          <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {formatDisplay(item.consumption_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const pad = (n) => String(n).padStart(2, '0');

function inMonthRange(dateStr, startYear, startMonth, endYear, endMonth) {
  if (startYear == null && endYear == null) return true;
  const prefix = (dateStr || '').slice(0, 7);
  if (startYear != null && startMonth != null) {
    if (prefix < `${startYear}-${pad(startMonth)}`) return false;
  }
  if (endYear != null && endMonth != null) {
    if (prefix > `${endYear}-${pad(endMonth)}`) return false;
  }
  return true;
}

/**
 * Bill list with month-range + search + type filtering.
 * `filter` is 'all' | 'expense' | 'income'.
 */
export default function BillsList({ items, startYear, startMonth, endYear, endMonth, search, filter, loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.bill_type !== filter) return false;
    if (!inMonthRange(item.consumption_date, startYear, startMonth, endYear, endMonth)) return false;
    if (search && !(item.name || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color={hexToRgba(Colors.orange, 0.3)} />
          <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
            {loading ? t('common.loading') : t('bills.empty')}
          </Text>
        </View>
      ) : (
        filtered.map((item, i) => <BillCard key={item.id} item={item} isLast={i === filtered.length - 1} />)
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
  iconBox: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: 80,
    height: 80,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
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
