import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, currencyMeta } from '../../store/settings';
import { CATEGORY_TYPE_LABELS } from '../../utils/constant';
import CurrencyModal from './CurrencyModal';
import YearRangeModal from './YearRangeModal';
import DataManagement from './DataManagement';

const CATEGORY_ROW_ICONS = {
  item: 'pricetag-outline',
  bill: 'receipt-outline',
  asset: 'diamond-outline',
};

const CATEGORY_ROUTES = {
  item: '/settings/categories',
  bill: '/settings/categories/bill',
  asset: '/settings/categories/asset',
};

const CATEGORY_TYPES = ['item', 'bill', 'asset'];

function SettingsRow({ icon, label, value, showBorder, onPress }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingsRow, showBorder && { borderTopColor: Colors.cardBorder, borderTopWidth: 1 }]}
      activeOpacity={0.7}
      onPress={onPress}
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

export default function ManagementSections() {
  const { Colors, Fonts } = useTheme();
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [yearRangeOpen, setYearRangeOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        MANAGEMENT
      </Text>

      {/* Settings card */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
        <SettingsRow
          icon="cash-outline"
          label="Currency Selection"
          value={currencyMeta(settings.currency).label}
          onPress={() => setCurrencyOpen(true)}
        />
        <SettingsRow
          icon="calendar-outline"
          label="Year Range"
          value={`${settings.yearStart} - ${settings.yearEnd}`}
          showBorder
          onPress={() => setYearRangeOpen(true)}
        />
      </View>

      {/* Category management card */}
      <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
        <View style={styles.subHeadingWrap}>
          <Text style={[styles.subHeading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            CATEGORY MANAGEMENT
          </Text>
        </View>
        {CATEGORY_TYPES.map((type, i) => (
          <SettingsRow
            key={type}
            icon={CATEGORY_ROW_ICONS[type]}
            label={CATEGORY_TYPE_LABELS[type]}
            showBorder={i > 0}
            onPress={() => router.push(CATEGORY_ROUTES[type])}
          />
        ))}
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
      <DataManagement />

      <CurrencyModal visible={currencyOpen} onClose={() => setCurrencyOpen(false)} />
      <YearRangeModal visible={yearRangeOpen} onClose={() => setYearRangeOpen(false)} />
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
  subHeadingWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
});
