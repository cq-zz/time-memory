import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../src/store/categories';
import { getAsset, removeAsset, effectiveStatus, companionDays, displayValue } from '../../src/services/asset';
import { listBillsBySource } from '../../src/services/bill';
import { formatDisplay } from '../../src/utils/date';
import AssetHero from '../../src/components/asset-detail/AssetHero';
import AssetStatsGrid from '../../src/components/asset-detail/AssetStatsGrid';
import RelatedBills from '../../src/components/common/RelatedBills';
import DetailFooter from '../../src/components/common/DetailFooter';

const acquisitionLabel = (t, key) =>
  key ? t(`asset.acquisition${key.charAt(0).toUpperCase()}${key.slice(1)}`) : '--';

export default function AssetDetailScreen() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const categoryState = useCategoryStore();

  const [row, setRow] = useState(null);
  const [relatedBills, setRelatedBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const item = id ? await getAsset(id) : null;
        if (!active) return;
        setRow(item);
        setRelatedBills(item ? await listBillsBySource(item.id) : []);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id, currency]),
  );

  // ── Loading / not-found states ──────────────────
  if (loading) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('asset.loadingDetail')}
        </Text>
      </View>
    );
  }

  if (!row) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <Ionicons name="file-tray-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('asset.itemNotFound')}
        </Text>
        <Pressable
          onPress={() => router.replace('/asset')}
          style={[styles.stateBtn, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.stateBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.backToList')}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Derived values ──────────────────────────────
  const cat = resolveCategoryMeta(categoryState, 'asset', row.category, t);
  const status = effectiveStatus(row);
  const isActive = status === 'active';
  const value = displayValue(row);
  const days = companionDays(row);
  const priceText =
    row.purchase_price != null && row.purchase_price !== ''
      ? formatMoney(Number(row.purchase_price), currency)
      : '--';

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AssetHero
          image={row.image || null}
          fallbackIcon={cat.icon}
          title={row.name}
          statusText={isActive ? t('asset.active') : t('asset.disposed')}
          statusColor={isActive ? Colors.green : Colors.textSecondary}
          currentValueText={formatMoney(value, currency)}
        />
        <View style={styles.sections}>
          <AssetStatsGrid
            categoryLabel={cat.label}
            categoryIcon={cat.icon}
            sourceText={acquisitionLabel(t, row.acquisition_method)}
            purchaseDateText={formatDisplay(row.purchase_date)}
            purchasePriceText={priceText}
            companionText={days != null ? `${days} ${t('common.days')}` : '--'}
          />
          <RelatedBills
            bills={relatedBills}
            currency={currency}
            expenseTitle={t('asset.otherExpenses')}
            incomeTitle={t('asset.otherIncomes')}
            subtotalLabel={t('asset.subtotal')}
          />
        </View>
      </ScrollView>

      {/* Floating back button over hero */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: hexToRgba(Colors.inkDeep, 0.45) }]}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Fixed bottom actions */}
      <View style={{ paddingBottom: insets.bottom }}>
        <DetailFooter
          editPath={`/asset/form?id=${row.id}`}
          deleteConfirmText={t('asset.deleteConfirm')}
          onDelete={async () => {
            await removeAsset(row.id);
            router.replace('/asset');
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
    width: 40,
    height: 40,
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
