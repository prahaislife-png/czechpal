import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { toneColors, type Tone } from './tone';

/**
 * A pill for picking a category or activity. Unselected: quiet paper outline. Selected: its
 * pastel tone fills in over 180 ms (colour only, so it's fine with Reduce Motion).
 */
export function CategoryChip({
  label,
  icon,
  tone = 'sky',
  selected,
  onPress,
  role = 'radio',
}: {
  label: string;
  icon?: IconName;
  tone?: Tone;
  selected: boolean;
  onPress: () => void;
  role?: 'radio' | 'checkbox' | 'button';
}) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  const on = useSharedValue(selected ? 1 : 0);
  useEffect(() => {
    on.set(withTiming(selected ? 1 : 0, { duration: motion.chip, easing: motion.easeOut }));
  }, [selected, on]);
  const fill = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [colors.surface, tint]),
    borderColor: interpolateColor(on.get(), [0, 1], [colors.separator, tint]),
  }));
  return (
    <PressableScale
      onPress={() => {
        if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
        onPress();
      }}
      pressedScale={0.95}
      accessibilityRole={role}
      accessibilityState={role === 'button' ? undefined : { checked: selected }}
      accessibilityLabel={label}>
      <Animated.View style={[styles.chip, fill]}>
        {icon ? <Icon name={icon} size={16} color={selected ? ink : colors.label2} /> : null}
        <Text variant="subhead" weight={selected ? '600' : '500'} style={{ color: selected ? ink : colors.label }} chrome>
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    minHeight: 38,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
