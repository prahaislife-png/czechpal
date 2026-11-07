import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerReview, ItemAnswer, Passage, Recording } from '@/components/academy/task-parts';
import { WritingFeedbackCard } from '@/components/academy/writing-feedback';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { checkWriting, clock, elapsed, markSection, mockSets, mockWriting, sectionInfo, WARN_SECONDS } from '@/lib/academy/mock';
import { EXAM_PLAYS, emailChecks, formChecks, gradeItem, itemMeta, LETTERS, type Answers } from '@/lib/academy/tasks';
import type { TaskItem, TaskSet } from '@/lib/academy/types';
import { confirm } from '@/lib/dialogs';
import { countWords, EMAIL_MIN_WORDS, FORM_MIN_WORDS } from '@/lib/learn/exam';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * One part of the mock exam, under the exam's conditions: reading and writing count down from their
 * time; listening follows its recordings, each played twice. Answers can change until you hand in.
 * When the time is up the answers are locked, as they would be collected in the exam.
 */
export default function MockSectionScreen() {
  const { section, mock } = useLocalSearchParams<{ section: string; mock: string }>();
  const run = useAcademy((s) => s.mocks.find((m) => m.id === mock));
  const voice = useCzechVoice();
  const valid = section === 'reading' || section === 'listening' || section === 'writing';
  // Whether this part was already handed in when the screen opened; its own result still shows after hand-in.
  const [started] = useState(() => !useAcademy.getState().mocks.find((m) => m.id === mock)?.[section as 'reading']);
  const title = valid ? `Mock: ${sectionInfo[section].title.toLowerCase()}` : '';

  if (!run || !valid)
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2" align="center">
          This mock exam isn’t available any more.
        </Text>
      </View>
    );
  if (run[section] && !started)
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title, headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="title3" align="center">
          Already handed in
        </Text>
        <Text variant="callout" color="label2" align="center">
          Your result for this part is on the mock exam page. To do it again, start a new mock.
        </Text>
        <Button label="Back to the mock exam" onPress={() => router.back()} />
      </View>
    );
  return (
    <>
      <Stack.Screen options={{ title, headerLeft: () => <HeaderCloseButton /> }} />
      {section === 'writing' ? (
        <WritingSection mockId={run.id} variant={run.variant ?? 1} />
      ) : section === 'listening' && voice.state === 'checking' ? null : section === 'listening' && voice.state === 'missing' ? (
        <View style={styles.centered}>
          <Text variant="title3" align="center">
            No Czech voice on this phone
          </Text>
          <Text variant="callout" color="label2" align="center">
            Listening uses your phone’s own Czech voice. On iPhone, add one in Settings › Accessibility › Spoken Content › Voices › Czech, then come back.
          </Text>
        </View>
      ) : (
        <MarkedSection mockId={run.id} part={section as 'reading' | 'listening'} voice={voice.voice} variant={run.variant ?? 1} />
      )}
    </>
  );
}

/** A clock that ticks once a second while a section runs. */
function useClock(running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  return now;
}

function Timer({ seconds, limit }: { seconds: number; limit?: number }) {
  const { colors } = useTheme();
  const left = limit === undefined ? null : limit - seconds;
  const warn = left !== null && left <= WARN_SECONDS;
  useEffect(() => {
    if (warn && left! > 0) announce('5 minutes left');
  }, [warn]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View
      style={[styles.timer, { backgroundColor: warn ? colors.warningSoft : colors.fill }]}
      accessible
      accessibilityLabel={left === null ? `${clock(seconds)} so far` : `${Math.ceil(Math.max(0, left) / 60)} minutes left`}>
      <Icon name="clock" size={14} color={warn ? colors.warning : colors.label2} />
      <Text variant="subhead" weight="600" color={warn ? 'warning' : 'label2'} tabular>
        {left === null ? clock(seconds) : left > 0 ? `${clock(left)} left` : 'Time’s up'}
      </Text>
    </View>
  );
}

