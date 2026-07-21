import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../src/store/categories';
import {
  getDurable,
  getLinkedAsset,
  removeDurable,
  effectiveStatus,
  companionDays,
  dailyAvg,
  totalCost,
  expectedDailyAvg,
  expectedLifespanDays,
  lifespanPercent,
} from '../../src/services/durable';
import { listBillsBySource } from '../../src/services/bill';
import { formatDisplay } from '../../src/utils/date';
import DurableHero from '../../src/components/durable-detail/DurableHero';
import StatsGrid from '../../src/components/durable-detail/StatsGrid';
import LinkedAsset from '../../src/components/durable-detail/LinkedAsset';
import RelatedBills from '../../src/components/common/RelatedBills';
import DetailFooter from '../../src/components/common/DetailFooter';

export default function DurableDetailScreen() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const categoryState = useCategoryStore();

  const [row, setRow] = useState(null);
  const [linkedAsset, setLinkedAsset] = useState(null);
  const [relatedBills, setRelatedBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const item = id ? await getDurable(id) : null;
        if (!active) return;
        setRow(item);
        setLinkedAsset(item ? await getLinkedAsset(item) : null);
        setRelatedBills(item ? await listBillsBySource(item.id) : []);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  // ── Loading / not-found states ──────────────────
  if (loading) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('durable.loadingDetail')}
        </Text>
      </View>
    );
  }

  if (!row) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <Ionicons name="file-tray-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('durable.itemNotFound')}
        </Text>
        <Pressable
          onPress={() => router.replace('/durable')}
          style={[styles.stateBtn, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.stateBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.backToList')}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Derived values (computed like the old project) ──
  const cat = resolveCategoryMeta(categoryState, 'item', row.category, t);
  const status = effectiveStatus(row);
  const inUse = status === 'in_use';
  const cost = totalCost(row, relatedBills);
  const days = companionDays(row);
  const daily = dailyAvg(row, relatedBills);
  const expDaily = expectedDailyAvg(row, relatedBills);
  const percent = lifespanPercent(row);
  const lifespanDays = expectedLifespanDays(row);

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DurableHero
          image={row.image || null}
          fallbackIcon={cat.icon}
          title={row.name}
          statusText={inUse ? t('durable.inUse') : t('durable.disposed')}
          statusColor={inUse ? Colors.green : Colors.textSecondary}
          totalCostText={formatMoney(cost, currency)}
        />
        <View style={styles.sections}>
          <StatsGrid
            categoryLabel={cat.label}
            categoryIcon={cat.icon}
            purchaseDateText={formatDisplay(row.purchase_date)}
            dailyCostText={daily != null ? formatMoney(daily, currency) : '--'}
            companionText={days != null ? `${days} ${t('common.days')}` : '--'}
            expectedDailyText={expDaily != null ? formatMoney(expDaily, currency) : '--'}
            percent={percent}
            lifespanNoteText={
              percent != null ? `${days} / ${lifespanDays} ${t('common.days')}` : '--'
            }
          />
          <LinkedAsset asset={linkedAsset} currency={currency} />
          <RelatedBills
            bills={relatedBills}
            currency={currency}
            expenseTitle={t('durable.otherExpenses')}
            incomeTitle={t('durable.otherIncomes')}
            subtotalLabel={t('durable.subtotal')}
          />
        </View>
      </ScrollView>

      {/* Floating back button over hero */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: 'rgba(255,255,255,0.25)' }]}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Fixed bottom actions */}
      <View style={{ paddingBottom: insets.bottom }}>
        <DetailFooter
          editPath={`/durable/form?id=${row.id}`}
          deleteConfirmText={t('durable.deleteConfirm')}
          onDelete={async () => {
            await removeDurable(row.id);
            router.replace('/durable');
          }}
        />
      </View>

      <StatusBar style="light" />
    </View>
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
    paddingBottom: 24,
  },
  sections: {
    paddingTop: 20,
    gap: 24,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  stateText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  stateBtnText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
