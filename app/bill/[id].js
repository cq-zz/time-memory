import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, formatMoney } from '../../src/store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../src/store/categories';
import { getBill, removeBill } from '../../src/services/bill';
import { getDurable } from '../../src/services/durable';
import { getAsset } from '../../src/services/asset';
import { formatDisplay } from '../../src/utils/date';
import FormHeader from '../../src/components/common/FormHeader';
import ImagePreviewModal from '../../src/components/common/ImagePreviewModal';
import DetailFooter from '../../src/components/common/DetailFooter';

export default function BillDetailScreen() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const categoryState = useCategoryStore();

  const [row, setRow] = useState(null);
  const [linkedName, setLinkedName] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const item = id ? await getBill(id) : null;
        if (!active) return;
        setRow(item);
        // Resolve the linked billing object's name.
        if (item?.source && item?.source_id) {
          const linked =
            item.source === 'asset' ? await getAsset(item.source_id) : await getDurable(item.source_id);
          if (active) setLinkedName(linked?.name || '');
        } else if (active) {
          setLinkedName('');
        }
        if (active) setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (loading) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (!row) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('bills.loadFailed')}
        </Text>
        <Pressable
          onPress={() => router.replace('/bill')}
          style={[styles.stateBtn, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.stateBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.backToList')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const isIncome = row.bill_type === 'income';
  const amountColor = isIncome ? Colors.green : Colors.rose;
  const cat = resolveCategoryMeta(categoryState, 'bill', row.category, t);
  const linked = Boolean(row.source && row.source_id);
  const hasImage = Boolean(row.receipt_image) && !imageError;
  const isBroken = Boolean(row.receipt_image) && imageError;

  const goToSource = () => {
    if (row.source === 'asset') router.push(`/asset/${row.source_id}`);
    else if (row.source === 'durable') router.push(`/durable/${row.source_id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <FormHeader title={t('nav.billsDetail')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Receipt hero */}
        <View
          style={[
            styles.hero,
            {
              borderRadius: Radius.xl,
              backgroundColor: hasImage || isBroken ? Colors.card : hexToRgba(Colors.purple, 0.06),
            },
          ]}
        >
          {hasImage ? (
            <>
              <Image
                source={{ uri: row.receipt_image }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewImage(row.receipt_image)} />
            </>
          ) : isBroken ? (
            <View style={styles.heroCenter}>
              <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
              <Text style={[styles.brokenText, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
                {t('diary.imageBroken')}
              </Text>
            </View>
          ) : (
            <View style={styles.heroCenter}>
              <Ionicons name={cat.icon || 'pricetag-outline'} size={48} color={Colors.purple} />
            </View>
          )}
        </View>

        {/* Amount card */}
        <View
          style={[
            styles.amountCard,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
            Shadows.card,
          ]}
        >
          <View style={[styles.typePill, { backgroundColor: hexToRgba(amountColor, 0.12) }]}>
            <Ionicons
              name={isIncome ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'}
              size={14}
              color={amountColor}
            />
            <Text style={[styles.typePillText, { color: amountColor, fontFamily: Fonts.bold }]}>
              {isIncome ? t('bills.income') : t('bills.expense')}
            </Text>
          </View>
          <Text style={[styles.amount, { color: amountColor, fontFamily: Fonts.bold }]} numberOfLines={1} adjustsFontSizeToFit>
            {isIncome ? '+' : '-'}
            {formatMoney(Number(row.amount) || 0, row.currency || currency)}
          </Text>
          <Text style={[styles.name, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>{row.name}</Text>
        </View>

        {/* Details card */}
        <View
          style={[
            styles.detailCard,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
            Shadows.card,
          ]}
        >
          {/* Category */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
              {t('bills.category')}
            </Text>
            <View style={styles.detailValue}>
              <Ionicons name={cat.icon || 'pricetag-outline'} size={16} color={Colors.purple} />
              <Text style={[styles.detailText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                {cat.label}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
              {t('bills.time')}
            </Text>
            <Text style={[styles.detailText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {formatDisplay(row.consumption_date)}
            </Text>
          </View>

          {/* Billing object */}
          {linked ? (
            <TouchableOpacity style={styles.detailRow} activeOpacity={0.7} onPress={goToSource}>
              <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                {t('bills.billingObject')}
              </Text>
              <View style={styles.detailValue}>
                <Ionicons
                  name={row.source === 'asset' ? 'diamond-outline' : 'cube-outline'}
                  size={16}
                  color={Colors.purple}
                />
                <Text style={[styles.detailText, { color: Colors.purple, fontFamily: Fonts.semiBold }]} numberOfLines={1}>
                  {linkedName || '--'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.purple} />
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Notes */}
          {row.notes ? (
            <View style={[styles.notesSection, { borderTopColor: Colors.cardBorder }]}>
              <Text style={[styles.detailLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                {t('bills.notes')}
              </Text>
              <Text style={[styles.notesText, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
                {row.notes}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Fixed bottom actions */}
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

      <ImagePreviewModal imageUri={previewImage} onClose={() => setPreviewImage(null)} />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  hero: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
  },
  heroCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brokenText: {
    fontSize: 12,
  },
  amountCard: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 1,
    gap: 10,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  typePillText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  amount: {
    fontSize: 36,
    lineHeight: 44,
  },
  name: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  detailCard: {
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    flexShrink: 0,
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  notesSection: {
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
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
