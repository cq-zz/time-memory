import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';

const GROUPS = [
  {
    heading: 'ACCOUNT',
    rows: [
      { icon: 'person-outline', label: 'Profile Settings' },
      { icon: 'lock-closed-outline', label: 'Security' },
    ],
  },
  {
    heading: 'SYSTEM',
    rows: [
      { icon: 'moon-outline', label: 'Dark Mode', isToggle: true },
      { icon: 'language-outline', label: 'Language', value: 'English' },
      { icon: 'key-outline', label: 'Security Log' },
    ],
  },
  {
    heading: 'SUPPORT',
    rows: [
      { icon: 'book-outline', label: 'User Guide' },
      { icon: 'shield-checkmark-outline', label: 'Privacy Policy' },
      { icon: 'information-circle-outline', label: 'About Timemory', value: 'v2.4.0' },
    ],
  },
];

function Toggle({ value, onToggle }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={[styles.toggleTrack, { backgroundColor: value ? '#4AA868' : '#E2E2E2' }]}
    >
      <View style={[styles.toggleKnob, { transform: [{ translateX: value ? 24 : 0 }] }]} />
    </TouchableOpacity>
  );
}

function SettingRow({ icon, label, value, isToggle, toggleValue, onToggle }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: Colors.iconBg }]}>
          <Ionicons name={icon} size={18} color={Colors.textPrimary} />
        </View>
        <Text style={[styles.rowLabel, { color: Colors.textDark, fontFamily: Fonts.regular }]}>{label}</Text>
      </View>

      {isToggle ? (
        <Toggle value={toggleValue} onToggle={onToggle} />
      ) : (
        <View style={styles.rowRight}>
          {value ? (
            <Text style={[styles.rowValue, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {value}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={14} color={Colors.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SettingGroups() {
  const { Colors, Radius, Fonts } = useTheme();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.container}>
      {GROUPS.map((group) => (
        <View
          key={group.heading}
          style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl }]}
        >
          <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {group.heading}
          </Text>
          <View style={styles.rows}>
            {group.rows.map((row) => (
              <SettingRow
                key={row.label}
                {...row}
                toggleValue={darkMode}
                onToggle={() => setDarkMode((v) => !v)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  card: {
    padding: 24,
    gap: 16,
    borderWidth: 1,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  rows: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    lineHeight: 22,
  },
  toggleTrack: {
    width: 48,
    height: 24,
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});
