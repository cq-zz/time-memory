import { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { getDiary, saveDiary } from '../../src/services/diary';
import { hasPassword } from '../../src/utils/password';
import { WEATHER_OPTIONS } from '../../src/utils/constant';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import DatePickerField from '../../src/components/common/DatePickerField';
import FormInput from '../../src/components/common/FormInput';
import { weatherLabel } from '../../src/components/diary/DiaryList';

export default function DiaryFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [weather, setWeather] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [hasPwd, setHasPwd] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  useEffect(() => {
    hasPassword().then(setHasPwd);
    if (!isEdit) return;
    getDiary(id).then((row) => {
      if (row) {
        setImage(row.image || '');
        setTitle(row.title || '');
        setDate(row.date || '');
        setWeather(row.weather || '');
        setContent(row.content || '');
        setIsPrivate(Number(row.is_private) === 1);
      }
      setLoaded(true);
    });
  }, [isEdit, id]);

  const handleSave = async () => {
    if (!title.trim()) {
      showToast(t('diary.title') + ' *');
      return;
    }
    if (!content.trim()) {
      showToast(t('diary.content') + ' *');
      return;
    }
    const values = {
      image,
      title: title.trim(),
      date,
      weather,
      content,
      is_private: isPrivate,
    };
    try {
      await saveDiary(values, isEdit ? id : undefined);
    } catch (e) {
      if (e?.message === 'dateFuture') {
        showToast(t('diary.date') + ' ≤ ' + t('common.today'));
        return;
      }
      showToast(t('diary.title') + ' *');
      return;
    }
    showToast(t('common.saved'));
    router.back();
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editDiary') : t('nav.addDiary')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          value={image}
          onChange={setImage}
          placeholder={t('diary.attachmentPlaceholder')}
          hint={t('diary.attachmentHint')}
          aspectRatio={4 / 3}
        />

        <FormInput
          label={`${t('diary.title')} *`}
          placeholder={t('diary.titlePlaceholder')}
          value={title}
          onChangeText={(v) => setTitle(v.slice(0, 20))}
        />

        <DatePickerField
          label={`${t('diary.date')} *`}
          mode="date"
          value={date}
          onChange={setDate}
        />

        {/* Weather chips */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('diary.weather')}
          </Text>
          <View style={styles.chipRow}>
            {WEATHER_OPTIONS.map((opt) => {
              const isActive = weather === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setWeather(isActive ? '' : opt.key)}
                  style={[
                    styles.chip,
                    {
                      borderRadius: Radius.pill,
                      backgroundColor: isActive ? Colors.inkDeep : Colors.card,
                      borderColor: isActive ? Colors.inkDeep : Colors.grayDot,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.bold },
                    ]}
                  >
                    {opt.emoji} {weatherLabel(opt.key, t)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <FormInput
          label={`${t('diary.content')} *`}
          placeholder={t('diary.contentPlaceholder')}
          value={content}
          onChangeText={setContent}
          multiline
        />

        {/* Private toggle — only when a password is configured */}
        {hasPwd ? (
          <View
            style={[
              styles.privateCard,
              { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
            ]}
          >
            <View style={[styles.privateIconBox, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
              <Ionicons name="lock-closed" size={20} color={Colors.purple} />
            </View>
            <View style={styles.privateInfo}>
              <Text style={[styles.privateTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
                {t('diary.privateDiary')}
              </Text>
              <Text style={[styles.privateSubtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
                {t('diary.privateDiaryHint')}
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: Colors.lightGray, true: hexToRgba(Colors.purple, 0.4) }}
              thumbColor={isPrivate ? Colors.purple : Colors.card}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Save button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }]}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.saveRecord')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  field: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 18,
  },
  privateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  privateIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateInfo: {
    flex: 1,
    gap: 2,
  },
  privateTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  privateSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  saveBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 16,
    lineHeight: 22,
  },
});
