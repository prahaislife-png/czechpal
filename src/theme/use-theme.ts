import { useColorScheme } from '@/hooks/use-color-scheme';
import { useIncreaseContrast } from '@/lib/a11y';

import { highContrastPalettes, palettes } from './tokens';

export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const increaseContrast = useIncreaseContrast();
  return { scheme, colors: (increaseContrast ? highContrastPalettes : palettes)[scheme] } as const;
}
