import { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, currencyMeta } from '../../src/store/settings';
import { getBudget, saveBudget } from '../../src/services/budget';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import WheelPicker from '../../src/components/common/WheelPicker';
import FieldLabel from '../../src/components/common/FieldLabel';
import { sanitizeAmount } from '../../src/utils/money';

function AmountField({ label, value, onChangeText, symbol }) {
  const { Colors, Radius, Fonts } = useTheme();
  return (
    <View style={styles.field}>
      <FieldLabel label={`${label} *`} />
      <View
        style={[
          styles.amountBox,
          { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm },
        ]}
      >
        <Text style={[styles.amountSymbol, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {symbol}
        </Text>
        <TextInput
          style={[styles.amountInput, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}
          placeholder="0.00"
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={(v) => onChangeText(sanitizeAmount(v))}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

export default function BudgetFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = Boolean(id);
  const currency = useSettingsStore((s) => s.settings.currency);
  const symbol = currencyMeta(currency).symbol;

  const [year, setYear] = useState('');
  const [expenseBudget, setExpenseBudget] = useState('');
  const [incomeTarget, setIncomeTarget] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getBudget(id).then((row) => {
      if (row) {
        setYear(row.year || '');
        setExpenseBudget(row.expense_budget != null ? String(row.expense_budget) : '');
        setIncomeTarget(row.income_target != null ? String(row.income_target) : '');
      }
      setLoaded(true);
    });
  }, [isEdit, id]);

  const handleSave = async () => {
    if (!year) {
      showToast(t('budget.year') + ' *');
      return;
    }
    const values = {
      year,
      expense_budget: expenseBudget,
      income_target: incomeTarget,
    };
    try {
      await saveBudget(values, isEdit ? id : undefined);
    } catch (e) {
      if (e?.message === 'yearDuplicate') {
        showToast(t('budget.yearDuplicate'));
        return;
      }
      if (e?.message === 'expenseRequired') {
        showToast(t('budget.expenseRequired'));
        return;
      }
      if (e?.message === 'incomeRequired') {
        showToast(t('budget.incomeRequired'));
        return;
      }
      showToast(t('budget.year') + ' *');
      return;
    }
    showToast(t('common.saved'));
    router.back();
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editBudget') : t('nav.addBudget')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <WheelPicker
          label={`${t('budget.year')} *`}
          level="year"
          value={year}
          onChange={setYear}
        />

        <AmountField
          label={t('budget.expenseBudget')}
          value={expenseBudget}
          onChangeText={setExpenseBudget}
          symbol={symbol}
        />

        <AmountField
          label={t('budget.incomeTarget')}
          value={incomeTarget}
          onChangeText={setIncomeTarget}
          symbol={symbol}
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
            {t('common.saveRecord')}
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
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    gap: 8,
  },
  amountSymbol: {
    fontSize: 18,
    lineHeight: 24,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    padding: 0,
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
    fontSize: 16,
    lineHeight: 22,
  },
});
