import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/learn/cover';
import { MissionRow } from '@/components/learn/mission-row';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { streak, today } from '@/lib/learn/activity';
import { contentById, filterLibrary, levelsInLibrary, topicsInLibrary } from '@/lib/learn/content';
import { dailyPlan, planDone, type PlanStep } from '@/lib/learn/daily';
import { dueCards, nextDue } from '@/lib/learn/deck';
import { recommendMissions } from '@/lib/learn/missions';
import { isFinished, quizScore, readShare } from '@/lib/learn/progress';
import { untilLabel } from '@/lib/learn/srs';
import { topicLabels, type LearningContent, type Level, type Topic } from '@/lib/learn/types';
import { useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const kindLabels: Record<LearningContent['kind'], string> = { story: 'Story', dialogue: 'Dialogue', serial: 'Series' };

/**
 * Learn: today's plan (or making one), missions, your words, progress, and the library.
 */
export default function LearnScreen() {
  const { colors } = useTheme();
  const progress = useLearn((s) => s.progress);
  const lastId = useLearn((s) => s.lastContentId);
  const deck = useLearn((s) => s.deck);
  const profile = useLearn((s) => s.profile);
  const days = useLearn((s) => s.days);
  const listened = useLearn((s) => s.missionListening);
  const voice = useCzechVoice();
  const [level, setLevel] = useState<Level | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  const last = contentById(lastId);
  const lastProgress = last ? progress[last.id] : undefined;
  // With a plan, Today already offers to carry on reading.
  const showContinue = !profile && last && !isFinished(lastProgress, last);
  const due = useMemo(() => dueCards(deck, new Date(), 999).length, [deck]);
  const saved = Object.keys(deck).length;
  const next = useMemo(() => (due ? null : nextDue(deck)), [deck, due]);
  const items = filterLibrary(level, topic);
  const missionState = useMemo(() => ({ progress, deck, listened }), [progress, deck, listened]);
  const missions = useMemo(() => recommendMissions(profile, missionState).slice(0, 2), [profile, missionState]);
  const plan = useMemo(
    () => (profile ? dailyPlan({ profile, progress, lastContentId: lastId, deck, today: today(days), canListen: voice.state === 'available' }) : null),
    [profile, progress, lastId, deck, days, voice.state],
  );

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {plan ? (
        <TodayCard steps={plan} streakDays={streak(days)} />
      ) : (
        <Card style={styles.setup}>
          <Text variant="title3">Make a plan</Text>
          <Text variant="callout" color="label2">
            Tell Learn why you’re learning and how long you have each day. It then picks what to review, read and listen to.
          </Text>
          <Button label="Make my plan" size="medium" onPress={() => router.push('/learn-plan')} style={styles.setupButton} />
        </Card>
      )}

      {showContinue && last && (
        <PressableScale
          onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: last.id } })}
          accessibilityRole="button"
          accessibilityLabel={`Continue ${last.title}`}
          style={[styles.continue, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
          <Cover cover={last.cover} width={64} height={84} />
          <View style={styles.continueText}>
            <Text variant="footnote" weight="600" color="accent">
              Continue
            </Text>
            <Text variant="title3" numberOfLines={2}>
              {last.title}
            </Text>
            <Text variant="footnote" color="label2">
              {last.chapters.length > 1 ? `Chapter ${(lastProgress?.chapter ?? 0) + 1} of ${last.chapters.length}` : last.titleEn}
            </Text>
            <ProgressBar value={readShare(lastProgress, last)} />
          </View>
        </PressableScale>
      )}

      <View>
        <SectionHeader
          title="Missions"
          action={
            <Pressable onPress={() => router.push('/learn/missions')} hitSlop={10} accessibilityRole="button" accessibilityLabel="See all missions">
              <Text variant="subhead" weight="600" color="accent" chrome>
                See all
              </Text>
            </Pressable>
          }
        />
        <View style={styles.missions}>
          {missions.map((m) => (
            <MissionRow key={m.id} mission={m} state={missionState} />
          ))}
        </View>
      </View>

      <Card style={styles.words}>
        <View style={styles.wordsHead}>
          <View style={[styles.wordsIcon, { backgroundColor: colors.accentSoft }]}>
            <Icon name="cards" size={22} color={colors.accent} />
          </View>
          <View style={styles.wordsText}>
            <Text variant="headline">Your words</Text>
            <Text variant="footnote" color="label2">
              {saved === 0
                ? 'Tap a word in a story and save it. It comes back here at the right moment.'
                : due > 0
                  ? `${due} ${due === 1 ? 'card' : 'cards'} to review · ${saved} saved`
                  : `All caught up · ${saved} saved${next ? ` · next in ${untilLabel(next)}` : ''}`}
            </Text>
          </View>
        </View>
        {saved > 0 && (
          <View style={styles.wordsActions}>
            {due > 0 && <Button label={`Review ${Math.min(due, 20)}`} size="medium" variant={plan ? 'secondary' : 'primary'} onPress={() => router.push('/flashcards')} />}
            <Button label="See all" variant="secondary" size="medium" onPress={() => router.push('/learn/words')} />
          </View>
        )}
      </Card>

      <List>
        <Row icon="chart" title="Progress" subtitle="Your streak, words known and the A2 exam parts" chevron onPress={() => router.push('/learn/progress')} />
        {profile && <Row icon="settings" title="Your plan" subtitle={planSummary(profile)} chevron onPress={() => router.push('/learn-plan')} />}
      </List>

      <View>
        <SectionHeader title="Library" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsBleed} contentContainerStyle={styles.chips}>
          <Chip label="All levels" selected={level === null} onPress={() => setLevel(null)} />
          {levelsInLibrary.map((l) => (
            <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(level === l ? null : l)} />
          ))}
          <View style={[styles.chipDivider, { backgroundColor: colors.separator }]} />
          {topicsInLibrary.map((t) => (
            <Chip key={t} label={topicLabels[t]} selected={topic === t} onPress={() => setTopic(topic === t ? null : t)} role="checkbox" />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {items.map((c) => (
            <LibraryItem key={c.id} content={c} />
          ))}
          {items.length === 0 && (
            <Text variant="callout" color="label2" style={styles.empty}>
              Nothing here yet for this level and topic.
            </Text>
          )}
        </View>
      </View>

      <Text variant="footnote" color="label3" style={styles.note}>
        These texts were written for CzechPal and are still being checked by a Czech teacher. Audio uses your phone’s own Czech voice.
      </Text>
    </ScrollView>
  );
}

const goalNames = { exam: 'A2 exam', everyday: 'Day to day', work: 'At work' } as const;

function planSummary(p: NonNullable<ReturnType<typeof useLearn.getState>['profile']>) {
  return `${goalNames[p.goal]} · ${p.minutes} min a day`;
}

function stepCopy(step: PlanStep): { title: string; detail: string; action: string; go: () => void } {
  switch (step.kind) {
    case 'review':
      return {
        title: step.done ? 'Review your words' : `Review ${step.count} ${step.count === 1 ? 'card' : 'cards'}`,
        detail: 'Words you saved, at the right moment',
        action: 'Review',
        go: () => router.push('/flashcards'),
      };
    case 'read':
      return {
        title: `${step.resume ? 'Carry on with' : 'Read'} “${step.content.title}”`,
        detail: `${step.content.level} · ${kindLabels[step.content.kind]} · ${step.content.minutes} min`,
        action: step.resume ? 'Continue' : 'Read',
        go: () => router.push({ pathname: '/lesson/[id]', params: { id: step.content.id } }),
      };
    case 'listen':
      return {
        title: 'Listen',
        detail: `${step.count} quick questions with your phone’s Czech voice`,
        action: 'Listen',
        go: () => router.push('/listen'),
      };
  }
}

function TodayCard({ steps, streakDays }: { steps: PlanStep[]; streakDays: number }) {
  const { colors } = useTheme();
  const allDone = planDone(steps);
  const next = steps.find((s) => !s.done);
  const nextCopy = next ? stepCopy(next) : null;
  return (
    <Card style={styles.today}>
      <View style={styles.todayHead}>
        <Text variant="title3" accessibilityRole="header" style={styles.flex}>
          Today
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
      <View>
        {steps.map((s, i) => {
          const c = stepCopy(s);
          return (
            <Pressable
              key={s.kind}
              onPress={c.go}
              accessibilityRole="button"
              accessibilityLabel={`${c.title}. ${c.detail}. ${s.done ? 'Done' : 'To do'}`}
              style={({ pressed }) => [styles.step, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }, pressed && { opacity: 0.6 }]}>
              <Icon name={s.done ? 'checkCircle' : 'circle'} size={22} color={s.done ? colors.success : s === next ? colors.accent : colors.label3} />
              <View style={styles.stepText}>
                <Text variant="callout" weight="600" color={s.done ? 'label2' : 'label'} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text variant="footnote" color="label2" numberOfLines={1}>
                  {c.detail}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {allDone ? (
        <Text variant="callout" color="success" weight="600">
          Done for today. See you tomorrow.
        </Text>
      ) : nextCopy ? (
        <Button label={nextCopy.action} icon="arrowRight" size="medium" onPress={nextCopy.go} style={styles.todayButton} />
      ) : null}
    </Card>
  );
}

function LibraryItem({ content }: { content: LearningContent }) {
  const { colors } = useTheme();
  const p = useLearn((s) => s.progress[content.id]);
  const share = readShare(p, content);
  const done = isFinished(p, content);
  const score = quizScore(p, content);
  const status = done
    ? score.answered === score.total
      ? `Read · ${score.right} of ${score.total} right`
      : 'Read'
    : share > 0
      ? `${Math.round(share * 100)}% read`
      : null;

  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: content.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${content.title}, ${content.titleEn}, level ${content.level}, ${content.minutes} minutes${status ? `, ${status}` : ''}`}
      style={[styles.item, { backgroundColor: colors.surface }]}>
      <Cover cover={content.cover} width={60} height={80} />
      <View style={styles.itemText}>
        <Text variant="headline" numberOfLines={2}>
          {content.title}
        </Text>
        <Text variant="subhead" color="label2" numberOfLines={1}>
          {content.titleEn}
        </Text>
        <View style={styles.meta}>
          <View style={[styles.level, { backgroundColor: colors.fill }]}>
            <Text variant="caption" weight="700" chrome>
              {content.level}
            </Text>
          </View>
          <Text variant="footnote" color="label2" numberOfLines={1} style={styles.metaText}>
            {[kindLabels[content.kind], `${content.minutes} min`, content.chapters.length > 1 ? `${content.chapters.length} chapters` : null].filter(Boolean).join(' · ')}
          </Text>
        </View>
        {status && (
          <Text variant="footnote" weight="600" color={done ? 'success' : 'accent'}>
            {status}
          </Text>
        )}
      </View>
      {p?.bookmarked && <Icon name="bookmarkFill" size={16} color={colors.accent} />}
    </PressableScale>
  );
}

function ProgressBar({ value }: { value: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.fill }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View style={[styles.fill, { backgroundColor: colors.accentFill, width: `${Math.max(4, value * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  setup: { gap: space.sm },
  setupButton: { alignSelf: 'flex-start', marginTop: space.sm },
  today: { gap: space.md },
  todayHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: space.sm, paddingVertical: 4, borderRadius: radius.pill },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.sm },
  stepText: { flex: 1, gap: 2 },
  todayButton: { alignSelf: 'flex-start' },
  continue: { flexDirection: 'row', gap: space.lg, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  continueText: { flex: 1, gap: space.xs, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: space.xs },
  fill: { height: 6, borderRadius: 3 },
  missions: { gap: space.md },
  words: { gap: space.lg },
  wordsHead: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  wordsIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wordsText: { flex: 1, gap: 2 },
  wordsActions: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
  chipsBleed: { marginHorizontal: -layout.gutter },
  chips: { paddingHorizontal: layout.gutter, gap: space.sm, alignItems: 'center' },
  chipDivider: { width: StyleSheet.hairlineWidth, height: 24, marginHorizontal: space.xs },
  list: { gap: space.md, marginTop: space.lg },
  item: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.md, borderRadius: radius.card, borderCurve: 'continuous' },
  itemText: { flex: 1, gap: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 },
  level: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill },
  metaText: { flex: 1 },
  empty: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.xs },
});
