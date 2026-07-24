import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../utils/theme';
import { MOODS, moodMeta } from '../../utils/constant';
import { useMoodStore, todayStr } from '../../store/mood';
import { showToast } from '../common/Toast';

const pad = (n) => String(n).padStart(2, '0');
const dateStr = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/**
 * Mood Records — month-grid check-in calendar.
 * Tap any day up to today to set (or change) its mood.
 */
export default function MoodCalendarModal({ visible, onClose }) {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const records = useMoodStore((s) => s.records);
  const saveMood = useMoodStore((s) => s.saveMood);

  const monthNames = t('calendar.months', { returnObjects: true });
  const weekdayLabels = t('calendar.weekdays', { returnObjects: true });

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [pickingDate, setPickingDate] = useState(null);

  // Jump back to the current month whenever the calendar reopens.
  useEffect(() => {
    if (visible) {
      const d = new Date();
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth() + 1);
      setPickingDate(null);
    }
  }, [visible]);

  const recordMap = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      map[r.check_date] = r.mood;
    });
    return map;
  }, [records]);

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth - 1, 1).getDay();
  const today = todayStr();

  const goPrev = () => {
    if (viewMonth === 1) {
      setViewYear(viewYear - 1);
      setViewMonth(12);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 12) {
      setViewYear(viewYear + 1);
      setViewMonth(1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayPress = (day) => {
    const ds = dateStr(viewYear, viewMonth, day);
    if (ds > today) return; // future days are not check-in-able
    setPickingDate(ds);
  };

  const handlePickMood = async (mood) => {
    try {
      await saveMood(mood.key, pickingDate);
      setPickingDate(null);
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
            Shadows.dark,
          ]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('moodTrend.title')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <Pressable onPress={goPrev} hitSlop={8} style={styles.navBtn}>
              <Ionicons name="chevron-back" size={20} color={Colors.textPrimary} />
            </Pressable>
            <Text style={[styles.monthLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {monthNames[viewMonth - 1]} {viewYear}
            </Text>
            <Pressable onPress={goNext} hitSlop={8} style={styles.navBtn}>
              <Ionicons name="chevron-forward" size={20} color={Colors.textPrimary} />
            </Pressable>
          </View>

          {/* Weekday header row */}
          <View style={styles.weekRow}>
            {weekdayLabels.map((w, i) => (
              <View key={`${w}-${i}`} style={styles.cell}>
                <Text style={[styles.weekText, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
                  {w}
                </Text>
              </View>
            ))}
          </View>

          {/* Day grid */}
          <View style={styles.dayGrid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`pad-${i}`} style={styles.cell} />;
              const ds = dateStr(viewYear, viewMonth, day);
              const moodKey = recordMap[ds];
              const mood = moodKey ? moodMeta(moodKey) : null;
              const isFuture = ds > today;
              const isToday = ds === today;
              return (
                <Pressable
                  key={ds}
                  style={[
                    styles.cell,
                    isToday && {
                      backgroundColor: Colors.purpleTint,
                      borderRadius: Radius.sm,
                    },
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={isFuture}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: Colors.textPrimary, fontFamily: Fonts.regular },
                      isFuture && { color: Colors.textTertiary, opacity: 0.4 },
                      isToday && { color: Colors.purple, fontFamily: Fonts.bold },
                    ]}
                  >
                    {day}
                  </Text>
                  {mood ? (
                    <Text style={styles.dayEmoji}>{mood.emoji}</Text>
                  ) : (
                    !isFuture && (
                      <View style={[styles.addBadge, { backgroundColor: hexToRgba(Colors.purple, 0.15) }]}>
                        <Ionicons name="add" size={9} color={Colors.purple} />
                      </View>
                    )
                  )}
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.legend, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
            {t('butler.moodCalendarHint')}
          </Text>
        </Pressable>
      </Pressable>

      {/* Nested mood picker */}
      <Modal visible={!!pickingDate} transparent animationType="fade" onRequestClose={() => setPickingDate(null)}>
        <Pressable
          style={[styles.overlay, { backgroundColor: Colors.overlay }]}
          onPress={() => setPickingDate(null)}
        >
          <Pressable
            style={[
              styles.pickerContent,
              { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
              Shadows.dark,
            ]}
            onPress={() => {}}
          >
            <Text style={[styles.pickerTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {t('butler.moodPastQuestion')}
            </Text>
            <Text style={[styles.pickerDate, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {pickingDate}
            </Text>
            <ScrollView contentContainerStyle={styles.moodGrid} showsVerticalScrollIndicator={false}>
              {MOODS.map((m) => (
                <Pressable
                  key={m.key}
                  style={({ pressed }) => [
                    styles.moodChip,
                    { backgroundColor: Colors.bg, borderColor: Colors.grayDot },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => handlePickMood(m)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text
                    style={[styles.moodLabel, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}
                    numberOfLines={1}
                  >
                    {t(`checkIn.mood.${m.key}`)}
                  </Text>
                  <Text style={[styles.moodScore, { color: Colors.textTertiary, fontFamily: Fonts.bold }]}>
                    {m.score}/5
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    padding: 20,
    gap: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    lineHeight: 26,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 15,
    lineHeight: 22,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekText: {
    fontSize: 11,
    lineHeight: 16,
  },
  dayText: {
    fontSize: 13,
    lineHeight: 18,
  },
  dayEmoji: {
    fontSize: 12,
    lineHeight: 14,
    marginTop: 1,
  },
  addBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  legend: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  pickerContent: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '75%',
    padding: 20,
    gap: 6,
    borderWidth: 1,
  },
  pickerTitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  pickerDate: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  moodChip: {
    width: '30.5%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
  },
  moodEmoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  moodLabel: {
    fontSize: 11,
    lineHeight: 15,
  },
  moodScore: {
    fontSize: 9,
    lineHeight: 12,
    opacity: 0.7,
  },
});
