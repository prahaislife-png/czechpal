import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView, SpeakRow, type Say } from '@/components/academy/exercise';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { lessonById } from '@/lib/academy/lessons';
import { lessonSecure, PASS, RETEST_DAYS } from '@/lib/academy/roadmap';
import { topicById } from '@/lib/academy/topics';
import type { Lesson } from '@/lib/academy/types';
import { useRecordingPlayer } from '@/lib/academy/audio';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';


/**
 * A lesson, in order: the goal and a little new Czech, a short scene, guided practice, then an
 * independent check that counts. With ?retest=1 only the check runs again.
 */
export default function A2LessonScreen() {
  const { id, retest } = useLocalSearchParams<{ id: string; retest?: string }>();
  const lesson = lessonById(id);
  const voice = useCzechVoice();

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
      <Stack.Screen options={{ title: retest ? 'Check again' : (topicById(lesson.topic)?.title ?? ''), headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : <Player lesson={lesson} retest={retest === '1'} canListen={voice.state === 'available'} voice={voice.voice} />}
    </>
  );
}

type Step = { kind: 'intro' } | { kind: 'scene' } | { kind: 'practise'; i: number } | { kind: 'checkIntro' } | { kind: 'check'; i: number };

function stepsFor(lesson: Lesson, retest: boolean, canListen: boolean): Step[] {
  // Without a Czech voice, listening items can't be answered; leave them out.
  const ok = (e: Lesson['check'][number]) => canListen || !(e.kind === 'choice' && e.listen);
  const practise = lesson.practise.map((e, i) => ({ e, i })).filter(({ e }) => ok(e));
  const check = lesson.check.map((e, i) => ({ e, i })).filter(({ e }) => ok(e));
  return [
    ...(retest ? [] : ([{ kind: 'intro' }, { kind: 'scene' }, ...practise.map(({ i }) => ({ kind: 'practise', i }))] as Step[])),
    { kind: 'checkIntro' },
    ...check.map(({ i }) => ({ kind: 'check', i }) as Step),
  ];
}

