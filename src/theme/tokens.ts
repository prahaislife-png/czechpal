import { Easing } from 'react-native-reanimated';

/**
 * CzechPal design tokens.
 *
 * Rules (see design-system/MASTER.md):
 * - One accent (Czech cobalt). Spent only on the primary action, active state and progress.
 * - One cool grey family.
 * - Radius scale: icon wells 10 · inputs & inner tiles 14 · cards 20 · actions & chips are pills.
 * - Spacing base unit 4.
 */

const light = {
  background: '#F2F4F7',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F7F9',
  fill: 'rgba(118, 128, 150, 0.12)',
  fillPressed: 'rgba(118, 128, 150, 0.2)',
  label: '#0B1220',
  label2: '#4B5567',
  label3: '#646D7E', // 4.7:1 on background, 5.2:1 on surface (HIG: 4.5:1 up to 17 pt)
  separator: '#E3E7ED',
  accent: '#2251D1',
  accentFill: '#2251D1',
  accentSoft: '#E8EEFD',
  onAccent: '#FFFFFF',
  success: '#14804A',
  successSoft: '#E4F4EB',
  warning: '#A65800',
  warningSoft: '#FDF0DF',
  danger: '#C42B1C',
  dangerSoft: '#FCE8E6',
  paper: '#FFFEFB',
  paperInk: '#1E2430',
  /** The viewfinder: the one dark surface in light mode, standing in for the camera. */
  ink: '#0E1420',
  onInk: '#F4F6FA',
  onInk2: 'rgba(244, 246, 250, 0.62)',
  scrim: 'rgba(0, 0, 0, 0.4)',
  shadow: '0px 1px 2px rgba(16, 24, 40, 0.04), 0px 6px 20px rgba(16, 24, 40, 0.06)',
  shadowRaised: '0px 2px 6px rgba(16, 24, 40, 0.06), 0px 16px 40px rgba(16, 24, 40, 0.10)',
};

const dark: typeof light = {
  background: '#0A0C10',
  surface: '#15181E',
  surfaceMuted: '#1B1F26',
  fill: 'rgba(130, 140, 160, 0.16)',
  fillPressed: 'rgba(130, 140, 160, 0.26)',
  label: '#F1F3F7',
  label2: '#A4ADBC',
  label3: '#858E9C', // 5.9:1 on background, 5.0:1 on muted surface
  separator: '#262B33',
  accent: '#86A2FF',
  accentFill: '#3A64EA',
  accentSoft: '#18213A',
  onAccent: '#FFFFFF',
  success: '#3FCF8E',
  successSoft: '#0F2619',
  warning: '#F2B14C',
  warningSoft: '#2A1F0E',
  danger: '#FF7A6E',
  dangerSoft: '#2C1513',
  paper: '#1E222A',
  paperInk: '#E3E7EE',
  ink: '#1A1F28',
  onInk: '#F4F6FA',
  onInk2: 'rgba(244, 246, 250, 0.62)',
  scrim: 'rgba(0, 0, 0, 0.55)',
  shadow: '0px 0px 0px rgba(0, 0, 0, 0)',
  shadowRaised: '0px 12px 32px rgba(0, 0, 0, 0.45)',
};

export const palettes = { light, dark };
export type Palette = typeof light;

/**
 * Increase Contrast (iOS Settings > Accessibility): text and separators pull further from the
 * background, as Apple's own adaptive colours do. Everything else stays the same.
 */
export const highContrastPalettes: Record<'light' | 'dark', Palette> = {
  light: { ...light, label2: '#2E3646', label3: '#454E5F', separator: '#B9C0CB', accent: '#1A3FAA' },
  dark: { ...dark, label2: '#CBD2DD', label3: '#AAB2BF', separator: '#4A515D', accent: '#A9BEFF' },
};

/** Camera chrome: always light-on-black whatever the theme, because it sits on the live lens image. */
export const camera = {
  background: '#000000',
  foreground: '#FFFFFF',
  corner: 'rgba(255, 255, 255, 0.92)',
  glass: 'rgba(12, 14, 18, 0.48)',
} as const;

/** QR codes stay dark-on-white in every theme: banking apps scan that most reliably. */
export const qr = { dark: '#000000', light: '#FFFFFF' } as const;

/** Brand mark colours (the app icon): never UI state. */
export const brand = { inkTop: '#1B2333', inkBottom: '#0B1019', corners: '#7F9DFF', glyph: '#FFFFFF', hacek: '#E8333A' };

export const space = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const radius = {
  well: 10,
  tile: 14,
  card: 20,
  pill: 999,
} as const;

/** iOS type ramp. One display size per screen. */
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.6 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title3: { fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400', letterSpacing: -0.2 },
  callout: { fontSize: 16, lineHeight: 22, fontWeight: '400', letterSpacing: -0.15 },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.1 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500', letterSpacing: 0 },
} as const;

export type TypeVariant = keyof typeof type;

export const icon = { sm: 16, md: 20, lg: 24, xl: 28 } as const;

/** Motion vocabulary — one per app. */
export const motion = {
  easeOut: Easing.bezier(0.23, 1, 0.32, 1),
  press: 120,
  fast: 180,
  base: 240,
  slow: 300,
  snap: { duration: 400, dampingRatio: 1 },
} as const;

export const layout = {
  /** Readable max width for phone-sized columns on tablets / web. */
  maxWidth: 560,
  gutter: 20,
} as const;
