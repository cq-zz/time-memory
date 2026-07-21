/**
 * Global settings store — Zustand + SQLite write-through persistence.
 * Single source of truth for app-wide config: dark mode, language,
 * currency, annual budget, year range. All modules read from here.
 */
import { create } from 'zustand';
import { loadSettingsRows, saveSettingRow } from './db';
import { applyLanguage, detectSystemLanguage } from '../i18n';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  MIN_YEAR_DEFAULT,
  MAX_YEAR_DEFAULT,
} from '../utils/constant';

// Enums live in utils/constant.js — re-exported so existing
// `import { CURRENCIES } from '../store/settings'` keeps working.
export { CURRENCIES };

export const DEFAULT_SETTINGS = {
  darkMode: false,
  language: 'en',
  currency: DEFAULT_CURRENCY,
  annualBudget: 0, // 0 = not set yet
  yearStart: MIN_YEAR_DEFAULT,
  yearEnd: MAX_YEAR_DEFAULT,
};

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
];

export const currencyMeta = (code) =>
  CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

export const languageMeta = (code) =>
  LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];

/** Format an amount with the given currency code, e.g. formatMoney(1299, 'USD') -> "$1,299" */
export function formatMoney(amount, currencyCode) {
  const meta = currencyMeta(currencyCode);
  return `${meta.symbol}${Number(amount || 0).toLocaleString('en-US')}`;
}

export const useSettingsStore = create((set) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  /** Load persisted settings (SQLite on native, AsyncStorage on web); falls back to defaults on any failure. */
  loadSettings: async () => {
    try {
      const rows = await loadSettingsRows();
      const stored = {};
      rows.forEach((row) => {
        try {
          stored[row.key] = JSON.parse(row.value);
        } catch {
          /* skip corrupted row */
        }
      });
      const settings = { ...DEFAULT_SETTINGS, ...stored };
      // First run: no language persisted yet — follow the device locale.
      const hasLanguageRow = rows.some((r) => r.key === 'language');
      if (!hasLanguageRow) {
        settings.language = detectSystemLanguage();
        await saveSettingRow('language', JSON.stringify(settings.language));
      }
      applyLanguage(settings.language);
      set({ settings, loaded: true });
    } catch (e) {
      console.warn('[settings] load failed, using defaults:', e);
      applyLanguage(DEFAULT_SETTINGS.language);
      set({ loaded: true });
    }
  },

  /** Update one setting: applies to memory immediately, then persists (SQLite on native, AsyncStorage on web). */
  updateSetting: async (key, value) => {
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
    if (key === 'language') applyLanguage(value);
    try {
      await saveSettingRow(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[settings] persist failed:', e);
    }
  },
}));
