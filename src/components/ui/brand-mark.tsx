import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { brand } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { brandMark } from './brand-mark-data';

/**
 * The CzechLocal mark, the app icon in miniature: a Newsreader "Č" in charcoal with a coral háček,
 * on a sky disc, on a paper tile (paper on charcoal in dark mode, like the dark app icon).
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  const { scheme } = useTheme();
  const dark = scheme === 'dark';
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="CzechLocal">
      <Rect width="100" height="100" rx="22.4" fill={dark ? brand.tileDark : brand.tile} />
      <Circle cx={brandMark.disc.cx} cy={brandMark.disc.cy} r={brandMark.disc.r} fill={dark ? brand.discDark : brand.disc} />
      <G transform={brandMark.glyphTransform}>
        <Path d={brandMark.body} fill={dark ? brand.glyphDark : brand.glyph} />
        <Path d={brandMark.caron} fill={dark ? brand.hacekDark : brand.hacek} />
      </G>
    </Svg>
  );
}
