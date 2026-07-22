import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { listBudgets, removeBudget } from '../../src/services/budget';
import ModuleHeader from '../../src/components/common/ModuleHeader';
import ConfirmModal from '../../src/components/common/ConfirmModal';

function BudgetCard({ item, isLast, onDelete }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/budget/form?id=${item.id}`)}
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
        !isLast && styles.cardGap,
      ]}
    >
      {/* Top row: year badge + delete */}
      <View style={styles.topRow}>
        <View style={[styles.yearBadge, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
          <Ionicons name="flag-outline" size={14} color={Colors.purple} />
          <Text style={[styles.yearText, { color: Colors.purple, fontFamily: Fonts.bold }]}>{item.year}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onDelete(item)}
          style={[styles.deleteBtn, { backgroundColor: hexToRgba(Colors.rose, 0.1) }]}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.rose} />
        </TouchableOpacity>
      </View>

      {/* Expense budget row */}
      <View style={styles.amountRow}>
        <Text style={[styles.amountLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('budget.expenseBudget')}
        </Text>
        <Text style={[styles.amountValue, { color: Colors.rose, fontFamily: Fonts.bold }]}>
          {formatMoney(Number(item.expense_budget) || 0, item.currency || currency)}
        </Text>
      </View>

      {/* Income target row */}
      <View style={[styles.amountRow, styles.amountRowLast]}>
        <Text style={[styles.amountLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('budget.incomeTarget')}
        </Text>
        <Text style={[styles.amountValue, { color: Colors.green, fontFamily: Fonts.bold }]}>
          {formatMoney(Number(item.income_target) || 0, item.currency || currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function BudgetScreen() {
  const { Colors, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await listBudgets());
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <ModuleHeader title={t('nav.budget')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.count, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {t('common.count', { count: items.length })}
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flag-outline" size={48} color={hexToRgba(Colors.orange, 0.3)} />
            <Text style={[styles.emptyText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {loading ? t('common.loading') : t('budget.empty')}
            </Text>
          </View>
        ) : (
          items.map((item, i) => (
            <BudgetCard key={item.id} item={item} isLast={i === items.length - 1} onDelete={setDeleteTarget} />
          ))
        )}
      </ScrollView>

      {/* Floating action button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.inkDeep }, Shadows.dark]}
        activeOpacity={0.8}
        onPress={() => router.push('/budget/form')}
      >
        <Ionicons name="add" size={30} color={Colors.white} />
      </TouchableOpacity>

      <ConfirmModal
        visible={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await removeBudget(deleteTarget.id);
          setDeleteTarget(null);
          load();
        }}
        title={t('common.tip')}
        description={t('budget.deleteConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 112,
  },
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
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardGap: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  yearText: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,120,120,0.12)',
  },
  amountRowLast: {
    marginTop: 0,
  },
  amountLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  amountValue: {
    fontSize: 16,
    lineHeight: 22,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
