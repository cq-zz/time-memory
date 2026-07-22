import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
import { useSettingsStore, currencyMeta } from '../../src/store/settings';
import { getBudget, saveBudget } from '../../src/services/budget';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import WheelPicker from '../../src/components/common/WheelPicker';
import AmountField from '../../src/components/common/AmountField';
import FormSaveFooter from '../../src/components/common/FormSaveFooter';
import ScreenState from '../../src/components/common/ScreenState';

export default function BudgetFormScreen() {
  const { Colors } = useTheme();
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoaded(false);
    setLoadFailed(false);
    (async () => {
      try {
        const row = await getBudget(id);
        if (!active) return;
        if (!row) {
          setLoadFailed(true);
          return;
        }
        setYear(row.year || '');
        setExpenseBudget(row.expense_budget != null ? String(row.expense_budget) : '');
        setIncomeTarget(row.income_target != null ? String(row.income_target) : '');
      } catch {
        if (active) setLoadFailed(true);
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
    if (!year) {
      showToast(t('budget.year') + ' *');
      return;
    }
    const values = {
      year,
      expense_budget: expenseBudget,
      income_target: incomeTarget,
    };
    savingRef.current = true;
    setSaving(true);
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
      showToast(t('common.saveFailed'));
      return;
    } finally {
      savingRef.current = false;
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
      <ScreenState
        icon="flag-outline"
        message={t('budget.loadFailed')}
        onBack={() => router.replace('/budget')}
        backLabel={t('common.backToList')}
      />
    );
  }

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

      <FormSaveFooter
        label={t('common.saveRecord')}
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
});
