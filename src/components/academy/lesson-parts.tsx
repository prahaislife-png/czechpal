import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { matchOrder, shortForm, type QuickPick } from '@/lib/academy/lesson-steps';
import type { Lesson, Phrase } from '@/lib/academy/types';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { SpeakRow, type Say } from './exercise';

const haptic = (ok: boolean) => {
  if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
};

/** One new phrase on its own: the Czech large, its meaning, its sound. It is read aloud as it appears. */
export function PhraseCard({ phrase, n, of, say, canListen, onNext }: { phrase: Phrase; n: number; of: number; say: Say; canListen: boolean; onNext: () => void }) {
  const { colors } = useTheme();
  useEffect(() => {
    if (canListen) say(phrase.cs);
  }, [phrase, canListen, say]);
  return (
    <>
      <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
        NEW PHRASE · {n} OF {of}
      </Text>
      <View style={[styles.phraseCard, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <Text variant="title1" lang="cs" accessibilityRole="header">
          {phrase.cs}
        </Text>
        <Text variant="title3" color="label2" style={styles.meaning}>
          {phrase.en}
        </Text>
        {canListen ? <SpeakRow text={phrase.cs} say={say} canListen /> : null}
      </View>
      <Button label={n === of ? 'Got it' : 'Next phrase'} onPress={onNext} />
    </>
  );
}

/** A warm-up, not a test: pick the phrase that means this. A wrong tap just asks again. */
export function QuickPickView({ pick, onNext }: { pick: QuickPick; onNext: () => void }) {
  const { colors } = useTheme();
  const [wrong, setWrong] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const choose = (i: number) => {
    if (done) return;
    const ok = i === pick.answer;
    haptic(ok);
    announce(ok ? 'Right' : 'Not that one. Try again.');
    if (ok) setDone(true);
    else setWrong((w) => [...w, i]);
  };
  return (
    <>
      <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
        QUICK ONE
      </Text>
      <Text variant="title3" accessibilityRole="header">
        Which one means “{pick.ask}”?
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {pick.options.map((o, i) => {
          const state = done && i === pick.answer ? 'right' : wrong.includes(i) ? 'wrong' : 'idle';
          return (
            <Pressable
              key={o}
              onPress={() => choose(i)}
              disabled={done || wrong.includes(i)}
              accessibilityRole="radio"
              accessibilityState={{ checked: state === 'right', disabled: done || wrong.includes(i) }}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: state === 'right' ? colors.successSoft : state === 'wrong' ? colors.dangerSoft : pressed ? colors.fill : colors.surface,
                  borderColor: state === 'right' ? colors.success : state === 'wrong' ? colors.danger : colors.separator,
                },
              ]}>
              <Text variant="callout" weight="500" lang="cs" style={styles.flex}>
                {o}
              </Text>
              {state !== 'idle' ? <Icon name={state === 'right' ? 'checkCircle' : 'close'} size={20} color={state === 'right' ? colors.success : colors.danger} /> : null}
            </Pressable>
          );
        })}
      </View>
      {done ? (
        <Animated.View entering={FadeIn.duration(180)}>
          <Button label="Next" onPress={onNext} />
        </Animated.View>
      ) : wrong.length ? (
        <Text variant="footnote" color="label2">
          Not that one. Try another.
        </Text>
      ) : null}
    </>
  );
}

/**
 * Match each phrase to its meaning: tap one on the left, then its partner on the right. Pairs
 * lock in as they're found; a wrong pair flashes and lets go. Nothing is scored.
 */
