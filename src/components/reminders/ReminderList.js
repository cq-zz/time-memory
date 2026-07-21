import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const GROUPS = [
  {
    label: 'TODAY, 9:00 AM',
    items: [
      {
        icon: 'calendar-outline',
        iconColor: '#6B5CE7',
        iconBg: 'rgba(107, 92, 231, 0.1)',
        type: 'SCHEDULE',
        typeIcon: 'time-outline',
        status: '2 HOURS LEFT',
        statusColor: '#E86B6B',
        title: 'Quarterly Review Prep',
      },
      {
        icon: 'leaf-outline',
        iconColor: '#4AA868',
        iconBg: 'rgba(74, 168, 104, 0.1)',
        type: 'DURABLE',
        typeIcon: 'cube-outline',
        status: 'HEALTHY',
        statusColor: '#4AA868',
        title: 'Weekly Plant Care',
      },
    ],
  },
  {
    label: 'UPCOMING',
    items: [
      {
        icon: 'server-outline',
        iconColor: '#1A1A1A',
        iconBg: 'rgba(26, 26, 26, 0.1)',
        type: 'ASSET',
        typeIcon: 'wallet-outline',
        status: '5 DAYS LEFT',
        statusColor: '#F28B50',
        title: 'Server Renewal',
      },
      {
        icon: 'sync-outline',
        iconColor: '#F28B50',
        iconBg: 'rgba(242, 139, 80, 0.1)',
        type: 'ASSET',
        typeIcon: 'wallet-outline',
        status: 'NEXT WEEK',
        statusColor: '#747878',
        title: 'Sync Desktop Assets',
      },
    ],
  },
];

function ReminderCard({ item }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Colors.card, borderColor: Colors.avatarBg, borderRadius: Radius.md },
        Shadows.dark,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: item.iconBg, borderRadius: Radius.sm }]}>
        <Ionicons name={item.icon} size={26} color={item.iconColor} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <View style={styles.typeRow}>
            <Ionicons name={item.typeIcon} size={12} color={Colors.textSecondary} />
            <Text style={[styles.typeText, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
              {item.type}
            </Text>
          </View>
          <Text style={[styles.status, { color: item.statusColor, fontFamily: Fonts.bold }]}>
            {item.status}
          </Text>
        </View>

        <Text style={[styles.cardTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {item.title}
        </Text>
      </View>
    </View>
  );
}

export default function ReminderList() {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.container}>
      {GROUPS.map((group) => (
        <View key={group.label} style={styles.group}>
          <Text style={[styles.groupLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {group.label}
          </Text>
          <View style={styles.groupItems}>
            {group.items.map((item) => (
              <ReminderCard key={item.title} item={item} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 32,
  },
  group: {
    gap: 16,
  },
  groupLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  groupItems: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderWidth: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  status: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 28,
  },
});
