import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, currencyMeta } from '../../src/store/settings';
import { getDurable, saveDurable } from '../../src/services/durable';
import { DURABLE_STATUS_OPTIONS } from '../../src/utils/constant';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import WheelPicker from '../../src/components/common/WheelPicker';
import FormInput from '../../src/components/common/FormInput';
import AmountField from '../../src/components/common/AmountField';
import CategoryPicker from '../../src/components/common/CategoryPicker';
import AcquisitionPicker from '../../src/components/common/AcquisitionPicker';
import FormSaveFooter from '../../src/components/common/FormSaveFooter';
import ScreenState from '../../src/components/common/ScreenState';
import LinkedAssetPicker from '../../src/components/durable-form/LinkedAssetPicker';

export default function DurableFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const currency = useSettingsStore((s) => s.settings.currency);
  const isEdit = Boolean(id);

  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [acquisition, setAcquisition] = useState('purchase');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [expectedLifespan, setExpectedLifespan] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [linkedAssetId, setLinkedAssetId] = useState('');
  const [status, setStatus] = useState('in_use');
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const row = await getDurable(id);
        if (!active) return;
        if (!row) {
          setLoadError('durable.itemNotFound');
          return;
        }
        setImage(row.image || '');
        setName(row.name || '');
        setCategory(row.category || 'other');
        setAcquisition(row.acquisition_method || 'purchase');
        setPurchaseDate(row.purchase_date || '');
        setPrice(row.purchase_price != null && row.purchase_price !== '' ? String(row.purchase_price) : '');
        setExpectedLifespan(row.expected_lifespan || '');
        setExpiryDate(row.expiry_date || '');
        setLinkedAssetId(row.linked_asset_id || '');
        setStatus(row.status || 'in_use');
        setNotes(row.notes || '');
      } catch {
        if (active) setLoadError('durable.loadFailed');
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id]);

  const handleSave = async () => {
    if (savingRef.current) return;
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast(t('durable.nameRequired'));
      return;
    }
    if (!purchaseDate) {
      showToast(t('durable.purchaseDateRequired'));
      return;
    }
    const priceNum = Number(price);
    if (price.trim() === '' || Number.isNaN(priceNum) || priceNum < 0) {
      showToast(t('durable.purchasePriceRequired'));
      return;
    }
    const values = {
      image,
      name: trimmedName,
      category,
      acquisition_method: acquisition,
      purchase_date: purchaseDate,
      purchase_price: priceNum,
      expected_lifespan: expectedLifespan,
      expiry_date: expiryDate,
      linked_asset_id: linkedAssetId,
      status,
      notes,
      currency,
    };
    savingRef.current = true;
    setSaving(true);
    try {
      await saveDurable(values, isEdit ? id : undefined);
      router.back();
    } catch {
      showToast(t('common.saveFailed'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (!loaded || loadError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
        <FormHeader title={isEdit ? t('nav.editDurable') : t('nav.addDurable')} />
        <ScreenState
          loading={!loaded}
          message={!loaded ? t('durable.loadingDetail') : t(loadError)}
          onBack={() => router.replace('/durable')}
          backLabel={t('common.backToList')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editDurable') : t('nav.addDurable')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          value={image}
          onChange={setImage}
          placeholder={t('durable.uploadImage')}
          height={200}
        />
        <FormInput
          label={`${t('durable.itemName')} *`}
          placeholder={t('durable.itemNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />
        <CategoryPicker
          selected={category}
          onSelect={setCategory}
          type="item"
          label={`${t('durable.category')} *`}
        />
        <AcquisitionPicker selected={acquisition} onSelect={setAcquisition} ns="durable" />
        <WheelPicker
          label={`${t('durable.purchaseDate')} *`}
          level="date"
          value={purchaseDate}
          onChange={setPurchaseDate}
        />
        <AmountField
          label={t('durable.purchasePriceLabel')}
          value={price}
          onChangeText={setPrice}
          symbol={currencyMeta(currency).symbol}
        />
        <WheelPicker
          label={t('durable.expectedLifespan')}
          level="date"
          value={expectedLifespan}
          onChange={setExpectedLifespan}
        />
        <WheelPicker
          label={t('durable.expiryDate')}
          level="date"
          value={expiryDate}
          onChange={setExpiryDate}
        />

        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('durable.status')}
          </Text>
          <View style={styles.statusRow}>
            {DURABLE_STATUS_OPTIONS.map((opt) => {
              const isActive = status === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setStatus(opt.key)}
                  style={[
                    styles.statusBtn,
                    {
                      borderRadius: Radius.pill,
                      backgroundColor: isActive ? Colors.inkDeep : Colors.card,
                      borderColor: isActive ? Colors.inkDeep : Colors.grayDot,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
                    ]}
                  >
                    {opt.key === 'in_use' ? t('durable.inUse') : t('durable.disposed')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <LinkedAssetPicker value={linkedAssetId} onChange={setLinkedAssetId} />

        <FormInput
          label={t('durable.notesLabel')}
          placeholder={t('durable.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <FormSaveFooter
        label={t('durable.confirmSave')}
        savingLabel={t('common.saving')}
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
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBtnText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
});
