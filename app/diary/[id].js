import { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { getDiary, removeDiary } from '../../src/services/diary';
import { formatDisplay } from '../../src/utils/date';
import { weatherLabel } from '../../src/components/diary/DiaryList';
import { WEATHER_OPTIONS } from '../../src/utils/constant';
import FormHeader from '../../src/components/common/FormHeader';
import ImagePreviewModal from '../../src/components/common/ImagePreviewModal';
import DetailFooter from '../../src/components/common/DetailFooter';

const WEATHER_EMOJI = {};
WEATHER_OPTIONS.forEach((w) => {
  WEATHER_EMOJI[w.key] = w.emoji;
});

export default function DiaryDetailScreen() {
  const { Colors, Radius, Shadows, Fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const item = id ? await getDiary(id) : null;
        if (!active) return;
        setRow(item);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, [id]),
  );

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
        <Ionicons name="book-outline" size={48} color={Colors.textTertiary} />
        <Text style={[styles.stateText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
          {t('diary.loadFailed', { defaultValue: 'Entry not found' })}
        </Text>
        <Pressable
          onPress={() => router.replace('/diary')}
          style={[styles.stateBtn, { backgroundColor: Colors.inkDeep }]}
        >
          <Text style={[styles.stateBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.backToList')}
          </Text>
        </Pressable>
      </View>
    );
  }

  const isPrivate = Number(row.is_private) === 1;
  const emoji = WEATHER_EMOJI[row.weather] || '';
  const hasImage = Boolean(row.image) && !imageError;
  const isBroken = Boolean(row.image) && imageError;

  return (
    <View style={[styles.container, { backgroundColor: Colors.bg }]}>
      <FormHeader title={t('nav.diaryDetail')} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View
          style={[
            styles.hero,
            {
              borderRadius: Radius.xl,
              backgroundColor: hasImage || isBroken ? Colors.card : hexToRgba(Colors.purple, 0.06),
            },
          ]}
        >
          {hasImage ? (
            <>
              <Image
                source={{ uri: row.image }}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
                onError={() => setImageError(true)}
              />
              <Pressable style={StyleSheet.absoluteFill} onPress={() => setPreviewImage(row.image)} />
            </>
          ) : isBroken ? (
            <View style={styles.heroCenter}>
              <Ionicons name="image-outline" size={40} color={Colors.textTertiary} />
              <Text style={[styles.brokenText, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
                {t('diary.imageBroken')}
              </Text>
            </View>
          ) : (
            <View style={styles.heroCenter}>
              <Ionicons name="book-outline" size={48} color={Colors.purple} />
            </View>
          )}
        </View>

        {/* Info card */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.xl },
            Shadows.card,
          ]}
        >
          {/* Title + lock badge */}
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {row.title}
            </Text>
            {isPrivate ? (
              <View style={[styles.lockBadge, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
                <Ionicons name="lock-closed" size={12} color={Colors.purple} />
              </View>
            ) : null}
          </View>

          {/* Date + weather */}
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
            <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}>
              {formatDisplay(row.date)}
            </Text>
            {emoji ? (
              <Text style={[styles.metaText, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {emoji} {weatherLabel(row.weather, t)}
              </Text>
            ) : null}
          </View>

          {/* Content */}
          {row.content ? (
            <View style={[styles.contentSection, { borderTopColor: Colors.cardBorder }]}>
              <Text style={[styles.contentLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
                {t('diary.content')}
              </Text>
              <Text style={[styles.contentText, { color: Colors.textPrimary, fontFamily: Fonts.regular }]}>
                {row.content}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

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

      <ImagePreviewModal imageUri={previewImage} onClose={() => setPreviewImage(null)} />
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 20,
  },
  hero: {
    width: '100%',
    aspectRatio: 3 / 4,
    overflow: 'hidden',
  },
  heroCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brokenText: {
    fontSize: 12,
  },
  infoCard: {
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 28,
    flexShrink: 1,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  contentSection: {
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  contentLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 26,
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
