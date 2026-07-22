import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { useSettingsStore } from '../../src/store/settings';
import { getDiary, removeDiary } from '../../src/services/diary';
import { formatDisplay } from '../../src/utils/date';
import { weatherLabel } from '../../src/components/diary/DiaryList';
import { WEATHER_OPTIONS } from '../../src/utils/constant';
import DetailFooter from '../../src/components/common/DetailFooter';
import DetailTextSection from '../../src/components/common/DetailTextSection';
import ScreenState from '../../src/components/common/ScreenState';
import DiaryHero from '../../src/components/diary/DiaryHero';
import DiaryStatsGrid from '../../src/components/diary/DiaryStatsGrid';

const WEATHER_EMOJI = {};
WEATHER_OPTIONS.forEach((w) => {
  WEATHER_EMOJI[w.key] = w.emoji;
});

export default function DiaryDetailScreen() {
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
          const item = id ? await getDiary(id) : null;
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

  if (loading) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (!row) {
    return (
      <ScreenState
        icon="book-outline"
        message={t('diary.loadFailed')}
        onBack={() => router.replace('/diary')}
        backLabel={t('common.backToList')}
      />
    );
  }

  const isPrivate = Number(row.is_private) === 1;
  const emoji = WEATHER_EMOJI[row.weather] || '';
  const weatherText = emoji ? `${emoji} ${weatherLabel(row.weather, t)}` : '--';
  const privacyText = isPrivate
    ? t('diary.privateDiary')
    : t('diary.publicDiary');

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DiaryHero
          image={row.image || null}
          title={row.title}
          dateText={formatDisplay(row.date)}
          privateText={privacyText}
          isPrivate={isPrivate}
        />
        <View style={styles.sections}>
          <DiaryStatsGrid
            dateText={formatDisplay(row.date)}
            weatherText={weatherText}
            privacyText={privacyText}
          />
          <DetailTextSection title={t('diary.content')} text={row.content} />
        </View>
      </ScrollView>

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
          editPath={`/diary/form?id=${row.id}`}
          deleteConfirmText={t('diary.deleteConfirm')}
          onDelete={async () => {
            await removeDiary(row.id);
            router.replace('/diary');
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
