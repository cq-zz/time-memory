import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme, hexToRgba } from '../../src/utils/theme';
import { getImportantDate, saveImportantDate } from '../../src/services/importantDate';
import { IMPORTANT_DATE_TYPES, REMINDER_TYPES, SCHEDULE_PRIORITIES } from '../../src/utils/constant';
import { showToast } from '../../src/components/common/Toast';
import FormHeader from '../../src/components/common/FormHeader';
import ImageUploadField from '../../src/components/common/ImageUploadField';
import WheelPicker from '../../src/components/common/WheelPicker';
import FormInput from '../../src/components/common/FormInput';
import FormSaveFooter from '../../src/components/common/FormSaveFooter';
import ScreenState from '../../src/components/common/ScreenState';

const TYPE_LABEL = {
  birthday: 'importantDate.typeBirthday',
  anniversary: 'importantDate.typeAnniversary',
  remembrance: 'importantDate.typeRemembrance',
  other: 'importantDate.typeOther',
};
const REMINDER_LABEL = {
  annual: 'importantDate.typeAnnual',
  once: 'importantDate.typeOnce',
};
const PRIORITY_LABEL = {
  high: 'importantDate.priorityHigh',
  medium: 'importantDate.priorityMedium',
  low: 'importantDate.priorityLow',
};

export default function ImportantDateFormScreen() {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEdit = Boolean(id);

  const [image, setImage] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('birthday');
  const [priority, setPriority] = useState('medium');
  const [reminderType, setReminderType] = useState('annual');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState('1');
  const [notes, setNotes] = useState('');
  const [loaded, setLoaded] = useState(!isEdit);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    setLoaded(false);
    setLoadFailed(false);
    (async () => {
      try {
        const row = await getImportantDate(id);
        if (!active) return;
        if (!row) {
          setLoadFailed(true);
          return;
        }
        setImage(row.image || '');
        setName(row.name || '');
        setDate(row.date || '');
        setType(row.type || 'birthday');
        setPriority(row.priority || 'medium');
        setReminderType(row.reminder_type || 'annual');
        setReminderEnabled(Number(row.reminder_enabled) !== 0);
        setReminderDaysBefore(row.reminder_days_before != null ? String(row.reminder_days_before) : '1');
        setNotes(row.notes || '');
      } catch {
        if (active) setLoadFailed(true);
      } finally {
        if (active) setLoaded(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, id]);

  const handleSave = async () => {
    if (savingRef.current) return;
    if (!name.trim()) {
      showToast(t('importantDate.name') + ' *');
      return;
    }
    if (!date) {
      showToast(t('importantDate.dateRequired'));
      return;
    }
    const daysText = reminderDaysBefore.trim();
    const daysNum = Number(daysText);
    if (
      reminderEnabled &&
      (!/^\d+$/.test(daysText) || !Number.isInteger(daysNum) || daysNum < 0 || daysNum > 365)
    ) {
      showToast(t('importantDate.reminderDaysInvalid'));
      return;
    }
    const values = {
      image,
      name: name.trim(),
      date,
      type,
      priority,
      reminder_type: reminderType,
      reminder_enabled: reminderEnabled,
      reminder_days_before: reminderEnabled ? daysNum : 0,
      notes,
    };
    savingRef.current = true;
    setSaving(true);
    try {
      await saveImportantDate(values, isEdit ? id : undefined);
      showToast(t('common.saved'));
      router.back();
    } catch (error) {
      showToast(
        error?.message === 'reminderDaysInvalid'
          ? t('importantDate.reminderDaysInvalid')
          : t('common.saveFailed'),
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (!loaded) {
    return <ScreenState loading message={t('common.loading')} />;
  }

  if (loadFailed) {
    return (
      <ScreenState
        message={t('importantDate.itemNotFound')}
        onBack={() => router.replace('/important-date')}
        backLabel={t('common.backToList')}
      />
    );
  }

  const renderChips = (options, selected, onSelect, labelMap) => (
    <View style={styles.chipRow}>
      {options.map((opt) => {
        const isActive = selected === opt.key;
        return (
          <TouchableOpacity
            key={opt.key}
            activeOpacity={0.7}
            onPress={() => onSelect(opt.key)}
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
              {t(labelMap[opt.key])}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('nav.editImportantDate') : t('nav.addImportantDate')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageUploadField
          value={image}
          onChange={setImage}
          placeholder={t('importantDate.attachmentPlaceholder')}
          height={200}
        />
        <FormInput
          label={`${t('importantDate.name')} *`}
          placeholder={t('importantDate.namePlaceholder')}
          value={name}
          onChangeText={setName}
        />
        <WheelPicker
          label={`${t('importantDate.date')} *`}
          level="date"
          value={date}
          onChange={setDate}
        />

        {/* Type */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('importantDate.type')}
          </Text>
          {renderChips(IMPORTANT_DATE_TYPES, type, setType, TYPE_LABEL)}
        </View>

        {/* Priority */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('importantDate.priority')}
          </Text>
          {renderChips(SCHEDULE_PRIORITIES, priority, setPriority, PRIORITY_LABEL)}
        </View>

        {/* Reminder type */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('importantDate.reminderType')}
          </Text>
          {renderChips(REMINDER_TYPES, reminderType, setReminderType, REMINDER_LABEL)}
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
              {t('importantDate.enableReminder')}
            </Text>
            <Text style={[styles.reminderSubtitle, { color: Colors.textSecondary, fontFamily: Fonts.regular }]}>
              {t('importantDate.reminderSubtitle')}
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: Colors.lightGray, true: hexToRgba(Colors.purple, 0.4) }}
            thumbColor={reminderEnabled ? Colors.purple : Colors.card}
          />
        </View>

        {reminderEnabled ? (
          <FormInput
            label={t('importantDate.reminderDaysBefore')}
            placeholder="1"
            value={reminderDaysBefore}
            onChangeText={(text) => setReminderDaysBefore(text.replace(/\D/g, ''))}
            keyboardType="number-pad"
          />
        ) : null}

        <FormInput
          label={t('importantDate.notes')}
          placeholder={t('importantDate.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      <FormSaveFooter
        label={t('common.saveRecord')}
        savingLabel={t('common.saving')}
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
