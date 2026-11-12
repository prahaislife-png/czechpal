import { gatedStep } from '@/components/plus/gate';
import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerReview, ItemAnswer, Passage, Recording, type TaskMode } from '@/components/academy/task-parts';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { EXAM_PLAYS, gradeItem, itemMeta, scoreSet, taskSetById, type Answers } from '@/lib/academy/tasks';
import type { TaskSet } from '@/lib/academy/types';
import { examTasks } from '@/lib/learn/exam';
import { allRecorded, recordingFor, setTexts, useRecordingPlayer } from '@/lib/academy/audio';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Mode = TaskMode;

/**
 * Practice in the exam's own format. Learn mode marks each answer at once and lets you replay and
 * slow a recording down; exam mode plays each recording twice, as in the exam, and marks at the end.
 */
function TaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const set = taskSetById(id);
  const voice = useCzechVoice();

  if (!set)
    return (
      <Centered>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2" align="center">
          This practice isn’t available.
        </Text>
      </Centered>
    );

  const title = `${set.part === 'reading' ? 'Reading' : 'Listening'} ${set.task}`;
  // With every recording in the app, listening doesn't need the phone's own Czech voice.
  const recorded = set.part === 'listening' && allRecorded(setTexts(set));
  return (
    <>
      <Stack.Screen options={{ title, headerLeft: () => <HeaderCloseButton /> }} />
      {set.part === 'listening' && !recorded && voice.state === 'checking' ? null : set.part === 'listening' && !recorded && voice.state === 'missing' ? (
        <Centered>
          <NoVoice />
          <Text variant="title3" align="center">
            No Czech voice on this phone
          </Text>
          <Text variant="callout" color="label2" align="center">
            Listening uses your phone’s own Czech voice. On iPhone, add one in Settings › Accessibility › Spoken Content › Voices › Czech, then come back.
          </Text>
        </Centered>
      ) : (
        <Player set={set} voice={voice.voice} />
      )}
    </>
  );
}

