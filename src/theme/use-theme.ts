import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIncreaseContrast } from '@/lib/a11y';

import { explorePalettes, highContrastPalettes, palettes } from './tokens';

export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const increaseContrast = useIncreaseContrast();
  return { scheme, colors: (increaseContrast ? highContrastPalettes : palettes)[scheme] } as const;
}

/** Explore's warm palette, following the same light and dark switch. */
export function useExploreTheme() {
  const { scheme } = useTheme();
  return { scheme, ex: explorePalettes[scheme] } as const;
}
