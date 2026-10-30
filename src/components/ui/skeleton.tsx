import { useEffect } from 'react';
import { StyleSheet, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Skeletons only for content whose shape we know. A slow breathing pulse, no shimmer sweep. */
export function SkeletonLine({ width = '100%', height = 14 }: { width?: DimensionValue; height?: number }) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!reduceMotion) pulse.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: 0.55 + pulse.get() * 0.45 }));

  return (
    <Animated.View
      style={[styles.line, { width, height, backgroundColor: colors.fill }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

const styles = StyleSheet.create({
  line: { borderRadius: radius.pill },
});
