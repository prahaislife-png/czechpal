import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { stepHref, stepIcon, useTodayPlan, type TodayStep } from '@/lib/academy/use-plan';
import { streak } from '@/lib/learn/activity';
import { minutesOf } from '@/lib/learn/profile';
import { useLearn } from '@/store/learn';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Learn's one daily plan: every step for today, ticked off as it's done, and one button to the
 * next. Before the A2 setup it is the everyday session alone.
 */
export function TodayCard() {
  const { colors } = useTheme();
  const plan = useTodayPlan();
  const minutes = minutesOf(useLearn((s) => s.profile));
  const streakDays = streak(useLearn((s) => s.days));
  const next = plan.find((s) => !s.done);
  const doneCount = plan.length - plan.filter((s) => !s.done).length;
  const allDone = plan.length > 0 && !next;

  return (
    <Card style={[styles.card, { backgroundColor: colors.sage }]}>
      <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: colors.sageInk }]}>
        TODAY’S PLAN
      </Text>
      <View style={styles.head}>
        <Text variant="title2" accessibilityRole="header" style={[styles.flex, { color: colors.sageInk }]}>
          {allDone ? 'Done for today' : `Your ${minutes} minutes`}
        </Text>
        {streakDays > 0 && (
          <View style={[styles.streak, { backgroundColor: colors.warningSoft }]} accessible accessibilityLabel={`${streakDays} ${streakDays === 1 ? 'day' : 'days'} in a row`}>
            <Icon name="flame" size={14} color={colors.warning} />
            <Text variant="footnote" weight="700" color="warning" tabular>
              {streakDays}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.steps}>
        {plan.map((s) => (
          <StepRow key={`${s.kind}-${'id' in s ? s.id : ''}`} step={s} />
        ))}
      </View>
      <Text variant="footnote" style={{ color: colors.sageInk }}>
        {allDone
          ? 'Everything for today is done. Come back tomorrow, or practise some more.'
          : doneCount > 0
            ? `${doneCount} of ${plan.length} done. The rest stays here until tonight.`
            : 'Do them in any order. Each one ticks off when it’s done.'}
      </Text>
      <Button
        label={allDone ? 'Practise some more' : doneCount > 0 ? 'Carry on' : 'Start'}
        icon={allDone ? 'refresh' : 'play'}
        variant={allDone ? 'secondary' : 'primary'}
        onPress={() => router.push(next ? stepHref(next) : '/session')}
      />
    </Card>
  );
}

function StepRow({ step }: { step: TodayStep }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={() => router.push(stepHref(step))}
      accessibilityRole="button"
      accessibilityLabel={`${step.title}, ${step.minutes} minutes${step.done ? ', done' : `, ${step.why}`}`}
      style={[styles.step, { backgroundColor: colors.surface }]}>
      <Icon name={step.done ? 'checkCircle' : stepIcon[step.kind]} size={22} color={step.done ? colors.success : colors.sageInk} />
      <View style={styles.flex}>
        <Text variant="callout" weight="600" numberOfLines={2} color={step.done ? 'label2' : undefined}>
          {step.title}
        </Text>
        <Text variant="footnote" color="label2" numberOfLines={2}>
          {step.done ? 'Done today' : `${step.minutes} min · ${step.why}`}
        </Text>
      </View>
      <Icon name="chevronRight" size={14} color={colors.label3} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: space.md },
  eyebrow: { letterSpacing: 0.8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  steps: { gap: space.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md },
});
