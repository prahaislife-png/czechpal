import { Children, useEffect } from 'react';
import { Platform, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { announce } from '@/lib/a11y';
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
  /** Custom chrome (buttons, badges, bar labels): bounded Dynamic Type so controls never break. Body text stays unbounded. */
  chrome?: boolean;
};

/** HIG: "Ideally, offer text enlargement of at least 200%", so even chrome reaches double size. */
export const CHROME_MAX_SCALE = 2;

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
  // A live region is read out on Android only; VoiceOver needs the same message announced.
  const live = rest.accessibilityLiveRegion && rest.accessibilityLiveRegion !== 'none';
  const spoken = live
    ? Children.toArray(rest.children)
        .filter((c) => typeof c === 'string' || typeof c === 'number')
        .join('')
    : '';
  useEffect(() => {
    if (spoken) announce(spoken);
  }, [spoken]);

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
