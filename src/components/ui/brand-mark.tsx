import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { brand } from '@/theme/tokens';

import { brandMark } from './brand-mark-data';

/**
 * The CzechPal mark, the app icon in miniature: a white "Č" with a red háček inside cobalt
 * viewfinder corners, on ink. White, blue and red, without being a flag (the app isn't official).
 */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="CzechPal">
      <Defs>
        <LinearGradient id="brandInk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={brand.inkTop} />
          <Stop offset="1" stopColor={brand.inkBottom} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" rx="22.4" fill="url(#brandInk)" />
      <Path
        d={brandMark.corners}
        fill="none"
        stroke={brand.corners}
        strokeWidth={brandMark.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <G transform={brandMark.glyphTransform}>
        <Path d={brandMark.body} fill={brand.glyph} />
        <Path d={brandMark.caron} fill={brand.hacek} />
      </G>
    </Svg>
  );
}
