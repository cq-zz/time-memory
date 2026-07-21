import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { useSettingsStore, formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../store/categories';
import { formatDisplay } from '../../utils/date';

function BillCard({ item, isLast }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const categoryState = useCategoryStore();
  const currency = useSettingsStore((s) => s.settings.currency);

  const isIncome = item.bill_type === 'income';
  const cat = resolveCategoryMeta(categoryState, 'bill', item.category, t);
  const amountColor = isIncome ? Colors.green : Colors.rose;
  const linked = Boolean(item.source && item.source_id);

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
      {/* Category icon */}
      <View style={[styles.iconBox, { backgroundColor: hexToRgba(Colors.purple, 0.1), borderRadius: Radius.circle }]}>
        <Ionicons name={cat.icon || 'pricetag-outline'} size={20} color={Colors.purple} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
            {item.name || '--'}
          </Text>
          {linked ? <Ionicons name="link" size={13} color={Colors.textTertiary} /> : null}
        </View>
        <Text style={[styles.meta, { color: Colors.textSecondary, fontFamily: Fonts.regular }]} numberOfLines={1}>
          {formatDisplay(item.consumption_date)}
          {cat.label ? ` · ${cat.label}` : ''}
        </Text>
      </View>

      {/* Amount */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: amountColor, fontFamily: Fonts.bold }]}>
          {isIncome ? '+' : '-'}
          {formatMoney(Number(item.amount) || 0, currency)}
        </Text>
        <Text style={[styles.typeText, { color: amountColor, fontFamily: Fonts.bold }]}>
          {isIncome ? t('bills.income') : t('bills.expense')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Bill list with year/month + search + type filtering.
 * `filter` is 'all' | 'expense' | 'income'.
 */
export default function BillsList({ items, year, month, search, filter, loading }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const filtered = items.filter((item) => {
    if (filter !== 'all' && item.bill_type !== filter) return false;
    if (year != null && item.consumption_date && Number(item.consumption_date.slice(0, 4)) !== year) return false;
    if (month != null && item.consumption_date && Number(item.consumption_date.slice(5, 7)) !== month) return false;
    if (search && !(item.name || '').toLowerCase().includes(search.toLowerCase())) return false;
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
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardGap: {
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
  name: {
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  meta: {
    fontSize: 12,
    lineHeight: 17,
  },
  amountCol: {
    alignItems: 'flex-end',
    gap: 2,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    lineHeight: 21,
  },
  typeText: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
