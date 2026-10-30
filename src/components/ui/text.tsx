import { Platform, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { type Palette, type TypeVariant, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type ColorKey = Extract<
  keyof Palette,
  | 'label'
  | 'label2'
  | 'label3'
  | 'accent'
  | 'onAccent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'paperInk'
  | 'onInk'
  | 'onInk2'
>;

export type AppTextProps = TextProps & {
  variant?: TypeVariant;
  color?: ColorKey;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  tabular?: boolean;
  /** Custom chrome (buttons, badges, bar labels): bound Dynamic Type so controls never break. Body text stays unbounded. */
  chrome?: boolean;
};

export const CHROME_MAX_SCALE = 1.4;

const webFont = Platform.OS === 'web' ? { fontFamily: 'var(--font-display)' } : null;

export function Text({
  variant = 'body',
  color = 'label',
  weight,
  align,
  tabular,
  chrome,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <RNText
      maxFontSizeMultiplier={chrome ? CHROME_MAX_SCALE : undefined}
      {...rest}
      style={[
        ramp[variant],
        webFont,
        { color: colors[color] },
        weight != null && { fontWeight: weight },
        align != null && { textAlign: align },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
