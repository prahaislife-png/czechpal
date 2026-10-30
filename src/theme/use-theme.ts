import { useColorScheme } from '@/hooks/use-color-scheme';

import { palettes } from './tokens';

export function useTheme() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palettes[scheme] } as const;
}
