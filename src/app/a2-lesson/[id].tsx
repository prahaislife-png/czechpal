import { gatedStep } from '@/components/plus/gate';
import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView, type Say } from '@/components/academy/exercise';
import { Dialogue, MatchPairs, PhraseCard, QuickPickView } from '@/components/academy/lesson-parts';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { useRecordingPlayer } from '@/lib/academy/audio';
import { stepLabel } from '@/lib/academy/journey';
import { lessonSteps, lessonWords, shortForm } from '@/lib/academy/lesson-steps';
import { lessonById } from '@/lib/academy/lessons';
import { lessonSecure, PASS, RETEST_DAYS } from '@/lib/academy/roadmap';
import { topicById } from '@/lib/academy/topics';
import type { Lesson } from '@/lib/academy/types';
import { nodeHref, useJourney } from '@/lib/academy/use-plan';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * A lesson, taught in small steps: each new phrase on its own, a quick pick and a matching game
 * to let them settle, the phrases in a conversation, guided practice, then a short check. Answers
 * are built from word tiles, so nothing depends on finding accents on a keyboard. With ?retest=1,
 * or after "Try the check again", only the check runs.
 */
function A2LessonScreen() {
  const { id, retest } = useLocalSearchParams<{ id: string; retest?: string }>();
  const lesson = lessonById(id);
  const voice = useCzechVoice();
  // Another go at the check, straight after a lesson: the same screen, started over.
  const [again, setAgain] = useState(0);
  const checkOnly = retest === '1' || again > 0;

  if (!lesson)
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2" align="center">
          This lesson isn’t available.
        </Text>
      </View>
    );

  return (
    <>
      <Stack.Screen options={{ title: checkOnly ? 'Check again' : (topicById(lesson.topic)?.title ?? ''), headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : (
        <Player
          key={`${lesson.id}:${again}`}
          lesson={lesson}
          retest={checkOnly}
          canListen={voice.state === 'available'}
          voice={voice.voice}
          onRetry={() => setAgain((n) => n + 1)}
        />
      )}
    </>
  );
}