function Intro({ part, onStart, extra }: { part: 'reading' | 'listening' | 'writing'; onStart: () => void; extra: string }) {
  const { colors } = useTheme();
  const info = sectionInfo[part];
  return (
    <ScrollView contentContainerStyle={styles.intro}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name={part === 'reading' ? 'book' : part === 'listening' ? 'ear' : 'compose'} size={30} color={colors.accent} />
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {info.title} · {info.cs}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {info.timed ? `${info.minutes} minutes, as in the exam. The time starts when you tap Start and keeps running if you leave the app.` : `About ${info.minutes} minutes in the exam; here the recordings set the pace.`}
      </Text>
      <Text variant="footnote" color="label2" align="center">
        {extra}
      </Text>
      <Button label="Start" icon="play" onPress={onStart} />
    </ScrollView>
  );
}

function MarkedSection({ mockId, part, voice, variant }: { mockId: string; part: 'reading' | 'listening'; voice?: string; variant: number }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const sets = mockSets(part, variant);
  const entries = sets.flatMap((set) => set.items.map((item) => ({ set, item })));
  const info = sectionInfo[part];
  const limit = info.timed ? info.minutes * 60 : undefined;

  const [startMs, setStartMs] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [plays, setPlays] = useState<Record<string, number>>({});
  const [handedIn, setHandedIn] = useState<{ seconds: number } | null>(null);
  const now = useClock(startMs !== null && !handedIn);
  useFocusEffect(useCallback(() => stopSpeaking, []));

  if (startMs === null)
    return (
      <Intro
        part={part}
        onStart={() => setStartMs(Date.now())}
        extra={
          part === 'reading'
            ? '5 tasks, 25 questions, one point each. You can go back and change answers until you hand in.'
            : `5 tasks, 25 questions, one point each. Each recording plays ${EXAM_PLAYS === 2 ? 'twice' : `${EXAM_PLAYS} times`}. Read the question before you play it.`
        }
      />
    );

  const seconds = elapsed(startMs, now);
  const timeUp = limit !== undefined && seconds >= limit;

  if (handedIn) {
    const { right, total, byTask } = markSection(sets, answers);
    return (
      <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: insets.bottom + space.xxl }]}>
        <Text variant="title1" align="center" accessibilityRole="header">
          {right} of {total}
        </Text>
        <Text variant="callout" color="label2" align="center">
          Handed in after {clock(handedIn.seconds)}{limit ? ` of ${info.minutes}:00` : ''}. One point a question, as in the exam.
        </Text>
        <Card style={styles.byTask}>
          {sets.map((s) => (
            <View key={s.id} style={styles.taskLine}>
              <Text variant="callout" style={styles.flex}>
                Task {s.task}: {s.title}
              </Text>
              <Text variant="callout" weight="600" tabular color={byTask[s.task][0] / byTask[s.task][1] < 0.6 ? 'warning' : 'label'}>
                {byTask[s.task][0]}/{byTask[s.task][1]}
              </Text>
            </View>
          ))}
        </Card>
        <AnswerReview entries={entries} answers={answers} explainAll={false} />
        <Button label="Back to the mock exam" onPress={() => router.back()} />
      </ScrollView>
    );
  }

  const { set, item } = entries[index];
  const unanswered = entries.filter((e) => answers[e.item.id] === undefined || answers[e.item.id] === '').length;

  const play = (key: string, text: string) => {
    if ((plays[key] ?? 0) >= EXAM_PLAYS) return;
    setPlays((p) => ({ ...p, [key]: (p[key] ?? 0) + 1 }));
    speak(text, { voice, rate });
  };

  const handIn = async () => {
    if (!timeUp && unanswered > 0) {
      const ok = await confirm({
        title: 'Hand in now?',
        message: `${unanswered} ${unanswered === 1 ? 'question has' : 'questions have'} no answer. In the exam they would get no points.`,
        confirmLabel: 'Hand in',
      });
      if (!ok) return;
    }
    stopSpeaking();
    const used = Math.min(seconds, limit ?? seconds);
    const store = useAcademy.getState();
    for (const e of entries) store.record(itemMeta(e.set, e.item), gradeItem(e.item, answers[e.item.id]).correct, 'mock');
    store.saveMockSection(mockId, part, { at: new Date().toISOString(), seconds: used, answers, ...markSection(sets, answers) });
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setHandedIn({ seconds: used });
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.head}>
        <Text variant="subhead" weight="600" style={styles.flex}>
          Task {set.task} · {index + 1} of {entries.length}
        </Text>
        <Timer seconds={seconds} limit={limit} />
      </View>
      <AnswerSheet entries={entries} answers={answers} index={index} onJump={(i) => !timeUp && setIndex(i)} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View key={item.id} style={styles.stage}>
          <Text variant="footnote" color="label2">
            {set.instruction}
          </Text>
          {set.passage ? <Passage text={set.passage} /> : null}
          {set.audio ? <Recording label="Voice message" playsUsed={plays[set.id] ?? 0} mode="exam" onPlay={() => play(set.id, set.audio!)} /> : null}
          {item.text ? <Passage text={item.text} /> : null}
          {item.audio ? <Recording label="Recording" playsUsed={plays[item.id] ?? 0} mode="exam" onPlay={() => play(item.id, item.audio!)} /> : null}
          <Text variant="title3" lang="cs" accessibilityRole="header">
            {item.prompt}
          </Text>
          {timeUp ? (
            <Animated.View entering={FadeIn} style={[styles.timeUp, { backgroundColor: colors.warningSoft }]}>
              <Text variant="headline" color="warning">
                Time’s up
              </Text>
              <Text variant="callout" color="label2">
                In the exam your answer sheet would be collected now. Hand in to see your result.
              </Text>
            </Animated.View>
          ) : (
            <ItemAnswer
              key={item.id}
              set={set}
              item={item}
              mode="exam"
              committed={answers[item.id]}
              onCommit={(a) => setAnswers((x) => ({ ...x, [item.id]: a }))}
              examNote="You can change it until you hand in."
            />
          )}
        </View>
      </ScrollView>
      <View style={[styles.nav, { borderTopColor: colors.separator }]}>
        <Button label="Back" variant="plain" disabled={index === 0 || timeUp} onPress={() => setIndex((i) => i - 1)} style={styles.flex} />
        {index < entries.length - 1 && !timeUp ? (
          <Button label="Next" onPress={() => setIndex((i) => i + 1)} style={styles.flex} />
        ) : (
          <Button label="Hand in" onPress={handIn} style={styles.flex} />
        )}
      </View>
      {index < entries.length - 1 && !timeUp ? (
        <Pressable onPress={handIn} accessibilityRole="button" style={styles.handInEarly} hitSlop={8}>
          <Text variant="footnote" weight="600" color="accent" chrome>
            Hand in now
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * The answer sheet: a bar with how many are answered, which opens a grid of every question
 * (44 pt cells, so each is easy to hit); tap one to go to it.
 */
function AnswerSheet({ entries, answers, index, onJump }: { entries: { set: TaskSet; item: TaskItem }[]; answers: Answers; index: number; onJump: (i: number) => void }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const answered = entries.filter((e) => answers[e.item.id] !== undefined && answers[e.item.id] !== '').length;
  return (
    <View style={styles.sheetWrap}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Answer sheet, ${answered} of ${entries.length} answered`}
        style={[styles.sheetBar, { backgroundColor: colors.fill }]}>
        <Icon name="number" size={16} color={colors.label2} />
        <Text variant="subhead" weight="600" color="label2" style={styles.flex} tabular>
          Answer sheet · {answered} of {entries.length} answered
        </Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} color={colors.label3} />
      </Pressable>
      {open ? (
        <Animated.View entering={FadeIn.duration(150)} style={styles.sheet}>
          {entries.map((e, i) => {
            const a = answers[e.item.id];
            const done = a !== undefined && a !== '';
            const here = i === index;
            const n = Number(e.item.id.split('.').pop());
            return (
              <Pressable
                key={e.item.id}
                onPress={() => {
                  onJump(i);
                  setOpen(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Question ${n}${done ? `, answered${typeof a === 'number' ? ` ${LETTERS[a]}` : ''}` : ', no answer'}`}
                accessibilityState={{ selected: here }}
                style={[styles.cell, { backgroundColor: done ? colors.accentSoft : colors.surface, borderColor: here ? colors.accent : colors.separator }]}>
                <Text variant="subhead" weight="600" color={done ? 'accent' : 'label2'} tabular>
                  {n}
                </Text>
                {typeof a === 'number' ? (
                  <Text variant="caption" color="accent">
                    {LETTERS[a]}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

function WritingSection({ mockId, variant }: { mockId: string; variant: number }) {
  const { form: mockForm, email: mockEmail } = mockWriting(variant);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const limit = sectionInfo.writing.minutes * 60;
  const questions = mockForm.questions ?? [];
  const [startMs, setStartMs] = useState<number | null>(null);
  const [form, setForm] = useState<string[]>(() => questions.map(() => ''));
  const [email, setEmail] = useState('');
  const [handedIn, setHandedIn] = useState<{ seconds: number } | null>(null);
  const now = useClock(startMs !== null && !handedIn);
  const input = [styles.input, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: colors.separator }];

  if (startMs === null)
    return (
      <Intro
        part="writing"
        onStart={() => setStartMs(Date.now())}
        extra={`A form (3 answers, at least ${FORM_MIN_WORDS} words each) and an e-mail (at least ${EMAIL_MIN_WORDS} words, a sentence for each picture). A word count is shown here; the exam has none. Nothing is checked until you hand in.`}
      />
    );

  const seconds = elapsed(startMs, now);
  const timeUp = seconds >= limit;

  const handIn = async () => {
    if (!timeUp && !(await confirm({ title: 'Hand in your writing?', message: 'You can’t change it afterwards.', confirmLabel: 'Hand in' }))) return;
    const used = Math.min(seconds, limit);
    const store = useAcademy.getState();
    store.saveMockWriting(mockId, { at: new Date().toISOString(), seconds: used, form, email, ...checkWriting(form, email, variant) });
    store.saveWriting(mockForm.id, form);
    store.saveWriting(mockEmail.id, [email]);
    setHandedIn({ seconds: used });
  };

  if (handedIn) return <WritingResult form={form} email={email} seconds={handedIn.seconds} bottom={insets.bottom} variant={variant} />;

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.head}>
        <Text variant="subhead" weight="600" style={styles.flex}>
          Writing
        </Text>
        <Timer seconds={seconds} limit={limit} />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.stage}>
          <Text variant="footnote" weight="700" color="accent">
            TASK 1 · FORM
          </Text>
          <Text variant="headline" lang="cs">
            {mockForm.instructionCs}
          </Text>
          {questions.map((q, i) => (
            <View key={q} style={styles.field}>
              <Text variant="callout" weight="600" lang="cs">
                {i + 1}. {q}
              </Text>
              <TextInput
                value={form[i]}
                onChangeText={(t) => setForm((f) => f.map((x, j) => (j === i ? t : x)))}
                editable={!timeUp}
                multiline
                autoCorrect={false}
                spellCheck={false}
                accessibilityLabel={`Answer ${i + 1}`}
                style={input}
              />
              <Text variant="caption" color="label3" tabular>
                {countWords(form[i])} words
              </Text>
            </View>
          ))}

          <Text variant="footnote" weight="700" color="accent" style={styles.taskGap}>
            TASK 2 · E-MAIL
          </Text>
          <Text variant="headline" lang="cs">
            {mockEmail.instructionCs}
          </Text>
          <View style={styles.pictures}>
            {(mockEmail.pictures ?? []).map((p) => (
              <View key={p.question} style={[styles.picture, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
                <Icon name={p.icon as IconName} size={24} color={colors.accent} />
                <Text variant="caption" align="center" lang="cs">
                  {p.question}
                </Text>
              </View>
            ))}
          </View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            editable={!timeUp}
            multiline
            autoCorrect={false}
            spellCheck={false}
            accessibilityLabel="Your e-mail in Czech"
            style={[input, styles.email]}
          />
          <Text variant="caption" color="label3" tabular>
            {countWords(email)} words
          </Text>
          {timeUp ? (
            <View style={[styles.timeUp, { backgroundColor: colors.warningSoft }]}>
              <Text variant="headline" color="warning">
                Time’s up
              </Text>
              <Text variant="callout" color="label2">
                In the exam your paper would be collected now. Hand in to see the checks.
              </Text>
            </View>
          ) : null}
          <Button label="Hand in" onPress={handIn} disabled={!timeUp && !email.trim() && form.every((f) => !f.trim())} />
        </View>
      </ScrollView>
    </View>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.check}>
      <Icon name={ok ? 'checkCircle' : 'alert'} size={18} color={ok ? colors.success : colors.danger} />
      <Text variant="callout" style={styles.flex}>
        {label}
      </Text>
    </View>
  );
}

function WritingResult({ form, email, seconds, bottom, variant }: { form: string[]; email: string; seconds: number; bottom: number; variant: number }) {
  const { form: mockForm, email: mockEmail } = mockWriting(variant);
  const { colors } = useTheme();
  const f = formChecks(form);
  const e = emailChecks(email, mockEmail);
  return (
    <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: bottom + space.xxl }]}>
      <Text variant="title1" align="center" accessibilityRole="header">
        Writing handed in
      </Text>
      <Text variant="callout" color="label2" align="center">
        Handed in after {clock(seconds)} of {sectionInfo.writing.minutes}:00. Here is how it does against the exam’s own rules. For an estimate and corrections, ask for AI feedback below.
      </Text>
      <View>
        <SectionHeader title="Task 1 · form (8 points in the exam)" />
        <Card style={styles.checks}>
          {f.map((c, i) => (
            <Check
              key={i}
              ok={c.enoughWords && c.capital && c.endsWithStop}
              label={
                c.words === 0
                  ? `Answer ${i + 1}: no answer`
                  : `Answer ${i + 1}: ${c.words} words${c.enoughWords ? '' : ` – under ${FORM_MIN_WORDS} loses points`}${!c.capital || !c.endsWithStop ? ' · start with a capital, end with a full stop' : ''}`
              }
            />
          ))}
        </Card>
      </View>
      <View>
        <SectionHeader title="Task 2 · e-mail (12 points in the exam)" />
        <Card style={styles.checks}>
          <Check ok={!e.zero} label={e.zero ? `${e.words} words: under ${EMAIL_MIN_WORDS}, the e-mail scores 0` : `${e.words} words`} />
          <Check ok={e.greeting} label="A greeting on the first line" />
          <Check ok={e.closing} label="A closing before your name" />
          <Check ok={e.signature} label="Your name at the end" />
          <Check ok={e.sentences >= e.sentencesNeeded} label={`${e.sentences} ${e.sentences === 1 ? 'sentence' : 'sentences'} for ${e.sentencesNeeded} pictures`} />
        </Card>
        <Text variant="footnote" color="label3" style={styles.noteTop}>
          Also check yourself: one sentence answers each picture’s question, and you wrote vy all the way through.
        </Text>
      </View>
      <View>
        <SectionHeader title="AI feedback" />
        <View style={styles.feedback}>
          <WritingFeedbackCard task={mockForm} texts={form} />
          <WritingFeedbackCard task={mockEmail} texts={[email]} />
        </View>
      </View>
      <View style={[styles.sample, { backgroundColor: colors.accentSoft }]}>
        <Text variant="footnote" weight="700" color="accent">
          MODEL ANSWERS
        </Text>
        {[...mockForm.sample, '', ...mockEmail.sample].map((l, i) => (
          <Text key={i} variant="callout" lang="cs">
            {l}
          </Text>
        ))}
      </View>
      <Button label="Back to the mock exam" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter, gap: space.md },
  intro: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  sheetWrap: { paddingHorizontal: layout.gutter, paddingTop: space.sm, gap: space.sm },
  sheetBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44, paddingHorizontal: space.md, borderRadius: radius.tile },
  sheet: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  cell: { width: 44, height: 44, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  timeUp: { borderRadius: radius.tile, padding: space.lg, gap: space.xs },
  nav: { flexDirection: 'row', gap: space.md, paddingHorizontal: layout.gutter, paddingTop: space.sm, borderTopWidth: StyleSheet.hairlineWidth },
  handInEarly: { alignSelf: 'center', paddingVertical: space.sm },
  byTask: { gap: space.sm },
  taskLine: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  field: { gap: space.xs },
  input: { minHeight: 72, borderWidth: 1.5, borderRadius: radius.tile, paddingHorizontal: space.lg, paddingVertical: space.md, textAlignVertical: 'top' },
  email: { minHeight: 200 },
  taskGap: { marginTop: space.lg },
  pictures: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  picture: { width: '48%', flexGrow: 1, alignItems: 'center', gap: space.xs, padding: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth },
  checks: { gap: space.sm },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  noteTop: { paddingHorizontal: space.xs, marginTop: space.sm },
  sample: { borderRadius: radius.tile, padding: space.lg, gap: space.xs },
  feedback: { gap: space.lg },
});
