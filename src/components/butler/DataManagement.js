import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import { getAllRows, insertRow, clearAllData } from '../../store/db';
import { useMoodStore } from '../../store/mood';
import { useCategoryStore, getMergedCategories, BUILTIN_NS } from '../../store/categories';
import zhCN from '../../i18n/locales/zh-CN';
import en from '../../i18n/locales/en';
import {
  EXPORT_MODULES,
  moduleById,
  buildWorkbook,
  buildTemplateWorkbook,
  workbookToArray,
  readSheetRows,
  makeGetter,
} from '../../utils/excel';
import { showToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';
import useAlert from '../../hooks/useAlert';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const RESET_PRESERVED_SETTING_KEYS = ['profile.avatar', 'profile.nickname', 'darkMode', 'language'];

const genId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const fileDate = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const CATEGORY_TYPES = { durable: 'item', asset: 'asset', bills: 'bill' };

function duplicateKey(moduleId, row) {
  const name = row.name ?? row.title ?? '';
  const dateField = {
    durable: 'purchase_date',
    asset: 'purchase_date',
    bills: 'consumption_date',
    schedule: 'start_date',
    diary: 'date',
    'important-date': 'date',
    mood: 'check_date',
    budget: 'year',
  }[moduleId];
  return `${String(name).trim().toLowerCase()}|${String(row[dateField] ?? '').trim()}`;
}

async function resolveImportedCategory(moduleId, rawCategory, t) {
  const type = CATEGORY_TYPES[moduleId];
  const raw = String(rawCategory ?? '').trim();
  if (!type || !raw) return raw;

  const store = useCategoryStore.getState();
  const categories = getMergedCategories(store, type);
  const normalized = raw.toLocaleLowerCase();
  const matched = categories.find((category) => {
    const builtinLabel = category.isBuiltin ? t(`${BUILTIN_NS[type]}.${category.key}`) : '';
    const zhLabel = category.isBuiltin ? zhCN[BUILTIN_NS[type]]?.[category.key] : '';
    const enLabel = category.isBuiltin ? en[BUILTIN_NS[type]]?.[category.key] : '';
    return [category.key, category.name, builtinLabel, zhLabel, enLabel]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase() === normalized);
  });
  if (matched) return matched.key;
  return store.addCustom(type, raw, 'pricetag-outline');
}

function confirmDiscardMissingRelation(alert, t, name) {
  return new Promise((resolve) => {
    alert({
      title: t('butler.missingRelationTitle'),
      message: t('butler.missingRelationDesc', { name }),
      type: 'confirm',
      buttons: [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('butler.importWithoutRelation'), onPress: () => resolve(true) },
      ],
    });
  });
}

async function resolveImportedRelation(moduleId, data, alert, t) {
  const linkedName = data._linked_asset_name;
  const sourceName = data._source_name;
  const sourceType = String(data._source_type || '').toLowerCase();
  delete data._linked_asset_name;
  delete data._source_name;
  delete data._source_type;

  if (moduleId === 'durable' && linkedName) {
    const assets = await getAllRows('assets');
    const asset = assets.find((row) => String(row.name).trim().toLowerCase() === linkedName.toLowerCase());
    if (asset) data.linked_asset_id = asset.id;
    else if (!(await confirmDiscardMissingRelation(alert, t, linkedName))) return false;
  }
  if (moduleId === 'bills' && sourceName) {
    const table = ['item', 'durable'].includes(sourceType) ? 'durables' : 'assets';
    const rows = await getAllRows(table);
    const source = rows.find((row) => String(row.name).trim().toLowerCase() === sourceName.toLowerCase());
    if (source) {
      data.source = table === 'durables' ? 'durable' : 'asset';
      data.source_id = source.id;
    } else if (!(await confirmDiscardMissingRelation(alert, t, sourceName))) {
      return false;
    }
  }
  return true;
}

