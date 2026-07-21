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
import { useTheme } from '../../utils/theme';
import { useSettingsStore } from '../../store/settings';
import { getAllRows, insertRow, clearAllData, upsertCheckIn } from '../../store/db';
import { useMoodStore } from '../../store/mood';
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

const genId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

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
  if (!canShare) throw new Error('Sharing is not available on this device');
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

function ModuleChips({ selected, onSelect }) {
  const { Colors, Radius, Fonts } = useTheme();

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
              {m.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SheetShell({ visible, title, onClose, children }) {
  const { Colors, Fonts } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={[styles.overlay, { backgroundColor: Colors.overlay }]} onPress={onClose} />
        <View style={[styles.panel, { backgroundColor: Colors.card }]}>
          <View style={[styles.panelHeader, { borderBottomColor: Colors.cardBorder }]}>
            <Pressable onPress={onClose}>
              <Text style={[styles.headerBtnCancel, { color: Colors.textTertiary, fontFamily: Fonts.regular }]}>
                Cancel
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
        alert('No Data', `There are no ${mod.label.toLowerCase()} records to export${range === 'year' ? ` in ${year}` : ''}.`);
        return;
      }
      const fileName = `timemory_${mod.label.replace(/\s+/g, '_')}_${range === 'year' ? year : 'all'}.xlsx`;
      await deliverWorkbook(buildWorkbook(mod, rows), fileName);
      showToast(`Exported ${rows.length} ${mod.label.toLowerCase()} rows`);
      onClose();
    } catch (e) {
      alert('Export Failed', e?.message || 'Something went wrong while exporting.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell visible={visible} title="Export Data" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          MODULE
        </Text>
        <ModuleChips selected={moduleId} onSelect={setModuleId} />

        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          RANGE
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
                  {r === 'all' ? 'All' : 'By Year'}
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
        <PrimaryButton label="Export" onPress={handleExport} busy={busy} />
      </View>
    </SheetShell>
  );
}

// ── Import modal ──────────────────────────────────

function ImportModal({ visible, onClose }) {
  const { Colors, Radius, Fonts } = useTheme();
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
      await deliverWorkbook(buildTemplateWorkbook(mod), `timemory_template_${mod.label.replace(/\s+/g, '_')}.xlsx`);
      showToast('Template ready');
    } catch (e) {
      alert('Template Failed', e?.message || 'Could not generate the template.');
    }
  };

  const handlePick = async () => {
    try {
      const picked = Platform.OS === 'web' ? await pickXlsxFileWeb() : await pickXlsxFileNative();
      if (picked) setFile(picked);
    } catch (e) {
      alert('Pick Failed', e?.message || 'Could not read the selected file.');
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
        alert('Empty File', 'The selected file has no data rows.');
        return;
      }
      const headers = headerRow.map((h) => String(h ?? '').trim());

      let ok = 0;
      const errors = [];
      for (let i = 0; i < dataRows.length; i += 1) {
        const row = dataRows[i];
        if (!row || row.every((c) => c === '' || c === null || c === undefined)) continue;
        const result = mod.fromRow(makeGetter(headers, row));
        if (result.error) {
          errors.push(`Row ${i + 2}: ${result.error}`);
          continue;
        }
        try {
          if (mod.id === 'mood') {
            await upsertCheckIn(result.data.check_date, result.data.mood);
          } else {
            await insertRow(mod.table, { id: genId(), ...result.data });
          }
          ok += 1;
        } catch (e) {
          errors.push(`Row ${i + 2}: ${e?.message || 'insert failed'}`);
        }
      }

      if (mod.id === 'mood') {
        await useMoodStore.getState().loadMoods();
      }

      if (ok > 0) showToast(`Imported ${ok} ${mod.label.toLowerCase()} rows`);
      if (errors.length > 0) {
        const shown = errors.slice(0, 5).join('\n');
        const more = errors.length > 5 ? `\n…and ${errors.length - 5} more` : '';
        alert('Import Finished with Errors', `${ok} rows imported, ${errors.length} skipped.\n\n${shown}${more}`);
      } else if (ok === 0) {
        alert('Nothing Imported', 'No valid rows were found in the file.');
      }
      onClose();
    } catch (e) {
      alert('Import Failed', e?.message || 'Could not parse the selected file.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell visible={visible} title="Import Data" onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { color: Colors.textTertiary, fontFamily: Fonts.semiBold }]}>
          MODULE
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
            Download Template
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
            {file ? file.name : 'Pick an .xlsx file'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Import" onPress={handleImport} busy={busy} disabled={!file} />
      </View>
    </SheetShell>
  );
}

// ── Section ───────────────────────────────────────

export default function DataManagement() {
  const { Colors, Fonts } = useTheme();
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const handleReset = async () => {
    await clearAllData();
    await useMoodStore.getState().loadMoods();
    showToast('All data cleared');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: Colors.textSecondary, fontFamily: Fonts.bold }]}>
        DATA MANAGEMENT
      </Text>

      <View style={styles.dataRow}>
        <DataButton icon="download-outline" label="Import" onPress={() => setImportOpen(true)} />
        <DataButton icon="cloud-upload-outline" label="Export" onPress={() => setExportOpen(true)} />
        <DataButton icon="trash-outline" label="Reset" danger onPress={() => setResetOpen(true)} />
      </View>

      <ExportModal visible={exportOpen} onClose={() => setExportOpen(false)} />
      <ImportModal visible={importOpen} onClose={() => setImportOpen(false)} />
      <ConfirmModal
        visible={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        icon="alert-circle-outline"
        title="Reset All Data"
        description="This permanently deletes all durables, assets, bills, schedules, diaries, important dates and mood records. Settings are kept."
        confirmText="Reset"
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
    paddingVertical: 16,
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
