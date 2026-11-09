import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExamCheckIn, ReadinessRow } from '@/components/academy/academy-parts';
import { SetupCard } from '@/components/academy/academy-card';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { skillReadiness, weakObjectives } from '@/lib/academy/evidence';
import { mockFinished } from '@/lib/academy/mock';
import type { Skill } from '@/lib/academy/types';
import { daysToExam } from '@/lib/learn/exam';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The A2 exam, for learners whose goal it is: the countdown, readiness by skill, what needs work,
 * exam practice, mock exams and the guide. For everyone else, one row to the guide.
 */
export function ExamSection() {
  const { colors } = useTheme();
  const profile = useLearn((s) => s.profile);
  const setupAt = useAcademy((s) => s.setupAt);
  const attempts = useAcademy((s) => s.attempts);
  const mocks = useAcademy((s) => s.mocks);
  const readiness = useMemo(() => (['reading', 'listening', 'writing', 'speaking'] as Skill[]).map((s) => skillReadiness(attempts, s)), [attempts]);
  const weak = useMemo(() => weakObjectives(attempts).slice(0, 3), [attempts]);

  if (profile?.goal !== 'exam' && !setupAt)
    return (
      <List>
        <Row
          icon="info"
          title="The A2 exam"
          subtitle="Needed for permanent residence: what it is, how to register, and practice when you want it"
          chevron
          onPress={() => router.push('/learn/exam')}
        />
      </List>
    );

  const examDate = profile?.examDate;
  const left = examDate ? daysToExam(examDate) : null;
  const lastMock = mocks[mocks.length - 1];
  const mockSubtitle = !lastMock
    ? 'All four parts, timed, on new questions'
    : mockFinished(lastMock)
      ? `Last: reading ${lastMock.reading?.right} · listening ${lastMock.listening?.right} of 25`
      : 'In progress: carry on';

  return (
    <View style={styles.section}>
      <SectionHeader title="The A2 exam" />
      {left !== null && left >= 0 ? (
        <View style={[styles.countdown, { backgroundColor: colors.accentSoft }]}>
          <Icon name="calendar" size={18} color={colors.accent} />
          <Text variant="subhead" weight="600" color="accent" style={styles.flex}>
            {left === 0 ? 'Your exam is today' : `${left} ${left === 1 ? 'day' : 'days'} to your exam · ${longDate(examDate!)}`}
          </Text>
        </View>
      ) : left !== null && left < 0 ? (
        <ExamCheckIn examDate={examDate!} />
      ) : null}

      {!setupAt ? <SetupCard /> : null}

      {setupAt ? (
        <Card style={styles.readiness}>
          {readiness.map((r, i) => (
            <View key={r.skill}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <ReadinessRow r={r} />
            </View>
          ))}
        </Card>
      ) : null}

      {weak.length ? (
        <List>
          {weak.map((w) => {
            const g = w.objective.startsWith('g:') ? w.objective.slice(2) : null;
            const t = w.objective.startsWith('t:') ? w.objective.split(':')[1] : null;
            return (
              <Row
                key={w.objective}
                icon="refresh"
                title={`Needs work: ${w.label}`}
                subtitle={`${w.right} of ${w.total} right lately`}
                chevron
                onPress={() =>
                  g ? router.push({ pathname: '/learn/grammar/[id]', params: { id: g } }) : t ? router.push({ pathname: '/learn/topic/[id]', params: { id: t } }) : undefined
                }
              />
            );
          })}
        </List>
      ) : null}

      <List>
        <Row icon="flag" title="Exam practice" subtitle="Every exam task, one at a time, marked at once" chevron onPress={() => router.push('/learn/practice')} />
        <Row icon="clock" title="Mock exam" subtitle={mockSubtitle} chevron onPress={() => router.push('/learn/mock')} />
        <Row icon="info" title="Everything about the A2 exam" subtitle="Registering, dates, the fee, the day, every task" chevron onPress={() => router.push('/learn/exam')} />
        {setupAt ? <Row icon="refresh" title="Starting check" subtitle="Take it again any time" chevron onPress={() => router.push('/diagnostic')} /> : null}
      </List>
      {setupAt ? (
        <Text variant="footnote" color="label3" style={styles.note}>
          Readiness comes from your own first-try answers in checks, practice and mocks. It isn’t an exam score; for the whole exam, take a mock.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.tile, padding: space.md },
  readiness: { paddingVertical: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
});
