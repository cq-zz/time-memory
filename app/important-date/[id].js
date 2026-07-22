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
  getImportantDate,
  removeImportantDate,
  countdownDays,
  yearsPassed,
} from '../../src/services/importantDate';
import { typeMeta, countdownText } from '../../src/utils/importantDateMeta';
import { priorityMeta } from '../../src/utils/scheduleMeta';
import { formatDisplay } from '../../src/utils/date';
import ImportantDateHero from '../../src/components/important-date-detail/ImportantDateHero';
import ImportantDateStatsGrid from '../../src/components/important-date-detail/ImportantDateStatsGrid';
import DetailFooter from '../../src/components/common/DetailFooter';
import DetailTextSection from '../../src/components/common/DetailTextSection';
import ScreenState from '../../src/components/common/ScreenState';

export default function ImportantDateDetailScreen() {
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
          const item = id ? await getImportantDate(id) : null;
          if (active) setRow(item || null);
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

  // ── Loading / not-found states ──────────────────
  if (loading) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (!row) {
    return (
      <ScreenState
        message={t('importantDate.itemNotFound')}
        onBack={() => router.replace('/important-date')}
        backLabel={t('common.backToList')}
      />
    );
  }

  // ── Derived values ──────────────────────────────
  const ty = typeMeta(row.type, Colors, t);
  const pri = priorityMeta(row.priority, Colors, t);
  const days = countdownDays(row);
  const cd = countdownText(days, Colors, t);
  const years = yearsPassed(row);
  const isAnnual = (row.reminder_type || 'annual') === 'annual';
  const reminderOn = Number(row.reminder_enabled) === 1;
  const yearsText = isAnnual && years != null ? t('importantDate.yearCount', { count: years + 1 }) : '--';
  const reminderTypeText = isAnnual ? t('importantDate.typeAnnual') : t('importantDate.typeOnce');
  const reminderDaysText = reminderOn
    ? `${Number(row.reminder_days_before) || 0} ${t('common.days')}`
    : '--';

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ImportantDateHero
          image={row.image || null}
          fallbackIcon={ty.icon}
          title={row.name}
          typeText={ty.label}
          typeColor={ty.color}
          countdownText={cd.text}
        />
        <View style={styles.sections}>
          <ImportantDateStatsGrid
            dateText={formatDisplay(row.date)}
            typeLabel={ty.label}
            typeIcon={ty.icon}
            typeColor={ty.color}
            priorityLabel={pri.label}
            priorityColor={pri.color}
            reminderOn={reminderOn}
            reminderTypeText={reminderTypeText}
            reminderDaysText={reminderDaysText}
            yearsText={yearsText}
          />

          <DetailTextSection title={t('importantDate.notes')} text={row.notes} />
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
          editPath={`/important-date/form?id=${row.id}`}
          deleteConfirmText={t('importantDate.deleteConfirm')}
          onDelete={async () => {
            await removeImportantDate(row.id);
            router.replace('/important-date');
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
