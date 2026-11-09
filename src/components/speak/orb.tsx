import { useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
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
 * Every state comes from the real session (use-conversation.ts), never simulated:
 * idle (no session), connecting, listening (live, nobody talking), user-speaking (the learner's
 * words are arriving), thinking (the learner finished, the partner hasn't started), speaking
 * (the partner's words or voice are arriving), muted, error (disconnected or failed).
 */
export type OrbState = 'idle' | 'connecting' | 'listening' | 'user-speaking' | 'thinking' | 'speaking' | 'muted' | 'error';

/**
 * The Speak Czech voice orb: a soft coral shape. It moves only while a session is live (no
 * decorative looping when idle), swells with the partner's voice, leans with the learner's, and
 * pulses its ring while the partner thinks. Muted and error states hold still and fade. With
 * Reduce Motion it holds its shape and only changes brightness.
 */
export function Orb({
  size,
  input,
  output,
  state,
}: {
  size: number;
  /** 0–1 microphone level (real WebRTC statistics). */
  input: SharedValue<number>;
  /** 0–1 partner level (real WebRTC statistics). */
  output: SharedValue<number>;
  state: OrbState;
}) {
  const { scheme, colors } = useTheme();
  const reduce = useReducedMotion();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = useSharedValue(0);
  const b = useSharedValue(0);
  const spin = useSharedValue(0);
  const breath = useSharedValue(0);
  const active = useSharedValue(0);
  const think = useSharedValue(0);
  const lean = useSharedValue(0);

  const live = state === 'connecting' || state === 'listening' || state === 'user-speaking' || state === 'thinking' || state === 'speaking';

  // The shape drifts only while a session is live; otherwise it settles and stays.
  useEffect(() => {
    if (reduce || !live) {
      [a, b, spin, breath].forEach((v) => cancelAnimation(v));
      return;
    }
    a.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
    b.value = withRepeat(withTiming(1, { duration: 5600, easing: Easing.inOut(Easing.sin) }), -1, true);
    spin.value = withRepeat(withTiming(spin.value + 1, { duration: 18000, easing: Easing.linear }), -1, false);
    breath.value = withRepeat(withTiming(1, { duration: state === 'connecting' ? 1400 : 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [reduce, live, state, a, b, spin, breath]);

  useEffect(() => {
    active.value = withTiming(state === 'connecting' ? 0.35 : live ? 1 : 0, { duration: 400 });
    lean.value = withTiming(state === 'user-speaking' ? 1 : 0, { duration: 250 });
    if (state === 'thinking' && !reduce) think.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }), -1, true);
    else think.value = withTiming(0, { duration: 250 });
  }, [state, live, reduce, active, lean, think]);

  const r = size / 2;
  const shape = useAnimatedStyle(() => {
    const voice = Math.max(output.value, input.value * 0.6) * active.value;
    const scale = reduce
      ? 1
      : withSpring(
          1 +
            interpolate(breath.value, [0, 1], [-0.015, 0.015]) * active.value +
            output.value * 0.1 * active.value +
            input.value * 0.06 * active.value +
            lean.value * 0.02,
          { damping: 18, stiffness: 180 },
        );
    const wobble = reduce ? 0 : (0.12 + voice * 0.08) * Math.max(0.3, active.value);
    return {
      borderTopLeftRadius: r * (1 - wobble * a.value),
      borderTopRightRadius: r * (1 - wobble * (1 - b.value)),
      borderBottomRightRadius: r * (1 - wobble * (1 - a.value)),
      borderBottomLeftRadius: r * (1 - wobble * b.value),
      transform: [{ rotate: `${spin.value * 360}deg` }, { translateY: -lean.value * 4 }, { scale }],
    };
  });

  // The light inside turns the other way, so the surface seems to move.
  const light = useAnimatedStyle(() => ({ transform: [{ rotate: `${-spin.value * 720}deg` }] }));

  // Rings: the partner's voice (two, with the level), the learner's voice (sky), thinking (a slow pulse).
  const ring1 = useAnimatedStyle(() => {
    const level = output.value * active.value;
    return { opacity: Math.max(interpolate(level, [0, 1], [0, 0.5]), think.value * 0.35), transform: [{ scale: 1.06 + level * 0.06 + think.value * 0.04 }] };
  });
  const ring2 = useAnimatedStyle(() => {
    const level = output.value * active.value;
    return { opacity: Math.max(interpolate(level, [0, 1], [0, 0.3]), think.value * 0.18), transform: [{ scale: 1.18 + level * 0.12 + think.value * 0.06 }] };
  });
  const userRing = useAnimatedStyle(() => ({
    opacity: lean.value * interpolate(input.value, [0, 1], [0.2, 0.6]),
    transform: [{ scale: 1.04 + input.value * 0.08 }],
  }));

  const still = state === 'muted' || state === 'idle';
  const broken = state === 'error';
  // CzechLocal 2.0: warm coral at the heart, lavender at the edge, a cool sky light.
  const edge = scheme === 'dark' ? '#8F7FD6' : '#B7A8EE';

  return (
    <View style={{ width: size * 1.35, height: size * 1.35, alignItems: 'center', justifyContent: 'center' }} accessible={false} importantForAccessibility="no-hide-descendants">
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: edge }, ring2]} />
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: edge }, ring1]} />
      <Animated.View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: colors.sky, borderWidth: 3 }, userRing]} />
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            opacity: broken ? 0.45 : still ? 0.72 : 1,
            boxShadow: broken ? 'none' : `0px 18px 48px ${scheme === 'dark' ? 'rgba(255,152,110,0.22)' : 'rgba(255,152,110,0.32)'}`,
          },
          shape,
        ]}>
        <Animated.View style={[StyleSheet.absoluteFill, light]}>
          <Svg width={size} height={size}>
            <Defs>
              <RadialGradient id={`body${id}`} cx="38%" cy="32%" r="78%">
                <Stop offset="0" stopColor="#FFF1E4" />
                <Stop offset="0.38" stopColor="#FFB08A" />
                <Stop offset="0.72" stopColor="#FF986E" />
                <Stop offset="1" stopColor={edge} />
              </RadialGradient>
              <RadialGradient id={`tint${id}`} cx="78%" cy="76%" r="45%">
                <Stop offset="0" stopColor="#BCE8F0" stopOpacity="0.7" />
                <Stop offset="1" stopColor="#BCE8F0" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect width={size} height={size} fill={`url(#body${id})`} />
            <Rect width={size} height={size} fill={`url(#tint${id})`} />
          </Svg>
        </Animated.View>
        {broken ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.label3, opacity: 0.45 }]} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 1.5 },
});
