import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { roadmap } from '@/lib/academy/roadmap';
import { daysToExam } from '@/lib/learn/exam';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Before setup: what the A2 Academy is, and the way in. */
export function SetupCard() {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={[styles.well, { backgroundColor: colors.accentSoft }]}>
        <Icon name="school" size={22} color={colors.accent} />
      </View>
      <Text variant="title2" accessibilityRole="header">
        Get ready for the A2 exam
      </Text>
      <Text variant="callout" color="label2">
        The Czech exam for permanent residence. A short starting check, a plan for each day, and lessons by topic with checks that show what has stuck.
      </Text>
      <Button label="Set up · 2 min" onPress={() => router.push('/a2-setup')} />
    </Card>
  );
}

/** The way into the A2 Academy: the countdown and the roadmap. Today's steps are in Learn's daily plan. */
export function AcademyCard() {
  const { colors } = useTheme();
  const setupAt = useAcademy((s) => s.setupAt);
  const lessons = useAcademy((s) => s.lessons);
  const attempts = useAcademy((s) => s.attempts);
  const examDate = useLearn((s) => s.profile?.examDate);
  const map = useMemo(() => roadmap(lessons, attempts), [lessons, attempts]);
  if (!setupAt) return <SetupCard />;
  const started = map.filter((t) => t.state !== 'not-started').length;
  const left = examDate ? daysToExam(examDate) : null;
  return (
    <Card style={[styles.card, { backgroundColor: colors.lavender }]}>
      <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.lavenderInk }]}>
        MY A2 JOURNEY
      </Text>
      <View style={styles.head}>
        <Text variant="title2" accessibilityRole="header" style={[styles.flex, { color: colors.lavenderInk }]}>
          A2 Academy
        </Text>
        {left !== null && left >= 0 ? (
          <View style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text variant="footnote" weight="700" tabular style={{ color: colors.lavenderInk }}>
              {left === 0 ? 'Exam today' : `${left} ${left === 1 ? 'day' : 'days'} to go`}
            </Text>
          </View>
        ) : null}
      </View>
      <Text variant="footnote" style={{ color: colors.lavenderInk }}>
        {started} of {map.length} topics started. Your roadmap, readiness, exam practice, mock exams and everything about the exam.
      </Text>
      <Button label="Open" variant="secondary" onPress={() => router.push('/learn/academy')} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: space.md },
  eyebrow: { letterSpacing: 0.8, marginBottom: -space.sm },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  well: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
