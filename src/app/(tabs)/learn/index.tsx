import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/learn/cover';
import { CourseSection } from '@/components/learn/course-section';
import { ExamSection } from '@/components/learn/exam-section';
import { TodayCard } from '@/components/learn/today-card';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { grammar } from '@/lib/academy/grammar';
import { lessonById } from '@/lib/academy/lessons';
import { topicById } from '@/lib/academy/topics';
import { contentById } from '@/lib/learn/content';
import { dueCards, nextDue } from '@/lib/learn/deck';
import { formatCount, WORD_COUNT } from '@/lib/words';
import { isFinished, readShare } from '@/lib/learn/progress';
import { untilLabel } from '@/lib/learn/srs';
import { useAcademy } from '@/store/academy';
import { useStore } from '@/store/cases';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const goalNames = { exam: 'A2 exam', everyday: 'Day to day', work: 'At work' } as const;

/**
 * Learn, on one screen: today's plan; carry on where you stopped; the course, topic by topic
 * (lessons, missions, phrases and texts live inside each topic); the A2 exam; then the tools.
 */
export default function LearnScreen() {
  const { colors } = useTheme();
  const profile = useLearn((s) => s.profile);
  const deck = useLearn((s) => s.deck);
  const hasPermitDate = !!useStore((s) => s.about.expires);
  const due = useMemo(() => dueCards(deck, new Date(), 999).length, [deck]);
  const saved = Object.keys(deck).length;
  const next = useMemo(() => (due ? null : nextDue(deck)), [deck, due]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text variant="title1" accessibilityRole="header">
          A little Czech every day
        </Text>
        <Text variant="callout" color="label2">
          Today’s plan, then your course topic by topic, the A2 exam and your tools.
        </Text>
      </View>

      <View style={styles.today}>
        <TodayCard />
        {!hasPermitDate ? (
          <Pressable onPress={() => router.push('/about')} accessibilityRole="button" style={styles.link} hitSlop={6}>
            <Icon name="calendar" size={16} color={colors.accent} />
            <Text variant="subhead" weight="600" color="accent" chrome style={styles.flex}>
              Add when your permit ends, and Today gets you ready for it
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ContinueCard />

      <CourseSection />

      <ExamSection />

      <View>
        <SectionHeader title="Tools" />
        <List>
          <Row icon="mic" title="Speak Czech" subtitle="Talk out loud with a tutor that corrects you" chevron onPress={() => router.push('/learn/speak')} />
          <Row
            icon="cards"
            title="My words"
            subtitle={
              saved === 0
                ? 'Tap a word in any text to save it; it comes back at the right moment'
                : due > 0
                  ? `${due} ${due === 1 ? 'card' : 'cards'} to review · ${saved} saved`
                  : `All caught up · ${saved} saved${next ? ` · next in ${untilLabel(next)}` : ''}`
            }
            chevron
            onPress={() => router.push(due > 0 ? '/flashcards' : '/learn/words')}
          />
          <Row
            icon="text"
            title="Slovíčka"
            subtitle={`${formatCount(WORD_COUNT)} Czech words to scroll through, with meanings and examples`}
            chevron
            onPress={() => router.push('/slovicka')}
          />
          <Row icon="book" title="Grammar" subtitle={`${grammar.length} short explanations`} chevron onPress={() => router.push('/learn/grammar')} />
          <Row icon="chart" title="Progress" subtitle="Your streak, words known and the exam parts" chevron onPress={() => router.push('/learn/progress')} />
          <Row
            icon="settings"
            title="Your plan"
            subtitle={profile ? `${goalNames[profile.goal]} · ${profile.minutes} min a day` : 'How long each day, and why you’re learning'}
            chevron
            onPress={() => router.push('/learn-plan')}
          />
        </List>
      </View>

      <Text variant="footnote" color="label3" style={styles.note}>
        Stories and dialogues were reviewed by a native Czech teacher. Lessons and exam practice are written for CzechLocal and checked by AI. Saved on this phone only.
      </Text>
    </ScrollView>
  );
}

/** Carry on: the A2 lesson left open, else the text being read. Hidden when there's nothing to finish. */
function ContinueCard() {
  const { colors } = useTheme();
  const lesson = lessonById(useAcademy((s) => s.current));
  const progress = useLearn((s) => s.progress);
  const last = contentById(useLearn((s) => s.lastContentId));
  const lastProgress = last ? progress[last.id] : undefined;
  const story = last && !isFinished(lastProgress, last) ? last : undefined;

  if (lesson)
    return (
      <PressableScale
        onPress={() => router.push({ pathname: '/a2-lesson/[id]', params: { id: lesson.id } })}
        accessibilityRole="button"
        accessibilityLabel={`Continue ${lesson.title}`}
        style={[styles.continue, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <View style={[styles.well, { backgroundColor: colors.accentSoft }]}>
          <Icon name="play" size={20} color={colors.accent} />
        </View>
        <View style={styles.flex}>
          <Text variant="footnote" weight="600" color="accent">
            Continue
          </Text>
          <Text variant="headline">{lesson.title}</Text>
          <Text variant="footnote" color="label2">
            {topicById(lesson.topic)?.title}
          </Text>
        </View>
        <Icon name="chevronRight" size={16} color={colors.label3} />
      </PressableScale>
    );

  if (!story) return null;
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: story.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Continue ${story.title}`}
      style={[styles.continue, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <Cover cover={story.cover} width={52} height={68} />
      <View style={styles.flex}>
        <Text variant="footnote" weight="600" color="accent">
          Continue reading
        </Text>
        <Text variant="headline" numberOfLines={2}>
          {story.title}
        </Text>
        <Text variant="footnote" color="label2">
          {story.chapters.length > 1 ? `Chapter ${(lastProgress?.chapter ?? 0) + 1} of ${story.chapters.length}` : story.titleEn}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { backgroundColor: colors.accentFill, width: `${Math.max(4, readShare(lastProgress, story) * 100)}%` }]} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  heading: { gap: space.xs, paddingHorizontal: space.xs },
  flex: { flex: 1 },
  today: { gap: space.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs, paddingVertical: space.sm },
  continue: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  well: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: space.xs },
  fill: { height: 6, borderRadius: 3 },
  note: { paddingHorizontal: space.xs },
});
