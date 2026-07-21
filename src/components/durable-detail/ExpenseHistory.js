import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

function BillItem({ expense }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

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
          <Ionicons name={expense.icon} size={18} color={Colors.textPrimary} />
        </View>
        <View style={styles.billTextCol}>
          <Text style={[styles.billTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
            {expense.title}
          </Text>
          <Text style={[styles.billMeta, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {expense.meta}
          </Text>
        </View>
      </View>

      <Text style={[styles.billAmount, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
        {expense.amount}
      </Text>
    </View>
  );
}

export default function ExpenseHistory({ expenses }) {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Ionicons name="receipt-outline" size={18} color={Colors.textPrimary} />
        <Text style={[styles.headingText, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          Expense History
        </Text>
      </View>

      <View style={styles.list}>
        {expenses.map((expense) => (
          <BillItem key={expense.title} expense={expense} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
  },
  billIconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  billTextCol: {
    flex: 1,
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
  },
});
