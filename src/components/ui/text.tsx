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
>;

export type AppTextProps = TextProps & {
  variant?: TypeVariant;
  color?: ColorKey;
  weight?: TextStyle['fontWeight'];
  align?: TextStyle['textAlign'];
  tabular?: boolean;
};

const webFont = Platform.OS === 'web' ? { fontFamily: 'var(--font-display)' } : null;

export function Text({
  variant = 'body',
  color = 'label',
  weight,
  align,
  tabular,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <RNText
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