export function MatchPairs({ lesson, onNext }: { lesson: Pick<Lesson, 'id' | 'introduce'>; onNext: () => void }) {
  const { colors } = useTheme();
  const [order] = useState(() => matchOrder(lesson));
  const [left, setLeft] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [miss, setMiss] = useState<{ left: number; right: number } | null>(null);
  const done = matched.length === lesson.introduce.length;

  const pickRight = (i: number) => {
    if (left === null || matched.includes(i)) return;
    if (i === left) {
      haptic(true);
      setMatched((m) => [...m, i]);
      setLeft(null);
      if (matched.length + 1 === lesson.introduce.length) announce('All matched');
    } else {
      haptic(false);
      const pair = { left, right: i };
      setMiss(pair);
      setLeft(null);
      setTimeout(() => setMiss((m) => (m === pair ? null : m)), 600);
    }
  };

  const tile = (state: 'idle' | 'chosen' | 'matched' | 'miss') => ({
    backgroundColor: state === 'matched' ? colors.successSoft : state === 'miss' ? colors.dangerSoft : state === 'chosen' ? colors.accentSoft : colors.surface,
    borderColor: state === 'matched' ? colors.success : state === 'miss' ? colors.danger : state === 'chosen' ? colors.accent : colors.separator,
    opacity: state === 'matched' ? 0.6 : 1,
  });

  return (
    <>
      <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
        MATCH THEM UP
      </Text>
      <Text variant="title3" accessibilityRole="header">
        Tap a phrase, then what it means
      </Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {lesson.introduce.map((p, i) => {
            const state = matched.includes(i) ? 'matched' : miss?.left === i ? 'miss' : left === i ? 'chosen' : 'idle';
            return (
              <Pressable
                key={p.cs}
                onPress={() => !matched.includes(i) && setLeft(left === i ? null : i)}
                disabled={matched.includes(i)}
                accessibilityRole="button"
                accessibilityState={{ selected: left === i, disabled: matched.includes(i) }}
                accessibilityLabel={`${shortForm(p.cs)}${matched.includes(i) ? ', matched' : ''}`}
                style={[styles.matchTile, tile(state)]}>
                <Text variant="subhead" weight="600" lang="cs" numberOfLines={3}>
                  {shortForm(p.cs)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.column}>
          {order.map((i) => {
            const state = matched.includes(i) ? 'matched' : miss?.right === i ? 'miss' : 'idle';
            return (
              <Pressable
                key={lesson.introduce[i].en}
                onPress={() => pickRight(i)}
                disabled={matched.includes(i) || left === null}
                accessibilityRole="button"
                accessibilityState={{ disabled: matched.includes(i) || left === null }}
                accessibilityLabel={`${lesson.introduce[i].en}${matched.includes(i) ? ', matched' : ''}`}
                style={[styles.matchTile, tile(state)]}>
                <Text variant="subhead" color="label2" numberOfLines={3}>
                  {lesson.introduce[i].en}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {done ? (
        <Animated.View entering={FadeInDown.duration(220)}>
          <Button label="Next" onPress={onNext} />
        </Animated.View>
      ) : (
        <Text variant="footnote" color="label2" align="center">
          {matched.length} of {lesson.introduce.length} matched
        </Text>
      )}
    </>
  );
}

/**
 * The phrases in a short conversation, as chat bubbles: the first speaker on the left, the other
 * on the right. Tap a line to hear it; the English is a tap away, not in the way.
 */
export function Dialogue({ lesson, say, canListen, onNext }: { lesson: Lesson; say: Say; canListen: boolean; onNext: () => void }) {
  const { colors } = useTheme();
  const [english, setEnglish] = useState(false);
  const first = lesson.context[0]?.speaker;
  return (
    <>
      <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
        IN A REAL CONVERSATION
      </Text>
      <Text variant="title3" accessibilityRole="header">
        {canListen ? 'Read it, and tap a line to hear it' : 'Read how the phrases are used'}
      </Text>
      <View style={styles.bubbles}>
        {lesson.context.map((l, i) => {
          const mine = l.speaker !== first;
          return (
            <Pressable
              key={i}
              onPress={() => canListen && say(l.cs)}
              disabled={!canListen}
              accessibilityRole={canListen ? 'button' : undefined}
              accessibilityLabel={`${l.speaker ? `${l.speaker}: ` : ''}${l.cs}${english ? `. ${l.en}` : ''}`}
              style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft, { backgroundColor: mine ? colors.accentSoft : colors.surface, borderColor: mine ? colors.accentSoft : colors.separator }]}>
              {l.speaker ? (
                <Text variant="caption" weight="700" color="accent">
                  {l.speaker}
                </Text>
              ) : null}
              <Text variant="body" lang="cs">
                {l.cs}
              </Text>
              {english ? (
                <Animated.View entering={FadeIn.duration(160)}>
                  <Text variant="subhead" color="label2">
                    {l.en}
                  </Text>
                </Animated.View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <Button label={english ? 'Hide English' : 'Show English'} variant="secondary" onPress={() => setEnglish((s) => !s)} style={styles.flex} />
        <Button label="Practise" onPress={onNext} style={styles.flex} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  eyebrow: { letterSpacing: 0.8 },
  phraseCard: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xxl, gap: space.md, minHeight: 220, justifyContent: 'center' },
  meaning: { fontWeight: '400' },
  options: { gap: space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.md, borderRadius: radius.tile, borderCurve: 'continuous', borderWidth: 1.5 },
  columns: { flexDirection: 'row', gap: space.sm },
  column: { flex: 1, gap: space.sm },
  matchTile: { minHeight: 64, justifyContent: 'center', paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.tile, borderCurve: 'continuous', borderWidth: 1.5 },
  bubbles: { gap: space.sm },
  bubble: { maxWidth: '86%', borderRadius: radius.card, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.lg, paddingVertical: space.md, gap: 2 },
  bubbleLeft: { alignSelf: 'flex-start', borderBottomLeftRadius: space.xs },
  bubbleRight: { alignSelf: 'flex-end', borderBottomRightRadius: space.xs },
  row: { flexDirection: 'row', gap: space.sm },
});
