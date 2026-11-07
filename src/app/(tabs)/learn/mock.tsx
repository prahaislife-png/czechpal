import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { confirm } from '@/lib/dialogs';
import {
  clock,
  MOCK_SECTIONS,
  MOCK_VARIANTS,
  mockFinished,
  mockSpeakingTasks,
  nextVariant,
  sectionDone,
  sectionInfo,
  weakTasks,
  writtenOutlook,
  type MockRun,
  type MockSection,
} from '@/lib/academy/mock';
import { practiceSets } from '@/lib/academy/tasks';
import { passMarks } from '@/lib/learn/exam';
import { useAcademy } from '@/store/academy';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const icons = { reading: 'book', writing: 'compose', listening: 'ear', speaking: 'mic' } as const;

/**
 * The mock exam: the four parts in the exam's order and times, on questions kept out of practice.
 * Reading and listening are marked; writing and speaking are checked against the exam's rules,
 * not scored. One part at a time, or all in one sitting.
 */
export default function MockScreen() {
  const mocks = useAcademy((s) => s.mocks);
  const latest = mocks[mocks.length - 1];
  const current = latest && !mockFinished(latest) ? latest : undefined;
  const finished = mocks.filter(mockFinished).reverse();

  const start = () => {
    const done = Object.fromEntries(Object.entries(useAcademy.getState().speaking).map(([id, runs]) => [id, runs.length]));
    useAcademy.getState().startMock(mockSpeakingTasks(done), nextVariant(useAcademy.getState().mocks));
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {current ? (
        <Sections run={current} />
      ) : (
        <Intro taken={new Set(mocks.map((m) => m.variant ?? 1)).size} onStart={start} />
      )}

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
        Written for CzechPal in the exam’s formats and checked by AI, not taken from a real test. A mock shows how you do on one day; it isn’t a prediction of your exam.
      </Text>
    </ScrollView>
  );
}

function Intro({ taken, onStart }: { taken: number; onStart: () => void }) {
  const again = taken > 0;
  const repeats = taken >= MOCK_VARIANTS;
  const { colors } = useTheme();
  return (
    <Card style={styles.intro}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name="flag" size={28} color={colors.accent} />
      </View>
      <Text variant="title2" align="center" accessibilityRole="header">
        A full mock exam
      </Text>
      <Text variant="callout" color="label2" align="center">
        The four parts in the exam’s order and times: reading {sectionInfo.reading.minutes} min, writing {sectionInfo.writing.minutes}, listening about{' '}
        {sectionInfo.listening.minutes}, speaking up to {sectionInfo.speaking.minutes}. Do it in one sitting, or a part at a time.
      </Text>
      <Text variant="footnote" color="label2" align="center">
        {repeats
          ? `You’ve taken all ${MOCK_VARIANTS} mocks, so the next one repeats questions you’ve seen. It still shows your timing.`
          : `The reading, listening and writing questions are new: they aren’t in Exam practice${again ? ' or your earlier mock' : ''}. Reading and listening are marked; writing and speaking you check against the exam’s rules.`}
      </Text>
      <Button label={again ? 'Start another mock' : 'Start a mock exam'} icon="play" onPress={onStart} />
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

function Results({ run }: { run: MockRun }) {
  const { colors } = useTheme();
  const w = writtenOutlook(run);
  const weak = weakTasks(run).slice(0, 3);
  const done = useAcademy((s) => s.tasks);
  const recorded = Object.values(run.speaking?.tasks ?? {});
  const verdict =
    w.verdict === 'not-yet'
      ? 'Do reading and listening to see where the written part stands.'
      : w.verdict === 'reached'
        ? `Reading and listening alone reach the ${passMarks.written.need} you need.`
        : w.verdict === 'possible'
          ? `Writing would need at least ${w.need} of ${w.writingMax} points to reach ${passMarks.written.need}.`
          : `Even full marks in writing (${w.writingMax}) wouldn’t reach ${passMarks.written.need}.`;
  return (
    <View>
      <SectionHeader title={mockFinished(run) ? `Mock ${run.variant ?? 1} · ${longDate(run.startedAt.slice(0, 10))}` : 'So far'} />
      <Card style={styles.result}>
        <Text variant="headline">Written part</Text>
        <Line label="Reading" value={run.reading ? `${run.reading.right} of 25` : '—'} />
        <Line label="Listening" value={run.listening ? `${run.listening.right} of 25` : '—'} />
        <Line label="Writing" value={run.writing ? 'not scored' : '—'} />
        {run.writing?.emailZero ? (
          <Text variant="footnote" color="danger">
            The e-mail had {run.writing.emailWords} words. Under 35, it scores 0 of 12 in the exam.
          </Text>
        ) : null}
        <View style={[styles.verdict, { backgroundColor: w.verdict === 'out-of-reach' ? colors.warningSoft : colors.accentSoft }]}>
          <Text variant="subhead" weight="600" color={w.verdict === 'out-of-reach' ? 'warning' : 'accent'}>
            {verdict}
          </Text>
        </View>
        <Text variant="footnote" color="label3">
          You need {passMarks.written.need} of {passMarks.written.of} for reading, writing and listening together.
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.separator }]} />
        <Text variant="headline">Speaking</Text>
        <Line label="Answers recorded" value={recorded.length ? `${recorded.reduce((n, t) => n + t.recorded, 0)} of ${recorded.reduce((n, t) => n + t.prompts, 0)}` : '—'} />
        <Text variant="footnote" color="label3">
          Not scored; you checked it yourself. In the exam you need {passMarks.speaking.need} of {passMarks.speaking.of}, separately from the written part.
        </Text>
      </Card>
      {weak.length ? (
        <View style={styles.gap}>
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
  return (
    <List>
      <Row
        icon="history"
        title={`Mock ${run.variant ?? 1} · ${longDate(run.startedAt.slice(0, 10))}`}
        subtitle={`Reading ${run.reading?.right ?? '—'} · Listening ${run.listening?.right ?? '—'} of 25 · writing and speaking self-checked`}
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
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  gap: { marginTop: space.lg },
  intro: { gap: space.md, alignItems: 'stretch' },
  badge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  result: { gap: space.sm },
  line: { flexDirection: 'row', alignItems: 'center' },
  verdict: { borderRadius: radius.tile, padding: space.md, marginTop: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
});
