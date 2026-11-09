import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { toneColors, type Tone } from '@/components/design/tone';
import { Flashcard } from '@/components/learn/flashcard';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { dueCards, nextDue } from '@/lib/learn/deck';
import { preview, untilLabel, type Answer } from '@/lib/learn/srs';
import { speak, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Each answer has its pastel: again coral, hard lavender, good sky, easy sage. */
const ANSWERS: { answer: Answer; label: string; tone: Tone }[] = [
  { answer: 'again', label: 'Again', tone: 'coral' },
  { answer: 'hard', label: 'Hard', tone: 'lavender' },
  { answer: 'good', label: 'Good', tone: 'sky' },
  { answer: 'easy', label: 'Easy', tone: 'sage' },
];

/**
 * A review session: the cards due now (up to 20), one at a time. Everything runs on the phone;
 * no AI and no network.
 */
export default function FlashcardsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const deck = useLearn((s) => s.deck);
  const direction = useLearn((s) => s.direction);
  const rate = useLearn((s) => s.rate);
  const voice = useCzechVoice();
  // `cards` limits the session to some cards (a mission's words); those due are reviewed.
  const { cards } = useLocalSearchParams<{ cards?: string }>();
  // The session is fixed when it starts, so answering doesn't reshuffle what comes next.
  const [queue] = useState(() => {
    const only = cards ? new Set(cards.split(',')) : null;
    return dueCards(useLearn.getState().deck, new Date(), only ? 999 : 20)
      .filter((c) => !only || only.has(c.id))
      .map((c) => c.id);
  });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState<Record<Answer, number>>({ again: 0, hard: 0, good: 0, easy: 0 });

  const card = index < queue.length ? deck[queue[index]] : undefined;
  const intervals = useMemo(() => (card ? preview(card.schedule) : null), [card]);

  const answer = (a: Answer) => {
    if (!card) return;
    // A double tap or a swipe after a tap sends the same answer twice; the store counts it once.
    if (!useLearn.getState().answerCard(card.id, a)) return;
    if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(a === 'again' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    setTally((t) => ({ ...t, [a]: t[a] + 1 }));
    setRevealed(false);
    setIndex((i) => i + 1);
    if (index + 1 >= queue.length) announce('Review finished');
  };

  const flip = () => useLearn.getState().setDirection(direction === 'cs-en' ? 'en-cs' : 'cs-en');

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingBottom: insets.bottom + space.lg }]}>
      <Stack.Screen
        options={{
          title: 'Review',
          headerLeft: () => <HeaderCloseButton />,
          headerRight: () => (
            <Pressable onPress={flip} hitSlop={10} accessibilityRole="button" accessibilityLabel={direction === 'cs-en' ? 'Show English first' : 'Show Czech first'} style={styles.headerButton}>
              <Icon name="swap" size={22} color={colors.accent} />
            </Pressable>
          ),
        }}
      />

      {queue.length === 0 ? (
        <Done title="Nothing to review" next={nextDue(deck)} />
      ) : !card ? (
        <Done title="Done for now" tally={tally} next={nextDue(deck)} />
      ) : (
        <>
          <View style={styles.progressRow}>
            <Text variant="footnote" weight="600" color="label2" tabular>
              {index + 1} of {queue.length}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.fill }]}>
              <View style={[styles.fill, { backgroundColor: colors.accentFill, width: `${(index / queue.length) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.stage}>
            <Flashcard
              key={card.id}
              card={card}
              direction={direction}
              revealed={revealed}
              canSpeak={voice.state === 'available'}
              onReveal={() => setRevealed(true)}
              onSwipe={answer}
              onSpeak={(text) => speak(text, { voice: voice.voice, rate })}
            />
          </View>

          {revealed && intervals ? (
            <View style={styles.answers}>
              {ANSWERS.map(({ answer: a, label, tone }) => {
                const { tint, ink } = toneColors(colors, tone);
                return (
                  <PressableScale
                    key={a}
                    onPress={() => answer(a)}
                    pressedScale={0.94}
                    accessibilityRole="button"
                    accessibilityLabel={`${label}, again in ${untilLabel(intervals[a])}`}
                    style={[styles.answer, { backgroundColor: tint }]}>
                    <Text variant="callout" weight="700" style={{ color: ink }}>
                      {label}
                    </Text>
                    <Text variant="caption" style={{ color: ink, opacity: 0.8 }}>
                      {untilLabel(intervals[a])}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          ) : (
            <Button label="Show answer" onPress={() => setRevealed(true)} />
          )}
          <Text variant="caption" color="label3" align="center">
            {revealed ? 'Or swipe right for Good, left for Again' : 'Say it to yourself first, then check'}
          </Text>
        </>
      )}
    </View>
  );
}

function Done({ title, tally, next }: { title: string; tally?: Record<Answer, number>; next: Date | null }) {
  const { colors } = useTheme();
  const total = tally ? Object.values(tally).reduce((a, b) => a + b, 0) : 0;
  return (
    <View style={styles.done}>
      <View style={[styles.doneIcon, { backgroundColor: colors.successSoft }]}>
        <Icon name="check" size={28} color={colors.success} />
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {title}
      </Text>
      {tally && total > 0 && (
        <Text variant="callout" color="label2" align="center">
          {total} {total === 1 ? 'card' : 'cards'} reviewed{tally.again ? ` · ${tally.again} to see again soon` : ''}
        </Text>
      )}
      <Text variant="callout" color="label2" align="center">
        {next ? `The next card is due in ${untilLabel(next)}.` : 'Save words from a story to start.'}
      </Text>
      <Button label="Close" variant="secondary" onPress={() => router.back()} style={styles.doneButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.gutter, gap: space.lg, maxWidth: layout.maxWidth, width: '100%', alignSelf: 'center' },
  headerButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.md },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  stage: { flex: 1, minHeight: 320, maxHeight: 520 },
  answers: { flexDirection: 'row', gap: space.sm },
  answer: { flex: 1, minHeight: 64, borderRadius: radius.tile, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', gap: 2 },
  done: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.xl },
  doneIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  doneButton: { alignSelf: 'stretch', marginTop: space.lg },
});
