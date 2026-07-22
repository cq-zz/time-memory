import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore, currencyMeta } from '../../src/store/settings';
import { getBill, saveBill } from '../../src/services/bill';
import { getDurable } from '../../src/services/durable';
import { getAsset } from '../../src/services/asset';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import WheelPicker from '../../src/components/common/WheelPicker';
import FormInput from '../../src/components/common/FormInput';
import CategoryPicker from '../../src/components/common/CategoryPicker';
import FieldLabel from '../../src/components/common/FieldLabel';
import AmountField from '../../src/components/common/AmountField';
import FormSaveFooter from '../../src/components/common/FormSaveFooter';
import ScreenState from '../../src/components/common/ScreenState';
import BillingObjectPicker from '../../src/components/bill/BillingObjectPicker';

export default function BillFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = Boolean(id);
  const currency = useSettingsStore((s) => s.settings.currency);
  const symbol = currencyMeta(currency).symbol;

  const [billType, setBillType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [consumptionDate, setConsumptionDate] = useState('');
  const [category, setCategory] = useState('food');
  const [source, setSource] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveLockRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const row = await getBill(id);
        if (!active) return;
        if (!row) {
          setLoadFailed(true);
          showToast(t('bills.loadFailed'));
          return;
        }
        setBillType(row.bill_type === 'income' ? 'income' : 'expense');
        setAmount(row.amount != null ? String(row.amount) : '');
        setName(row.name || '');
        setConsumptionDate(row.consumption_date || '');
        setCategory(row.category || 'food');
        setSource(row.source || '');
        setSourceId(row.source_id || '');
        setReceiptImage(row.receipt_image || '');
        setNotes(row.notes || '');
        // Resolve the linked object's display name.
        if (row.source && row.source_id) {
          const linked =
            row.source === 'asset' ? await getAsset(row.source_id) : await getDurable(row.source_id);
          if (active) setSourceName(linked?.name || '');
        }
      } catch {
        if (active) {
          setLoadFailed(true);
          showToast(t('bills.loadFailed'));
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id, t]);

  const handleBillingObject = (sel) => {
    if (!sel) {
      setSource('');
      setSourceId('');
      setSourceName('');
    } else {
      setSource(sel.source);
      setSourceId(sel.sourceId);
      setSourceName(sel.sourceName);
    }
  };

  const handleSave = async () => {
    if (saveLockRef.current) return;
    if (!name.trim()) {
      showToast(t('bills.name') + ' *');
      return;
    }
    const values = {
      name: name.trim(),
      bill_type: billType,
      amount,
      consumption_date: consumptionDate,
      category,
      source,
      source_id: sourceId,
      receipt_image: receiptImage,
      notes,
    };
    saveLockRef.current = true;
    setSaving(true);
    try {
      await saveBill(values, isEdit ? id : undefined);
    } catch (e) {
      if (e?.message === 'amountInvalid') {
        showToast(t('bills.amountLabel', { type: billType === 'income' ? t('bills.income') : t('bills.expense') }) + ' > 0');
        return;
      }
      showToast(t('common.saveFailed'));
      return;
    } finally {
      saveLockRef.current = false;
      setSaving(false);
    }
    showToast(t('common.saved'));
    router.back();
  };

  if (!loaded) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (loadFailed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
        <FormHeader title={t('nav.editBill')} />
        <ScreenState
          icon="receipt-outline"
          message={t('bills.loadFailed')}
          onBack={() => router.replace('/bill')}
          backLabel={t('common.backToList')}
        />
      </SafeAreaView>
    );
  }

  const TypeButton = ({ typeKey, icon, activeColor }) => {
    const isActive = billType === typeKey;
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setBillType(typeKey)}
        style={[
          styles.typeBtn,
          {
            borderRadius: Radius.lg,
            backgroundColor: isActive ? hexToRgba(activeColor, 0.12) : Colors.card,
            borderColor: isActive ? activeColor : Colors.grayDot,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={isActive ? activeColor : Colors.textTertiary} />
        <Text
          style={[
            styles.typeBtnText,
            { color: isActive ? activeColor : Colors.textSecondary, fontFamily: Fonts.bold },
          ]}
        >
          {t(`bills.${typeKey}`)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editBill') : t('nav.addBill')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Bill type toggle */}
        <View style={styles.field}>
          <FieldLabel label={t('bills.billType')} />
          <View style={styles.typeRow}>
            <TypeButton typeKey="expense" icon="arrow-down-circle-outline" activeColor={Colors.rose} />
            <TypeButton typeKey="income" icon="arrow-up-circle-outline" activeColor={Colors.green} />
          </View>
        </View>

        <AmountField
          label={t('bills.amountLabel', {
            type: billType === 'income' ? t('bills.income') : t('bills.expense'),
          })}
          value={amount}
          onChangeText={setAmount}
          symbol={symbol}
        />

        <FormInput
          label={`${t('bills.name')} *`}
          placeholder={t('bills.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        <WheelPicker
          label={t('bills.time')}
          level="date"
          value={consumptionDate}
          onChange={setConsumptionDate}
        />

        <CategoryPicker
          type="bill"
          label={t('bills.selectCategory')}
          selected={category}
          onSelect={setCategory}
        />

        <BillingObjectPicker
          label={t('bills.billingObject')}
          source={source}
          sourceId={sourceId}
          sourceName={sourceName}
          onChange={handleBillingObject}
        />

        <ImageUploadField
          value={receiptImage}
          onChange={setReceiptImage}
          placeholder={t('bills.attachmentPlaceholder')}
          hint={t('bills.attachmentHint')}
          aspectRatio={4 / 3}
        />

        <FormInput
          label={t('bills.notes')}
          placeholder={t('bills.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <FormSaveFooter
        label={t('common.saveRecord')}
        savingLabel={t('common.loading')}
        saving={saving}
        onPress={handleSave}
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
    paddingBottom: 24,
    gap: 16,
  },
  field: {
    gap: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  typeBtnText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
