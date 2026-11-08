import { Easing } from 'react-native-reanimated';

/**
 * CzechLocal design tokens (2.0: editorial, warm paper).
 *
 * Rules (see docs/czechlocal-design/02-design-system.md):
 * - Paper and charcoal carry the app. Primary actions are charcoal pills.
 * - Four soft pastels (sky, sage, coral, lavender) tint surfaces: categories, progress, highlights.
 *   They are never text colours: each has a deep "ink" partner that passes 4.5:1 on its tint.
 * - The interactive accent is Vltava teal, the deep partner of sky blue.
 * - Radius scale: icon wells 10 · inputs & inner tiles 14 · cards 22 · sheets 28 · actions & chips are pills.
 * - Spacing base unit 4.
 */

/** The brief's starting colours, kept as named swatches. */
export const swatch = {
  paper: '#F7F3EB',
  charcoal: '#252522',
  sky: '#BCE8F0',
  sage: '#B8D2BA',
  coral: '#FF986E',
  lavender: '#DCD4F5',
};

const light = {
  background: swatch.paper,
  surface: '#FFFDF8',
  surfaceMuted: '#EFE9DD',
  fill: 'rgba(37, 37, 34, 0.07)',
  fillPressed: 'rgba(37, 37, 34, 0.13)',
  label: swatch.charcoal,
  label2: '#57544C',
  label3: '#6B675D', // 5.0:1 on paper, 5.4:1 on surface
  separator: '#E3DCCD',
  accent: '#1F5C67', // Vltava teal: 6.9:1 on paper
  accentFill: swatch.charcoal,
  accentSoft: '#DDF1F4',
  onAccent: swatch.paper,
  success: '#2F6B3C',
  successSoft: '#E2EEE2',
  warning: '#9A4318',
  warningSoft: '#FFE6DA',
  danger: '#B3261E',
  dangerSoft: '#FBE5E1',
  paper: '#FFFEFB',
  paperInk: '#1E1E1B',
  /** The viewfinder: the one dark surface in light mode, standing in for the camera. */
  ink: '#22221F',
  onInk: '#F7F3EB',
  onInk2: 'rgba(247, 243, 235, 0.64)',
  scrim: 'rgba(20, 20, 18, 0.4)',
  shadow: '0px 1px 2px rgba(60, 50, 30, 0.05), 0px 8px 24px rgba(60, 50, 30, 0.07)',
  shadowRaised: '0px 2px 6px rgba(60, 50, 30, 0.07), 0px 18px 44px rgba(60, 50, 30, 0.12)',
  /** Pastel tints for surfaces (chips, cards, progress) and their readable inks. */
  sky: swatch.sky,
  skyInk: '#1A4D57',
  sage: swatch.sage,
  sageInk: '#24482A',
  coral: swatch.coral,
  coralSoft: '#FFE1D3',
  coralInk: '#7A320F',
  lavender: swatch.lavender,
  lavenderInk: '#3F3577',
};

const dark: typeof light = {
  background: '#161614',
  surface: '#20201D',
  surfaceMuted: '#292926',
  fill: 'rgba(247, 243, 235, 0.08)',
  fillPressed: 'rgba(247, 243, 235, 0.15)',
  label: '#F3EFE6',
  label2: '#BCB6A9',
  label3: '#999387', // 5.9:1 on background
  separator: '#33322D',
  accent: '#9ED8E2',
  accentFill: '#F3EFE6',
  accentSoft: '#1D3A3F',
  onAccent: '#1B1B19',
  success: '#8FCB98',
  successSoft: '#1C2E1F',
  warning: '#FFB08C',
  warningSoft: '#3A2418',
  danger: '#FF8A7E',
  dangerSoft: '#3A1916',
  paper: '#24241F',
  paperInk: '#ECE7DD',
  ink: '#1C1C1A',
  onInk: '#F7F3EB',
  onInk2: 'rgba(247, 243, 235, 0.62)',
  scrim: 'rgba(0, 0, 0, 0.55)',
  shadow: '0px 0px 0px rgba(0, 0, 0, 0)',
  shadowRaised: '0px 12px 32px rgba(0, 0, 0, 0.5)',
  sky: '#2B4D53',
  skyInk: '#BDEBF2',
  sage: '#2E4532',
  sageInk: '#C6E0C8',
  coral: '#6A3B27',
  coralSoft: '#3A2418',
  coralInk: '#FFC2A6',
  lavender: '#3A3555',
  lavenderInk: '#DDD5FA',
};

export const palettes = { light, dark };

/**
 * Explore: the same paper over the map, with sky chips for what is selected.
 * Same keys as before so the map screens keep working.
 */
