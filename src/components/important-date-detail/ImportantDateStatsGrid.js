import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';

function StatCard({ label, value, icon, iconColor, dotColor }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <Text style={[styles.statLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {label}
      </Text>
      <View style={styles.statValueRow}>
        {icon ? <Ionicons name={icon} size={18} color={iconColor} /> : null}
        {dotColor ? <View style={[styles.dot, { backgroundColor: dotColor }]} /> : null}
        <Text
          style={[styles.statValue, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ImportantDateStatsGrid({
  dateText,
  typeLabel,
  typeIcon,
  typeColor,
  priorityLabel,
  priorityColor,
  reminderOn,
  yearsText,
}) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard label="DATE" value={dateText} />
        <StatCard label="TYPE" value={typeLabel} icon={typeIcon} iconColor={typeColor} />
      </View>
      <View style={styles.row}>
        <StatCard label="PRIORITY" value={priorityLabel} dotColor={priorityColor} />
        <StatCard
          label="REMINDER"
          value={reminderOn ? t('common.enable') : t('common.disabled')}
          icon={reminderOn ? 'notifications' : 'notifications-off-outline'}
          iconColor={reminderOn ? Colors.purple : Colors.textSecondary}
        />
      </View>

      {/* Years hero card */}
      <View style={[styles.yearsCard, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
        <View style={styles.yearsTop}>
          <Text style={[styles.yearsLabel, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
            YEARS
          </Text>
          <View style={[styles.yearsIconBox, { backgroundColor: Colors.white10, borderRadius: Radius.circle }]}>
            <Ionicons name="hourglass-outline" size={22} color={Colors.white} />
          </View>
        </View>
        <Text
          style={[styles.yearsValue, { color: Colors.white, fontFamily: Fonts.bold }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {yearsText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 20,
  },
  statCard: {
    flex: 1,
    height: 90,
    padding: 20,
    gap: 4,
    borderWidth: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9999,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 28,
    flexShrink: 1,
  },
  yearsCard: {
    padding: 24,
    gap: 12,
  },
  yearsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearsLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  yearsIconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearsValue: {
    fontSize: 28,
    lineHeight: 34,
  },
});
