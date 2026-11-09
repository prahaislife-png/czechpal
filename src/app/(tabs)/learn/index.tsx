import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AcademyCard } from '@/components/academy/academy-card';
import { Cover } from '@/components/learn/cover';
import { MissionRow } from '@/components/learn/mission-row';
import { TodayCard } from '@/components/learn/today-card';
import { SpeakCard } from '@/components/speak/speak-card';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { situationProgress } from '@/lib/learn/session';
import { situations, type Situation } from '@/lib/learn/situations';
import type { Upcoming } from '@/lib/learn/upcoming';
import { useUpcoming } from '@/lib/learn/use-upcoming';
import { useStore } from '@/store/cases';
import { contentById, filterLibrary, levelsInLibrary, topicsInLibrary } from '@/lib/learn/content';
import { dueCards, nextDue } from '@/lib/learn/deck';
import { recommendMissions } from '@/lib/learn/missions';
import { isFinished, quizScore, readShare } from '@/lib/learn/progress';
import { untilLabel } from '@/lib/learn/srs';
import { topicLabels, type LearningContent, type Level, type Topic } from '@/lib/learn/types';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const kindLabels: Record<LearningContent['kind'], string> = { story: 'Story', dialogue: 'Dialogue', serial: 'Series' };

/**
 * Learn: one plan for today (the everyday session, and the A2 Academy's steps once it's set up);
 * the way into the A2 Academy; getting ready for what's coming up; then missions, words, progress
 * and the library.
 */
export default function LearnScreen() {
  const { colors } = useTheme();
  const progress = useLearn((s) => s.progress);
  const lastId = useLearn((s) => s.lastContentId);
  const deck = useLearn((s) => s.deck);
  const profile = useLearn((s) => s.profile);
  const listened = useLearn((s) => s.missionListening);
  const [level, setLevel] = useState<Level | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);

  const last = contentById(lastId);
  const lastProgress = last ? progress[last.id] : undefined;
  const showContinue = last && !isFinished(lastProgress, last);
  const due = useMemo(() => dueCards(deck, new Date(), 999).length, [deck]);
  const saved = Object.keys(deck).length;
  const next = useMemo(() => (due ? null : nextDue(deck)), [deck, due]);
  const items = filterLibrary(level, topic);
  const missionState = useMemo(() => ({ progress, deck, listened }), [progress, deck, listened]);
  const missions = useMemo(() => recommendMissions(profile, missionState).slice(0, 2), [profile, missionState]);
  const coming = useUpcoming();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text variant="title1" accessibilityRole="header">
          A little Czech every day
        </Text>
        <Text variant="callout" color="label2">
          Today’s plan first, then your A2 journey, speaking and your words. Everything else is further down.
        </Text>
      </View>

      <TodayCard />

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

      <AcademyCard />

      <SpeakCard />

      <Card style={[styles.words, { backgroundColor: colors.sky }]}>
        <View style={styles.wordsHead}>
          <View style={[styles.wordsIcon, { backgroundColor: colors.surface }]}>
            <Icon name="cards" size={22} color={colors.skyInk} />
          </View>
          <View style={styles.wordsText}>
            <Text variant="title3">My words</Text>
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
            {due > 0 && <Button label={`Review ${Math.min(due, 20)}`} size="medium" variant="secondary" onPress={() => router.push('/flashcards')} />}
            <Button label="See all" variant="secondary" size="medium" onPress={() => router.push('/learn/words')} />
          </View>
        )}
      </Card>

      <GetReady coming={coming} />

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

      <List>
        <Row icon="chart" title="Progress" subtitle="Your streak, words known and the A2 exam parts" chevron onPress={() => router.push('/learn/progress')} />
        <Row
          icon="settings"
          title="Your plan"
          subtitle={profile ? planSummary(profile) : 'How long each day, and why you’re learning'}
          chevron
          onPress={() => router.push('/learn-plan')}
        />
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
        These texts were written for CzechLocal and reviewed by a native Czech teacher. Audio uses your phone’s own Czech voice.
      </Text>
    </ScrollView>
  );
}

const goalNames = { exam: 'A2 exam', everyday: 'Day to day', work: 'At work' } as const;

function planSummary(p: NonNullable<ReturnType<typeof useLearn.getState>['profile']>) {
  return `${goalNames[p.goal]} · ${p.minutes} min a day`;
}

/** Situations coming up, soonest first, then the rest to pick from. */
function GetReady({ coming }: { coming: Upcoming[] }) {
  const { colors } = useTheme();
  const memory = useLearn((s) => s.phrases);
  const hasPermitDate = !!useStore((s) => s.about.expires);
  const others = situations.filter((s) => !coming.some((c) => c.situation.id === s.id));
  const open = (s: Situation) => router.push({ pathname: '/prepare/[id]', params: { id: s.id } });
  return (
    <View>
      <SectionHeader title="Get ready" />
      {coming.length > 0 ? (
        <List>
          {coming.slice(0, 3).map((c) => {
            const { known, total } = situationProgress(c.situation, memory);
            return (
              <Row
                key={c.situation.id}
                icon={c.situation.icon}
                title={c.situation.title}
                subtitle={`${c.reason} · ${known}/${total} phrases`}
                chevron
                onPress={() => open(c.situation)}
              />
            );
          })}
        </List>
      ) : (
        <Text variant="footnote" color="label2" style={styles.readyHint}>
          Nothing coming up yet. Scan a letter, or add your permit date, and Learn gets you ready for it.
        </Text>
      )}
      {!hasPermitDate ? (
        <Pressable onPress={() => router.push('/about')} accessibilityRole="button" style={styles.readyLink} hitSlop={6}>
          <Icon name="calendar" size={16} color={colors.accent} />
          <Text variant="subhead" weight="600" color="accent" chrome>
            Add when your permit ends
          </Text>
        </Pressable>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsBleed} contentContainerStyle={styles.tiles}>
        {others.map((s) => {
          const { known, total } = situationProgress(s, memory);
          return (
            <PressableScale
              key={s.id}
              onPress={() => open(s)}
              accessibilityRole="button"
              accessibilityLabel={`${s.title}. ${known} of ${total} phrases`}
              style={[styles.tile, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
              <View style={[styles.tileIcon, { backgroundColor: colors.accentSoft }]}>
                <Icon name={s.icon} size={20} color={colors.accent} />
              </View>
              <Text variant="subhead" weight="600" numberOfLines={2}>
                {s.title}
              </Text>
              <Text variant="caption" color="label3">
                {known}/{total} phrases
              </Text>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
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
  heading: { gap: space.xs, paddingHorizontal: space.xs },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  readyHint: { paddingHorizontal: space.xs, marginBottom: space.sm },
  readyLink: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs, paddingVertical: space.sm, alignSelf: 'flex-start' },
  tiles: { paddingHorizontal: layout.gutter, gap: space.md, paddingVertical: space.md },
  tile: { width: 132, borderRadius: radius.card, borderCurve: 'continuous', padding: space.md, gap: space.sm },
  tileIcon: { width: 36, height: 36, borderRadius: radius.well, alignItems: 'center', justifyContent: 'center' },
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