// ── File delivery (platform split) ────────────────
// Native: write xlsx bytes into the cache dir and hand the URI to the
// system share sheet. Web: plain Blob download. expo-file-system /
// expo-sharing are imported dynamically so web never evaluates them.

async function shareWorkbookNative(arrayBuf, fileName) {
  const [fs, Sharing] = await Promise.all([import('expo-file-system'), import('expo-sharing')]);
  const file = new fs.File(fs.Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(new Uint8Array(arrayBuf));
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('butler.sharingUnavailable');
  await Sharing.shareAsync(file.uri, { mimeType: XLSX_MIME, dialogTitle: 'Timemory Export' });
}

function downloadWorkbookWeb(arrayBuf, fileName) {
  const blob = new Blob([arrayBuf], { type: XLSX_MIME });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function deliverWorkbook(wb, fileName) {
  const buf = workbookToArray(wb);
  if (Platform.OS === 'web') {
    downloadWorkbookWeb(buf, fileName);
  } else {
    await shareWorkbookNative(buf, fileName);
  }
}

async function pickXlsxFileNative() {
  const fs = await import('expo-file-system');
  const result = await fs.File.pickFileAsync({ mimeTypes: XLSX_MIME });
  if (!result || result.canceled || !result.result) return null;
  const picked = result.result;
  // Read bytes immediately — picked URIs can expire before the user confirms.
  const bytes = await picked.bytes();
  return { name: picked.name, bytes };
}

function pickXlsxFileWeb() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return resolve(null);
      const buf = await f.arrayBuffer();
      resolve({ name: f.name, bytes: new Uint8Array(buf) });
    };
    input.click();
  });
}

// ── Shared bits ───────────────────────────────────

function DataButton({ icon, label, danger, onPress }) {
  const { Colors, Fonts } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.dataBtn,
        danger
          ? { backgroundColor: 'rgba(232, 107, 107, 0.1)', borderColor: 'rgba(232, 107, 107, 0.2)' }
          : { backgroundColor: Colors.card, borderColor: Colors.grayDot },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Ionicons name={icon} size={16} color={danger ? Colors.rose : Colors.textDark} />
      <Text
        style={[
          styles.dataBtnText,
          { color: danger ? Colors.rose : Colors.textDark, fontFamily: Fonts.semiBold },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const MODULE_LABEL_KEYS = {
  durable: 'butler.moduleDurable',
  asset: 'butler.moduleAsset',
  bills: 'butler.moduleBills',
  schedule: 'butler.moduleSchedule',
  diary: 'butler.moduleDiary',
  'important-date': 'butler.moduleImportantDate',
  budget: 'butler.moduleBudget',
  mood: 'butler.moduleMood',
};

function ModuleChips({ selected, onSelect }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.chipGrid}>
      {EXPORT_MODULES.map((m) => {
        const isActive = selected === m.id;
        return (
          <Pressable
            key={m.id}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? Colors.purple : Colors.iconBg,
                borderColor: isActive ? Colors.purple : Colors.cardBorder,
                borderRadius: Radius.pill,
              },
            ]}
            onPress={() => onSelect(m.id)}
          >
            <Text
              style={[
                styles.chipText,
                { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
              ]}
              numberOfLines={1}
            >
              {t(MODULE_LABEL_KEYS[m.id], { defaultValue: m.label })}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SheetShell({ visible, title, onClose, children }) {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: Colors.card }]}>
          <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Pressable onPress={onClose}>
              <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
            <Text style={[styles.panelTitle, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {title}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function PrimaryButton({ label, onPress, busy, disabled }) {
  const { Colors, Fonts } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: Colors.purple },
        pressed && { opacity: 0.85 },
        (busy || disabled) && { opacity: 0.55 },
      ]}
      onPress={onPress}
      disabled={busy || disabled}
    >
      {busy ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={[styles.primaryBtnText, { color: Colors.white, fontFamily: Fonts.bold }]}>{label}</Text>
      )}
    </Pressable>
  );
}

