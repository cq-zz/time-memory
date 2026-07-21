import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/utils/theme';
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

export default function ScheduleDetailScreen() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const item = id ? await getSchedule(id) : null;
        if (!active) return;
        setRow(item);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

  // Lightweight refetch (no spinner) after a quick status change.
  const reload = useCallback(async () => {
    const item = id ? await getSchedule(id) : null;
    setRow(item);
  }, [id]);

  // ── Loading / not-found states ──────────────────
  if (loading) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <ActivityIndicator size="large" color={Colors.purple} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  if (!row) {
    return (
      <View style={[styles.stateWrap, { backgroundColor: Colors.bg }]}>
        <Ionicons name="file-tray-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('schedule.loadFailed')}
        </Text>
        <Pressable
          onPress={() => router.replace('/schedule')}
          style={[styles.stateBtn, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.stateBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.backToList')}
          </Text>
        </Pressable>
      </View>
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

          {/* Notes */}
          {row.notes ? (
            <View style={styles.notesWrap}>
              <Text style={[styles.notesLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                {t('schedule.notes')}
              </Text>
              <View
                style={[
                  styles.notesCard,
                  { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
                  Shadows.card,
                ]}
              >
                <Text style={[styles.notesText, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
                  {row.notes}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Floating back button over hero */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.back()}
        style={[styles.backBtn, { top: insets.top + 8, backgroundColor: 'rgba(255,255,255,0.25)' }]}
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

      <StatusBar style="light" />
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
    paddingBottom: 24,
  },
  sections: {
    paddingTop: 20,
    gap: 24,
  },
  notesWrap: {
    paddingHorizontal: 16,
    gap: 12,
  },
  notesLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  notesCard: {
    padding: 16,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  stateText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  stateBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  stateBtnText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
