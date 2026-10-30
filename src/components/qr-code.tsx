import createQr from 'qrcode-generator';
import { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { qr as colors } from '@/theme/tokens';

const QUIET_ZONE = 4; // modules of white border the QR spec requires around the code

/**
 * Renders `value` (ASCII only, which SPAYD guarantees) as a QR code.
 * Error correction M: the level Czech banks use for QR Platba.
 */
export function QrCode({ value, size, accessibilityLabel }: { value: string; size: number; accessibilityLabel: string }) {
  const { path, count } = useMemo(() => {
    const code = createQr(0, 'M');
    code.addData(value, 'Byte');
    code.make();
    const n = code.getModuleCount();
    let d = '';
    // One rectangle per horizontal run of dark modules: fewer path segments and no hairline seams between cells.
    for (let row = 0; row < n; row++) {
      let col = 0;
      while (col < n) {
        if (!code.isDark(row, col)) {
          col++;
          continue;
        }
        const start = col;
        while (col < n && code.isDark(row, col)) col++;
        d += `M${start + QUIET_ZONE} ${row + QUIET_ZONE}h${col - start}v1h${start - col}z`;
      }
    }
    return { path: d, count: n + QUIET_ZONE * 2 };
  }, [value]);

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${count} ${count}`}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      <Rect x={0} y={0} width={count} height={count} fill={colors.light} />
      <Path d={path} fill={colors.dark} />
    </Svg>
  );
}