// ── Export modal ──────────────────────────────────

function ExportModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();
  const yearStart = useSettingsStore((s) => s.settings.yearStart);
  const yearEnd = useSettingsStore((s) => s.settings.yearEnd);

  const [moduleId, setModuleId] = useState('durable');
  const [range, setRange] = useState('all');
  const [year, setYear] = useState(new Date().getFullYear());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setModuleId('durable');
      setRange('all');
      setYear(new Date().getFullYear());
    }
  }, [visible]);

  const handleExport = async () => {
    const mod = moduleById(moduleId);
    if (!mod || busy) return;
    setBusy(true);
    try {
      let rows = await getAllRows(mod.table);
      if (range === 'year') {
        rows = rows.filter((r) => String(r[mod.dateField] || '').startsWith(String(year)));
      }
      if (rows.length === 0) {
        const moduleName = t(MODULE_LABEL_KEYS[mod.id], { defaultValue: mod.label }).toLowerCase();
        const period = range === 'year' ? t('butler.inYear', { year }) : '';
        alert(t('settings.noDataTitle'), t('butler.noDataDesc', { module: moduleName, period }));
        return;
      }
      if (mod.id === 'durable' || mod.id === 'bills') {
        const [durables, assets] = await Promise.all([getAllRows('durables'), getAllRows('assets')]);
        const sourceMap = new Map([
          ...durables.map((row) => [`durable:${row.id}`, row.name]),
          ...assets.map((row) => [`asset:${row.id}`, row.name]),
        ]);
        rows = rows.map((row) => ({
          ...row,
          linked_asset_name: mod.id === 'durable' ? sourceMap.get(`asset:${row.linked_asset_id}`) || '' : undefined,
          source_name: mod.id === 'bills' ? sourceMap.get(`${row.source}:${row.source_id}`) || '' : undefined,
        }));
      }
      const moduleName = t(MODULE_LABEL_KEYS[mod.id], { defaultValue: mod.label });
      const fileName = `${t('home.brand')}-${moduleName}-${fileDate()}.xlsx`;
      await deliverWorkbook(buildWorkbook(mod, rows), fileName);
      showToast(t('butler.exportedRows', { count: rows.length, module: moduleName.toLowerCase() }));
      onClose();
    } catch (e) {
      alert(
        t('butler.exportFailedTitle'),
        e?.message ? t(e.message, { defaultValue: e.message }) : t('butler.exportFailedDesc')
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell visible={visible} title={t('butler.exportDataTitle')} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          {t('butler.moduleSection')}
        </Text>
        <ModuleChips selected={moduleId} onSelect={setModuleId} />

        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          {t('butler.rangeSection')}
        </Text>
        <View style={styles.rangeRow}>
          {['all', 'year'].map((r) => {
            const isActive = range === r;
            return (
              <Pressable
                key={r}
                style={[
                  styles.rangeChip,
                  {
                    backgroundColor: isActive ? Colors.purple : Colors.iconBg,
                    borderColor: isActive ? Colors.purple : Colors.cardBorder,
                    borderRadius: Radius.pill,
                  },
                ]}
                onPress={() => setRange(r)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? Colors.white : Colors.textSecondary, fontFamily: Fonts.semiBold },
                  ]}
                >
                  {r === 'all' ? t('common.all') : t('butler.rangeByYear')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {range === 'year' && (
          <View style={styles.yearStepper}>
            <Pressable
              style={[styles.stepperBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
              onPress={() => setYear(Math.max(year - 1, yearStart))}
            >
              <Ionicons name="chevron-back" size={16} color={Colors.textSecondary} />
            </Pressable>
            <Text style={[styles.stepperValue, { color: Colors.textPrimary, fontFamily: Fonts.bold }]}>
              {year}
            </Text>
            <Pressable
              style={[styles.stepperBtn, { backgroundColor: Colors.iconBg, borderColor: Colors.cardBorder }]}
              onPress={() => setYear(Math.min(year + 1, yearEnd))}
            >
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t('butler.exportBtn')} onPress={handleExport} busy={busy} />
      </View>
    </SheetShell>
  );
}

// ── Import modal ──────────────────────────────────

function ImportModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
  const { t } = useTranslation();
  const { alert } = useAlert();

  const [moduleId, setModuleId] = useState('durable');
  const [file, setFile] = useState(null); // { name, bytes }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) {
      setModuleId('durable');
      setFile(null);
    }
  }, [visible]);

  const handleTemplate = async () => {
    const mod = moduleById(moduleId);
    if (!mod) return;
    try {
      const moduleName = t(MODULE_LABEL_KEYS[mod.id], { defaultValue: mod.label });
      await deliverWorkbook(
        buildTemplateWorkbook(mod),
        `${t('home.brand')}-${moduleName}-${t('butler.templateFileSuffix')}-${fileDate()}.xlsx`,
      );
      showToast(t('butler.templateReady'));
    } catch (e) {
      alert(t('butler.templateFailedTitle'), e?.message || t('butler.templateFailedDesc'));
    }
  };

  const handlePick = async () => {
    try {
      const picked = Platform.OS === 'web' ? await pickXlsxFileWeb() : await pickXlsxFileNative();
      if (picked) setFile(picked);
    } catch (e) {
      alert(t('butler.pickFailedTitle'), e?.message || t('butler.pickFailedDesc'));
    }
  };

  const handleImport = async () => {
    const mod = moduleById(moduleId);
    if (!mod || !file || busy) return;
    setBusy(true);
    try {
      const sheetRows = readSheetRows(file.bytes);
      const [headerRow, ...dataRows] = sheetRows;
      if (!headerRow || dataRows.length === 0) {
        alert(t('butler.emptyFileTitle'), t('butler.emptyFileDesc'));
        return;
      }
      const headers = headerRow.map((h) => String(h ?? '').trim());

      await useCategoryStore.getState().loadCategories();
      const existingRows = await getAllRows(mod.table);
      const seen = new Set(existingRows.map((row) => duplicateKey(mod.id, row)));
      let ok = 0;
      let skipped = 0;
      const errors = [];
      for (let i = 0; i < dataRows.length; i += 1) {
        const row = dataRows[i];
        if (!row || row.every((c) => c === '' || c === null || c === undefined)) continue;
        const result = mod.fromRow(makeGetter(headers, row));
        if (result.error) {
          errors.push(t('butler.rowError', { row: i + 2, error: result.error }));
          continue;
        }
        try {
          const key = duplicateKey(mod.id, result.data);
          if (seen.has(key)) {
            skipped += 1;
            continue;
          }
          result.data.category = await resolveImportedCategory(mod.id, result.data.category, t);
          if (!(await resolveImportedRelation(mod.id, result.data, alert, t))) {
            return;
          }
          await insertRow(mod.table, { id: genId(), ...result.data });
          seen.add(key);
          ok += 1;
        } catch (e) {
          errors.push(t('butler.rowError', { row: i + 2, error: e?.message || 'insert failed' }));
        }
      }

      if (mod.id === 'mood') {
        await useMoodStore.getState().loadMoods();
      }

      const moduleName = t(MODULE_LABEL_KEYS[mod.id], { defaultValue: mod.label }).toLowerCase();
      if (errors.length > 0) {
        if (ok > 0) {
          showToast(t('butler.importedRows', { count: ok, module: moduleName }) +
            (skipped ? `，${t('butler.importSkippedDuplicates', { count: skipped })}` : ''));
        }
        const shown = errors.slice(0, 5).join('\n');
        const more = errors.length > 5 ? `\n${t('butler.moreErrors', { count: errors.length - 5 })}` : '';
        alert(
          t('butler.importErrorsTitle'),
          t('butler.importErrorsDesc', { ok, failed: errors.length, details: `${shown}${more}` })
        );
      } else if (ok === 0) {
        alert(t('butler.nothingImportedTitle'), t('butler.nothingImportedDesc'));
      } else {
        showToast(t('butler.importedRows', { count: ok, module: moduleName }) +
          (skipped ? `，${t('butler.importSkippedDuplicates', { count: skipped })}` : ''));
        onClose();
      }
    } catch (e) {
      alert(t('butler.importFailedTitle'), e?.message || t('butler.importFailedDesc'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell visible={visible} title={t('butler.importDataTitle')} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          {t('butler.moduleSection')}
        </Text>
        <ModuleChips selected={moduleId} onSelect={setModuleId} />

        <Pressable
          style={({ pressed }) => [
            styles.outlineBtn,
            { borderColor: Colors.grayDot, backgroundColor: Colors.card, borderRadius: Radius.sm },
            pressed && { opacity: 0.75 },
          ]}
          onPress={handleTemplate}
        >
          <Ionicons name="document-text-outline" size={16} color={Colors.purple} />
          <Text style={[styles.outlineBtnText, { color: Colors.purple, fontFamily: Fonts.semiBold }]}>
            {t('butler.downloadTemplate')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.outlineBtn,
            { borderColor: Colors.grayDot, backgroundColor: Colors.bg, borderRadius: Radius.sm },
            pressed && { opacity: 0.75 },
          ]}
          onPress={handlePick}
        >
          <Ionicons name="folder-open-outline" size={16} color={Colors.textSecondary} />
          <Text
            style={[styles.outlineBtnText, { color: Colors.textSecondary, fontFamily: Fonts.semiBold }]}
            numberOfLines={1}
          >
            {file ? file.name : t('butler.pickXlsx')}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t('butler.importBtn')} onPress={handleImport} busy={busy} disabled={!file} />
      </View>
    </SheetShell>
  );
}

// ── Section ───────────────────────────────────────

export default function DataManagement() {
  const { Colors, Fonts } = useTheme();
  const { t } = useTranslation();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleReset = async () => {
    setResetOpen(false);
    try {
      await clearAllData(RESET_PRESERVED_SETTING_KEYS);
      await Promise.all([
        useMoodStore.getState().loadMoods(),
        useSettingsStore.getState().loadSettings(),
        useCategoryStore.getState().loadCategories(),
      ]);
      showToast(t('butler.allDataCleared'));
    } catch (e) {
      showToast(t('butler.resetFailedDesc'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        {t('butler.dataManagementHeading')}
      </Text>

      <View style={styles.dataRow}>
        <DataButton icon="download-outline" label={t('butler.importBtn')} onPress={() => setImportOpen(true)} />
        <DataButton icon="cloud-upload-outline" label={t('butler.exportBtn')} onPress={() => setExportOpen(true)} />
        <DataButton icon="trash-outline" label={t('butler.resetBtn')} danger onPress={() => setResetOpen(true)} />
      </View>

      <ExportModal visible={exportOpen} onClose={() => setExportOpen(false)} />
      <ImportModal visible={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmModal
        visible={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        icon="alert-circle-outline"
        title={t('butler.resetAllTitle')}
        description={t('butler.resetAllDesc')}
        confirmText={t('butler.resetBtn')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    paddingHorizontal: 4,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dataBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 32,
  },
  dataBtnText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    maxHeight: '80%',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  headerBtnCancel: {
    fontSize: 15,
    lineHeight: 22,
  },
  headerSpacer: {
    width: 52,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    lineHeight: 18,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
  },
  yearStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 6,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stepperValue: {
    fontSize: 17,
    lineHeight: 24,
    minWidth: 56,
    textAlign: 'center',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  outlineBtnText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