function NoVoice() {
  const { colors } = useTheme();
  return <Icon name="speaker" size={32} color={colors.label3} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

function Player({ set, voice }: { set: TaskSet; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const [mode, setMode] = useState<Mode>('learn');
  const [index, setIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [plays, setPlays] = useState<Record<string, number>>({});
  const done = index >= set.items.length;
  const recording = useRecordingPlayer({ voice, rate });
  const say = useCallback((text: string, slow = false) => recording.play(text, slow), [recording]);
  useFocusEffect(useCallback(() => recording.stop, [recording]));

  const play = (key: string, text: string, slow = false) => {
    if (mode === 'exam' && (plays[key] ?? 0) >= EXAM_PLAYS) return;
    setPlays((p) => ({ ...p, [key]: (p[key] ?? 0) + 1 }));
    say(text, slow);
  };

  useEffect(() => {
    if (!done) return;
    const { right, total } = scoreSet(set, answers);
    useAcademy.getState().finishTask(set.id, right, total, mode);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    announce(`${right} of ${total}`);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (index < 0) return <Intro set={set} mode={mode} setMode={setMode} onStart={() => setIndex(0)} />;
  if (done) return <Result set={set} answers={answers} mode={mode} />;

  const item = set.items[index];
  const record = (answer: number | string) => useAcademy.getState().record(itemMeta(set, item), gradeItem(item, answer).correct, 'task');
  // Learn mode marks the first answer at once. Exam mode, as on the answer sheet, lets it change
  // until you go on, and records it then.
  const commit = (answer: number | string) => {
    if (mode === 'learn') {
      if (answers[item.id] !== undefined) return;
      record(answer);
    }
    setAnswers((a) => ({ ...a, [item.id]: answer }));
  };
  const next = () => {
    if (mode === 'exam' && answers[item.id] !== undefined) record(answers[item.id]);
    setIndex((i) => i + 1);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.progress} accessibilityLabel={`Item ${index + 1} of ${set.items.length}`}>
        {set.items.map((_, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={item.id} entering={FadeInRight.duration(200)} style={styles.stage}>
          {set.passage ? <Passage text={set.passage} /> : null}
          {set.audio ? <Recording label="Voice message" playsUsed={plays.set ?? 0} mode={mode} recorded={recordingFor(set.audio) !== null} onPlay={(slow) => play('set', set.audio!, slow)} /> : null}
          {item.text ? <Passage text={item.text} /> : null}
          {item.audio ? <Recording label="Recording" playsUsed={plays[item.id] ?? 0} mode={mode} recorded={recordingFor(item.audio) !== null} onPlay={(slow) => play(item.id, item.audio!, slow)} /> : null}
          <Text variant="title3" lang="cs" accessibilityRole="header">
            {item.prompt}
          </Text>
          <ItemAnswer
            key={item.id}
            set={set}
            item={item}
            mode={mode}
            onCommit={commit}
            committed={answers[item.id]}
            examNote="You can change it until you go on. Answers are marked at the end."
          />
          {answers[item.id] !== undefined && answers[item.id] !== '' ? (
            <Button label={index === set.items.length - 1 ? 'See the result' : 'Next'} onPress={next} />
          ) : null}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Intro({ set, mode, setMode, onStart }: { set: TaskSet; mode: Mode; setMode: (m: Mode) => void; onStart: () => void }) {
  const { colors } = useTheme();
  const task = examTasks.find((t) => t.part === set.part && t.n === set.task);
  return (
    <ScrollView contentContainerStyle={styles.intro}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name={set.part === 'reading' ? 'book' : 'ear'} size={30} color={colors.accent} />
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {set.title}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {set.instruction}
      </Text>
      {task ? (
        <Text variant="footnote" color="label3" align="center">
          In the exam: {set.part} task {set.task}, {task.points} points.
        </Text>
      ) : null}
      <Segmented
        options={[
          { value: 'learn', label: 'Learn' },
          { value: 'exam', label: 'Like the exam' },
        ]}
        value={mode}
        onChange={setMode}
      />
      <Text variant="footnote" color="label2" align="center">
        {mode === 'learn'
          ? 'Each answer is marked straight away, with why.' + (set.part === 'listening' ? ' Play recordings as often as you like, or slower.' : '')
          : 'Answers are marked at the end.' + (set.part === 'listening' ? ` Each recording plays ${EXAM_PLAYS === 2 ? 'twice' : `${EXAM_PLAYS} times`}, as in the exam.` : '')}
      </Text>
      <Button label="Start" icon="play" onPress={onStart} />
    </ScrollView>
  );
}

function Result({ set, answers, mode }: { set: TaskSet; answers: Answers; mode: Mode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { right, total } = scoreSet(set, answers);
  const task = examTasks.find((t) => t.part === set.part && t.n === set.task);
  return (
    <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: insets.bottom + space.xxl }]}>
      <View style={[styles.badge, { backgroundColor: right / total >= 0.6 ? colors.successSoft : colors.warningSoft }]}>
        <Text variant="title2" weight="700" color={right / total >= 0.6 ? 'success' : 'warning'} tabular>
          {right}/{total}
        </Text>
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {right} of {total} right
      </Text>
      <Text variant="callout" color="label2" align="center">
        {task ? `In the exam this task gives ${task.points} points, one for each item. ` : ''}
        {mode === 'learn' ? 'Next time try it like the exam, marked at the end.' : 'Your answers count towards your readiness.'}
      </Text>
      <AnswerReview entries={set.items.map((item) => ({ set, item }))} answers={answers} explainAll={mode === 'exam'} />
      <Button label="Done" onPress={() => router.back()} />
      <Button label="Do it again" variant="secondary" onPress={() => router.replace({ pathname: '/a2-task/[id]', params: { id: set.id } })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter, gap: space.md },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  intro: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
});

export default gatedStep(TaskScreen);
