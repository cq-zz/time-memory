import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore, currencyMeta } from '../../store/settings';
import CurrencyModal from './CurrencyModal';
import YearRangeModal from './YearRangeModal';
import DataManagement from './DataManagement';

const CATEGORY_ROW_ICONS = {
  item: 'pricetag-outline',
  bill: 'receipt-outline',
  asset: 'diamond-outline',
};

const CATEGORY_TYPE_LABEL_KEYS = {
  item: 'butler.categoryTypeItem',
  bill: 'butler.categoryTypeBill',
  asset: 'butler.categoryTypeAsset',
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

function StepperRow({ label, value, min, max, onChange, showBorder }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  const step = (delta) => {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  };

  const btnStyle = (disabled) => [
    styles.stepperBtn,
    { backgroundColor: Colors.bg, borderColor: Colors.grayDot },
    disabled && { opacity: 0.35 },
  ];

  return (
    <View style={[styles.remindRow, showBorder && { borderTopColor: Colors.cardBorder, borderTopWidth: 1 }]}>
      <Text style={[styles.rowLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
        {label}
      </Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={btnStyle(value <= min)}
          activeOpacity={0.7}
          disabled={value <= min}
          onPress={() => step(-1)}
        >
          <Ionicons name="remove" size={14} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.stepperValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
          {t('settings.daysShort', { days: value })}
        </Text>
        <TouchableOpacity
          style={btnStyle(value >= max)}
          activeOpacity={0.7}
          disabled={value >= max}
          onPress={() => step(1)}
        >
          <Ionicons name="add" size={14} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ManagementSections() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [yearRangeOpen, setYearRangeOpen] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('butler.management')}
        </Text>

        {/* Settings card */}
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
          <SettingsRow
            icon="cash-outline"
            label={t('butler.currencySelection')}
            value={currencyMeta(settings.currency).label}
            onPress={() => setCurrencyOpen(true)}
          />
          <SettingsRow
            icon="calendar-outline"
            label={t('butler.yearRangeRow')}
            value={`${settings.yearStart} - ${settings.yearEnd}`}
            showBorder
            onPress={() => setYearRangeOpen(true)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {t('butler.categoryManagementHeading')}
        </Text>

        {/* Category management card */}
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
          {CATEGORY_TYPES.map((type, i) => (
            <SettingsRow
              key={type}
              icon={CATEGORY_ROW_ICONS[type]}
              label={t(CATEGORY_TYPE_LABEL_KEYS[type])}
              showBorder={i > 0}
              onPress={() => router.push(CATEGORY_ROUTES[type])}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.reminderHeading}>
          <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('butler.remindSettingsHeading')}
          </Text>
          <Text style={[styles.reminderHint, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
            {t('butler.remindSettingsHint')}
          </Text>
        </View>

        {/* Remind settings card */}
        <View style={[styles.card, { backgroundColor: Colors.card, borderColor: Colors.grayDot }]}>
          <StepperRow
            label={t('settings.durableRemind')}
            value={settings.durableRemindDays}
            min={0}
            max={7}
            onChange={(v) => updateSetting('durableRemindDays', v)}
          />
          <StepperRow
            label={t('settings.assetRemind')}
            value={settings.assetRemindDays}
            min={0}
            max={365}
            onChange={(v) => updateSetting('assetRemindDays', v)}
            showBorder
          />
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
  section: {
    gap: 8,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  reminderHeading: {
    gap: 4,
  },
  reminderHint: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 32,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  remindRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 44,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
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
