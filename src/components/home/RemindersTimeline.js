import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

function TimelineDot({ color, glowing }) {
  const { Colors, Shadows } = useTheme();

  if (glowing) {
    return (
      <View style={[styles.glowDot, { backgroundColor: Colors.inkDeep, borderColor: Colors.white }]}>
        <View style={[styles.glowInner, Shadows.card]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.dot,
        { backgroundColor: color, borderColor: Colors.white },
        Shadows.card,
      ]}
    />
  );
}

function ReminderCard({ time, timeColor, title, meta, icon, active, description }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  if (active) {
    return (
      <View style={[styles.activeCard, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }, Shadows.dark]}>
        <View style={styles.cardTopRow}>
          <Text style={[styles.timeText, { color: Colors.orange, fontFamily: Fonts.bold }]}>
            CURRENTLY
          </Text>
          <Ionicons name="notifications" size={15} color={Colors.white40} />
        </View>
        <Text style={[styles.cardTitle, { color: Colors.white, fontFamily: Fonts.bold }]}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.activeDesc, { color: Colors.white60, fontFamily: Fonts.regular }]}>
            {description}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
        Shadows.card,
      ]}
    >
      <View style={styles.cardTopRow}>
        <Text style={[styles.timeText, { color: timeColor, fontFamily: Fonts.bold }]}>{time}</Text>
        <Ionicons name="ellipsis-horizontal" size={14} color={Colors.textSecondary} />
      </View>
      <Text style={[styles.cardTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
        {title}
      </Text>
      {meta && (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
          <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {meta}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function RemindersTimeline() {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
          Today's Reminders
        </Text>
        <Text style={[styles.viewAll, { color: Colors.orange, fontFamily: Fonts.bold }]}>
          VIEW ALL
        </Text>
      </View>

      <View style={styles.timeline}>
        {/* Vertical line */}
        <View style={[styles.verticalLine, { backgroundColor: Colors.cardBorder }]} />

        {/* Item 1 */}
        <View style={styles.itemWrap}>
          <TimelineDot color={Colors.purple} />
          <ReminderCard
            time="09:00 AM"
            timeColor={Colors.purple}
            title="Team Sync: UI/UX Flow"
            meta="Meeting Room 4"
          />
        </View>

        {/* Item 2 — active */}
        <View style={styles.itemWrap}>
          <TimelineDot glowing />
          <ReminderCard
            active
            title="Design Asset Review"
            description="Finalizing icons for Timemory v2"
          />
        </View>

        {/* Item 3 */}
        <View style={[styles.itemWrap, styles.itemWrapLast]}>
          <TimelineDot color={Colors.grayDot} />
          <ReminderCard
            time="04:30 PM"
            timeColor={Colors.textSecondary}
            title="Gym Session"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  viewAll: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  timeline: {
    position: 'relative',
  },
  verticalLine: {
    position: 'absolute',
    left: 19,
    top: 16,
    width: 2,
    height: '88%',
  },
  itemWrap: {
    paddingLeft: 40,
    paddingBottom: 32,
    position: 'relative',
  },
  itemWrapLast: {
    paddingBottom: 0,
  },
  dot: {
    position: 'absolute',
    left: 15,
    top: 20,
    width: 10,
    height: 10,
    borderRadius: 9999,
    borderWidth: 2,
  },
  glowDot: {
    position: 'absolute',
    left: 8,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowInner: {
    width: 16,
    height: 16,
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  activeCard: {
    padding: 16,
    gap: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 22,
  },
  activeDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
});
