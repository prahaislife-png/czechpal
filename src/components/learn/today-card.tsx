import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { nodeHref, stepHref, stepIcon, useJourney, useTodayPlan, type TodayStep } from '@/lib/academy/use-plan';
import { streak } from '@/lib/learn/activity';
import { daysToExam } from '@/lib/learn/exam';
import { minutesOf } from '@/lib/learn/profile';
import { useLearn } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Learn's signature card: today, on the one dark surface. The unit the learner is in, today's
 * steps (the next steps of the journey, plus what needs going over), one button to the next
 * step, and how far along the whole journey they are. Steps tick off as they're done.
 */
export function TodayCard() {
  const { colors } = useTheme();
  const plan = useTodayPlan();
  const journey = useJourney();
  const profile = useLearn((s) => s.profile);
  const streakDays = streak(useLearn((s) => s.days));
  const minutes = minutesOf(profile);
  const next = plan.find((s) => !s.done);
  const doneCount = plan.filter((s) => s.done).length;
  const allDone = plan.length > 0 && !next;
  const unit = journey.next?.unit;
  const share = journey.total ? journey.done / journey.total : 0;
  const left = profile?.examDate ? daysToExam(profile.examDate) : null;

  const go = () => {
    if (next) router.push(stepHref(next));
    else if (journey.next) router.push(nodeHref(journey.next.node));
    else router.push('/learn/practice');
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.ink }]}>
      <View style={styles.top}>
        <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.onInk2 }]}>
          TODAY · {minutes} MIN
        </Text>
        {streakDays > 0 ? (
          <View style={styles.streak} accessible accessibilityLabel={`${streakDays} ${streakDays === 1 ? 'day' : 'days'} in a row`}>
            <Icon name="flame" size={14} color={colors.coral} />
            <Text variant="footnote" weight="700" tabular style={{ color: colors.onInk }}>
              {streakDays}
            </Text>
          </View>
        ) : null}
      </View>

      <Text variant="title2" accessibilityRole="header" style={{ color: colors.onInk }}>
        {allDone ? 'Done for today' : unit ? `Unit ${unit.n} · ${unit.topic.title}` : 'Your A2 journey'}
      </Text>

      <View style={styles.steps}>
        {plan.map((s) => (
          <StepRow key={`${s.kind}-${'id' in s ? s.id : ''}`} step={s} />
        ))}
      </View>

      <PressableScale onPress={go} accessibilityRole="button" style={[styles.button, { backgroundColor: colors.onInk }]}>
        <Icon name={allDone ? 'arrowRight' : 'play'} size={18} color={colors.ink} />
        <Text variant="headline" weight="600" chrome style={{ color: colors.ink }}>
          {allDone ? 'Keep going' : doneCount > 0 ? 'Carry on' : 'Start'}
        </Text>
      </PressableScale>

      <View style={styles.journey} accessible accessibilityLabel={`${journey.done} of ${journey.total} steps of the journey done`}>
        <View style={styles.track}>
          <View style={[styles.fill, { backgroundColor: colors.coral, width: `${Math.max(2, share * 100)}%` }]} />
        </View>
        <View style={styles.journeyText}>
          <Text variant="caption" style={{ color: colors.onInk2 }}>
            {journey.done} of {journey.total} steps to exam-ready
          </Text>
          {left !== null && left >= 0 ? (
            <Text variant="caption" weight="600" style={{ color: colors.onInk }}>
              {left === 0 ? 'Exam today' : `${left} ${left === 1 ? 'day' : 'days'} to your exam`}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function StepRow({ step }: { step: TodayStep }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => router.push(stepHref(step))}
      accessibilityRole="button"
      accessibilityLabel={`${step.title}, ${step.minutes} minutes${step.done ? ', done' : `, ${step.why}`}`}
      style={styles.step}>
      <View style={[styles.stepIcon, { backgroundColor: step.done ? colors.sage : 'rgba(255,255,255,0.1)' }]}>
        <Icon name={step.done ? 'check' : stepIcon[step.kind]} size={16} color={step.done ? colors.sageInk : colors.onInk} />
      </View>
      <View style={styles.flex}>
        <Text variant="callout" weight="600" numberOfLines={1} style={{ color: colors.onInk, opacity: step.done ? 0.6 : 1 }}>
          {step.title}
        </Text>
        <Text variant="footnote" numberOfLines={1} style={{ color: colors.onInk2 }}>
          {step.done ? 'Done today' : `${step.minutes} min · ${step.why}`}
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.sheet, borderCurve: 'continuous', padding: space.xl, gap: space.md },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 26 },
  eyebrow: { letterSpacing: 0.8 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.1)' },
  steps: { gap: space.sm, marginTop: space.xs },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md, backgroundColor: 'rgba(255,255,255,0.07)' },
  stepIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, minHeight: 54, borderRadius: radius.pill, marginTop: space.xs },
  journey: { gap: space.sm, marginTop: space.xs },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.14)' },
  fill: { height: 6, borderRadius: 3 },
  journeyText: { flexDirection: 'row', justifyContent: 'space-between', gap: space.md },
});
