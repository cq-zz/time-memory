/**
 * Timemory Design Tokens — MD3 "Soft Tech"
 * Extracted from Figma: Shpa1ZGC0Fl1urN2atnLlH
 *
 * useTheme() is reactive: it re-renders consumers when the global
 * darkMode setting changes (persisted via src/store/settings.js).
 */
import { useSettingsStore } from '../store/settings';

export const LightColors = {
  // Surfaces
  bg: '#F5F5F5',
  card: '#FFFFFF',
  inkDeep: '#1A1A1A', // feature cards & primary buttons

  // Brand
  purple: '#6B5CE7',
  orange: '#F28B50',
  green: '#4AA868',
  rose: '#E86B6B',
  peach: '#FFB690',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#747878',
  textTertiary: '#858383',
  textDark: '#1A1C1C',

  // Borders & overlays
  cardBorder: 'rgba(196, 199, 199, 0.3)',
  grayDot: '#C4C7C7',
  lightGray: '#DADADA',
  iconBg: '#F5F5F5',
  avatarBg: '#EEEEEE',

  // White overlays (for dark cards)
  white05: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white: '#FFFFFF',

  // Modal & tints
  overlay: 'rgba(26, 26, 26, 0.45)',
  purpleTint: 'rgba(107, 92, 231, 0.1)',
};

export const DarkColors = {
  // Surfaces — inkDeep stays dark (elevated) so white text/icons keep contrast
  bg: '#121316',
  card: '#1C1E22',
  inkDeep: '#26292F',

  // Brand — slightly lifted for dark backgrounds
  purple: '#7D70F0',
  orange: '#F59A66',
  green: '#5BBB78',
  rose: '#EE8080',
  peach: '#FFB690',

  // Text
  textPrimary: '#F0F1F2',
  textSecondary: '#9BA0A6',
  textTertiary: '#7E8288',
  textDark: '#F0F1F2',

  // Borders & overlays
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  grayDot: '#3A3D44',
  lightGray: '#2E3138',
  iconBg: '#23262B',
  avatarBg: '#2A2D33',

  // White overlays (unchanged — still sit on dark feature cards)
  white05: 'rgba(255, 255, 255, 0.05)',
  white10: 'rgba(255, 255, 255, 0.1)',
  white40: 'rgba(255, 255, 255, 0.4)',
  white60: 'rgba(255, 255, 255, 0.6)',
  white: '#FFFFFF',

  // Modal & tints
  overlay: 'rgba(0, 0, 0, 0.6)',
  purpleTint: 'rgba(125, 112, 240, 0.16)',
};

export const Radius = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  pill: 48,
  circle: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 12.5,
    elevation: 8,
  },
};

export const Spacing = {
  sm: 8,
  md: 12,
  lg: 16,
  page: 24,
  section: 16,
};

export const Fonts = {
  regular: 'WorkSans_400Regular',
  semiBold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
};

/** hexToRgba('#6B5CE7', 0.1) -> 'rgba(107, 92, 231, 0.1)' */
export function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Reactive theme hook. Re-renders the consumer only when darkMode flips.
 * All components must read tokens through this hook.
 */
export function useTheme() {
  const darkMode = useSettingsStore((s) => s.settings.darkMode);
  return {
    Colors: darkMode ? DarkColors : LightColors,
    Radius,
    Shadows,
    Spacing,
    Fonts,
  };
}
