import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const MONTHS_PER_ROW = 4;

const pad = (n) => String(n).padStart(2, '0');

/**
 * Year + month period picker (bottom sheet).
 * year=null means "All". yearOnly hides the month grid.
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
  const [open, setOpen] = useState(false);

  const displayText = useMemo(() => {
    if (year == null) return 'All';
    if (yearOnly) return `${year}`;
    if (month) return `${year}-${pad(month)}`;
    return `${year} · All`;
  }, [year, month, yearOnly]);

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

function PickerPanel({ currentYear, currentMonth, onSelect, onClose, yearOnly, showAllOption }) {
  const { Colors, Radius, Fonts } = useTheme();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const initialYear = currentYear || new Date().getFullYear();
  const [viewYear, setViewYear] = useState(initialYear);
  const [localMonth, setLocalMonth] = useState(currentMonth);
  const [localAll, setLocalAll] = useState(currentYear == null);

  const handleYearChange = (y) => {
    setViewYear(y);
    setLocalMonth(null);
    setLocalAll(false);
  };

  const years = useMemo(() => {
    const list = [];
    for (let y = yearEnd; y >= yearStart; y--) list.push(y);
    return list;
  }, [yearStart, yearEnd]);

  const handleConfirm = useCallback(() => {
    if (localAll) {
      onSelect(null, null);
    } else if (yearOnly) {
      onSelect(viewYear, null);
    } else {
      onSelect(viewYear, localMonth);
    }
  }, [localAll, yearOnly, viewYear, localMonth, onSelect]);

  return (
    <View style={styles.modalRoot}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
      <View style={[styles.panel, { backgroundColor: Colors.card }]}>
        {/* Header */}
        <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
          <Pressable onPress={onClose}>
            <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
              Cancel
            </Text>
          </Pressable>
          <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            Select Period
          </Text>
          <Pressable onPress={handleConfirm}>
            <Text style={[styles.headerBtnConfirm, { color: Colors.purple, fontFamily: Fonts.bold }]}>
              Confirm
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.allHint, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
          Leaving month empty selects the full year
        </Text>

        {showAllOption && (
          <Pressable
            style={[
              styles.allOption,
              {
                backgroundColor: localAll ? Colors.purple : Colors.iconBg,
                borderColor: localAll ? Colors.purple : Colors.cardBorder,
                borderRadius: Radius.md,
              },
            ]}
            onPress={() => {
              if (localAll) {
                setLocalAll(false);
                setViewYear(new Date().getFullYear());
              } else {
                setLocalAll(true);
                setLocalMonth(null);
              }
            }}
          >
            <Text
              style={[
                styles.allOptionText,
                { color: localAll ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
              ]}
            >
              All
            </Text>
          </Pressable>
        )}

        {!yearOnly && (
          <View style={styles.monthGrid}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={styles.monthRow}>
                {MONTHS.slice(row * MONTHS_PER_ROW, row * MONTHS_PER_ROW + MONTHS_PER_ROW).map((m) => {
                  const isActive = localMonth === m;
                  return (
                    <Pressable
                      key={m}
                      style={[
                        styles.monthCell,
                        {
                          backgroundColor: isActive ? Colors.purple : Colors.iconBg,
                          borderColor: isActive ? Colors.purple : Colors.cardBorder,
                          borderRadius: Radius.md,
                        },
                      ]}
                      onPress={() => {
                        setLocalMonth(localMonth === m ? null : m);
                        setLocalAll(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.monthCellText,
                          { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
                        ]}
                      >
                        {MONTH_NAMES[m - 1]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}

        {/* Year selector */}
        <View style={styles.yearHeader}>
          <Pressable
            onPress={() => handleYearChange(Math.max(viewYear - 1, yearStart))}
            style={[styles.yearNavBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
          >
            <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
          </Pressable>
          <Text style={[styles.yearHeaderTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
            {viewYear}
          </Text>
          <Pressable
            onPress={() => handleYearChange(Math.min(viewYear + 1, yearEnd))}
            style={[styles.yearNavBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
          >
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {/* Year quick jump */}
        <View style={styles.yearSection}>
          <Text style={[styles.yearSectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
            QUICK JUMP
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearGridRow}
          >
            {years.map((y) => {
              const isActive = currentYear === y;
              return (
                <Pressable
                  key={y}
                  style={[
                    styles.yearChip,
                    {
                      backgroundColor: isActive ? Colors.purple : Colors.iconBg,
                      borderColor: isActive ? Colors.purple : Colors.cardBorder,
                      borderRadius: Radius.pill,
                    },
                  ]}
                  onPress={() => handleYearChange(y)}
                >
                  <Text
                    style={[
                      styles.yearChipText,
                      { color: isActive ? Colors.white : Colors.textTertiary, fontFamily: Fonts.semiBold },
                    ]}
                  >
                    {y}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
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
