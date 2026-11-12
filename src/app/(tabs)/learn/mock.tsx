import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { openPlus } from '@/components/plus/gate';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { ai, AnalyzeError, isDemoMode } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import {
  clock,
  MOCK_SECTIONS,
  MOCK_VARIANTS,
  mockFinished,
  mockOutcome,
  mockSpeakingTasks,
  mockWriting,
  nextVariant,
  sectionDone,
  sectionInfo,
  weakTasks,
  writingToMark,
  writtenOutlook,
  type MockOutcome,
  type MockRun,
  type MockSection,
  type PartResult,
} from '@/lib/academy/mock';
import { practiceSets } from '@/lib/academy/tasks';
import { passMarks } from '@/lib/learn/exam';
import { mockLocked } from '@/lib/plus/access';
import { useAcademy } from '@/store/academy';
import { useStore } from '@/store/cases';
import { useAccess } from '@/store/plus';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const icons = { reading: 'book', writing: 'compose', listening: 'ear', speaking: 'mic' } as const;

/**
 * The mock exam: the four parts in the exam's order and times, on questions kept out of practice,
 * ending in a result by the exam's own rule. Reading and listening are marked; writing gets the
 * AI's estimate; speaking is the learner's own check. One part at a time, or all in one sitting.
 */
export default function MockScreen() {
  const mocks = useAcademy((s) => s.mocks);
  const locked = mockLocked(useAccess());
  const latest = mocks[mocks.length - 1];
  const current = latest && !mockFinished(latest) ? latest : undefined;
  const finished = mocks.filter(mockFinished).reverse();

  const start = () => {
    const done = Object.fromEntries(Object.entries(useAcademy.getState().speaking).map(([id, runs]) => [id, runs.length]));
    useAcademy.getState().startMock(mockSpeakingTasks(done), nextVariant(useAcademy.getState().mocks));
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {current ? <Sections run={current} /> : <Intro taken={new Set(mocks.map((m) => m.variant ?? 1)).size} locked={locked} onStart={start} />}

      {current && (current.reading || current.listening || current.writing || current.speaking) ? <Results run={current} /> : null}

      {finished.length ? (
        <View>
          <SectionHeader title={current ? 'Earlier mocks' : 'Your mock exams'} />
          {finished.map((m, i) => (
            <View key={m.id} style={i > 0 ? styles.gap : undefined}>
              {i === 0 && !current ? <Results run={m} /> : <PastRow run={m} />}
            </View>
          ))}
        </View>
      ) : null}

      {current ? (
        <Button
          label="Discard this mock"
          variant="quietDestructive"
          onPress={async () => {
            if (await confirm({ title: 'Discard this mock?', message: 'Its answers stay in your progress; the mock itself is removed.', confirmLabel: 'Discard', destructive: true }))
              useAcademy.getState().discardMock(current.id);
          }}
        />
      ) : null}

      <Text variant="footnote" color="label3" style={styles.note}>
        Written for CzechLocal in the exam’s formats and checked by AI, not taken from a real test. The writing points are an AI estimate and the speaking points are your own check, so
        the result shows where you stand today; it isn’t a prediction of your exam.
      </Text>
    </ScrollView>
  );
}

function Intro({ taken, locked, onStart }: { taken: number; locked: boolean; onStart: () => void }) {
  const again = taken > 0;
  const repeats = taken >= MOCK_VARIANTS;
  const { colors } = useTheme();
  return (
    <Card style={styles.intro}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name={locked ? 'lock' : 'flag'} size={28} color={colors.accent} />
      </View>
      <Text variant="title2" align="center" accessibilityRole="header">
        A full mock exam
      </Text>
      <Text variant="callout" color="label2" align="center">
        The four parts in the exam’s order and times: reading {sectionInfo.reading.minutes} min, writing {sectionInfo.writing.minutes}, listening about{' '}
        {sectionInfo.listening.minutes}, speaking up to {sectionInfo.speaking.minutes}. Do it in one sitting, or a part at a time.
      </Text>
      <Text variant="footnote" color="label2" align="center">
        {locked
          ? `At the end you get a result by the exam’s own rule: ${passMarks.written.need} of ${passMarks.written.of} in the written part and ${passMarks.speaking.need} of ${passMarks.speaking.of} in speaking, and what to practise next. The mock exams are part of Plus.`
          : repeats
            ? `You’ve taken all ${MOCK_VARIANTS} mocks, so the next one repeats questions you’ve seen. It still shows your timing.`
            : `The reading, listening and writing questions are new: they aren’t in Exam practice${again ? ' or your earlier mock' : ''}. At the end you get a result by the exam’s own rule: pass, or not yet.`}
      </Text>
      {locked ? (
        <Button label="Unlock the mock exams" icon="lock" onPress={() => openPlus('mock')} />
      ) : (
        <Button label={again ? 'Start another mock' : 'Start a mock exam'} icon="play" onPress={onStart} />
      )}
    </Card>
  );
}

