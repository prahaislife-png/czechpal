import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SetupCard } from '@/components/academy/academy-card';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { MIN_EVIDENCE, readinessLabels, skillReadiness, weakObjectives, type SkillReadiness } from '@/lib/academy/evidence';
import { grammar } from '@/lib/academy/grammar';
import { lessonById } from '@/lib/academy/lessons';
import { planMinutes } from '@/lib/academy/plan';
import { roadmap } from '@/lib/academy/roadmap';
import { topicById } from '@/lib/academy/topics';
import { stepHref, stepIcon, useTodayPlan } from '@/lib/academy/use-plan';
import type { Skill } from '@/lib/academy/types';
import { daysToExam, EXAM_CHECKED_ON } from '@/lib/learn/exam';
import { minutesOf } from '@/lib/learn/profile';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const skillNames: Record<Skill, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const skillIcons = { reading: 'book', listening: 'ear', writing: 'compose', speaking: 'message' } as const;

/**
 * A2 Academy home: carry on, today's plan, readiness per exam skill, what needs work, then the
 * roadmap, grammar and the exam's verified facts.
 */
export default function AcademyScreen() {
  const { colors } = useTheme();
  const profile = useLearn((s) => s.profile);
  const setupAt = useAcademy((s) => s.setupAt);
  const attempts = useAcademy((s) => s.attempts);
  const lessons = useAcademy((s) => s.lessons);
  const current = lessonById(useAcademy((s) => s.current));
  const plan = useTodayPlan();
  const readiness = useMemo(() => (['reading', 'listening', 'writing', 'speaking'] as Skill[]).map((s) => skillReadiness(attempts, s)), [attempts]);
  const weak = useMemo(() => weakObjectives(attempts), [attempts]);
  const map = useMemo(() => roadmap(lessons, attempts), [lessons, attempts]);
  const started = map.filter((t) => t.state !== 'not-started').length;
  const left = profile?.examDate ? daysToExam(profile.examDate) : null;

  if (!setupAt)
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <SetupCard />
        <List>
          <Row icon="info" title="About the exam" subtitle="Parts, points and how to pass" chevron onPress={() => router.push('/learn/exam')} />
        </List>
      </ScrollView>
    );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {left !== null && left >= 0 ? (
        <View style={[styles.countdown, { backgroundColor: colors.accentSoft }]}>
          <Icon name="calendar" size={18} color={colors.accent} />
          <Text variant="subhead" weight="600" color="accent" style={styles.flex}>
            {left === 0 ? 'Your exam is today' : `${left} ${left === 1 ? 'day' : 'days'} to your exam · ${longDate(profile!.examDate!)}`}
          </Text>
        </View>
      ) : null}

      {current ? (
        <PressableScale
          onPress={() => router.push({ pathname: '/a2-lesson/[id]', params: { id: current.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Continue ${current.title}`}
          style={[styles.continue, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
          <View style={[styles.well, { backgroundColor: colors.accentSoft }]}>
            <Icon name="play" size={20} color={colors.accent} />
          </View>
          <View style={styles.flex}>
            <Text variant="footnote" weight="600" color="accent">
              Continue learning
            </Text>
            <Text variant="headline">{current.title}</Text>
            <Text variant="footnote" color="label2">
              {topicById(current.topic)?.title}
            </Text>
          </View>
          <Icon name="chevronRight" size={16} color={colors.label3} />
        </PressableScale>
      ) : null}

      <View>
        <SectionHeader title={`Today · ${planMinutes(plan)} of ${minutesOf(profile)} min`} />
        {plan.length ? (
          <List>
            {plan.map((s) => (
              <Row key={`${s.kind}-${'id' in s ? s.id : ''}`} icon={stepIcon[s.kind]} title={s.title} subtitle={`${s.minutes} min · ${s.why}`} chevron onPress={() => router.push(stepHref(s))} />
            ))}
          </List>
        ) : (
          <Text variant="footnote" color="label2" style={styles.note}>
            You’ve done every lesson written so far. More topics are on the way; meanwhile, keep your words and stories going in Learn.
          </Text>
        )}
      </View>

      <View>
        <SectionHeader title="Your readiness" />
        <Card style={styles.readiness}>
          {readiness.map((r, i) => (
            <View key={r.skill}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <ReadinessRow r={r} />
            </View>
          ))}
        </Card>
        <Text variant="footnote" color="label3" style={styles.note}>
          Built from your own answers in checks: first tries, no hints. It isn’t an exam score. “Ready” needs a full practice test, which comes in a later
          update.
        </Text>
      </View>

      <View>
        <SectionHeader title="What needs work" />
        {weak.length ? (
          <List>
            {weak.map((w) => {
              const g = w.objective.startsWith('g:') ? w.objective.slice(2) : null;
              const t = w.objective.startsWith('t:') ? w.objective.split(':')[1] : null;
              return (
                <Row
                  key={w.objective}
                  icon={g ? 'book' : 'flag'}
                  title={w.label}
                  subtitle={`${w.right} of ${w.total} right lately`}
                  chevron
                  onPress={() =>
                    g ? router.push({ pathname: '/learn/grammar/[id]', params: { id: g } }) : t ? router.push({ pathname: '/learn/topic/[id]', params: { id: t } }) : undefined
                  }
                />
              );
            })}
          </List>
        ) : (
          <Text variant="footnote" color="label2" style={styles.note}>
            Nothing yet. After a few checks, what you miss most shows up here.
          </Text>
        )}
      </View>

      <List>
        <Row icon="flag" title="Exam practice" subtitle="Reading, listening and writing, as in the exam" chevron onPress={() => router.push('/learn/practice')} />
        <Row icon="map" title="Topics" subtitle={`${started} of ${map.length} started`} chevron onPress={() => router.push('/learn/topics')} />
        <Row icon="book" title="Grammar" subtitle={`${grammar.length} short explanations`} chevron onPress={() => router.push('/learn/grammar')} />
        <Row icon="info" title="About the exam" subtitle={`Checked ${longDate(EXAM_CHECKED_ON)}`} chevron onPress={() => router.push('/learn/exam')} />
        <Row icon="flag" title="Starting check" subtitle="Take it again any time" chevron onPress={() => router.push('/diagnostic')} />
        <Row icon="settings" title="Your A2 plan" subtitle="Level, exam date, minutes" chevron onPress={() => router.push('/a2-setup')} />
      </List>

      <Text variant="footnote" color="label3" style={styles.note}>
        Lessons and exercises are written for CzechPal and checked by AI, not by a teacher yet. If something looks wrong, tell us from Help. Saved on this
        phone only.
      </Text>
    </ScrollView>
  );
}

function ReadinessRow({ r }: { r: SkillReadiness }) {
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

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  countdown: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.tile, padding: space.md },
  continue: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  well: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  readiness: { paddingVertical: space.xs },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.sm },
  skill: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  meter: { width: 56, height: 6, borderRadius: 3, overflow: 'hidden' },
  meterFill: { height: 6, borderRadius: 3 },
});
