import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { formatMoney } from '../../store/settings';
import { useCategoryStore, resolveCategoryMeta } from '../../store/categories';
import { formatDisplay } from '../../utils/date';

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
          <Ionicons name={cat.icon} size={18} color={Colors.textPrimary} />
        </View>
        <View style={styles.billTextCol}>
          <Text
            style={[styles.billTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
            numberOfLines={1}
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

function BillSection({ title, icon, bills, currency, amountColor, subtotalLabel }) {
  const { Colors, Fonts } = useTheme();

  if (!bills || bills.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Ionicons name={icon} size={18} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          {title}
        </Text>
      </View>

      <View style={styles.list}>
        {bills.map((bill) => (
          <BillRow key={bill.id} bill={bill} currency={currency} amountColor={amountColor} />
        ))}
      </View>

      <View style={styles.subtotalRow}>
        <Text style={[styles.subtotalLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {subtotalLabel}
        </Text>
        <Text style={[styles.subtotalValue, { color: amountColor, fontFamily: Fonts.semiBold }]}>
          {formatMoney(sumAmount(bills), currency)}
        </Text>
      </View>
    </View>
  );
}

/**
 * Related expenses & incomes for a durable/asset, sourced from bills linked
 * via source/source_id (first-version association model). Renders nothing when
 * there are no linked bills.
 */
export default function RelatedBills({ bills, currency, expenseTitle, incomeTitle, subtotalLabel }) {
  const { Colors } = useTheme();

  const expenses = (bills || []).filter((b) => b.bill_type !== 'income');
  const incomes = (bills || []).filter((b) => b.bill_type === 'income');
  if (expenses.length === 0 && incomes.length === 0) return null;

  return (
    <View style={styles.container}>
      <BillSection
        title={expenseTitle}
        icon="receipt-outline"
        bills={expenses}
        currency={currency}
        amountColor={Colors.textPrimary}
        subtotalLabel={subtotalLabel}
      />
      <BillSection
        title={incomeTitle}
        icon="cash-outline"
        bills={incomes}
        currency={currency}
        amountColor={Colors.green}
        subtotalLabel={subtotalLabel}
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
    fontSize: 20,
    lineHeight: 28,
  },
  list: {
    gap: 12,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
  },
  billLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  billIconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTextCol: {
    flex: 1,
    minWidth: 0,
  },
  billTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  billMeta: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  billAmount: {
    fontSize: 16,
    lineHeight: 28,
    flexShrink: 0,
    marginLeft: 8,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  subtotalLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  subtotalValue: {
    fontSize: 16,
    lineHeight: 24,
  },
});
