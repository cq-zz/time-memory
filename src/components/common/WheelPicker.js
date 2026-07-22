import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import FieldLabel from './FieldLabel';
import WheelColumn from './WheelColumn';

const LEVEL_CONFIG = {
  year: { cols: ['year'], format: 'YYYY', titleKey: 'common.selectYear' },
  month: { cols: ['year', 'month'], format: 'YYYY-MM', titleKey: 'common.selectYearMonth' },
  date: { cols: ['year', 'month', 'day'], format: 'YYYY-MM-DD', titleKey: 'common.selectDate' },
  hour: { cols: ['year', 'month', 'day', 'hour'], format: 'YYYY-MM-DD HH', titleKey: 'common.selectDateHour' },
  minute: { cols: ['year', 'month', 'day', 'hour', 'minute'], format: 'YYYY-MM-DD HH:mm', titleKey: 'common.selectDateTime' },
};

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Scroll-wheel date/time picker (bottom sheet).
 * level: 'year' | 'month' | 'date' | 'hour' | 'minute'
 * Year range follows the global Year Range setting.
 */
export default function WheelPicker({
  value,
  onChange,
  placeholder,
  level = 'date',
  label,
  clearable = true,
  style,
  allOption = false,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const [open, setOpen] = useState(false);
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.date;
  const resolvedPlaceholder = placeholder ?? t('common.pleaseSelect');
  const allLabel = t('common.all');

  const isAll = allOption && value === 'all';
  // Memoized on primitives: a fresh dayjs object every render would make
  // `parts` (and the [open, parts] sync effect below) re-fire endlessly.
  const parsed = useMemo(() => (value && !isAll ? dayjs(value) : null), [value, isAll]);
  const hasValue = isAll || (parsed && parsed.isValid());
  const displayValue = isAll ? allLabel : (hasValue ? parsed.format(config.format) : '');

  const parts = useMemo(() => {
    if (isAll) {
      return { year: allLabel, month: 1, day: 1, hour: 0, minute: 0 };
    }
    const d = hasValue ? parsed : dayjs();
    return {
      year: d.year(),
      month: d.month() + 1,
      day: d.date(),
      hour: d.hour(),
      minute: d.minute(),
    };
  }, [hasValue, parsed, isAll, allLabel]);

  const [draft, setDraft] = useState(parts);

  const draftDaysInMonth = useMemo(() => {
    if (allOption && typeof draft.year === 'string') return 31;
    return getDaysInMonth(draft.year, draft.month);
  }, [draft.year, draft.month, allOption]);

  useEffect(() => {
    if (open) setDraft(parts);
  }, [open, parts]);

  const ranges = useMemo(() => {
    const year = [];
    if (allOption) year.push({ value: allLabel, label: allLabel });
    for (let y = yearStart; y <= yearEnd; y++) year.push({ value: y, label: String(y) });
    const month = [];
    for (let m = 1; m <= 12; m++) month.push({ value: m, label: pad(m) });
    const day = [];
    for (let d = 1; d <= draftDaysInMonth; d++) day.push({ value: d, label: pad(d) });
    const hour = [];
    for (let h = 0; h < 24; h++) hour.push({ value: h, label: pad(h) });
    const minute = [];
    for (let m = 0; m < 60; m++) minute.push({ value: m, label: pad(m) });
    return { year, month, day, hour, minute };
  }, [yearStart, yearEnd, draftDaysInMonth, allOption, allLabel]);

  const handleColumnChange = useCallback((colKey, val) => {
    setDraft((prev) => {
      if (allOption && colKey === 'year' && typeof val === 'string') {
        return { ...prev, year: val };
      }
      const next = { ...prev, [colKey]: val };
      if (colKey === 'year' || colKey === 'month') {
        const dim = getDaysInMonth(
          colKey === 'year' ? val : next.year,
          colKey === 'month' ? val : next.month,
        );
        if (next.day > dim) next.day = dim;
      }
      return next;
    });
  }, [allOption]);

  const handleConfirm = useCallback(() => {
    if (allOption && draft.year === allLabel) {
      onChange('all');
      setOpen(false);
      return;
    }
    const ds = dayjs(`${draft.year}-${pad(draft.month)}-${pad(draft.day)} ${pad(draft.hour)}:${pad(draft.minute)}`);
    onChange(ds.format(config.format));
    setOpen(false);
  }, [draft, onChange, config.format, allOption]);

  const isTimeLevel = level === 'minute' || level === 'hour';

  return (
    <View style={[styles.wrap, style]}>
      {label ? <FieldLabel label={label} /> : null}
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: Colors.card,
            borderColor: hasValue ? Colors.purpleTint : Colors.grayDot,
            borderRadius: Radius.sm,
          },
          pressed && { borderColor: Colors.purple },
        ]}
        onPress={() => {
          setDraft(parts);
          setOpen(true);
        }}
      >
        <View style={styles.triggerLeft}>
          <Ionicons
            name={isTimeLevel ? 'time-outline' : 'calendar-outline'}
            size={18}
            color={hasValue ? Colors.purple : Colors.grayDot}
          />
          <Text
            style={[
              styles.triggerText,
              { color: Colors.textPrimary, fontFamily: Fonts.regular },
              !hasValue && { color: Colors.textTertiary },
            ]}
          >
            {displayValue || resolvedPlaceholder}
          </Text>
        </View>
        {clearable && value ? (
          <Pressable
            onPress={(event) => {
              event?.stopPropagation?.();
              onChange('');
            }}
            hitSlop={8}
            style={[styles.clearBtn, { backgroundColor: Colors.lightGray }]}
          >
            <Ionicons name="close" size={12} color={Colors.textSecondary} />
          </Pressable>
        ) : null}
      </Pressable>

      {open && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setOpen(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={() => setOpen(false)} />
            <View style={[styles.panel, { backgroundColor: Colors.card }]}>
              <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
                  {t(config.titleKey)}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                    {t('common.confirm')}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.pickerBody}>
                <View style={styles.colsRow}>
                  {config.cols.map((colKey) => (
                    <WheelColumn
                      key={colKey}
                      items={ranges[colKey]}
                      selected={draft[colKey]}
                      onChange={(val) => handleColumnChange(colKey, val)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    width: '100%',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    minHeight: 56,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  triggerText: {
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginLeft: 8,
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
    flexShrink: 1,
    textAlign: 'center',
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerBtnConfirm: {
    fontSize: 15,
    lineHeight: 22,
  },
  pickerBody: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  colsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
});
