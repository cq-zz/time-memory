/**
 * i18n bootstrap — i18next + react-i18next, single `translation` namespace.
 * Locale files are plain JS objects copied from the legacy project.
 *
 * Language persistence lives in the settings store (key `language`);
 * this module only owns runtime switching (applyLanguage) and first-run
 * system detection (detectSystemLanguage).
 */
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en';
import zhCN from './locales/zh-CN';

export const DEFAULT_LANGUAGE = 'en';

const resources = {
  en: { translation: en },
  'zh-CN': { translation: zhCN },
};

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
});

/**
 * Detect the device language on first run.
 * Any zh-* variant maps to zh-CN; other languages fall back to English
 * unless a matching resource exists.
 */
export function detectSystemLanguage() {
  try {
    const locales = Localization.getLocales();
    for (const locale of locales) {
      const tag = locale.languageTag || '';
      const code = locale.languageCode || '';
      if (code === 'zh' || tag.toLowerCase().startsWith('zh')) return 'zh-CN';
      if (resources[code]) return code;
    }
  } catch (e) {
    console.warn('[i18n] locale detection failed:', e);
  }
  return DEFAULT_LANGUAGE;
}

/** Switch the active language; unknown codes fall back to the default. */
export function applyLanguage(code) {
  const target = resources[code] ? code : DEFAULT_LANGUAGE;
  if (i18n.language !== target) i18n.changeLanguage(target);
  return target;
}

export default i18n;
