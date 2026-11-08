import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme/use-theme';

/**
 * The Speak Czech voice orb: a soft coral shape that breathes while idle, swells with the
 * partner's voice and leans with the learner's. CzechPal's own: coral and lavender with a cool sky
 * light, a slowly changing outline, and rings while the partner speaks. With Reduce Motion on it
 * holds its shape and only brightens with speech.
 */
export function Orb({
  size,
  input,
  output,
  state,
}: {
  size: number;
  /** 0–1 microphone level. */
  input: SharedValue<number>;
  /** 0–1 partner level. */
  output: SharedValue<number>;
  state: 'idle' | 'connecting' | 'listening' | 'speaking' | 'muted';
}) {
  const { scheme } = useTheme();
  const reduce = useReducedMotion();
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const spin = useSharedValue(0);
  const breath = useSharedValue(0);
  const active = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    a.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 5600, easing: Easing.inOut(Easing.sin) }), -1, true);
    spin.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.linear }), -1, false);
    breath.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduce, a, b, spin, breath]);

  useEffect(() => {
    active.value = withTiming(state === 'connecting' ? 0.35 : state === 'muted' || state === 'idle' ? 0 : 1, { duration: 400 });
  }, [state, active]);

  const r = size / 2;
  const shape = useAnimatedStyle(() => {
    const voice = Math.max(output.value, input.value * 0.6) * active.value;
    const scale = reduce
      ? 1
      : withSpring(1 + interpolate(breath.value, [0, 1], [-0.015, 0.015]) + output.value * 0.1 * active.value + input.value * 0.05 * active.value, {
          damping: 18,
          stiffness: 180,
        });
    const wobble = reduce ? 0 : 0.12 + voice * 0.08;
    return {
      borderTopLeftRadius: r * (1 - wobble * a.value),
      borderTopRightRadius: r * (1 - wobble * (1 - b.value)),
      borderBottomRightRadius: r * (1 - wobble * (1 - a.value)),
      borderBottomLeftRadius: r * (1 - wobble * b.value),
      transform: [{ rotate: `${spin.value * 360}deg` }, { scale }],
    };
  });

  // The light inside turns the other way, so the surface seems to move.
  const light = useAnimatedStyle(() => ({ transform: [{ rotate: `${-spin.value * 720}deg` }] }));

  // Two rings while the partner speaks, the outer one fainter and wider.
  const ring1 = useAnimatedStyle(() => {
    const level = output.value * active.value;
    return { opacity: interpolate(level, [0, 1], [0, 0.5]), transform: [{ scale: 1.06 + level * 0.06 }] };
  });
  const ring2 = useAnimatedStyle(() => {
    const level = output.value * active.value;
    return { opacity: interpolate(level, [0, 1], [0, 0.3]), transform: [{ scale: 1.18 + level * 0.12 }] };
  });

  const dim = state === 'muted' || state === 'idle';
  // CzechPal 2.0: warm coral at the heart, lavender at the edge, a cool sky light.
  const edge = scheme === 'dark' ? '#8F7FD6' : '#B7A8EE';

  return (
    <View style={{ width: size * 1.35, height: size * 1.35, alignItems: 'center', justifyContent: 'center' }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: edge }, ring2]} />
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: edge }, ring1]} />
      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, opacity: dim ? 0.72 : 1, boxShadow: `0px 18px 48px ${scheme === 'dark' ? 'rgba(255,152,110,0.22)' : 'rgba(255,152,110,0.32)'}` },
          shape,
        ]}>
        <Animated.View style={[StyleSheet.absoluteFill, light]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id="body" cx="38%" cy="32%" r="78%">
                <Stop offset="0" stopColor="#FFF1E4" />
                <Stop offset="0.38" stopColor="#FFB08A" />
                <Stop offset="0.72" stopColor="#FF986E" />
                <Stop offset="1" stopColor={edge} />
              </RadialGradient>
              <RadialGradient id="tint" cx="78%" cy="76%" r="45%">
                <Stop offset="0" stopColor="#BCE8F0" stopOpacity="0.7" />
                <Stop offset="1" stopColor="#BCE8F0" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width={size} height={size} fill="url(#body)" />
            <Rect width={size} height={size} fill="url(#tint)" />
          </Svg>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1.5 },
});