function Player({ lesson, retest, canListen, voice, onRetry }: { lesson: Lesson; retest: boolean; canListen: boolean; voice?: string; onRetry: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const [steps] = useState(() => lessonSteps(lesson, { retest, canListen }));
  const words = useMemo(() => lessonWords(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const done = index >= steps.length;
  // A recorded voice when the text has one; the phone's Czech voice otherwise.
  const recording = useRecordingPlayer({ voice, rate });
  const say = useCallback<Say>((text, slow = false) => recording.play(text, slow), [recording]);
  useFocusEffect(useCallback(() => recording.stop, [recording]));

  useEffect(() => {
    useAcademy.getState().startLesson(lesson.id);
  }, [lesson.id]);

  useEffect(() => {
    if (!done) return;
    useAcademy.getState().finishLesson(lesson.id, score.right, score.total);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    announce('Lesson finished');
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (done) return <Finished lesson={lesson} score={score} onRetry={onRetry} />;

  const step = steps[index];
  const next = () => setIndex((i) => i + 1);
  const checks = steps.filter((s) => s.kind === 'check');

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={[styles.track, { backgroundColor: colors.fill }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: steps.length, now: index }}>
        <View style={[styles.fill, { backgroundColor: colors.accent, width: `${(index / steps.length) * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={index} entering={FadeInRight.duration(220)} style={styles.stage}>
          {step.kind === 'start' ? (
            <Start lesson={lesson} onNext={next} />
          ) : step.kind === 'phrase' ? (
            <PhraseCard phrase={lesson.introduce[step.i]} n={step.i + 1} of={lesson.introduce.length} say={say} canListen={canListen} onNext={next} />
          ) : step.kind === 'pick' ? (
            <QuickPickView pick={step.pick} onNext={next} />
          ) : step.kind === 'match' ? (
            <MatchPairs lesson={lesson} onNext={next} />
          ) : step.kind === 'scene' ? (
            <Dialogue lesson={lesson} say={say} canListen={canListen} onNext={next} />
          ) : step.kind === 'checkIntro' ? (
            <CheckIntro retest={retest} questions={checks.length} onNext={next} />
          ) : (
            <>
              <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
                {step.kind === 'practise' ? 'PRACTICE · TRY AS OFTEN AS YOU LIKE' : `CHECK · ${checks.indexOf(step) + 1} OF ${checks.length}`}
              </Text>
              <ExerciseView
                exercise={step.kind === 'practise' ? lesson.practise[step.i] : lesson.check[step.i]}
                mode={step.kind === 'practise' ? 'practise' : 'check'}
                canListen={canListen}
                say={say}
                words={words}
                onAnswered={(correct) => {
                  const e = step.kind === 'practise' ? lesson.practise[step.i] : lesson.check[step.i];
                  useAcademy.getState().record({ ...e, topic: lesson.topic }, correct, step.kind === 'practise' ? 'practise' : 'check');
                  if (step.kind === 'check' && correct !== null) setScore((s) => ({ right: s.right + (correct ? 1 : 0), total: s.total + 1 }));
                }}
                onNext={next}
              />
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

/** What the lesson is for and what's in it, before anything is asked. */
function Start({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  const { colors } = useTheme();
  const parts: { icon: 'cards' | 'message' | 'check' | 'clock'; text: string }[] = [
    { icon: 'cards', text: `${lesson.introduce.length} new phrases, one at a time` },
    { icon: 'message', text: 'A short conversation that uses them' },
    { icon: 'check', text: 'Practice, then a quick check' },
    { icon: 'clock', text: 'About 6 minutes' },
  ];
  return (
    <>
      <Text variant="footnote" weight="600" color="accent" style={styles.eyebrow}>
        {topicById(lesson.topic)?.cs.toUpperCase()}
      </Text>
      <Text variant="title1" accessibilityRole="header">
        {lesson.title}
      </Text>
      <Text variant="callout" color="label2">
        {lesson.goal}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {parts.map((p) => (
          <View key={p.text} style={styles.part}>
            <View style={[styles.partIcon, { backgroundColor: colors.accentSoft }]}>
              <Icon name={p.icon} size={16} color={colors.accent} />
            </View>
            <Text variant="callout" style={styles.flex}>
              {p.text}
            </Text>
          </View>
        ))}
      </View>
      <Button label="Start" icon="play" onPress={onNext} />
    </>
  );
}

function CheckIntro({ retest, questions, onNext }: { retest: boolean; questions: number; onNext: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name="flag" size={28} color={colors.accent} />
      </View>
      <Text variant="title2" align="center" accessibilityRole="header">
        {retest ? 'The check again' : 'A quick check'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {retest
          ? `The same ${questions} questions. Getting them again, days later, is what makes it stick.`
          : `${questions} questions on what you just practised, without hints this time. One slip is fine.`}
      </Text>
      <Button label="Start the check" onPress={onNext} />
    </View>
  );
}

/** The end of a lesson: how it went, what the learner can say now, and straight on to the next step. */
function Finished({ lesson, score, onRetry }: { lesson: Lesson; score: { right: number; total: number }; onRetry: () => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const runs = useAcademy((s) => s.lessons[lesson.id]);
  const secure = lessonSecure(runs);
  const pass = score.total === 0 || score.right / score.total >= PASS;
  const journey = useJourney();
  // The step after this one; a lesson being checked again isn't offered as its own next step.
  const next = journey.next && journey.next.node.id !== lesson.id ? journey.next : null;
  const nextButton = next ? (
    <Button label={`Next: ${next.node.title}`} icon="arrowRight" variant={pass ? 'primary' : 'secondary'} onPress={() => router.replace(nodeHref(next.node))} />
  ) : null;

  return (
    <ScrollView contentContainerStyle={[styles.finished, { paddingBottom: insets.bottom + space.xxl }]}>
      <Animated.View entering={FadeIn} style={[styles.badge, { backgroundColor: pass ? colors.successSoft : colors.accentSoft }]}>
        <Icon name={pass ? 'check' : 'refresh'} size={32} color={pass ? colors.success : colors.accent} />
      </Animated.View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {secure ? 'Mastered' : pass ? 'Lesson complete' : 'Nearly there'}
      </Text>
      {score.total ? (
        <Text variant="title3" align="center" color="label2" tabular>
          {score.right} of {score.total} right in the check
        </Text>
      ) : null}
      <Text variant="callout" color="label2" align="center">
        {secure
          ? 'You got this check right twice, days apart. It has stuck.'
          : pass
            ? `It comes back once more in ${RETEST_DAYS} days, to make sure it has stuck.`
            : 'One more go at the check usually does it. Your phrases are below if you want a look first.'}
      </Text>

      <View style={[styles.card, styles.learnt, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
          {pass ? 'YOU CAN NOW SAY' : 'THIS LESSON’S PHRASES'}
        </Text>
        {lesson.introduce.map((p) => (
          <View key={p.cs} style={styles.learntRow}>
            <Icon name="check" size={16} color={pass ? colors.success : colors.label3} />
            <View style={styles.flex}>
              <Text variant="callout" weight="600" lang="cs">
                {shortForm(p.cs)}
              </Text>
              <Text variant="footnote" color="label2">
                {p.en}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.finishedActions}>
        {next ? (
          <Text variant="footnote" weight="600" color="label3" align="center" style={styles.eyebrow}>
            NEXT · UNIT {next.unit.n} · {stepLabel(next.node).toUpperCase()}
          </Text>
        ) : null}
        {pass ? nextButton : <Button label="Try the check again" icon="refresh" onPress={onRetry} />}
        {pass ? null : nextButton}
        <Button label="Back to Learn" variant="plain" onPress={() => router.back()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginHorizontal: layout.gutter, marginTop: space.sm },
  fill: { height: 6, borderRadius: 3 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  eyebrow: { letterSpacing: 0.8 },
  card: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.md },
  part: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  partIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  center: { gap: space.lg, paddingTop: space.xxl },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  finished: { padding: layout.gutter, paddingTop: space.xxxl, gap: space.md },
  learnt: { alignSelf: 'stretch', marginTop: space.md },
  learntRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  finishedActions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.md },
});

export default gatedStep(A2LessonScreen);
