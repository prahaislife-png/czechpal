import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { toneColors, type Tone } from '@/components/design/tone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { MIN_EVIDENCE, readinessLabels, type SkillReadiness } from '@/lib/academy/evidence';
import type { TopicProgress, TopicState } from '@/lib/academy/roadmap';
import type { Skill } from '@/lib/academy/types';
import { afterExam } from '@/lib/learn/exam';
import { useAcademy } from '@/store/academy';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export const skillNames: Record<Skill, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const skillIcons = { reading: 'book', listening: 'ear', writing: 'compose', speaking: 'message' } as const;

const stateTone: Record<TopicState, Tone> = { 'not-started': 'neutral', learning: 'sky', practised: 'lavender', mastered: 'sage' };
const stateWords: Record<TopicState, string> = { 'not-started': 'Not started', learning: 'Learning', practised: 'Practised', mastered: 'Secure' };

/** One topic of the course: its number, name, state and lessons done, from real progress. */
export function RoadmapTile({ t, n }: { t: TopicProgress; n: number }) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, stateTone[t.state]);
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/learn/topic/[id]', params: { id: t.topic.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Topic ${n}, ${t.topic.title}. ${stateWords[t.state]}. ${t.done} of ${t.total} lessons done.`}
      style={[styles.tile, { backgroundColor: tint }]}>
      <Text variant="title2" style={{ color: ink }}>
        {n}
      </Text>
      <Text variant="subhead" weight="600" numberOfLines={2} style={{ color: ink }}>
        {t.topic.title}
      </Text>
      <Text variant="caption" style={{ color: ink, opacity: 0.85 }}>
        {stateWords[t.state]} · {t.done}/{t.total}
      </Text>
    </PressableScale>
  );
}

/** One exam skill: how ready, from the learner's own first-try answers. */
export function ReadinessRow({ r }: { r: SkillReadiness }) {
  const { colors } = useTheme();
  const status =
    r.skill === 'speaking'
      ? 'Not scored: record yourself in Exam practice'
      : r.count === 0
        ? 'Not assessed yet'
        : !r.enough
          ? `Not enough assessed practice yet · ${r.count} of ${MIN_EVIDENCE}`
          : `${readinessLabels[r.state]} · ${Math.round((r.accuracy ?? 0) * 100)}% of the last ${Math.min(r.count, 30)}`;
  const tone = r.state === 'needs-practice' && r.enough ? colors.warning : colors.accent;
  return (
    <View style={styles.skill} accessible accessibilityLabel={`${skillNames[r.skill]}: ${status}`}>
      <Icon name={skillIcons[r.skill]} size={20} color={r.skill === 'speaking' ? colors.label3 : tone} />
      <View style={styles.flex}>
        <Text variant="headline">{skillNames[r.skill]}</Text>
        <Text variant="footnote" color="label2">
          {status}
        </Text>
      </View>
      {r.enough && r.skill !== 'speaking' ? (
        <View style={[styles.meter, { backgroundColor: colors.fill }]}>
          <View style={[styles.meterFill, { backgroundColor: tone, width: `${Math.max(6, Math.round((r.accuracy ?? 0) * 100))}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

/** Once the exam date has passed: how did it go? The answer changes what the card says next. */
export function ExamCheckIn({ examDate }: { examDate: string }) {
  const { colors } = useTheme();
  const saved = useAcademy((s) => s.examResult);
  const result = saved?.examDate === examDate ? saved.result : undefined;
  const set = (r: 'passed' | 'failed' | 'waiting') => useAcademy.getState().setExamResult(examDate, r);
  const change = <Button label="Change my answer" variant="plain" size="medium" onPress={() => useAcademy.getState().setExamResult(examDate, 'waiting')} />;
  return (
    <Card style={styles.checkIn}>
      {!result ? (
        <>
          <Text variant="headline">How did your exam go?</Text>
          <Text variant="footnote" color="label2">
            Your exam was on {longDate(examDate)}. Tell CzechLocal, and your plan follows. Saved on this phone only.
          </Text>
          <Button label="I passed" size="medium" onPress={() => set('passed')} />
          <Button label="Waiting for the result" variant="secondary" size="medium" onPress={() => set('waiting')} />
          <Button label="Not this time" variant="secondary" size="medium" onPress={() => set('failed')} />
        </>
      ) : result === 'passed' ? (
        <>
          <View style={styles.checkInHead}>
            <Icon name="checkCircle" size={22} color={colors.success} />
            <Text variant="headline" style={styles.flex}>
              Congratulations!
            </Text>
          </View>
          <Text variant="callout" color="label2">
            The certificate, Osvědčení o znalosti českého jazyka, is sent within {afterExam.certificateWithinDays} days and doesn’t expire. Keep your Czech going in Learn.
          </Text>
        </>
      ) : result === 'waiting' ? (
        <>
          <Text variant="headline">Waiting for the result</Text>
          <Text variant="callout" color="label2">
            The certificate is sent within {afterExam.certificateWithinDays} days of the exam. Your plan carries on meanwhile.
          </Text>
          <Button label="I passed" size="medium" onPress={() => set('passed')} />
          <Button label="Not this time" variant="secondary" size="medium" onPress={() => set('failed')} />
        </>
      ) : (
        <>
          <Text variant="headline">Next time</Text>
          <Text variant="callout" color="label2">
            If either part doesn’t pass, the whole exam is taken again, at the earliest {afterExam.retakeAfterMonths} months later and at most{' '}
            {afterExam.retakesPerYear} times a year. A mock exam shows which part needs the most work.
          </Text>
          <Button label="Set a new exam date" size="medium" onPress={() => router.push('/learn-plan')} />
          <Button label="Take a mock exam" variant="secondary" size="medium" onPress={() => router.push('/learn/mock')} />
        </>
      )}
      {result && result !== 'waiting' ? change : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkIn: { gap: space.sm },
  checkInHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  skill: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  meter: { width: 56, height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: 6, borderRadius: 3 },
  tile: { width: 138, minHeight: 128, borderRadius: radius.card, borderCurve: 'continuous', padding: space.md, gap: space.xxs, justifyContent: 'space-between' },
});