function sectionStatus(run: MockRun, s: MockSection) {
  if (s === 'reading' || s === 'listening') {
    const r = run[s];
    return r ? `${r.right} of ${r.total} · in ${clock(r.seconds)}` : null;
  }
  if (s === 'writing') return run.writing ? `Done · e-mail ${run.writing.emailWords} words${run.writing.emailZero ? ' (under 35)' : ''}` : null;
  const done = run.speakingTasks.filter((id) => run.speaking?.tasks[id]).length;
  return done === 0 ? null : done === run.speakingTasks.length ? 'Done · all 4 tasks' : `${done} of 4 tasks done`;
}

function Sections({ run }: { run: MockRun }) {
  const open = (s: MockSection) => {
    if (s !== 'speaking') return router.push({ pathname: '/a2-mock/[section]', params: { section: s, mock: run.id } });
    const next = run.speakingTasks.find((id) => !run.speaking?.tasks[id]) ?? run.speakingTasks[0];
    router.push({ pathname: '/a2-speaking/[id]', params: { id: next, mock: run.id } });
  };
  const next = MOCK_SECTIONS.find((s) => !sectionDone(run, s));
  return (
    <View>
      <SectionHeader title={`Mock exam ${run.variant ?? 1} · started ${longDate(run.startedAt.slice(0, 10))}`} />
      <List>
        {MOCK_SECTIONS.map((s) => {
          const status = sectionStatus(run, s);
          const done = sectionDone(run, s);
          const info = sectionInfo[s];
          return (
            <Row
              key={s}
              icon={done ? 'checkCircle' : icons[s]}
              title={`${info.title} · ${info.cs}`}
              subtitle={status ?? `${info.timed ? '' : s === 'speaking' ? 'Up to ' : 'About '}${info.minutes} min · ${info.note}`}
              chevron={!done || s === 'speaking'}
              onPress={done && s !== 'speaking' ? undefined : () => open(s)}
            />
          );
        })}
      </List>
      {next ? (
        <Text variant="footnote" color="label2" style={styles.note}>
          Next, as in the exam: {sectionInfo[next].title.toLowerCase()}.{next === 'listening' ? ' In the exam there is a 15-minute break before listening.' : ''}
        </Text>
      ) : null}
    </View>
  );
}

const verdictCopy: Record<MockOutcome['verdict'], { title: string; detail: string }> = {
  pass: { title: 'On this mock, you’d pass', detail: 'Both parts reach their pass mark. Keep the weaker tasks warm until the exam.' },
  'not-yet': { title: 'Not yet', detail: 'One part is under its pass mark. In the exam, both must pass, so that is the part to work on.' },
  open: { title: 'Result so far', detail: 'Finish every part to see whether this mock passes.' },
};

/** The mock's headline: pass or not yet by the exam's own rule, with each part against its pass mark. */
function Verdict({ run, outcome }: { run: MockRun; outcome: MockOutcome }) {
  const { colors } = useTheme();
  const copy = verdictCopy[outcome.verdict];
  const toMark = writingToMark(run).length > 0;
  return (
    <View style={[styles.verdictCard, { backgroundColor: colors.ink }]} accessible accessibilityLabel={`${copy.title}. ${copy.detail}`}>
      <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.onInk2 }]}>
        MOCK {run.variant ?? 1} · {mockFinished(run) ? 'RESULT' : 'SO FAR'}
      </Text>
      <Text variant="title1" accessibilityRole="header" style={{ color: colors.onInk }}>
        {copy.title}
      </Text>
      <Text variant="callout" style={{ color: colors.onInk2 }}>
        {outcome.verdict === 'open' && mockFinished(run) && toMark ? 'Get your writing marked below to complete the result.' : copy.detail}
      </Text>
      <PartBar label="Written part" part={outcome.written} suffix={outcome.written.score !== null && outcome.written.writing === null ? 'without writing' : outcome.written.estimated ? 'writing estimated' : undefined} />
      <PartBar label="Speaking" part={outcome.speaking} suffix={outcome.speaking.score !== null ? 'your own check' : undefined} />
    </View>
  );
}

