import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOut, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { dayKey, streak } from '@/lib/learn/activity';
import { buildSession, situationProgress, type DailyMinutes, type SessionStep } from '@/lib/learn/session';
import { situationById } from '@/lib/learn/situations';
import { useFocus } from '@/lib/learn/use-upcoming';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLOW = 0.55;

/**
 * The daily session: a few minutes made for today. Words that are due, then phrases for what's
 * coming up in the learner's life, then hearing those phrases. One thing on screen at a time.
 */
export default function SessionScreen() {
  const { focus: focusParam } = useLocalSearchParams<{ focus?: string }>();
  const coming = useFocus();
  const situation = situationById(focusParam) ?? coming.situation;
  const reason = situationById(focusParam) && focusParam !== coming.situation.id ? undefined : coming.reason;
  const voice = useCzechVoice();

  return (
    <>
      <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : (
        <Session key={situation.id} situationId={situation.id} reason={reason} canListen={voice.state === 'available'} voice={voice.voice} />
      )}
    </>
  );
}

function Session({ situationId, reason, canListen, voice }: { situationId: string; reason?: string; canListen: boolean; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const situation = situationById(situationId)!;
  const rate = useLearn((s) => s.rate);
  const direction = useLearn((s) => s.direction);
  const minutes = (useLearn((s) => s.profile?.minutes) ?? 5) as DailyMinutes;
  // Built once: the deck changes as cards are answered, and the session must not reshuffle.
  const [steps] = useState<SessionStep[]>(() =>
    buildSession({
      deck: useLearn.getState().deck,
      focus: situation,
      memory: useLearn.getState().phrases,
      minutes,
      canListen,
      seed: Number(dayKey().replace(/-/g, '')),
    }),
  );
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ cards: 0, phrases: 0, knew: 0, heard: 0, heardRight: 0 });
  const done = index >= steps.length;
  const step = steps[index];

  const say = useCallback((text: string, slow = false) => speak(text, { voice, rate: slow ? SLOW : rate }), [voice, rate]);
  useFocusEffect(useCallback(() => stopSpeaking, []));

  // The end is logged once, when it's reached.
  useEffect(() => {
    if (!done) return;
    useLearn.getState().finishSession();
    if (tally.heard) useLearn.getState().finishListening(tally.heardRight, tally.heard);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    announce('Done for today');
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => setIndex((i) => i + 1);

  if (done) return <Finished situationId={situationId} tally={tally} />;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.progress} accessibilityLabel={`Step ${index + 1} of ${steps.length}`}>
        {steps.map((s, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <Text variant="footnote" weight="600" color="label3" style={styles.kicker}>
        {step.kind === 'card' ? 'YOUR WORDS' : step.kind === 'phrase' ? situation.title.toUpperCase() : 'LISTEN'}
      </Text>
      {step.kind === 'phrase' && reason && index === steps.findIndex((s) => s.kind === 'phrase') ? (
        <Text variant="footnote" color="label2" style={styles.kicker}>
          {reason}
        </Text>
      ) : null}

      <Animated.View key={index} entering={FadeInRight.duration(220)} exiting={FadeOut.duration(120)} style={styles.stage}>
        {step.kind === 'card' ? (
          <CardStep
            step={step}
            czechFirst={direction === 'cs-en'}
            say={say}
            canListen={canListen}
            onAnswer={(knew) => {
              useLearn.getState().answerCard(step.card.id, knew ? 'good' : 'again');
              setTally((t) => ({ ...t, cards: t.cards + 1 }));
              next();
            }}
          />
        ) : step.kind === 'phrase' ? (
          <PhraseStep
            step={step}
            say={say}
            canListen={canListen}
            onAnswer={(knew) => {
              useLearn.getState().practisePhrase(step.id, knew);
              setTally((t) => ({ ...t, phrases: t.phrases + 1, knew: t.knew + (knew ? 1 : 0) }));
              next();
            }}
          />
        ) : (
          <ListenStep
            step={step}
            say={say}
            onDone={(right) => {
              setTally((t) => ({ ...t, heard: t.heard + 1, heardRight: t.heardRight + (right ? 1 : 0) }));
              next();
            }}
          />
        )}
      </Animated.View>
    </View>
  );
}

function SpeakButton({ text, say, label = 'Play' }: { text: string; say: (text: string, slow?: boolean) => void; label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.speakRow}>
      <Pressable onPress={() => say(text)} accessibilityRole="button" accessibilityLabel={label} style={[styles.speak, { backgroundColor: colors.accentSoft }]}>
        <Icon name="speaker" size={22} color={colors.accent} />
      </Pressable>
      <Pressable onPress={() => say(text, true)} accessibilityRole="button" accessibilityLabel="Play slowly" hitSlop={8}>
        <Text variant="subhead" weight="600" color="accent" chrome>
          Slower
        </Text>
      </Pressable>
    </View>
  );
}

function CardStep({
  step,
  czechFirst,
  say,
  canListen,
  onAnswer,
}: {
  step: Extract<SessionStep, { kind: 'card' }>;
  czechFirst: boolean;
  say: (text: string, slow?: boolean) => void;
  canListen: boolean;
  onAnswer: (knew: boolean) => void;
}) {
  const { colors } = useTheme();
  const [shown, setShown] = useState(false);
  const { card } = step;
  const front = czechFirst ? card.cs : card.en;
  const back = czechFirst ? card.en : card.cs;
  return (
    <>
      <View style={[styles.face, { backgroundColor: colors.surface, boxShadow: colors.shadowRaised }]}>
        <Text variant="title1" align="center" lang={czechFirst ? 'cs' : undefined}>
          {front}
        </Text>
        {shown ? (
          <Animated.View entering={FadeIn.duration(180)} style={styles.back}>
            <View style={[styles.rule, { backgroundColor: colors.separator }]} />
            <Text variant="title3" weight="500" align="center" color="label2" lang={czechFirst ? undefined : 'cs'}>
              {back}
            </Text>
            {card.grammar ? (
              <Text variant="footnote" color="label3" align="center">
                {card.grammar}
              </Text>
            ) : null}
          </Animated.View>
        ) : null}
        {canListen && (czechFirst || shown) ? <SpeakButton text={card.cs} say={say} /> : null}
      </View>
      <View style={styles.actions}>
        {shown ? (
          <>
            <Button label="Again" variant="secondary" onPress={() => onAnswer(false)} style={styles.flex} />
            <Button label="Got it" onPress={() => onAnswer(true)} style={styles.flex} />
          </>
        ) : (
          <Button label="Show answer" onPress={() => setShown(true)} style={styles.flex} />
        )}
      </View>
    </>
  );
}

function PhraseStep({
  step,
  say,
  canListen,
  onAnswer,
}: {
  step: Extract<SessionStep, { kind: 'phrase' }>;
  say: (text: string, slow?: boolean) => void;
  canListen: boolean;
  onAnswer: (knew: boolean) => void;
}) {
  const { colors } = useTheme();
  const [shown, setShown] = useState(false);
  return (
    <>
      <View style={[styles.face, { backgroundColor: colors.surface, boxShadow: colors.shadowRaised }]}>
        <Text variant="footnote" weight="600" color="label3" align="center">
          How would you say it in Czech?
        </Text>
        <Text variant="title2" align="center">
          {step.phrase.en}
        </Text>
        {shown ? (
          <Animated.View entering={FadeIn.duration(180)} style={styles.back}>
            <View style={[styles.rule, { backgroundColor: colors.separator }]} />
            <Text variant="title2" align="center" color="accent" lang="cs">
              {step.phrase.cs}
            </Text>
            {canListen ? <SpeakButton text={step.phrase.cs} say={say} /> : null}
          </Animated.View>
        ) : (
          <Text variant="footnote" color="label3" align="center">
            Say it out loud, then check.
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        {shown ? (
          <>
            <Button label="Not yet" variant="secondary" onPress={() => onAnswer(false)} style={styles.flex} />
            <Button label="I knew it" onPress={() => onAnswer(true)} style={styles.flex} />
          </>
        ) : (
          <Button
            label="Show the Czech"
            onPress={() => {
              setShown(true);
              if (canListen) say(step.phrase.cs);
            }}
            style={styles.flex}
          />
        )}
      </View>
    </>
  );
}

function ListenStep({
  step,
  say,
  onDone,
}: {
  step: Extract<SessionStep, { kind: 'listen' }>;
  say: (text: string, slow?: boolean) => void;
  onDone: (right: boolean) => void;
}) {
  const { colors } = useTheme();
  const { item } = step;
  const [chosen, setChosen] = useState<number | null>(null);
  // Each one plays as it appears.
  useEffect(() => {
    say(item.say);
  }, [item, say]);
  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const ok = i === item.answer;
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    announce(ok ? 'Right' : `Not quite. It was ${item.options[item.answer]}`);
  };
  return (
    <>
      <View style={[styles.face, { backgroundColor: colors.surface, boxShadow: colors.shadowRaised }]}>
        <Text variant="footnote" weight="600" color="label3" align="center">
          What does it mean?
        </Text>
        <SpeakButton text={item.say} say={say} label="Play again" />
        {chosen !== null ? (
          <Animated.View entering={FadeIn.duration(180)} style={styles.back}>
            <Text variant="headline" align="center" lang="cs">
              {item.reveal.cs}
            </Text>
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.options}>
        {item.options.map((o, i) => {
          const state = chosen === null ? 'idle' : i === item.answer ? 'right' : i === chosen ? 'wrong' : 'idle';
          return (
            <Pressable
              key={o}
              onPress={() => pick(i)}
              disabled={chosen !== null}
              accessibilityRole="button"
              accessibilityState={{ selected: chosen === i }}
              style={[
                styles.option,
                {
                  backgroundColor: state === 'right' ? colors.successSoft : state === 'wrong' ? colors.dangerSoft : colors.surface,
                  borderColor: state === 'right' ? colors.success : state === 'wrong' ? colors.danger : colors.separator,
                },
              ]}>
              <Text variant="callout" weight="500">
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {chosen !== null ? (
        <View style={styles.actions}>
          <Button label="Next" onPress={() => onDone(chosen === item.answer)} style={styles.flex} />
        </View>
      ) : null}
    </>
  );
}

function Finished({ situationId, tally }: { situationId: string; tally: { cards: number; phrases: number; knew: number; heard: number; heardRight: number } }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const situation = situationById(situationId)!;
  const days = useLearn((s) => s.days);
  const memory = useLearn((s) => s.phrases);
  const { known, total } = situationProgress(situation, memory);
  const run = streak(days);
  const lines = [
    tally.cards ? `${tally.cards} ${tally.cards === 1 ? 'word' : 'words'} reviewed` : '',
    tally.phrases ? `${tally.knew} of ${tally.phrases} phrases known` : '',
    tally.heard ? `${tally.heardRight} of ${tally.heard} heard right` : '',
  ].filter(Boolean);

  return (
    <ScrollView contentContainerStyle={[styles.finished, { paddingBottom: insets.bottom + space.xxl }]}>
      <Animated.View entering={reduceMotion ? FadeIn : FadeIn.springify()} style={[styles.badge, { backgroundColor: colors.successSoft }]}>
        <Icon name="check" size={36} color={colors.success} />
      </Animated.View>
      <Text variant="title1" align="center" accessibilityRole="header">
        Done for today
      </Text>
      <Text variant="callout" color="label2" align="center">
        {lines.join(' · ')}
      </Text>

      <View style={[styles.summary, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <View style={styles.summaryRow}>
          <Icon name="flame" size={20} color={colors.warning} />
          <Text variant="headline" style={styles.flex}>
            {run} {run === 1 ? 'day' : 'days'} in a row
          </Text>
        </View>
        <View style={[styles.rule, { backgroundColor: colors.separator }]} />
        <View style={styles.summaryRow}>
          <Icon name={situation.icon} size={20} color={colors.accent} />
          <View style={styles.flex}>
            <Text variant="headline">{situation.title}</Text>
            <Text variant="footnote" color="label2">
              {known} of {total} phrases you can say
            </Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { width: `${Math.round((known / total) * 100)}%`, backgroundColor: colors.accent }]} />
        </View>
      </View>

      <Button label="Back to Learn" onPress={() => router.back()} />
      <Button
        label={`See all ${situation.title.toLowerCase()} phrases`}
        variant="secondary"
        onPress={() => router.replace({ pathname: '/prepare/[id]', params: { id: situation.id } })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.gutter, paddingTop: space.sm, gap: space.sm },
  progress: { flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  kicker: { marginTop: space.xs },
  stage: { flex: 1, justifyContent: 'center', gap: space.lg },
  face: {
    borderRadius: radius.card + 4,
    borderCurve: 'continuous',
    padding: space.xxl,
    gap: space.md,
    minHeight: 260,
    justifyContent: 'center',
  },
  back: { gap: space.md, alignItems: 'center' },
  rule: { height: StyleSheet.hairlineWidth, alignSelf: 'stretch' },
  speakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.lg },
  speak: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: space.md },
  flex: { flex: 1 },
  options: { gap: space.sm },
  option: { minHeight: 52, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.lg, justifyContent: 'center' },
  finished: { padding: layout.gutter, gap: space.lg, alignItems: 'stretch', paddingTop: space.huge },
  badge: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  summary: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
});
