import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../src/store/categories';
import { getBill, removeBill } from '../../src/services/bill';
import { getDurable } from '../../src/services/durable';
import { getAsset } from '../../src/services/asset';
import { formatDisplay } from '../../src/utils/date';
import BillHero from '../../src/components/bill/BillHero';
import BillStatsGrid from '../../src/components/bill/BillStatsGrid';
import LinkedBillingObject from '../../src/components/bill/LinkedBillingObject';
import DetailFooter from '../../src/components/common/DetailFooter';
import DetailTextSection from '../../src/components/common/DetailTextSection';
import ScreenState from '../../src/components/common/ScreenState';

export default function BillDetailScreen() {
  const { Colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const categoryState = useCategoryStore();

  const [row, setRow] = useState(null);
  const [linkedName, setLinkedName] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const item = id ? await getBill(id) : null;
          let name = '';
          if (item?.source && item?.source_id) {
            const linked =
              item.source === 'asset' ? await getAsset(item.source_id) : await getDurable(item.source_id);
            name = linked?.name || '';
          }
          if (!active) return;
          setRow(item);
          setLinkedName(name);
        } catch {
          if (!active) return;
          setRow(null);
          setLinkedName('');
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (loading) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (!row) {
    return (
      <ScreenState
        icon="receipt-outline"
        message={t('bills.loadFailed')}
        onBack={() => router.replace('/bill')}
        backLabel={t('common.backToList')}
      />
    );
  }

  const isIncome = row.bill_type === 'income';
  const amountColor = isIncome ? Colors.green : Colors.rose;
  const cat = resolveCategoryMeta(categoryState, 'bill', row.category, t);

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BillHero
          image={row.receipt_image || null}
          fallbackIcon={cat.icon}
          title={row.name}
          amountLabel={t('bills.amountLabel', { type: isIncome ? t('bills.income') : t('bills.expense') })}
          amountText={`${isIncome ? '+' : '-'}${formatMoney(Number(row.amount) || 0, row.currency || currency)}`}
          typeText={isIncome ? t('bills.income') : t('bills.expense')}
          typeColor={amountColor}
        />
        <View style={styles.sections}>
          <BillStatsGrid
            categoryLabel={cat.label}
            categoryIcon={cat.icon}
            dateText={formatDisplay(row.consumption_date)}
          />
          <LinkedBillingObject
            source={row.source}
            sourceId={row.source_id}
            name={linkedName}
          />
          <DetailTextSection title={t('bills.notes')} text={row.notes} />
        </View>
      </ScrollView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: hexToRgba(Colors.inkDeep, 0.45) }]}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      <View style={{ paddingBottom: insets.bottom }}>
        <DetailFooter
          editPath={`/bill/form?id=${row.id}`}
          deleteConfirmText={t('bills.deleteConfirm')}
          onDelete={async () => {
            await removeBill(row.id);
            router.replace('/bill');
          }}
        />
      </View>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
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
    paddingBottom: 16,
  },
  sections: {
    paddingTop: 16,
    gap: 16,
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
});