function PartBar({ label, part, suffix }: { label: string; part: PartResult; suffix?: string }) {
  const { colors } = useTheme();
  const share = part.score === null ? 0 : Math.min(1, part.score / part.of);
  const tone = part.state === 'passed' ? colors.sage : part.state === 'failed' ? colors.coral : colors.onInk2;
  return (
    <View style={styles.part} accessible accessibilityLabel={`${label}: ${part.score === null ? 'not scored yet' : `${part.score} of ${part.of}`}. You need ${part.need}.`}>
      <View style={styles.partTop}>
        <Text variant="subhead" weight="600" style={[styles.flex, { color: colors.onInk }]}>
          {label}
          {suffix ? (
            <Text variant="footnote" style={{ color: colors.onInk2 }}>
              {'  '}
              {suffix}
            </Text>
          ) : null}
        </Text>
        <Text variant="subhead" weight="700" tabular style={{ color: colors.onInk }}>
          {part.score === null ? '—' : part.score} / {part.of}
        </Text>
      </View>
      <View style={styles.partTrack}>
        <View style={[styles.partFill, { backgroundColor: tone, width: `${share * 100}%` }]} />
        {/* The pass mark, as a line across the bar. */}
        <View style={[styles.passMark, { left: `${(part.need / part.of) * 100}%`, backgroundColor: colors.onInk }]} />
      </View>
      <Text variant="caption" style={{ color: colors.onInk2 }}>
        Pass mark: {part.need}
      </Text>
    </View>
  );
}

/** Asks the AI for the estimate of the writing tasks that don't have one yet, and keeps it on the mock. */
function MarkWriting({ run }: { run: MockRun }) {
  const tasks = writingToMark(run);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const aiConsent = useStore((s) => s.aiConsent);
  if (!tasks.length || !run.writing) return null;
  const { form, email } = mockWriting(run.variant ?? 1);
  const writing = run.writing;

  const mark = async () => {
    if (busy) return;
    if (!isDemoMode && !aiConsent) useStore.getState().setAiConsent(true);
    setBusy(true);
    setError(null);
    const language = useStore.getState().language;
    try {
      for (const kind of tasks) {
        const task = kind === 'form' ? form : email;
        const out = await ai.writingFeedback({
          kind,
          instruction: task.instructionCs,
          questions: task.questions,
          pictures: task.pictures?.map((p) => p.question),
          register: task.register,
          texts: kind === 'form' ? writing.form : [writing.email],
          language,
        });
        useAcademy.getState().setMockWritingEstimate(run.id, kind, out.estimate.points);
      }
    } catch (e) {
      setError(e instanceof AnalyzeError ? e.message : 'The marking didn’t come through. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.mark}>
      <Button label={busy ? 'Marking your writing…' : 'Get your writing marked'} icon="compose" variant="secondary" loading={busy} onPress={mark} />
      <Text variant="footnote" color={error ? 'danger' : 'label3'} align="center" accessibilityLiveRegion="polite">
        {error ??
          (!isDemoMode && !aiConsent
            ? 'CzechLocal sends what you wrote to Anthropic’s Claude AI for an estimate of the points. CzechLocal doesn’t keep it.'
            : 'An AI estimate of your form and e-mail, to complete the written part.')}
      </Text>
    </View>
  );
}

function Results({ run }: { run: MockRun }) {
  const { colors } = useTheme();
  const w = writtenOutlook(run);
  const outcome = mockOutcome(run);
  const weak = weakTasks(run).slice(0, 3);
  const done = useAcademy((s) => s.tasks);
  const recorded = Object.values(run.speaking?.tasks ?? {});
  const writingLine = !run.writing ? '—' : outcome.written.writing !== null ? `about ${outcome.written.writing} of 20` : 'not marked yet';
  const verdict =
    w.verdict === 'not-yet'
      ? 'Do reading and listening to see where the written part stands.'
      : outcome.written.writing !== null
        ? outcome.written.state === 'passed'
          ? `Together that is ${outcome.written.score} of ${passMarks.written.of}: over the ${passMarks.written.need} you need.`
          : `Together that is ${outcome.written.score} of ${passMarks.written.of}: ${passMarks.written.need - (outcome.written.score ?? 0)} short of the ${passMarks.written.need} you need.`
        : w.verdict === 'reached'
          ? `Reading and listening alone reach the ${passMarks.written.need} you need.`
          : w.verdict === 'possible'
            ? `Writing would need at least ${w.need} of ${w.writingMax} points to reach ${passMarks.written.need}.`
            : `Even full marks in writing (${w.writingMax}) wouldn’t reach ${passMarks.written.need}.`;
  const bad = outcome.written.state === 'failed';
  return (
    <View style={styles.results}>
      <Verdict run={run} outcome={outcome} />
      <MarkWriting run={run} />
      <Card style={styles.result}>
        <Text variant="headline">Written part</Text>
        <Line label="Reading" value={run.reading ? `${run.reading.right} of 25` : '—'} />
        <Line label="Listening" value={run.listening ? `${run.listening.right} of 25` : '—'} />
        <Line label="Writing" value={writingLine} />
        {run.writing?.emailZero ? (
          <Text variant="footnote" color="danger">
            The e-mail had {run.writing.emailWords} words. Under 35, it scores 0 of 12 in the exam.
          </Text>
        ) : null}
        <View style={[styles.verdict, { backgroundColor: bad ? colors.warningSoft : colors.accentSoft }]}>
          <Text variant="subhead" weight="600" color={bad ? 'warning' : 'accent'}>
            {verdict}
          </Text>
        </View>
        <Text variant="footnote" color="label3">
          You need {passMarks.written.need} of {passMarks.written.of} for reading, writing and listening together. The writing points are an AI estimate: the exam’s marking scale isn’t
          published.
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.separator }]} />
        <Text variant="headline">Speaking</Text>
        <Line label="Answers recorded" value={recorded.length ? `${recorded.reduce((n, t) => n + t.recorded, 0)} of ${recorded.reduce((n, t) => n + t.prompts, 0)}` : '—'} />
        <Line label="By your own check" value={outcome.speaking.score === null ? '—' : `about ${outcome.speaking.score} of 40`} />
        <Text variant="footnote" color="label3">
          From what you ticked after each task. Pronunciation (3 of the 40 points) can’t be checked this way. In the exam you need {passMarks.speaking.need} of {passMarks.speaking.of},
          separately from the written part.
        </Text>
      </Card>
      {weak.length ? (
        <View>
          <SectionHeader title="Practise next" />
          <List>
            {weak.map((t) => {
              // The practice set for that task done fewest times.
              const set = practiceSets.filter((s) => s.part === t.part && s.task === t.task).sort((a, b) => (done[a.id]?.length ?? 0) - (done[b.id]?.length ?? 0))[0];
              return (
                <Row
                  key={`${t.part}-${t.task}`}
                  icon={t.part === 'reading' ? 'book' : 'ear'}
                  title={`${t.part === 'reading' ? 'Reading' : 'Listening'} ${t.task}${set ? `: ${set.title}` : ''}`}
                  subtitle={`${t.right} of ${t.total} in the mock`}
                  chevron={!!set}
                  onPress={set ? () => router.push({ pathname: '/a2-task/[id]', params: { id: set.id } }) : undefined}
                />
              );
            })}
          </List>
        </View>
      ) : null}
    </View>
  );
}