const exploreLight = {
  sheet: swatch.paper,
  sheetMuted: '#EFE9DD',
  card: '#FFFDF8',
  line: '#E3DCCD',
  ink: swatch.charcoal,
  ink2: '#57544C',
  ink3: '#6B675D',
  chip: swatch.sky,
  chipInk: '#1A4D57',
  chipLine: '#A6D9E2',
  float: 'rgba(247, 243, 235, 0.94)',
  shadow: '0px 1px 2px rgba(60, 50, 30, 0.06), 0px 8px 24px rgba(60, 50, 30, 0.10)',
  sheetShadow: '0px -2px 6px rgba(60, 50, 30, 0.05), 0px -12px 32px rgba(60, 50, 30, 0.10)',
};

const exploreDark: typeof exploreLight = {
  sheet: '#191917',
  sheetMuted: '#24241F',
  card: '#20201D',
  line: '#34332E',
  ink: '#F3EFE6',
  ink2: '#BCB6A9',
  ink3: '#999387',
  chip: '#2B4D53',
  chipInk: '#BDEBF2',
  chipLine: '#3A6268',
  float: 'rgba(25, 25, 23, 0.94)',
  shadow: '0px 8px 24px rgba(0, 0, 0, 0.45)',
  sheetShadow: '0px -12px 32px rgba(0, 0, 0, 0.5)',
};

export const explorePalettes = { light: exploreLight, dark: exploreDark };
export type ExplorePalette = typeof exploreLight;
export type Palette = typeof light;

/**
 * Increase Contrast (iOS Settings > Accessibility): text and separators pull further from the
 * background, as Apple's own adaptive colours do. Everything else stays the same.
 */
export const highContrastPalettes: Record<'light' | 'dark', Palette> = {
  light: { ...light, label2: '#3C3A34', label3: '#4B4841', separator: '#C2B9A8', accent: '#154750' },
  dark: { ...dark, label2: '#D3CDC1', label3: '#B5AFA3', separator: '#4A4842', accent: '#BDEBF2' },
};

/** Camera chrome: always light-on-black whatever the theme, because it sits on the live lens image. */
export const camera = {
  background: '#000000',
  foreground: '#FFFFFF',
  corner: 'rgba(255, 255, 255, 0.92)',
  glass: 'rgba(12, 14, 18, 0.48)',
} as const;

/** Brand mark colours (the app icon, scripts/icons/build.mjs): never UI state. */
export const brand = {
  tile: '#F7F3EB',
  disc: '#BCE8F0',
  glyph: '#252522',
  hacek: '#F2784B',
  tileDark: '#1B1B19',
  discDark: '#2E5A61',
  glyphDark: '#F7F3EB',
  hacekDark: '#FF986E',
};

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
  card: 22,
  sheet: 28,
  pill: 999,
} as const;

/**
 * Fonts. Newsreader (an editorial serif with full Czech diacritics) for display headings, the
 * system font for everything else. Loaded in the root layout; until it loads, headings use the
 * system font.
 */
export const fonts = {
  display: 'Newsreader_600SemiBold',
  displayMedium: 'Newsreader_500Medium',
  displayItalic: 'Newsreader_500Medium_Italic',
} as const;

/** Type ramp. The three display sizes are set in Newsreader (see Text); the rest is the system font. One display size per screen. */
export const type = {
  largeTitle: { fontSize: 36, lineHeight: 42, fontWeight: '600', letterSpacing: -0.4 },
  title1: { fontSize: 30, lineHeight: 36, fontWeight: '600', letterSpacing: -0.3 },
  title2: { fontSize: 24, lineHeight: 30, fontWeight: '600', letterSpacing: -0.2 },
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

/**
 * Motion vocabulary, one for the whole app (docs/czechlocal-design/03-motion.md).
 * press 100 ms (80-130) · chip 180 ms (150-220) · reveal 260 ms (220-320) · flip 350 ms (300-400).
 * Sheets and drags settle on springs. Reduce Motion: fades only, no movement.
 */
export const motion = {
  easeOut: Easing.bezier(0.23, 1, 0.32, 1),
  press: 100,
  fast: 180,
  chip: 180,
  base: 240,
  reveal: 260,
  slow: 300,
  flip: 350,
  snap: { duration: 400, dampingRatio: 1 },
  /** Bottom sheets: settles without overshoot, fast enough to follow a flick. */
  sheet: { damping: 32, stiffness: 320, mass: 1 },
  /** Cards and chips that answer a touch: a touch of bounce. */
  tactile: { damping: 18, stiffness: 260, mass: 0.9 },
} as const;

export const layout = {
  /** Readable max width for phone-sized columns on tablets / web. */
  maxWidth: 560,
  gutter: 20,
} as const;
