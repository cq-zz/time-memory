import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { getSchedule, saveSchedule, parseChecklist } from '../../src/services/schedule';
import { SCHEDULE_PRIORITIES, SCHEDULE_STATUS_OPTIONS } from '../../src/utils/constant';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import WheelPicker from '../../src/components/common/WheelPicker';
import FormInput from '../../src/components/common/FormInput';
import FormSaveFooter from '../../src/components/common/FormSaveFooter';
import ScreenState from '../../src/components/common/ScreenState';

const STATUS_LABEL = {
  not_started: 'schedule.notStarted',
  in_progress: 'schedule.inProgress',
  done: 'schedule.done',
  incomplete: 'schedule.incomplete',
};
const PRIORITY_LABEL = {
  high: 'schedule.priorityHigh',
  medium: 'schedule.priorityMedium',
  low: 'schedule.priorityLow',
};

export default function ScheduleFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [image, setImage] = useState('');
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('not_started');
  const [priority, setPriority] = useState('medium');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [loaded, setLoaded] = useState(!isEdit);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveLockRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    (async () => {
      try {
        const row = await getSchedule(id);
        if (!active) return;
        if (!row) {
          setLoadFailed(true);
          showToast(t('schedule.loadFailed'));
          return;
        }
        setImage(row.image || '');
        setPlanName(row.title || '');
        setStartDate(row.start_date || '');
        setEndDate(row.end_date || '');
        setStatus(row.status || 'not_started');
        setPriority(row.priority || 'medium');
        setReminderEnabled(Number(row.reminder_enabled) !== 0);
        setNotes(row.notes || '');
        setChecklist(parseChecklist(row));
      } catch {
        if (active) {
          setLoadFailed(true);
          showToast(t('schedule.loadFailed'));
        }
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id, t]);

  const handleSave = async () => {
    if (saveLockRef.current) return;
    const trimmedName = planName.trim();
    if (!trimmedName) {
      showToast(t('schedule.planName') + ' *');
      return;
    }
    if (!startDate) {
      showToast(t('schedule.startDate') + ' *');
      return;
    }
    const values = {
      image,
      title: trimmedName,
      start_date: startDate,
      end_date: endDate,
      status,
      priority,
      reminder_enabled: reminderEnabled,
      notes,
      checklist,
    };
    saveLockRef.current = true;
    setSaving(true);
    try {
      await saveSchedule(values, isEdit ? id : undefined);
      showToast(t('common.saved'));
      router.back();
    } catch {
      showToast(t('common.saveFailed'));
    } finally {
      saveLockRef.current = false;
      setSaving(false);
    }
  };

  if (!loaded) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (loadFailed) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
        <FormHeader title={t('nav.editSchedule')} />
        <ScreenState
          message={t('schedule.loadFailed')}
          onBack={() => router.replace('/schedule')}
          backLabel={t('common.backToList')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editSchedule') : t('nav.addSchedule')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          value={image}
          onChange={setImage}
          placeholder={t('schedule.attachmentPlaceholder')}
          height={200}
        />
        <FormInput
          label={`${t('schedule.planName')} *`}
          placeholder={t('schedule.planNamePlaceholder')}
          value={planName}
          onChangeText={setPlanName}
        />
        <WheelPicker
          label={`${t('schedule.startDate')} *`}
          level="date"
          value={startDate}
          onChange={setStartDate}
        />
        <WheelPicker
          label={t('schedule.endDate')}
          level="date"
          value={endDate}
          onChange={setEndDate}
        />

        {/* Status */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('schedule.status')}
          </Text>
          <View style={styles.chipRow}>
            {SCHEDULE_STATUS_OPTIONS.map((opt) => {
              const isActive = status === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setStatus(opt.key)}
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
                    {t(STATUS_LABEL[opt.key])}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('schedule.priority')}
          </Text>
          <View style={styles.chipRow}>
            {SCHEDULE_PRIORITIES.map((opt) => {
              const isActive = priority === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.7}
                  onPress={() => setPriority(opt.key)}
                  style={[
                    styles.chip,
                    styles.chipFlex,
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
                    {t(PRIORITY_LABEL[opt.key])}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reminder toggle */}
        <View
          style={[
            styles.reminderCard,
            { backgroundColor: Colors.card, borderColor: Colors.cardBorder, borderRadius: Radius.lg },
          ]}
        >
          <View style={[styles.reminderIconBox, { backgroundColor: hexToRgba(Colors.purple, 0.12) }]}>
            <Ionicons name="notifications-outline" size={20} color={Colors.purple} />
          </View>
          <View style={styles.reminderInfo}>
            <Text style={[styles.reminderTitle, { color: Colors.textPrimary, fontFamily: Fonts.semiBold }]}>
              {t('schedule.enableReminder')}
            </Text>
            <Text style={[styles.reminderSubtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {t('schedule.reminderSubtitle')}
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: Colors.lightGray, true: hexToRgba(Colors.purple, 0.4) }}
            thumbColor={reminderEnabled ? Colors.purple : Colors.card}
          />
        </View>

        <FormInput
          label={t('schedule.notes')}
          placeholder={t('schedule.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <FormSaveFooter
        label={t('common.saveRecord')}
        savingLabel={t('common.loading')}
        saving={saving}
        onPress={handleSave}
      />
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
    paddingBottom: 24,
    gap: 16,
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
    gap: 10,
  },
  chip: {
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  chipFlex: {
    flex: 1,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
  },
  reminderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderInfo: {
    flex: 1,
    gap: 2,
  },
  reminderTitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  reminderSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
});
