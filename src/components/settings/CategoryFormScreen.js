import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useCategoryStore } from '../../store/categories';
import { CATEGORY_BUILTINS, ICON_SELECTOR_OPTIONS } from '../../utils/constant';
import { getAllRows, reassignCategory } from '../../store/db';
import { showToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';
import FormHeader from '../common/FormHeader';
import FormInput from '../common/FormInput';

/** i18n namespace holding the built-in display names for each type. */
const BUILTIN_NS = { item: 'categories', bill: 'billCategories', asset: 'assetCategories' };
/** Table whose `category` column references this type. */
const TYPE_TABLE = { item: 'durables', bill: 'bills', asset: 'assets' };
const NAME_MAX = 20;

export default function CategoryFormScreen({ type, editKey }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const custom = useCategoryStore((s) => s.custom);
  const addCustom = useCategoryStore((s) => s.addCustom);
  const updateCustom = useCategoryStore((s) => s.updateCustom);
  const deleteCustom = useCategoryStore((s) => s.deleteCustom);

  const isEdit = Boolean(editKey);
  const existing = useMemo(
    () => (isEdit ? (custom[type] || []).find((c) => c.key === editKey) : null),
    [isEdit, custom, type, editKey]
  );

  const [name, setName] = useState(existing ? existing.name : '');
  const [icon, setIcon] = useState(existing ? existing.icon : ICON_SELECTOR_OPTIONS[0]);
  const [enabled, setEnabled] = useState(existing ? existing.enabled !== false : true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inUse, setInUse] = useState(false);

  // Built-in categories must never enter the form — bounce back immediately.
  useEffect(() => {
    if (editKey && (CATEGORY_BUILTINS[type] || []).some((c) => c.key === editKey)) {
      router.back();
    }
  }, [editKey, type, router]);

  // Edit target vanished (deleted elsewhere) — leave.
  useEffect(() => {
    if (isEdit && !existing) router.back();
  }, [isEdit, existing, router]);

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > NAME_MAX) {
      showToast(t('settings.categoryNameHint'));
      return null;
    }
    const lower = trimmed.toLowerCase();
    const dupCustom = (custom[type] || []).some(
      (c) => c.key !== editKey && c.name.trim().toLowerCase() === lower
    );
    const dupBuiltin = (CATEGORY_BUILTINS[type] || []).some(
      (c) => t(`${BUILTIN_NS[type]}.${c.key}`).toLowerCase() === lower
    );
    if (dupCustom || dupBuiltin) {
      showToast(t('settings.categoryNameDuplicate'));
      return null;
    }
    return trimmed;
  };

  const handleSave = async () => {
    const trimmed = validate();
    if (!trimmed) return;
    try {
      if (isEdit) {
        await updateCustom(type, editKey, { name: trimmed, icon, enabled });
      } else {
        await addCustom(type, trimmed, icon);
      }
      router.back();
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  const handleDeleteTap = async () => {
    const rows = await getAllRows(TYPE_TABLE[type]);
    setInUse(rows.some((r) => r.category === editKey));
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (inUse) await reassignCategory(TYPE_TABLE[type], editKey);
      await deleteCustom(type, editKey);
      setDeleteOpen(false);
      router.back();
    } catch {
      showToast(t('common.saveFailed'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.bg }]} edges={['top', 'bottom']}>
      <FormHeader title={isEdit ? t('common.edit') : t('common.add')} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FormInput
          label={t('settings.categoryNamePlaceholder')}
          value={name}
          onChangeText={setName}
        />

        {/* Icon grid */}
        <View style={styles.field}>
          <Text style={[styles.gridLabel, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
            {t('settings.selectIcon')}
          </Text>
          <View style={[styles.iconGrid, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm }]}>
            {ICON_SELECTOR_OPTIONS.map((opt) => {
              const active = icon === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.iconChip,
                    active
                      ? { backgroundColor: Colors.purple }
                      : { backgroundColor: Colors.bg, borderColor: Colors.grayDot, borderWidth: 1 },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setIcon(opt)}
                >
                  <Ionicons name={opt} size={20} color={active ? Colors.white : Colors.textPrimary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Enable switch — edit mode only */}
        {isEdit && (
          <View style={[styles.enableRow, { backgroundColor: Colors.card, borderColor: Colors.grayDot, borderRadius: Radius.sm }]}>
            <Text style={[styles.enableLabel, { color: Colors.textDark, fontFamily: Fonts.semiBold }]}>
              {t('common.enable')}
            </Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: Colors.grayDot, true: Colors.purple }}
              thumbColor={Colors.white}
              style={styles.switch}
            />
          </View>
        )}
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        {isEdit && (
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: Colors.rose }]}
            activeOpacity={0.8}
            onPress={handleDeleteTap}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.rose} />
            <Text style={[styles.deleteText, { color: Colors.rose, fontFamily: Fonts.bold }]}>
              {t('common.delete')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: Colors.inkDeep, borderRadius: Radius.xl }]}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={[styles.saveText, { color: Colors.white, fontFamily: Fonts.bold }]}>
            {t('common.confirm')}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmModal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={t('settings.deleteCategoryTitle')}
        description={inUse ? t('settings.deleteCategoryInUse') : t('settings.deleteCategoryConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
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
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  field: {
    gap: 8,
  },
  gridLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    borderWidth: 1,
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  enableLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  switch: {
    transform: [{ scale: 0.85 }],
    marginVertical: -6,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  deleteBtn: {
    height: 56,
    borderRadius: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
  },
  saveBtn: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 1,
  },
});
