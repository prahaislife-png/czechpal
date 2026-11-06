import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { planMinutes } from '@/lib/academy/plan';
import { stepHref, stepIcon, useTodayPlan } from '@/lib/academy/use-plan';
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

/** Learn's top card: the A2 Academy's next step, or the way in. */
export function AcademyCard() {
  const { colors } = useTheme();
  const setupAt = useAcademy((s) => s.setupAt);
  const examDate = useLearn((s) => s.profile?.examDate);
  const plan = useTodayPlan();
  if (!setupAt) return <SetupCard />;
  const first = plan[0];
  const left = examDate ? daysToExam(examDate) : null;
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Text variant="title2" accessibilityRole="header" style={styles.flex}>
          A2 Academy
        </Text>
        {left !== null && left >= 0 ? (
          <View style={[styles.pill, { backgroundColor: colors.accentSoft }]}>
            <Text variant="footnote" weight="700" color="accent" tabular>
              {left === 0 ? 'Exam today' : `${left} ${left === 1 ? 'day' : 'days'} to go`}
            </Text>
          </View>
        ) : null}
      </View>
      {first ? (
        <View style={[styles.next, { backgroundColor: colors.accentSoft }]}>
          <Icon name={stepIcon[first.kind]} size={22} color={colors.accent} />
          <View style={styles.flex}>
            <Text variant="callout" weight="600" numberOfLines={2}>
              {first.title}
            </Text>
            <Text variant="footnote" color="label2" numberOfLines={2}>
              {first.why}
            </Text>
          </View>
        </View>
      ) : (
        <Text variant="footnote" color="label2">
          Every lesson written so far is done. More topics are on the way.
        </Text>
      )}
      <Text variant="footnote" color="label2">
        {plan.length > 1 ? `Today: ${plan.length} things, about ${planMinutes(plan)} min.` : 'Your roadmap, readiness and grammar are inside.'}
      </Text>
      <View style={styles.actions}>
        {first ? <Button label="Start" icon="play" onPress={() => router.push(stepHref(first))} style={styles.flex} /> : null}
        <Button label="Open" variant="secondary" onPress={() => router.push('/learn/academy')} style={styles.flex} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  pill: { paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  well: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  next: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, padding: space.md },
  actions: { flexDirection: 'row', gap: space.sm },
});