function PastRow({ run }: { run: MockRun }) {
  const o = mockOutcome(run);
  const head = o.verdict === 'pass' ? 'Passed' : o.verdict === 'not-yet' ? 'Not yet' : 'Not fully scored';
  return (
    <List>
      <Row
        icon={o.verdict === 'pass' ? 'checkCircle' : 'history'}
        title={`Mock ${run.variant ?? 1} · ${longDate(run.startedAt.slice(0, 10))}`}
        subtitle={`${head} · written ${o.written.score ?? '—'} of ${o.written.of} · speaking ${o.speaking.score ?? '—'} of ${o.speaking.of}`}
      />
    </List>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.line}>
      <Text variant="callout" color="label2" style={styles.flex}>
        {label}
      </Text>
      <Text variant="callout" weight="600" tabular>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  eyebrow: { letterSpacing: 0.8 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  gap: { marginTop: space.lg },
  intro: { gap: space.md, alignItems: 'stretch' },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  results: { gap: space.lg },
  verdictCard: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xl, gap: space.md },
  part: { gap: space.xs, marginTop: space.xs },
  partTop: { flexDirection: 'row', alignItems: 'baseline', gap: space.md },
  partTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.14)', overflow: 'hidden' },
  partFill: { height: 8, borderRadius: 4 },
  passMark: { position: 'absolute', top: 0, bottom: 0, width: 2, opacity: 0.9 },
  mark: { gap: space.sm },
  result: { gap: space.sm },
  line: { flexDirection: 'row', alignItems: 'center' },
  verdict: { borderRadius: radius.tile, padding: space.md, marginTop: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
});
