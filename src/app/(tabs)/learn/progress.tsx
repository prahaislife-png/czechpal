import { router } from 'expo-router';
import { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
import { lastWeek, streak } from '@/lib/learn/activity';
import { daysToExam, EXAM_CHECKED_ON, EXAM_SOURCES, examParts, NEW_FORMAT_FROM, passMarks } from '@/lib/learn/exam';
import { learnStats } from '@/lib/learn/stats';
import { topicLabels } from '@/lib/learn/types';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const pct = (right: number, of: number) => (of ? `${Math.round((right / of) * 100)}%` : '–');

/**
 * Progress: the streak, what's been read, heard and learnt, mapped onto the four parts of the A2
 * exam, and (for exam learners) the exam's checked facts. Writing and speaking are practised in
 * A2 Academy but not scored, so the screen counts them rather than showing a score.
 */
export default function ProgressScreen() {
  const { colors } = useTheme();
  const progress = useLearn((s) => s.progress);
  const written = useAcademy((s) => Object.values(s.writing).reduce((n, runs) => n + runs.length, 0));
  const spokenTasks = useAcademy((s) => Object.values(s.speaking).reduce((n, runs) => n + runs.length, 0));
  const deck = useLearn((s) => s.deck);
  const days = useLearn((s) => s.days);
  const profile = useLearn((s) => s.profile);
  const stats = useMemo(() => learnStats({ progress, deck, days }), [progress, deck, days]);
  const run = streak(days);
  const week = lastWeek(days);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Card style={styles.streakCard}>
        <View style={styles.streakHead}>
          <Icon name="flame" size={28} color={run > 0 ? colors.warning : colors.label3} />
          <View style={styles.flex}>
            <Text variant="title2" tabular>
              {run} {run === 1 ? 'day' : 'days'} in a row
            </Text>
            <Text variant="footnote" color="label2">
              {run === 0 ? 'Any review, chapter or listening starts a streak.' : 'A little every day is what makes it stick.'}
            </Text>
          </View>
        </View>
        <View style={styles.week}>
          {week.map((d) => (
            <View
              key={d.key}
              style={styles.day}
              accessible
              accessibilityLabel={`${d.today ? 'Today' : WEEKDAY_NAMES[d.weekday]}: ${d.active ? 'practised' : 'no practice'}`}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: d.active ? colors.accentFill : colors.fill },
                  d.today && { borderColor: colors.accent, borderWidth: 2 },
                ]}>
                {d.active && <Icon name="check" size={14} color={colors.onAccent} />}
              </View>
              <Text variant="caption" color={d.today ? 'accent' : 'label3'} weight={d.today ? '700' : '500'}>
                {WEEKDAYS[d.weekday]}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.grid}>
        <Stat value={`${stats.texts.read}`} of={`of ${stats.texts.total}`} label="texts read" />
        <Stat value={`${stats.words.known}`} of={`of ${stats.words.saved}`} label="words known" />
        <Stat value={`${stats.month.reviews}`} label="reviews, 30 days" />
        <Stat value={pct(stats.listening.right, stats.listening.heard)} label="heard right, 30 days" />
      </View>

      <View>
        <SectionHeader title="The four parts of the A2 exam" />
        <List>
          <Row
            icon="book"
            title="Reading"
            subtitle={stats.texts.read ? `${stats.texts.read} texts read · ${pct(stats.quiz.right, stats.quiz.answered)} of questions right` : 'Read a story and answer its questions'}
          />
          <Row
            icon="ear"
            title="Listening"
            subtitle={stats.listening.heard ? `${pct(stats.listening.right, stats.listening.heard)} right in the last 30 days` : 'Do a listening session to start'}
          />
          <Row icon="compose" title="Writing" subtitle={written ? `${written} ${written === 1 ? 'piece' : 'pieces'} written in A2 Academy · not scored` : 'Try the writing coach in A2 Academy'} />
          <Row icon="message" title="Speaking" subtitle={spokenTasks ? `${spokenTasks} speaking ${spokenTasks === 1 ? 'task' : 'tasks'} recorded · not scored` : 'Record yourself in A2 Academy'} />
        </List>
        <Text variant="footnote" color="label2" style={styles.note}>
          Words help with all four: {stats.words.known} known, {stats.words.learning} still being learnt. A word counts as known once its next review is three weeks away.
        </Text>
      </View>

      <View>
        <SectionHeader title="Topics read" />
        <View style={[styles.topics, { backgroundColor: colors.surface }]}>
          {stats.topics.map((t, i) => (
            <View
              key={t.topic}
              style={[styles.topic, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}
              accessible
              accessibilityLabel={`${topicLabels[t.topic]}: ${t.read} of ${t.total} read`}>
              <Text variant="callout" style={styles.topicName}>
                {topicLabels[t.topic]}
              </Text>
              <View style={[styles.track, { backgroundColor: colors.fill }]}>
                <View style={[styles.fill, { backgroundColor: t.read === t.total ? colors.success : colors.accentFill, width: `${(t.read / t.total) * 100}%` }]} />
              </View>
              <Text variant="footnote" color="label2" tabular style={styles.topicCount}>
                {t.read}/{t.total}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {profile?.goal === 'exam' && <ExamFacts examDate={profile.examDate} />}
    </ScrollView>
  );
}

function Stat({ value, of, label }: { value: string; of?: string; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]} accessible accessibilityLabel={`${value} ${of ?? ''} ${label}`}>
      <Text variant="title1" tabular>
        {value}
        {of ? (
          <Text variant="subhead" color="label3">
            {' '}
            {of}
          </Text>
        ) : null}
      </Text>
      <Text variant="footnote" color="label2">
        {label}
      </Text>
    </View>
  );
}

/** Only facts checked on the organiser's site, with the date they were checked and a link to recheck. */
function ExamFacts({ examDate }: { examDate?: string }) {
  const { colors } = useTheme();
  const left = examDate ? daysToExam(examDate) : null;
  return (
    <View>
      <SectionHeader title="The A2 exam for permanent residence" />
      <Card style={styles.exam}>
        {left !== null && left >= 0 && (
          <Text variant="headline">
            {left === 0 ? 'Your exam is today.' : `${left} ${left === 1 ? 'day' : 'days'} to your exam on ${longDate(examDate!)}.`}
          </Text>
        )}
        {left === null && (
          <Pressable onPress={() => router.push('/learn-plan')} accessibilityRole="button">
            <Text variant="callout" color="accent" weight="600">
              Add your exam date
            </Text>
          </Pressable>
        )}
        <View style={styles.parts}>
          {examParts.map((p) => (
            <View key={p.id} style={styles.part}>
              <Text variant="callout" weight="600" style={styles.flex}>
                {p.label}
              </Text>
              <Text variant="footnote" color="label2" tabular>
                {p.approx ? 'about ' : ''}
                {p.minutes} min · {p.points} points
              </Text>
            </View>
          ))}
        </View>
        <Text variant="footnote" color="label2">
          To pass you need {passMarks.written.need} of {passMarks.written.of} points in reading, writing and listening together, and {passMarks.speaking.need} of {passMarks.speaking.of} in speaking.
          From {longDate(NEW_FORMAT_FROM)}, writing and speaking have a new format.
        </Text>
        <Text variant="caption" color="label3">
          From the organiser’s website, checked {longDate(EXAM_CHECKED_ON)}. Always confirm there before your exam.
        </Text>
        <View style={styles.links}>
          <Pressable onPress={() => Linking.openURL(EXAM_SOURCES.overview)} accessibilityRole="link" hitSlop={6} style={styles.link}>
            <Text variant="subhead" color="accent" weight="600">
              Official exam page
            </Text>
            <Icon name="external" size={14} color={colors.accent} />
          </Pressable>
          <Pressable onPress={() => Linking.openURL(EXAM_SOURCES.newFormatTest)} accessibilityRole="link" hitSlop={6} style={styles.link}>
            <Text variant="subhead" color="accent" weight="600">
              Practice test, new format
            </Text>
            <Icon name="external" size={14} color={colors.accent} />
          </Pressable>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  streakCard: { gap: space.lg },
  streakHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: space.xs },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  stat: { flexGrow: 1, flexBasis: '45%', padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous', gap: 2 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  topics: { borderRadius: radius.card, borderCurve: 'continuous', paddingHorizontal: space.lg },
  topic: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  topicName: { width: 120 },
  topicCount: { minWidth: 32, textAlign: 'right' },
  track: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  exam: { gap: space.md },
  parts: { gap: space.sm },
  part: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  links: { gap: space.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 32 },
});
