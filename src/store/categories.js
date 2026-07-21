/**
 * Category store — built-in + custom categories for item / bill / asset.
 * Built-ins come from utils/constant.js; toggles & custom entries persist
 * through the settings key-value layer (SQLite native / AsyncStorage web).
 */
import { create } from 'zustand';
import { loadSettingsRows, saveSettingRow } from './db';
import { CATEGORY_BUILTINS } from '../utils/constant';

const CUSTOM_KEY = 'categories.custom';
const DISABLED_KEY = 'categories.disabled';

const EMPTY = { item: [], bill: [], asset: [] };

export const useCategoryStore = create((set, get) => ({
  loaded: false,
  custom: EMPTY, // { item: [{key,name,icon}], bill: [], asset: [] }
  disabled: EMPTY, // { item: [builtinKey, ...], bill: [], asset: [] }

  loadCategories: async () => {
    try {
      const rows = await loadSettingsRows();
      const map = {};
      rows.forEach((r) => {
        try {
          map[r.key] = JSON.parse(r.value);
        } catch {
          /* skip corrupted row */
        }
      });
      set({
        custom: { ...EMPTY, ...(map[CUSTOM_KEY] || {}) },
        disabled: { ...EMPTY, ...(map[DISABLED_KEY] || {}) },
        loaded: true,
      });
    } catch (e) {
      console.warn('[categories] load failed:', e);
      set({ loaded: true });
    }
  },

  /** Add a custom category; returns its generated key. */
  addCustom: async (type, name, icon) => {
    const key = `custom_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const custom = {
      ...get().custom,
      [type]: [...get().custom[type], { key, name, icon, enabled: true }],
    };
    set({ custom });
    await saveSettingRow(CUSTOM_KEY, JSON.stringify(custom));
    return key;
  },

  /** Patch a custom category (name / icon / enabled). */
  updateCustom: async (type, key, patch) => {
    const custom = {
      ...get().custom,
      [type]: get().custom[type].map((c) => (c.key === key ? { ...c, ...patch } : c)),
    };
    set({ custom });
    await saveSettingRow(CUSTOM_KEY, JSON.stringify(custom));
  },

  deleteCustom: async (type, key) => {
    const custom = { ...get().custom, [type]: get().custom[type].filter((c) => c.key !== key) };
    set({ custom });
    await saveSettingRow(CUSTOM_KEY, JSON.stringify(custom));
  },

  /** Toggle a built-in category on/off. */
  toggleBuiltin: async (type, key) => {
    const list = [...get().disabled[type]];
    const idx = list.indexOf(key);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(key);
    const disabled = { ...get().disabled, [type]: list };
    set({ disabled });
    await saveSettingRow(DISABLED_KEY, JSON.stringify(disabled));
  },
}));

/**
 * Merged view of a category type: enabled-flagged built-ins (with "other"
 * pinned last) followed by custom entries.
 */
export function getMergedCategories(state, type) {
  const builtins = CATEGORY_BUILTINS[type] || [];
  const disabledSet = new Set(state.disabled[type] || []);
  const withFlags = (list) =>
    list.map((c) => ({ ...c, isBuiltin: true, enabled: !disabledSet.has(c.key) }));
  const main = withFlags(builtins.filter((c) => c.key !== 'other'));
  const other = builtins.find((c) => c.key === 'other');
  const custom = (state.custom[type] || []).map((c) => ({
    ...c,
    isBuiltin: false,
    enabled: c.enabled !== false,
  }));
  return [...main, ...custom, ...(other ? withFlags([other]) : [])];
}

/** i18n namespace holding each type's built-in display names. */
export const BUILTIN_NS = { item: 'categories', bill: 'billCategories', asset: 'assetCategories' };

/**
 * Resolve a category key to { key, label, icon } for display.
 * Built-ins use t(`${ns}.${key}`) when a translator is passed (else the
 * constant's English label); customs use their stored name/icon.
 */
export function resolveCategoryMeta(state, type, key, t) {
  const builtin = (CATEGORY_BUILTINS[type] || []).find((c) => c.key === key);
  if (builtin) {
    return {
      key,
      label: t ? t(`${BUILTIN_NS[type]}.${key}`) : builtin.label,
      icon: builtin.icon,
    };
  }
  const custom = (state.custom[type] || []).find((c) => c.key === key);
  if (custom) return { key, label: custom.name, icon: custom.icon || 'pricetag-outline' };
  return { key, label: key || '--', icon: 'pricetag-outline' };
}
