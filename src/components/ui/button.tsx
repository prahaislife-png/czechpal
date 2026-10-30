import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type Variant = 'primary' | 'secondary' | 'plain' | 'destructive' | 'quietDestructive' | 'onDark';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'large' | 'medium';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/** Actions are pills. Exactly one primary per screen. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  size = 'large',
  style,
  accessibilityHint,
}: Props) {
  const { colors } = useTheme();

  const bg = {
    primary: colors.accentFill,
    secondary: colors.accentSoft,
    plain: 'transparent',
    destructive: colors.dangerSoft,
    quietDestructive: 'transparent',
    onDark: 'transparent',
  }[variant];
  const fg = {
    primary: colors.onAccent,
    secondary: colors.accent,
    plain: colors.accent,
    destructive: colors.danger,
    quietDestructive: colors.danger,
    onDark: colors.onInk,
  }[variant];

  const inactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      style={[
        styles.base,
        size === 'large' ? styles.large : styles.medium,
        { backgroundColor: bg },
        disabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size="md" color={fg} />}
          <Text variant={size === 'large' ? 'headline' : 'subhead'} weight="600" style={{ color: fg }} chrome>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: { minHeight: 54, paddingHorizontal: space.xxl },
  medium: { minHeight: 44, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  disabled: { opacity: 0.45 },
});
