import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

export default function MonthlyRecordsCard() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.inkDeep,
          borderColor: Colors.white05,
          borderRadius: Radius.xl,
        },
        Shadows.dark,
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: Colors.white, fontFamily: Fonts.semiBold }]}>
          Monthly Records
        </Text>
        <View style={styles.momBadge}>
          <Ionicons name="trending-up" size={13} color={Colors.green} />
          <Text style={[styles.momText, { color: Colors.green, fontFamily: Fonts.bold }]}>
            +5.2% MoM
          </Text>
        </View>
      </View>

      {/* Expense area */}
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            Monthly Expense
          </Text>
          <Text style={[styles.recordValue, { color: Colors.white, fontFamily: Fonts.bold }]}>
            $3,420.50
          </Text>
        </View>
        <View style={styles.recordRight}>
          <Text style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            42 Transactions
          </Text>
          <Text style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
            $114.02 Daily Avg
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: Colors.white10 }]} />

      {/* Income area */}
      <View style={styles.recordRow}>
        <View style={styles.recordLeft}>
          <Text style={[styles.recordLabel, { color: Colors.white40, fontFamily: Fonts.bold }]}>
            Monthly Income
          </Text>
          <Text style={[styles.recordValue, { color: Colors.green, fontFamily: Fonts.bold }]}>
            $5,800.00
          </Text>
        </View>
        <View style={styles.recordRight}>
          <Text style={[styles.recordMeta, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            3 Transactions
          </Text>
          <Text style={[styles.recordSub, { color: Colors.white40, fontFamily: Fonts.regular }]}>
            $193.33 Daily Avg
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderWidth: 1,
    gap: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
  },
  momBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  momText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  recordLeft: {
    gap: 4,
  },
  recordLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  recordValue: {
    fontSize: 28,
    lineHeight: 34,
  },
  recordRight: {
    alignItems: 'flex-end',
  },
  recordMeta: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  recordSub: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
  },
});
