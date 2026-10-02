import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  primary: "#2563EB",
  primaryTint: "#EAF2FF",
  primaryDark: "#0B2A5B",
  primaryLight: "#60A5FA",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  light: {
    text: '#0F1B33',
    background: '#FFFFFF',
    backgroundElement: '#EEF3FB',
    backgroundSelected: '#DCE6F7',
    tint: "#DCEBFF",
    paper: '#F4F8FF',
    inkSoft: "#8A97B0",
    line: "#E3EAF6",
    textSecondary: '#5B6B88',
    accentSurface: '#EAF2FF',
    accentText: '#1D4ED8',
    controlOff: '#D5DEEE',
    controlThumb: '#FFFFFF',
  },
  dark: {
    text: '#F2F6FF',
    background: '#0E1A30',
    backgroundElement: '#16253F',
    backgroundSelected: '#1F3155',
    tint: "#1E3A6E",
    paper: '#08111F',
    inkSoft: "#7D8CAB",
    line: "#1E2E4D",
    textSecondary: '#A6B4D0',
    accentSurface: '#152A4E',
    accentText: '#93C5FD',
    controlOff: '#33456A',
    controlThumb: '#FFFFFF',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;

// Softer, rounder shape language than the original
export const Radius = { sm: 14, md: 20, lg: 28, pill: 999 } as const;

export const Shadow = {
  shadowColor: '#1E40AF',
  shadowOpacity: 0.08,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
