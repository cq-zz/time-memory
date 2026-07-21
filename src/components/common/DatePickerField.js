import { useCallback, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';

const FORMAT_MAP = {
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  datetime: 'YYYY-MM-DD HH:mm',
};

const TITLE_MAP = {
  date: 'Select Date',
  time: 'Select Time',
  datetime: 'Select Date & Time',
};

const normalizeMode = (mode) =>
  Object.prototype.hasOwnProperty.call(FORMAT_MAP, mode) ? mode : 'date';

const parseDateValue = (value, mode) => {
  if (!value) return null;
  const parsed =
    mode === 'time'
      ? dayjs(`${dayjs().format('YYYY-MM-DD')} ${value}`)
      : dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const formatDateValue = (date, mode) => dayjs(date).format(FORMAT_MAP[mode]);

const mergeDateAndTime = (datePart, timePart) =>
  dayjs(datePart)
    .hour(dayjs(timePart).hour())
    .minute(dayjs(timePart).minute())
    .second(0)
    .millisecond(0)
    .toDate();

/**
 * Date / time / datetime field with native picker.
 * iOS: spinner inside a bottom sheet. Android: system dialog.
 * Year bounds follow the global Year Range setting.
 */
export default function DatePickerField({
  value,
  onChange,
  placeholder,
  mode = 'date',
  label,
  clearable = true,
  style,
}) {
  const { Colors, Radius, Fonts } = useTheme();
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const [open, setOpen] = useState(false);
  const pickerMode = normalizeMode(mode);
  const resolvedPlaceholder = placeholder ?? 'Please select';

  const parsedValue = parseDateValue(value, pickerMode);
  const hasValue = Boolean(parsedValue);
  const dateValue = parsedValue ? parsedValue.toDate() : new Date();
  const displayValue = parsedValue ? parsedValue.format(FORMAT_MAP[pickerMode]) : '';
  const minDate = useMemo(() => dayjs(`${yearStart}-01-01`).toDate(), [yearStart]);
  const maxDate = useMemo(() => dayjs(`${yearEnd}-12-31`).toDate(), [yearEnd]);

  const handleConfirm = useCallback(
    (d) => {
      setOpen(false);
      onChange(formatDateValue(d, pickerMode));
    },
    [onChange, pickerMode],
  );

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={[styles.label, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
          {label}
        </Text>
      ) : null}
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
        onPress={() => setOpen(true)}
      >
        <View style={styles.triggerLeft}>
          <Ionicons
            name={pickerMode === 'time' ? 'time-outline' : 'calendar-outline'}
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

      {open ? (
        <NativePicker
          dateValue={dateValue}
          mode={pickerMode}
          minDate={minDate}
          maxDate={maxDate}
          darkMode={darkMode}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      ) : null}
    </View>
  );
}

function NativePicker({ dateValue, mode, minDate, maxDate, darkMode, onConfirm, onCancel }) {
  const { Colors, Fonts } = useTheme();
  const [date, setDate] = useState(dateValue);
  const [androidMode, setAndroidMode] = useState(mode === 'datetime' ? 'date' : mode);

  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={date}
        mode={androidMode}
        display="default"
        minuteInterval={1}
        minimumDate={minDate}
        maximumDate={maxDate}
        onDismiss={onCancel}
        onValueChange={(_, selectedDate) => {
          if (!selectedDate) return;
          if (mode === 'datetime' && androidMode === 'date') {
            setDate(mergeDateAndTime(selectedDate, date));
            setAndroidMode('time');
            return;
          }
          onConfirm(androidMode === 'time' ? mergeDateAndTime(date, selectedDate) : selectedDate);
        }}
      />
    );
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onCancel} />
        <View style={[styles.pickerContainer, { backgroundColor: Colors.card }]}>
          <View style={[styles.pickerHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Pressable onPress={onCancel} style={styles.pickerBtn}>
              <Text style={[styles.pickerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                Cancel
              </Text>
            </Pressable>
            <Text style={[styles.pickerTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {TITLE_MAP[mode]}
            </Text>
            <Pressable onPress={() => onConfirm(date)} style={styles.pickerBtn}>
              <Text style={[styles.pickerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
                Confirm
              </Text>
            </Pressable>
          </View>
          <View style={styles.pickerBody}>
            <DateTimePicker
              value={date}
              mode={mode}
              display="spinner"
              minuteInterval={1}
              minimumDate={minDate}
              maximumDate={maxDate}
              onValueChange={(_, selectedDate) => {
                if (selectedDate) setDate(selectedDate);
              }}
              style={styles.inlinePicker}
              textColor={Colors.textPrimary}
              themeVariant={darkMode ? 'dark' : 'light'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
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
  pickerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  pickerBtn: {
    minWidth: 52,
    alignItems: 'center',
  },
  pickerBtnCancel: {
    fontSize: 16,
    lineHeight: 24,
  },
  pickerBtnConfirm: {
    fontSize: 16,
    lineHeight: 24,
  },
  pickerTitle: {
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
    textAlign: 'center',
  },
  pickerBody: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  inlinePicker: {
    height: 216,
  },
});
