import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import type { Severity } from '../phq9';

// Design tokens. Every text/background pair below is >= 4.5:1 (checked with WCAG relative luminance).
export const colors = {
  canvas: '#F3F6F5', // page background: cool mist, not cream
  surface: '#FFFFFF',
  surfaceAlt: '#E8EFEE',
  line: '#D5DEDC',
  ink: '#1E2B2F', // 13.4:1 on canvas
  inkSoft: '#4B5B60', // 6.5:1
  inkFaint: '#5E6C72', // 5.0:1 on canvas, 5.4:1 on white
  primary: '#2A6F6B', // lagoon teal; white on it 5.9:1
  primaryPressed: '#225A57',
  primaryTint: '#DCEDEA',
  onPrimary: '#FFFFFF',
  info: '#5A4AA3', // lavender-indigo for "supportive info"
  infoTint: '#ECE8F8',
  careInk: '#4A1F36', // suicide-ideation card: warm plum, never red
  careTint: '#F4E6EE',
  careLine: '#C98BA8',
  careSolid: '#8A3F66', // white on it 6.6:1
  errorInk: '#7A2E1D',
  errorTint: '#FBE9E2',
  focus: '#2A6F6B',
  sunTop: '#F8D9A8',
  sunBottom: '#F2A877',
  hill1: '#BFDCD4',
  hill2: '#8FC2B6',
};

// Gentle, non-red treatment of PHQ-9 severity levels.
export const severity: Record<Severity, { tint: string; ink: string; solid: string }> = {
  MINIMAL: { tint: '#DFF0E6', ink: '#1F5A3A', solid: '#4FA374' },
  MILD: { tint: '#DDEEF2', ink: '#1D5563', solid: '#4A9BB0' },
  MODERATE: { tint: '#FBEFD0', ink: '#6A4A00', solid: '#D9A53A' },
  MODERATELY_SEVERE: { tint: '#FADFCB', ink: '#7A3A10', solid: '#DB8A4F' },
  SEVERE: { tint: '#EBDCF0', ink: '#5B2A6B', solid: '#A25FB5' },
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 48 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

// Web falls back to the system stack if the Google font fails to load.
const stack = (name: string) => (Platform.OS === 'web' ? `${name}, system-ui, -apple-system, 'Segoe UI', sans-serif` : name);
export const fonts = {
  regular: stack('Nunito_400Regular'),
  medium: stack('Nunito_600SemiBold'),
  bold: stack('Nunito_700Bold'),
  heavy: stack('Nunito_800ExtraBold'),
};

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'label';
export const type: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.heavy, fontSize: 32, lineHeight: 38, letterSpacing: -0.3 },
  title: { fontFamily: fonts.heavy, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
};

// One soft, tinted shadow used sparingly (cards that need lift). Flat cards use a hairline instead.
export const shadow: ViewStyle = Platform.select<ViewStyle>({
  web: { boxShadow: '0 6px 20px rgba(30, 60, 58, 0.08)' } as ViewStyle,
  default: {
    shadowColor: '#1E3C3A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
})!;

export const MAX_WIDTH = 560;
