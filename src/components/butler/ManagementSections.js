import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

function SettingsRow({ icon, label, value, showBorder }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsRow, showBorder && { borderTopColor: Colors.cardBorder, borderTopWidth: 1 }]}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={18} color={Colors.textPrimary} />
        <Text style={[styles.rowLabel, { color: Colors.textDark, fontFamily: Fonts.semiBold }]}>
          {label}
        </Text>
      </View>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {value}
          </Text>
        )}
        <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function RemindRow({ label, showBorder }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.remindRow, showBorder && { borderTopColor: Colors.cardBorder, borderTopWidth: 1 }]}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

function DataButton({ icon, label, danger }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.dataBtn,
        danger
          ? { backgroundColor: 'rgba(232, 107, 107, 0.1)', borderColor: 'rgba(232, 107, 107, 0.2)' }
          : { backgroundColor: Colors.card, borderColor: Colors.grayDot },
      ]}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={16} color={danger ? Colors.rose : Colors.textDark} />
      <Text
        style={[
          styles.dataBtnText,
          { color: danger ? Colors.rose : Colors.textDark, fontFamily: Fonts.semiBold },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function ManagementSections() {
  const { Colors, Fonts } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        MANAGEMENT
      </Text>

      {/* Settings card */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
        <SettingsRow icon="wallet-outline" label="Annual Budget" />
        <SettingsRow icon="cash-outline" label="Currency Selection" value="USD ($)" showBorder />
        <SettingsRow icon="calendar-outline" label="Year Range" value="2023 - 2024" showBorder />
      </View>

      {/* Remind settings card */}
      <View style={[styles.remindCard, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
        <Text style={[styles.subHeading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          REMIND SETTINGS
        </Text>
        <View>
          <RemindRow label="Durables" />
          <RemindRow label="Schedules" showBorder />
          <RemindRow label="Assets" showBorder />
        </View>
      </View>

      {/* Data management */}
      <View style={styles.dataRow}>
        <DataButton icon="download-outline" label="Import" />
        <DataButton icon="cloud-upload-outline" label="Export" />
        <DataButton icon="trash-outline" label="Reset" danger />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  subHeading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  card: {
    borderWidth: 1,
    borderRadius: 32,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  remindCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 32,
    gap: 16,
  },
  remindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 28,
  },
  rowValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dataBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 32,
  },
  dataBtnText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
});
