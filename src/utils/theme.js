/**
 * Timemory Design Tokens — MD3 "Soft Tech"
 * Extracted from Figma: Shpa1ZGC0Fl1urN2atnLlH
 */

export const Colors = {
  // Surfaces
  bg: '#F5F5F5',
  card: '#FFFFFF',
  inkDeep: '#1A1A1A', // dark cards only

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
  page: 24,
  section: 16,
};

export const Fonts = {
  regular: 'WorkSans_400Regular',
  semiBold: 'WorkSans_600SemiBold',
  bold: 'WorkSans_700Bold',
};

const theme = { Colors, Radius, Shadows, Spacing, Fonts };

export function useTheme() {
  return theme;
}

export default theme;
