import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import WheelColumn from './WheelColumn';

const pad = (n) => String(n).padStart(2, '0');
const ALL_VALUE = '__all__';

/**
 * Year + month period picker (bottom sheet).
 * Both wheel columns start with an "All" option. yearOnly hides the month wheel.
 * Year range follows the global Year Range setting.
 */
export default function YearMonthPicker({
  year,
  month, // null = full year
  onChange, // ({ year, month }) => {}
  style,
  yearOnly = false,
  showAllOption = false,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (year == null) return t('common.all');
    if (yearOnly) return `${year}`;
    if (month) return `${year}-${pad(month)}`;
    return t('common.yearFull', { year });
  }, [year, month, yearOnly, t]);

  const handleSelect = useCallback(
    (y, m) => {
      onChange({ year: y, month: m });
      setOpen(false);
    },
    [onChange],
  );

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: Colors.purpleTint, borderRadius: Radius.pill },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => setOpen(true)}
      >
        <Ionicons name="calendar-outline" size={16} color={Colors.purple} />
        <Text style={[styles.triggerText, { color: Colors.purple, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {displayText}
        </Text>
      </Pressable>

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <PickerPanel
            currentYear={year}
            currentMonth={month}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
            yearOnly={yearOnly}
            showAllOption={showAllOption}
          />
        </Modal>
      )}
    </View>
  );
}

function PickerPanel({ currentYear, currentMonth, onSelect, onClose, yearOnly }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);
  const monthNames = t('calendar.monthsShort', { returnObjects: true });

  const [draftYear, setDraftYear] = useState(currentYear ?? ALL_VALUE);
  const [draftMonth, setDraftMonth] = useState(currentMonth ?? ALL_VALUE);

  useEffect(() => {
    setDraftYear(currentYear ?? ALL_VALUE);
    setDraftMonth(currentMonth ?? ALL_VALUE);
  }, [currentYear, currentMonth]);

  const years = useMemo(
    () => [
      { value: ALL_VALUE, label: t('common.all') },
      ...Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => {
        const year = yearStart + i;
        return { value: year, label: String(year) };
      }),
    ],
    [yearStart, yearEnd, t],
  );
  const months = useMemo(
    () => [
      { value: ALL_VALUE, label: t('common.all') },
      ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: monthNames[i] })),
    ],
    [monthNames, t],
  );

  const handleConfirm = useCallback(() => {
    if (draftYear === ALL_VALUE) {
      onSelect(null, null);
    } else if (yearOnly) {
      onSelect(draftYear, null);
    } else {
      onSelect(draftYear, draftMonth === ALL_VALUE ? null : draftMonth);
    }
  }, [draftYear, draftMonth, yearOnly, onSelect]);

  return (
    <View style={styles.modalRoot}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: Colors.card }]}>
        {/* Header */}
        <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              {t('common.cancel')}
            </Text>
          </Pressable>
          <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {t('common.selectPeriod')}
          </Text>
          <Pressable onPress={handleConfirm}>
            <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
              {t('common.confirm')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.pickerBody}>
          <View style={styles.columns}>
            <WheelColumn
              items={years}
              selected={draftYear}
              onChange={(value) => {
                setDraftYear(value);
                if (value === ALL_VALUE) setDraftMonth(ALL_VALUE);
              }}
              width={112}
            />
            {!yearOnly && draftYear !== ALL_VALUE ? (
              <WheelColumn items={months} selected={draftMonth} onChange={setDraftMonth} width={112} />
            ) : !yearOnly ? (
              <View style={styles.emptyColumn} />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  triggerText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  pickerBody: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyColumn: {
    width: 112,
    height: 200,
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerBtnConfirm: {
    fontSize: 15,
    lineHeight: 22,
  },
  allHint: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
  },
  allOption: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  allOptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  monthGrid: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  monthRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  monthCellText: {
    fontSize: 14,
    lineHeight: 20,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  yearHeaderTitle: {
    fontSize: 18,
    lineHeight: 26,
  },
  yearNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  yearSection: {
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  yearSectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  yearGridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
