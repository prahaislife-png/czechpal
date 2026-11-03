import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import type { Cover as CoverSpec } from '@/lib/learn/types';
import { useTheme } from '@/theme/use-theme';

/** Soft paper tones for covers, with one deeper ink each for the shape. Light and dark. */
const tones: Record<CoverSpec['tone'], { light: [string, string]; dark: [string, string] }> = {
  sand: { light: ['#F3E9DA', '#C9A77C'], dark: ['#3A3228', '#B8946A'] },
  sage: { light: ['#E4EBE1', '#8FA885'], dark: ['#2B3329', '#86A07C'] },
  sky: { light: ['#E1EAF4', '#7E9CC4'], dark: ['#26303D', '#7E9CC4'] },
  rose: { light: ['#F4E3E1', '#C98A82'], dark: ['#3B2B29', '#C48980'] },
  stone: { light: ['#E8E6E2', '#8E8A84'], dark: ['#302F2D', '#9A958E'] },
  butter: { light: ['#F5EDCF', '#C9A93E'], dark: ['#3A3524', '#C2A440'] },
};

/** Original geometric cover art: one shape on a paper tone, drawn in code. */
export function Cover({ cover, width, height }: { cover: CoverSpec; width: number; height: number }) {
  const { scheme } = useTheme();
  const [ground, ink] = tones[cover.tone][scheme === 'dark' ? 'dark' : 'light'];
  const w = 60;
  const h = 80;
  return (
    <View style={[styles.frame, { width, height, backgroundColor: ground }]} accessible={false}>
      <Svg width={width} height={height} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
        {cover.shape === 'arch' && <Path d="M14 62 V36 A16 16 0 0 1 46 36 V62 Z" fill={ink} />}
        {cover.shape === 'circle' && (
          <>
            <Circle cx={30} cy={36} r={15} fill={ink} />
            <Rect x={10} y={58} width={40} height={3} rx={1.5} fill={ink} opacity={0.5} />
          </>
        )}
        {cover.shape === 'steps' && <Path d="M10 64 H22 V52 H34 V40 H46 V28 H50 V64 Z" fill={ink} />}
        {cover.shape === 'window' && (
          <>
            <Rect x={15} y={20} width={30} height={40} rx={2} fill={ink} />
            <Rect x={29} y={20} width={2} height={40} fill={ground} />
            <Rect x={15} y={39} width={30} height={2} fill={ground} />
          </>
        )}
        {cover.shape === 'wave' && <Path d="M6 48 C16 36 24 60 34 48 S50 36 54 44 V64 H6 Z" fill={ink} />}
        {cover.shape === 'stack' && (
          <>
            <Rect x={14} y={46} width={32} height={10} rx={2} fill={ink} />
            <Rect x={18} y={34} width={24} height={10} rx={2} fill={ink} opacity={0.75} />
            <Rect x={22} y={22} width={16} height={10} rx={2} fill={ink} opacity={0.5} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: 10, borderCurve: 'continuous', overflow: 'hidden' },
});
