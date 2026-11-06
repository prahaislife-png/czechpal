import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { EXAM_PLAYS, gradeItem, isWriteItem, itemMeta, itemOptions, LETTERS, scoreSet, taskSetById, type Answers } from '@/lib/academy/tasks';
import type { TaskItem, TaskSet } from '@/lib/academy/types';
import { examTasks } from '@/lib/learn/exam';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLOW = 0.55;
type Mode = 'learn' | 'exam';

/**
 * Practice in the exam's own format. Learn mode marks each answer at once and lets you replay and
 * slow a recording down; exam mode plays each recording twice, as in the exam, and marks at the end.
 */
export default function TaskScreen() {
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
  return (
    <>
      <Stack.Screen options={{ title, headerLeft: () => <HeaderCloseButton /> }} />
      {set.part === 'listening' && voice.state === 'checking' ? null : set.part === 'listening' && voice.state === 'missing' ? (
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
  const say = useCallback((text: string, slow = false) => speak(text, { voice, rate: slow ? SLOW : rate }), [voice, rate]);
  useFocusEffect(useCallback(() => stopSpeaking, []));

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
          {set.audio ? <Recording label="Voice message" playsUsed={plays.set ?? 0} mode={mode} onPlay={(slow) => play('set', set.audio!, slow)} /> : null}
          {item.text ? <Passage text={item.text} /> : null}
          {item.audio ? <Recording label="Recording" playsUsed={plays[item.id] ?? 0} mode={mode} onPlay={(slow) => play(item.id, item.audio!, slow)} /> : null}
          <Text variant="title3" lang="cs" accessibilityRole="header">
            {item.prompt}
          </Text>
          <ItemAnswer key={item.id} set={set} item={item} mode={mode} onCommit={commit} committed={answers[item.id]} />
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

function Passage({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.passage, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Text variant="body" lang="cs">
        {text}
      </Text>
    </View>
  );
}

function Recording({ label, playsUsed, mode, onPlay }: { label: string; playsUsed: number; mode: Mode; onPlay: (slow: boolean) => void }) {
  const { colors } = useTheme();
  const left = EXAM_PLAYS - playsUsed;
  const blocked = mode === 'exam' && left <= 0;
  return (
    <View style={[styles.recording, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <Pressable
        onPress={() => onPlay(false)}
        disabled={blocked}
        accessibilityRole="button"
        accessibilityLabel={`Play ${label.toLowerCase()}`}
        accessibilityState={{ disabled: blocked }}
        style={[styles.play, { backgroundColor: blocked ? colors.fill : colors.accentFill }]}>
        <Icon name="play" size={22} color={blocked ? colors.label3 : colors.onAccent} />
      </Pressable>
      <View style={styles.flex}>
        <Text variant="headline">{label}</Text>
        <Text variant="footnote" color="label2">
          {mode === 'exam' ? (left > 0 ? `${left} ${left === 1 ? 'play' : 'plays'} left` : 'Played twice') : 'Play as often as you like'}
        </Text>
      </View>
      {mode === 'learn' ? (
        <Pressable onPress={() => onPlay(true)} accessibilityRole="button" accessibilityLabel="Play slowly" hitSlop={8}>
          <Text variant="subhead" weight="600" color="accent" chrome>
            Slower
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function ItemAnswer({
  set,
  item,
  mode,
  committed,
  onCommit,
}: {
  set: TaskSet;
  item: TaskItem;
  mode: Mode;
  committed: number | string | undefined;
  onCommit: (a: number | string) => void;
}) {
  const { colors } = useTheme();
  const [typed, setTyped] = useState('');
  const shown = mode === 'learn' && committed !== undefined;
  const locked = mode === 'learn' && committed !== undefined;
  const result = committed !== undefined ? gradeItem(item, committed) : null;

  useEffect(() => {
    if (!shown || !result) return;
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(result.correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    announce(result.correct ? 'Right' : 'Not quite');
  }, [shown]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isWriteItem(item))
    return (
      <View style={styles.answer}>
        <TextInput
          value={mode === 'exam' ? String(committed ?? '') : committed !== undefined ? String(committed) : typed}
          onChangeText={(t) => (mode === 'exam' ? onCommit(t.trim() ? t : '') : setTyped(t))}
          editable={!locked}
          placeholder="Write the information in Czech"
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="done"
          onSubmitEditing={() => mode === 'learn' && typed.trim() && onCommit(typed.trim())}
          accessibilityLabel="Your answer"
          placeholderTextColor={colors.label3}
          style={[
            styles.input,
            ramp.body,
            { color: colors.label, backgroundColor: colors.surface, borderColor: shown ? (result!.correct ? colors.success : colors.danger) : colors.separator },
          ]}
        />
        {mode === 'learn' && committed === undefined ? <Button label="Check" disabled={!typed.trim()} onPress={() => onCommit(typed.trim())} /> : null}
        {shown ? <Feedback ok={result!.correct} title={result!.correct ? 'Right' : `For example: ${item.accept![0]}`} body={(result!.accentsOnly ? 'Only the accents differ. ' : '') + item.explain} /> : null}
      </View>
    );

  const options = itemOptions(set, item);
  const icons = item.options ? undefined : set.choices?.map((c) => c.icon as IconName | undefined);
  return (
    <View style={styles.answer} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const chosen = committed === i;
        const state = !shown ? (chosen ? 'chosen' : 'idle') : i === item.answer ? 'right' : chosen ? 'wrong' : 'idle';
        return (
          <Pressable
            key={i}
            onPress={() => onCommit(i)}
            disabled={locked}
            accessibilityRole="radio"
            accessibilityState={{ checked: chosen, disabled: locked }}
            accessibilityLabel={`${LETTERS[i]}: ${o}`}
            style={({ pressed }) => [
              styles.option,
              {
                backgroundColor:
                  state === 'right' ? colors.successSoft : state === 'wrong' ? colors.dangerSoft : state === 'chosen' ? colors.accentSoft : pressed ? colors.fill : colors.surface,
                borderColor: state === 'right' ? colors.success : state === 'wrong' ? colors.danger : state === 'chosen' ? colors.accent : colors.separator,
              },
            ]}>
            <Text variant="headline" color="accent" style={styles.letter}>
              {LETTERS[i]}
            </Text>
            {icons?.[i] ? <Icon name={icons[i]!} size={22} color={colors.label2} /> : null}
            <Text variant="callout" weight="500" lang="cs" style={styles.flex}>
              {o}
            </Text>
          </Pressable>
        );
      })}
      {shown ? <Feedback ok={result!.correct} title={result!.correct ? 'Right' : `It’s ${LETTERS[item.answer!]}`} body={item.explain} /> : null}
      {mode === 'exam' && committed !== undefined ? (
        <Text variant="footnote" color="label3">
          You can change it until you go on. Answers are marked at the end.
        </Text>
      ) : null}
    </View>
  );
}

function Feedback({ ok, title, body }: { ok: boolean; title: string; body: string }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(160)} style={[styles.feedback, { backgroundColor: ok ? colors.successSoft : colors.dangerSoft }]} accessibilityLiveRegion="polite">
      <View style={styles.row}>
        <Icon name={ok ? 'checkCircle' : 'alert'} size={20} color={ok ? colors.success : colors.danger} />
        <Text variant="headline" style={styles.flex}>
          {title}
        </Text>
      </View>
      <Text variant="callout" color="label2">
        {body}
      </Text>
    </Animated.View>
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
      <View style={[styles.review, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {set.items.map((item, i) => {
          const a = answers[item.id];
          const r = gradeItem(item, a);
          const yours = a === undefined ? '—' : typeof a === 'number' ? `${LETTERS[a]}: ${itemOptions(set, item)[a]}` : a;
          const correct = item.accept ? item.accept[0] : `${LETTERS[item.answer!]}: ${itemOptions(set, item)[item.answer!]}`;
          return (
            <View key={item.id}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <View style={styles.reviewRow}>
                <Icon name={r.correct ? 'checkCircle' : 'alert'} size={20} color={r.correct ? colors.success : colors.danger} />
                <View style={styles.flex}>
                  <Text variant="subhead" weight="600" lang="cs">
                    {item.prompt}
                  </Text>
                  <Text variant="footnote" color="label2" lang="cs">
                    You: {yours}
                  </Text>
                  {!r.correct ? (
                    <Text variant="footnote" color="success" lang="cs">
                      Right: {correct}
                    </Text>
                  ) : null}
                  {!r.correct || mode === 'exam' ? (
                    <Text variant="footnote" color="label3">
                      {item.explain}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Button label="Done" onPress={() => router.back()} />
      <Button label="Do it again" variant="secondary" onPress={() => router.replace({ pathname: '/a2-task/[id]', params: { id: set.id } })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter, gap: space.md },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  intro: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  passage: { borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.lg },
  recording: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.md },
  play: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  answer: { gap: space.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 56,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1.5,
  },
  letter: { width: 20 },
  input: { minHeight: 52, borderWidth: 1.5, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md },
  feedback: { borderRadius: radius.tile, padding: space.lg, gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  review: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg },
  reviewRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.md },
});
