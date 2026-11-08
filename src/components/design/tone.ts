import type { Palette } from '@/theme/tokens';

/** The four pastels plus neutral: a surface tint and the ink that reads on it. */
export type Tone = 'sky' | 'sage' | 'coral' | 'lavender' | 'neutral';

export function toneColors(colors: Palette, tone: Tone): { tint: string; ink: string } {
  switch (tone) {
    case 'sky':
      return { tint: colors.sky, ink: colors.skyInk };
    case 'sage':
      return { tint: colors.sage, ink: colors.sageInk };
    case 'coral':
      return { tint: colors.coralSoft, ink: colors.coralInk };
    case 'lavender':
      return { tint: colors.lavender, ink: colors.lavenderInk };
    default:
      return { tint: colors.surfaceMuted, ink: colors.label };
  }
}
