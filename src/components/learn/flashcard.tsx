import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { UserCard } from '@/lib/learn/deck';
import type { Direction } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SWIPE = 110;

/**
 * One oversized card. Tap turns it over; once it shows the answer, a swipe right means Good and
 * left means Again, and the card flies off the way it was thrown. Reduce Motion swaps the turn
 * for a crossfade and the throw for a fade.
 */
export function Flashcard({
  card,
  direction,
  revealed,
  canSpeak,
  onReveal,
  onSwipe,
  onSpeak,
}: {
  card: UserCard;
  direction: Direction;
  revealed: boolean;
  canSpeak: boolean;
  onReveal: () => void;
  onSwipe: (answer: 'good' | 'again') => void;
  onSpeak: (text: string) => void;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const turn = useSharedValue(revealed ? 1 : 0);
  const x = useSharedValue(0);
  const gone = useSharedValue(0);
  // Swiping only means something once the answer shows. Gated here rather than by toggling the
  // gesture's config, which a gesture created disabled doesn't pick up.
  const canSwipe = useSharedValue(revealed);

  useEffect(() => {
    canSwipe.set(revealed);
    turn.set(reduceMotion ? withTiming(revealed ? 1 : 0, { duration: 160 }) : withSpring(revealed ? 1 : 0, { duration: 520, dampingRatio: 0.82 }));
  }, [revealed, reduceMotion, turn, canSwipe]);

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    onUpdate: (e) => {
      if (canSwipe.get()) x.set(e.translationX);
    },
    onDeactivate: (e) => {
      if (!canSwipe.get()) return;
      const thrown = Math.abs(e.translationX) > SWIPE || Math.abs(e.velocityX) > 900;
      if (!thrown) {
        x.set(withSpring(0, { duration: 400, dampingRatio: 0.9 }));
        return;
      }
      const right = (e.translationX || e.velocityX) > 0;
      if (reduceMotion) gone.set(withTiming(1, { duration: 140 }));
      else x.set(withTiming(right ? 520 : -520, { duration: 220 }));
      scheduleOnRN(onSwipe, right ? 'good' : 'again');
    },
  });

  const motionStyle = useAnimatedStyle(() => ({
    opacity: 1 - gone.get(),
    transform: [{ translateX: x.get() }, { rotate: `${x.get() / 22}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: 1 - turn.get() }
      : { transform: [{ perspective: 1200 }, { rotateY: `${interpolate(turn.get(), [0, 1], [0, 180])}deg` }] },
  );
  const backStyle = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: turn.get() }
      : { transform: [{ perspective: 1200 }, { rotateY: `${interpolate(turn.get(), [0, 1], [180, 360])}deg` }] },
  );
  // Which way a swipe is heading, as a quiet label on the card.
  const goodHint = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [20, SWIPE], [0, 1], 'clamp') }));
  const againHint = useAnimatedStyle(() => ({ opacity: interpolate(x.get(), [-SWIPE, -20], [1, 0], 'clamp') }));

  const czechFirst = direction === 'cs-en';
  const face = [styles.face, { backgroundColor: colors.surface, boxShadow: colors.shadowRaised }];

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap}>
      <Animated.View style={[styles.wrap, motionStyle]}>
        <Pressable
          onPress={() => {
            if (revealed) return;
            if (process.env.EXPO_OS !== 'web') Haptics.selectionAsync();
            onReveal();
          }}
          accessibilityRole="button"
          accessibilityLabel={revealed ? undefined : `${czechFirst ? card.cs : card.en}. Tap to see the answer`}
          style={styles.press}>
          <Animated.View style={[face, styles.abs, frontStyle]} pointerEvents={revealed ? 'none' : 'auto'} importantForAccessibility={revealed ? 'no-hide-descendants' : 'auto'}>
            <Text variant="footnote" weight="600" color="label3" style={styles.corner}>
              {czechFirst ? 'Czech' : 'English'}
            </Text>
            <Text style={czechFirst ? styles.big : styles.bigEn} align="center" maxFontSizeMultiplier={1.6}>
              {czechFirst ? card.cs : card.en}
            </Text>
            {czechFirst && canSpeak && <SpeakButton text={card.cs} onSpeak={onSpeak} />}
            <Text variant="footnote" color="label3" style={styles.hint}>
              Tap to turn over
            </Text>
          </Animated.View>

          <Animated.View style={[face, styles.abs, backStyle]} pointerEvents={revealed ? 'auto' : 'none'} importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}>
            <Text style={styles.big} align="center" maxFontSizeMultiplier={1.6}>
              {card.cs}
            </Text>
            <Text variant="title3" align="center" color="label2">
              {card.en}
            </Text>
            {card.grammar && (
              <Text variant="footnote" color="label3" align="center">
                {card.grammar}
              </Text>
            )}
            {card.example?.cs ? (
              <Text variant="callout" align="center" style={styles.example}>
                „{card.example.cs}“
              </Text>
            ) : null}
            {canSpeak && <SpeakButton text={card.cs} onSpeak={onSpeak} />}
            <Animated.View style={[styles.swipeHint, styles.swipeRight, goodHint]} pointerEvents="none">
              <Text variant="subhead" weight="700" color="success">
                Good
              </Text>
            </Animated.View>
            <Animated.View style={[styles.swipeHint, styles.swipeLeft, againHint]} pointerEvents="none">
              <Text variant="subhead" weight="700" color="danger">
                Again
              </Text>
            </Animated.View>
          </Animated.View>
        </Pressable>
      </Animated.View>
      </View>
    </GestureDetector>
  );
}

function SpeakButton({ text, onSpeak }: { text: string; onSpeak: (text: string) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => onSpeak(text)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Hear ${text}`} style={[styles.speak, { backgroundColor: colors.fill }]}>
      <Icon name="speaker" size={20} color={colors.label} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  press: { flex: 1 },
  abs: { ...StyleSheet.absoluteFill },
  face: {
    borderRadius: radius.card + 12,
    borderCurve: 'continuous',
    padding: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    backfaceVisibility: 'hidden',
  },
  corner: { position: 'absolute', top: space.xl, left: space.xl, textTransform: 'uppercase', letterSpacing: 0.8 },
  big: { fontSize: 44, lineHeight: 52, fontWeight: '700', letterSpacing: -1 },
  bigEn: { fontSize: 32, lineHeight: 40, fontWeight: '600', letterSpacing: -0.6 },
  example: { fontStyle: 'italic', marginTop: space.sm },
  hint: { position: 'absolute', bottom: space.xl },
  speak: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: space.sm },
  swipeHint: { position: 'absolute', top: space.xl },
  swipeRight: { right: space.xl },
  swipeLeft: { left: space.xl },
});
