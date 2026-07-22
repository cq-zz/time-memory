import { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import { getAsset, saveAsset } from '../../src/services/asset';
import { ASSET_STATUS_OPTIONS } from '../../src/utils/constant';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import WheelPicker from '../../src/components/common/WheelPicker';
import FormInput from '../../src/components/common/FormInput';
import CategoryPicker from '../../src/components/common/CategoryPicker';
import AcquisitionPicker from '../../src/components/common/AcquisitionPicker';
import { sanitizeAmount } from '../../src/utils/money';

export default function AssetFormScreen() {
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
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('active');
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getAsset(id).then((row) => {
      if (row) {
        setImage(row.image || '');
        setName(row.name || '');
        setCategory(row.category || 'other');
        setAcquisition(row.acquisition_method || 'purchase');
        setPurchaseDate(row.purchase_date || '');
        setPurchasePrice(row.purchase_price != null && row.purchase_price !== '' ? String(row.purchase_price) : '');
        setCurrentPrice(row.current_price != null && row.current_price !== '' ? String(row.current_price) : '');
        setExpiryDate(row.expiry_date || '');
        setStatus(row.status || 'active');
        setNotes(row.notes || '');
      }
      setLoaded(true);
    });
  }, [isEdit, id]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast(t('asset.assetName') + ' *');
      return;
    }
    if (!purchaseDate) {
      showToast(t('asset.purchaseDateRequired'));
      return;
    }
    const buyNum = Number(purchasePrice);
    if (purchasePrice.trim() === '' || Number.isNaN(buyNum) || buyNum < 0) {
      showToast(t('asset.purchasePriceRequired'));
      return;
    }
    const curNum = Number(currentPrice);
    if (currentPrice.trim() === '' || Number.isNaN(curNum) || curNum < 0) {
      showToast(t('asset.currentPriceRequired'));
      return;
    }
    const values = {
      image,
      name: trimmedName,
      category,
      acquisition_method: acquisition,
      purchase_date: purchaseDate,
      purchase_price: buyNum,
      current_price: curNum,
      expiry_date: expiryDate,
      status,
      notes,
      currency,
    };
    await saveAsset(values, isEdit ? id : undefined);
    showToast(t('common.saved'));
    router.back();
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editAsset') : t('nav.addAsset')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          value={image}
          onChange={setImage}
          placeholder={t('asset.uploadImage')}
          height={200}
        />
        <FormInput
          label={`${t('asset.assetName')} *`}
          placeholder={t('asset.assetNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />
        <CategoryPicker
          selected={category}
          onSelect={setCategory}
          type="asset"
          label={`${t('asset.category')} *`}
        />
        <AcquisitionPicker selected={acquisition} onSelect={setAcquisition} ns="asset" />
        <WheelPicker
          label={`${t('asset.purchaseDate')} *`}
          level="date"
          value={purchaseDate}
          onChange={setPurchaseDate}
        />
        <FormInput
          label={`${t('asset.purchasePrice')} *`}
          placeholder={`${currency} 0.00`}
          value={purchasePrice}
          onChangeText={(v) => setPurchasePrice(sanitizeAmount(v))}
          keyboardType="decimal-pad"
        />
        <FormInput
          label={`${t('asset.currentPrice')} *`}
          placeholder={`${currency} 0.00 · ${t('asset.currentPriceHint')}`}
          value={currentPrice}
          onChangeText={(v) => setCurrentPrice(sanitizeAmount(v))}
          keyboardType="decimal-pad"
        />
        <WheelPicker
          label={t('asset.expiryDate')}
          level="date"
          value={expiryDate}
          onChange={setExpiryDate}
        />

        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('asset.status')}
          </Text>
          <View style={styles.statusRow}>
            {ASSET_STATUS_OPTIONS.map((opt) => {
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
                    {opt.key === 'active' ? t('asset.active') : t('asset.disposed')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <FormInput
          label={t('asset.notes')}
          placeholder={t('asset.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }]}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('asset.confirmSave')}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 24,
    gap: 24,
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
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  saveBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
  },
});
