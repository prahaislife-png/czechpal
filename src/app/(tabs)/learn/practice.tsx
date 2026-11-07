import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { mistakeIds } from '@/lib/academy/evidence';
import { practiceSets } from '@/lib/academy/tasks';
import { speakingTasks } from '@/lib/academy/tasks/speaking';
import { writingTasks } from '@/lib/academy/tasks/writing';
import type { TaskSet } from '@/lib/academy/types';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy, type TaskRun } from '@/store/academy';
import { layout, space } from '@/theme/tokens';

const speakingTaskLine = { 1: 'Answer 8 questions', 2: 'Ask questions in 2 dialogues', 3: 'Tell a story from 4 pictures', 4: 'Agree with a friend' } as const;

const best = (runs: TaskRun[] = []) => runs.reduce<TaskRun | null>((b, r) => (!b || r.right / r.total > b.right / b.total ? r : b), null);

/** Exam practice: every reading, listening and writing task in the exam's own format, and your mistakes. */
export default function PracticeScreen() {
  const tasks = useAcademy((s) => s.tasks);
  const writing = useAcademy((s) => s.writing);
  const speaking = useAcademy((s) => s.speaking);
  const attempts = useAcademy((s) => s.attempts);
  const mistakes = useMemo(() => mistakeIds(attempts).length, [attempts]);
  const voice = useCzechVoice();

  const row = (set: TaskSet) => {
    const b = best(tasks[set.id]);
    const needsVoice = set.part === 'listening' && voice.state === 'missing';
    return (
      <Row
        key={set.id}
        title={`${set.task}. ${set.title}`}
        subtitle={needsVoice ? 'Needs a Czech voice on this phone' : b ? `Best ${b.right} of ${b.total} · ${tasks[set.id]!.length}× done` : `${set.items.length} items · not done yet`}
        chevron
        onPress={() => router.push({ pathname: '/a2-task/[id]', params: { id: set.id } })}
      />
    );
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="subhead" color="label2" style={styles.note}>
        Practice in the exam’s own formats, one task at a time. Written for CzechPal, never copied from a real test.
      </Text>

      <List>
        <Row icon="clock" title="Mock exam" subtitle="All four parts, timed, on new questions" chevron onPress={() => router.push('/learn/mock')} />
        <Row
          icon="refresh"
          title="Your mistakes"
          subtitle={mistakes ? `${mistakes} to get right` : 'Nothing to go over'}
          chevron
          onPress={() => router.push('/a2-mistakes')}
        />
      </List>

      <View>
        <SectionHeader title="Reading" />
        <List>{practiceSets.filter((s) => s.part === 'reading').map(row)}</List>
      </View>

      <View>
        <SectionHeader title="Listening" />
        <List>{practiceSets.filter((s) => s.part === 'listening').map(row)}</List>
      </View>

      <View>
        <SectionHeader title="Writing" />
        <List>
          {writingTasks.map((w) => (
            <Row
              key={w.id}
              icon="compose"
              title={w.title}
              subtitle={writing[w.id]?.length ? `${writing[w.id]!.length}× written` : w.kind === 'form' ? '3 answers · 10 words each' : 'At least 35 words'}
              chevron
              onPress={() => router.push({ pathname: '/a2-writing/[id]', params: { id: w.id } })}
            />
          ))}
        </List>
      </View>

      <View>
        <SectionHeader title="Speaking" />
        <List>
          {speakingTasks.map((t) => (
            <Row
              key={t.id}
              icon="mic"
              title={`${t.task}. ${t.title}`}
              subtitle={speaking[t.id]?.length ? `${speaking[t.id]!.length}× practised` : speakingTaskLine[t.task]}
              chevron
              onPress={() => router.push({ pathname: '/a2-speaking/[id]', params: { id: t.id } })}
            />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={[styles.note, styles.under]}>
          You record your answers and play them back. Recordings stay on this phone. CzechPal doesn’t score speaking.
        </Text>
      </View>

      <Text variant="footnote" color="label3" style={styles.note}>
        Written for CzechPal and checked by AI; if something looks wrong, tell us from Help.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  note: { paddingHorizontal: space.xs },
  under: { marginTop: space.sm },
});
