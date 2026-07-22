import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import {
  getSchedule,
  removeSchedule,
  patchSchedule,
  effectiveStatus,
  parseChecklist,
  progress,
} from '../../src/services/schedule';
import { statusMeta, priorityMeta, dateRangeText } from '../../src/utils/scheduleMeta';
import { daysUntil } from '../../src/utils/date';
import ScheduleHero from '../../src/components/schedule-detail/ScheduleHero';
import ScheduleStatsGrid from '../../src/components/schedule-detail/ScheduleStatsGrid';
import QuickStatus from '../../src/components/schedule-detail/QuickStatus';
import ChecklistSection from '../../src/components/schedule-detail/ChecklistSection';
import DetailFooter from '../../src/components/common/DetailFooter';
import DetailTextSection from '../../src/components/common/DetailTextSection';
import ScreenState from '../../src/components/common/ScreenState';

export default function ScheduleDetailScreen() {
  const { Colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const darkMode = useSettingsStore((s) => s.settings.darkMode);

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const item = id ? await getSchedule(id) : null;
          if (active) setRow(item);
        } catch {
          if (active) setRow(null);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  // Lightweight refetch (no spinner) after a quick status change.
  const reload = useCallback(async () => {
    try {
      const item = id ? await getSchedule(id) : null;
      setRow(item);
    } catch {
      setRow(null);
    }
  }, [id]);

  // ── Loading / not-found states ──────────────────
  if (loading) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (!row) {
    return (
      <ScreenState
        message={t('schedule.loadFailed')}
        onBack={() => router.replace('/schedule')}
        backLabel={t('common.backToList')}
      />
    );
  }

  // ── Derived values ──────────────────────────────
  const status = effectiveStatus(row);
  const sta = statusMeta(status, Colors, t);
  const pri = priorityMeta(row.priority, Colors, t);
  const prog = progress(row);
  const checklist = parseChecklist(row);
  const reminderOn = Number(row.reminder_enabled) === 1;

  const daysLeft = daysUntil(row.end_date);
  const timeLeftText =
    daysLeft === null
      ? '--'
      : daysLeft > 0
        ? `${daysLeft} ${t('common.days')}`
        : daysLeft === 0
          ? t('common.today')
          : t('common.expired');

  const setStatus = async (newStatus) => {
    await patchSchedule(row.id, { status: newStatus });
    reload();
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScheduleHero
          image={row.image || null}
          title={row.title}
          statusText={sta.label}
          statusColor={sta.color}
          timeLeftText={timeLeftText}
        />
        <View style={styles.sections}>
          <ScheduleStatsGrid
            priorityLabel={pri.label}
            priorityColor={pri.color}
            dateRangeText={dateRangeText(row)}
            checklistText={prog.total > 0 ? `${prog.done}/${prog.total}` : '--'}
            reminderOn={reminderOn}
          />
          <QuickStatus current={status} onSetStatus={setStatus} />
          <ChecklistSection items={checklist} />

          <DetailTextSection title={t('schedule.notes')} text={row.notes} />
        </View>
      </ScrollView>

      {/* Floating back button over hero */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: hexToRgba(Colors.inkDeep, 0.45) }]}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.white} />
      </TouchableOpacity>

      {/* Fixed bottom actions */}
      <View style={{ paddingBottom: insets.bottom }}>
        <DetailFooter
          editPath={`/schedule/form?id=${row.id}`}
          deleteConfirmText={t('schedule.deleteConfirm')}
          onDelete={async () => {
            await removeSchedule(row.id);
            router.replace('/schedule');
          }}
        />
      </View>

      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 16,
  },
  sections: {
    paddingTop: 16,
    gap: 16,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