function Player({ lesson, retest, canListen, voice }: { lesson: Lesson; retest: boolean; canListen: boolean; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const [steps] = useState(() => stepsFor(lesson, retest, canListen));
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

  if (done) return <Finished lesson={lesson} score={score} />;

  const step = steps[index];
  const next = () => setIndex((i) => i + 1);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.progress} accessibilityLabel={`Step ${index + 1} of ${steps.length}`}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={index} entering={FadeInRight.duration(220)} style={styles.stage}>
          {step.kind === 'intro' ? (
            <Intro lesson={lesson} say={say} canListen={canListen} onNext={next} />
          ) : step.kind === 'scene' ? (
            <Scene lesson={lesson} say={say} canListen={canListen} onNext={next} />
          ) : step.kind === 'checkIntro' ? (
            <CheckIntro retest={retest} onNext={next} />
          ) : (
            <>
              <Text variant="footnote" weight="600" color="label3">
                {step.kind === 'practise' ? 'PRACTICE · HINTS AND RETRIES ALLOWED' : 'CHECK · ONE TRY, COUNTS TOWARDS PROGRESS'}
              </Text>
              <ExerciseView
                exercise={step.kind === 'practise' ? lesson.practise[step.i] : lesson.check[step.i]}
                mode={step.kind === 'practise' ? 'practise' : 'check'}
                canListen={canListen}
                say={say}
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

function Intro({ lesson, say, canListen, onNext }: { lesson: Lesson; say: Say; canListen: boolean; onNext: () => void }) {
  const { colors } = useTheme();
  return (
    <>
      <Text variant="footnote" weight="600" color="accent">
        {lesson.level} · {topicById(lesson.topic)?.cs}
      </Text>
      <Text variant="title1" accessibilityRole="header">
        {lesson.title}
      </Text>
      <Text variant="callout" color="label2">
        {lesson.goal}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {lesson.introduce.map((p, i) => (
          <View key={p.cs}>
            {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
            <View style={styles.phrase}>
              <View style={styles.flex}>
                <Text variant="headline" lang="cs">
                  {p.cs}
                </Text>
                <Text variant="subhead" color="label2">
                  {p.en}
                </Text>
              </View>
              {canListen ? <SpeakRow text={p.cs} say={say} canListen compact /> : null}
            </View>
          </View>
        ))}
      </View>
      <Button label="Next" onPress={onNext} />
    </>
  );
}

function Scene({ lesson, say, canListen, onNext }: { lesson: Lesson; say: Say; canListen: boolean; onNext: () => void }) {
  const { colors } = useTheme();
  const [shown, setShown] = useState(false);
  const all = lesson.context.map((l) => l.cs).join(' ');
  return (
    <>
      <Text variant="title2" accessibilityRole="header">
        In context
      </Text>
      {canListen ? <SpeakRow text={all} say={say} canListen /> : null}
      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {lesson.context.map((l, i) => (
          <View key={i} style={styles.line}>
            {l.speaker ? (
              <Text variant="footnote" weight="700" color="accent">
                {l.speaker}
              </Text>
            ) : null}
            <Text variant="body" lang="cs">
              {l.cs}
            </Text>
            {shown ? (
              <Animated.View entering={FadeIn.duration(160)}>
                <Text variant="subhead" color="label2">
                  {l.en}
                </Text>
              </Animated.View>
            ) : null}
          </View>
        ))}
      </View>
      <View style={styles.row}>
        <Button label={shown ? 'Hide English' : 'Show English'} variant="secondary" onPress={() => setShown((s) => !s)} style={styles.flex} />
        <Button label="Practise" onPress={onNext} style={styles.flex} />
      </View>
    </>
  );
}

function CheckIntro({ retest, onNext }: { retest: boolean; onNext: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name="flag" size={28} color={colors.accent} />
      </View>
      <Text variant="title2" align="center" accessibilityRole="header">
        {retest ? 'Check it again' : 'Now on your own'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {retest
          ? 'The same check, a few days later. Passing it again shows it has stuck.'
          : `A short check: one try each, no hints. At ${Math.round(PASS * 100)}% it passes; passing again ${RETEST_DAYS} days later masters the lesson.`}
      </Text>
      <Button label="Start the check" onPress={onNext} />
    </View>
  );
}

function Finished({ lesson, score }: { lesson: Lesson; score: { right: number; total: number } }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const runs = useAcademy((s) => s.lessons[lesson.id]);
  const secure = lessonSecure(runs);
  const pass = score.total === 0 || score.right / score.total >= PASS;
  return (
    <ScrollView contentContainerStyle={[styles.finished, { paddingBottom: insets.bottom + space.xxl }]}>
      <Animated.View entering={FadeIn} style={[styles.badge, { backgroundColor: pass ? colors.successSoft : colors.warningSoft }]}>
        <Icon name={pass ? 'check' : 'refresh'} size={32} color={pass ? colors.success : colors.warning} />
      </Animated.View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {secure ? 'Mastered' : pass ? 'Passed' : 'Lesson done'}
      </Text>
      <Text variant="title3" align="center" color="label2" tabular>
        {score.total ? `${score.right} of ${score.total} right in the check` : 'Your written answer is saved.'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {secure
          ? 'You passed this check twice, days apart. It counts as mastered.'
          : pass
            ? `It comes back in your plan in ${RETEST_DAYS} days. Pass it again then and it’s mastered.`
            : 'It comes back in your plan tomorrow. Look over the phrases again before then.'}
      </Text>
      <Button label="Back to the plan" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  card: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.md },
  phrase: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  line: { gap: 2, paddingVertical: space.sm },
  row: { flexDirection: 'row', gap: space.sm },
  center: { gap: space.lg, paddingTop: space.xxl },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  finished: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg },
});
