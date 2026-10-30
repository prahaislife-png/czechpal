import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale on press-in. Buttons and cards use 0.97; pass 1 to disable. */
  pressedScale?: number;
};

/**
 * Press feedback lands on press-in (120 ms, strong ease-out) and springs back on release.
 * Reduce Motion swaps the scale for an opacity dip.
 */
export function PressableScale({ pressedScale = 0.97, style, onPressIn, onPressOut, ...rest }: Props) {
  const reduceMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const p = pressed.get();
    return reduceMotion
      ? { opacity: 1 - p * 0.25 }
      : { transform: [{ scale: 1 - p * (1 - pressedScale) }] };
  });

  return (
    <AnimatedPressable
      {...rest}
      onPressIn={(e) => {
        pressed.set(withTiming(1, { duration: motion.press, easing: motion.easeOut }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withTiming(0, { duration: motion.fast, easing: motion.easeOut }));
        onPressOut?.(e);
      }}
      style={[style, animatedStyle]}
    />
  );
}
