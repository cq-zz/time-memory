import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
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

export default function ImportantDateDetailScreen() {
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
        const item = id ? await getImportantDate(id) : null;
        if (!active) return;
        setRow(item);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

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
          {t('importantDate.itemNotFound', { defaultValue: 'Event not found' })}
        </Text>
        <Pressable
          onPress={() => router.replace('/important-date')}
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
  const ty = typeMeta(row.type, Colors, t);
  const pri = priorityMeta(row.priority, Colors, t);
  const days = countdownDays(row);
  const cd = countdownText(days, Colors, t);
  const years = yearsPassed(row);
  const isAnnual = (row.reminder_type || 'annual') === 'annual';
  const reminderOn = Number(row.reminder_enabled) === 1;
  const yearsText = isAnnual && years != null ? t('importantDate.yearCount', { count: years + 1 }) : '--';

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
            yearsText={yearsText}
          />

          {/* Notes */}
          {row.notes ? (
            <View style={styles.notesWrap}>
              <Text style={[styles.notesLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                {t('importantDate.notes')}
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
    width: 40,
    height: 40,
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
