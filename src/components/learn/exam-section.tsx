import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ExamCheckIn, ReadinessRow } from '@/components/academy/academy-parts';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { skillReadiness, weakObjectives } from '@/lib/academy/evidence';
import { mockFinished, mockOutcome } from '@/lib/academy/mock';
import type { Skill } from '@/lib/academy/types';
import { daysToExam } from '@/lib/learn/exam';
import { mockLocked } from '@/lib/plus/access';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { useAccess } from '@/store/plus';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The exam itself: the date (or the way to add one), how ready each of its four parts is from
 * the learner's own answers, what needs work, and the ways to practise and read about it.
 */
export function ExamSection() {
  const { colors } = useTheme();
  const examDate = useLearn((s) => s.profile?.examDate);
  const attempts = useAcademy((s) => s.attempts);
  const mocks = useAcademy((s) => s.mocks);
  const readiness = useMemo(() => (['reading', 'listening', 'writing', 'speaking'] as Skill[]).map((s) => skillReadiness(attempts, s)), [attempts]);
  const weak = useMemo(() => weakObjectives(attempts).slice(0, 3), [attempts]);
  const left = examDate ? daysToExam(examDate) : null;
  const lastMock = mocks[mocks.length - 1];
  const locked = mockLocked(useAccess());
  const last = lastMock && mockFinished(lastMock) ? mockOutcome(lastMock) : null;
  const mockSubtitle = !lastMock
    ? `All four parts, timed, with a pass or not-yet result${locked ? ' · Plus' : ''}`
    : last
      ? `Last: ${last.verdict === 'pass' ? 'passed' : last.verdict === 'not-yet' ? 'not yet' : 'not fully scored'} · written ${last.written.score ?? '—'} of ${last.written.of} · speaking ${last.speaking.score ?? '—'} of ${last.speaking.of}`
      : 'In progress: carry on';

  return (
    <View style={styles.section}>
      <SectionHeader title="The exam" />
      {left !== null && left < 0 ? (
        <ExamCheckIn examDate={examDate!} />
      ) : (
        <PressableScale
          onPress={() => router.push('/learn-plan')}
          accessibilityRole="button"
          accessibilityLabel={left === null ? 'Add your exam date' : `${left} days to your exam. Change the date.`}
          style={[styles.date, { backgroundColor: colors.accentSoft }]}>
          <Icon name="calendar" size={18} color={colors.accent} />
          <Text variant="subhead" weight="600" color="accent" style={styles.flex}>
            {left === null
              ? 'Add your exam date to count down to it'
              : left === 0
                ? 'Your exam is today. Good luck!'
                : `${left} ${left === 1 ? 'day' : 'days'} to your exam · ${longDate(examDate!)}`}
          </Text>
          <Icon name="chevronRight" size={14} color={colors.accent} />
        </PressableScale>
      )}

      <Card style={styles.readiness}>
        {readiness.map((r, i) => (
          <View key={r.skill}>
            {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
            <ReadinessRow r={r} />
          </View>
        ))}
      </Card>

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
      </List>
      <Text variant="footnote" color="label3" style={styles.note}>
        Readiness comes from your own first-try answers in checks, practice and mocks. It isn’t an exam score; for the whole exam, take a mock.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: space.md },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs },
  date: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md, minHeight: 48 },
  readiness: { paddingVertical: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
});
