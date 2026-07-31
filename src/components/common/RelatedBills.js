import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../store/categories';
import { formatDisplay } from '../../utils/date';
import { isAutoSource } from '../../utils/excel';

function sumAmount(bills) {
  return (bills || []).reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
}

function BillRow({ bill, currency, amountColor }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const categoryState = useCategoryStore();
  const cat = resolveCategoryMeta(categoryState, 'bill', bill.category, t);

  return (
    <View
      style={[
        styles.billCard,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <View style={styles.billLeft}>
        <View style={[styles.billIconBox, { backgroundColor: Colors.avatarBg, borderRadius: Radius.circle }]}>
          <Ionicons name={cat.icon} size={14} color={Colors.textPrimary} />
        </View>
        <View style={styles.billTextCol}>
          <Text
            style={[styles.billTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
            numberOfLines={2}
          >
            {bill.name || '--'}
          </Text>
          <Text style={[styles.billMeta, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {formatDisplay(bill.consumption_date)}
          </Text>
        </View>
      </View>

      <Text style={[styles.billAmount, { color: amountColor, fontFamily: Fonts.regular }]}>
        {formatMoney(Number(bill.amount) || 0, currency)}
      </Text>
    </View>
  );
}

function BillSection({ title, icon, bills, currency, amountColor }) {
  const { Colors, Fonts } = useTheme();

  if (!bills || bills.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Ionicons name={icon} size={16} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {title}
        </Text>
        <Text style={[styles.headingAmount, { color: amountColor, fontFamily: Fonts.semiBold }]}>
          {formatMoney(sumAmount(bills), currency)}
        </Text>
      </View>

      <View style={styles.list}>
        {bills.map((bill) => (
          <BillRow key={bill.id} bill={bill} currency={currency} amountColor={amountColor} />
        ))}
      </View>
    </View>
  );
}

/**
 * Related expenses & incomes for a durable/asset, sourced from bills linked
 * via source/source_id (first-version association model). Renders nothing when
 * there are no linked bills.
 */
export default function RelatedBills({ bills, currency, expenseTitle, incomeTitle }) {
  const { Colors } = useTheme();

  // Filter out auto-generated bills (the purchase bill itself)
  const manualBills = (bills || []).filter((b) => !isAutoSource(b.source));
  const expenses = manualBills.filter((b) => b.bill_type !== 'income');
  const incomes = manualBills.filter((b) => b.bill_type === 'income');
  if (expenses.length === 0 && incomes.length === 0) return null;

  return (
    <View style={styles.container}>
      <BillSection
        title={expenseTitle}
        icon="receipt-outline"
        bills={expenses}
        currency={currency}
        amountColor={Colors.rose}
      />
      <BillSection
        title={incomeTitle}
        icon="cash-outline"
        bills={incomes}
        currency={currency}
        amountColor={Colors.green}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  headingAmount: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  billIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTextCol: {
    flex: 1,
    minWidth: 0,
  },
  billTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  billMeta: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
  billAmount: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 0,
    marginLeft: 8,
  },
});
