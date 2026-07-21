import { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/utils/theme';
import { getDurableById } from '../../src/data/durables';
import FormHeader from '../../src/components/durable-form/FormHeader';
import PhotoUpload from '../../src/components/durable-form/PhotoUpload';
import FormInput from '../../src/components/durable-form/FormInput';
import CategoryPicker from '../../src/components/durable-form/CategoryPicker';
import AcquisitionPicker from '../../src/components/durable-form/AcquisitionPicker';
import LinkedAssetPicker from '../../src/components/durable-form/LinkedAssetPicker';

export default function DurableFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { id } = useLocalSearchParams();

  const isEdit = Boolean(id);
  const existing = isEdit ? getDurableById(id) : null;

  const [name, setName] = useState(existing ? existing.name : '');
  const [category, setCategory] = useState(-1);
  const [acquisition, setAcquisition] = useState(0);
  const [purchaseDate, setPurchaseDate] = useState(
    existing && existing.detail ? existing.detail.purchaseDate : ''
  );
  const [price, setPrice] = useState(existing ? existing.price.replace(/[$,]/g, '') : '');
  const [expiry, setExpiry] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? 'Edit Item' : 'New Memory'} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PhotoUpload />
        <FormInput label="ITEM NAME" placeholder="e.g. Vintage Leather Sofa" value={name} onChangeText={setName} />
        <CategoryPicker selected={category} onSelect={setCategory} />
        <AcquisitionPicker selected={acquisition} onSelect={setAcquisition} />
        <FormInput label="PURCHASE DATE" placeholder="mm/dd/yyyy" value={purchaseDate} onChangeText={setPurchaseDate} />
        <FormInput label="PRICE & CURRENCY" placeholder="CNY 0.00" value={price} onChangeText={setPrice} />
        <LinkedAssetPicker />
        <FormInput label="EXPIRY / WARRANTY DATE" placeholder="mm/dd/yyyy" value={expiry} onChangeText={setExpiry} />
        <FormInput
          label="PRIVATE NOTES"
          placeholder="Mention specific care instructions or memories associated with this item…"
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
        >
          <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>SAVE MEMORY</Text>
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
