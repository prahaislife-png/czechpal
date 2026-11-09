import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui/card';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { longDate, shortDate } from '@/lib/about';
import {
  EMAIL_MIN_WORDS,
  EXAM_CHECKED_ON,
  EXAM_SOURCES,
  examParts,
  examTasks,
  FORM_MIN_WORDS,
  LISTENING_PLAYS,
  NEW_FORMAT_FROM,
  passMarks,
  PRONUNCIATION_POINTS,
} from '@/lib/learn/exam';
import {
  afterTheExam,
  bookableDates,
  EXAM_FEE_CZK,
  examDay,
  exemptions,
  GUIDE_CHECKED_ON,
  GUIDE_SOURCES,
  registrationSteps,
  REGISTER_DAYS_BEFORE,
  whoMustTake,
  withdrawal,
} from '@/lib/learn/exam-guide';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Everything about the A2 exam for permanent residence, from the organiser's own published sources
 * only: who needs it, registering, dates and cost, the exam day, the four parts and every task,
 * how passing works, and what happens after. Each part says when it was checked.
 */
export default function ExamScreen() {
  const { colors } = useTheme();
  const dates = useMemo(() => bookableDates(), []);
  const [showExempt, setShowExempt] = useState(false);
  const fee = `${EXAM_FEE_CZK.toLocaleString('en-GB')} Kč`;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <Text variant="title1" accessibilityRole="header">
          Everything about the A2 exam
        </Text>
        <Text variant="callout" color="label2">
          The Czech exam for permanent residence: who needs it, how to register, the day itself, every task and how you pass. Only from the organiser’s own
          pages, checked {longDate(GUIDE_CHECKED_ON)}.
        </Text>
      </View>

      <View style={styles.facts}>
        <Fact icon="money" label="Fee" value={fee} note="each attempt" />
        <Fact icon="clock" label="Exam time" value="About 2 h" note="written 110 min, oral 15, same day" />
        <Fact icon="checkCircle" label="To pass" value="60 %" note="of each part" />
        <Fact icon="calendar" label="Dates" value="3 a month" note="Wed or Sat, 9:00" />
      </View>

      <View>
        <SectionHeader title="Do you need it?" />
        <Card style={styles.card}>
          <Text variant="headline">You need it if you are</Text>
          {whoMustTake.map((t) => (
            <Bullet key={t} text={t} />
          ))}
          <Pressable
            onPress={() => setShowExempt((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showExempt }}
            style={styles.toggle}
            hitSlop={6}>
            <Text variant="subhead" weight="600" color="accent" style={styles.flex}>
              Who doesn’t need it
            </Text>
            <Icon name="chevronDown" size={14} color={colors.accent} style={showExempt ? styles.flip : undefined} />
          </Pressable>
          {showExempt ? exemptions.map((t) => <Bullet key={t} text={t} />) : null}
        </Card>
      </View>

      <View>
        <SectionHeader title="How to register" />
        <Card style={styles.card}>
          {registrationSteps.map((s, i) => (
            <View key={s.title} style={styles.step}>
              <View style={[styles.stepNo, { backgroundColor: colors.accentFill }]}>
                <Text variant="footnote" weight="700" color="onAccent">
                  {i + 1}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text variant="callout" weight="600">
                  {s.title}
                </Text>
                <Text variant="footnote" color="label2">
                  {s.detail}
                </Text>
              </View>
            </View>
          ))}
          <Text variant="footnote" color="label2">
            {withdrawal}
          </Text>
          <Link label="Official online registration" url={GUIDE_SOURCES.registration} />
          <Link label="Schools that hold the exam" url={GUIDE_SOURCES.schools} />
        </Card>
      </View>

      <View>
        <SectionHeader title="Dates you can still register for" />
        {dates.length ? (
          <List>
            {dates.map((d) => (
              <Row key={d.date} icon="calendar" title={longDate(d.date)} subtitle={`Register by ${shortDate(d.registerBy)}`} />
            ))}
          </List>
        ) : null}
        <Text variant="footnote" color="label3" style={styles.note}>
          From the organiser’s list, checked {longDate(GUIDE_CHECKED_ON)}; registration closes {REGISTER_DAYS_BEFORE} days before. Dates can change: check the official
          page.
        </Text>
      </View>

      <View>
        <SectionHeader title="On the day" />
        <Card style={styles.card}>
          {examDay.map((t, i) => (
            <Bullet key={t} text={t} n={i + 1} />
          ))}
        </Card>
      </View>

      <View>
        <SectionHeader title="How you pass" />
        <Card style={styles.card}>
          <Text variant="headline">Two parts, both must pass</Text>
          <Text variant="callout">
            Written part (reading, writing, listening): at least {passMarks.written.need} of {passMarks.written.of} points together.
          </Text>
          <Text variant="callout">
            Speaking: at least {passMarks.speaking.need} of {passMarks.speaking.of} points.
          </Text>
          <Text variant="footnote" color="label2">
            Both are 60%. A strong written part can’t make up for speaking, or the other way round. If you fail either part, you repeat the whole exam.
          </Text>
        </Card>
      </View>

      <View>
        <SectionHeader title="The four parts" />
        <Card style={styles.card}>
          {examParts.map((p) => (
            <View key={p.id} style={styles.part}>
              <Text variant="callout" weight="600" style={styles.flex}>
                {p.label}
              </Text>
              <Text variant="footnote" color="label2" tabular>
                {p.id === 'speaking' ? 'up to ' : p.approx ? 'about ' : ''}
                {p.minutes} min · {p.points} points
              </Text>
            </View>
          ))}
          <Text variant="footnote" color="label2">
            Writing and speaking have a new format from {longDate(NEW_FORMAT_FROM)}.
          </Text>
        </Card>
      </View>

      {examParts.map((p) => (
        <View key={p.id}>
          <SectionHeader title={p.label} />
          <Card style={styles.card}>
            {examTasks
              .filter((t) => t.part === p.id)
              .map((t) => (
                <View key={`${t.part}-${t.n}`} style={styles.task}>
                  <View style={styles.part}>
                    <Text variant="callout" weight="600" style={styles.flex}>
                      {t.n}. {t.title}
                    </Text>
                    <Text variant="footnote" color="label2" tabular>
                      {t.points} {t.points === 1 ? 'point' : 'points'}
                    </Text>
                  </View>
                  <Text variant="footnote" color="label2">
                    {t.what}
                  </Text>
                </View>
              ))}
            {p.id === 'listening' ? <Rule text={`Every recording is played ${LISTENING_PLAYS === 2 ? 'twice' : `${LISTENING_PLAYS} times`}.`} /> : null}
            {p.id === 'writing' ? (
              <>
                <Rule text={`Form: each answer needs at least ${FORM_MIN_WORDS} words, in full sentences. A shorter answer loses points.`} />
                <Rule text={`E-mail: under ${EMAIL_MIN_WORDS} words scores 0, however good it is. Write a sentence for each picture.`} />
                <Rule text="Start each sentence with a capital letter and end it with a full stop." />
              </>
            ) : null}
            {p.id === 'speaking' ? (
              <>
                <Rule text={`Pronunciation is marked across the whole speaking part: ${PRONUNCIATION_POINTS} points.`} />
                <Rule text="Answer in full sentences, in the tense of the question: a question in the past needs an answer in the past." />
              </>
            ) : null}
          </Card>
        </View>
      ))}

      <View>
        <SectionHeader title="After the exam" />
        <Card style={styles.card}>
          {afterTheExam.map((t) => (
            <Bullet key={t} text={t} />
          ))}
        </Card>
      </View>

      <View>
        <SectionHeader title="Get ready here" />
        <List>
          <Row icon="flag" title="Exam practice" subtitle="Every task of the exam, one at a time" chevron onPress={() => router.push('/learn/practice')} />
          <Row icon="clock" title="Mock exam" subtitle="All four parts, timed, scored by the official rules" chevron onPress={() => router.push('/learn/mock')} />
          <Row icon="mic" title="Speak Czech" subtitle="Talk out loud with the tutor" chevron onPress={() => router.push('/learn/speak')} />
        </List>
      </View>

      <View style={styles.links}>
        <Text variant="footnote" weight="600" color="label2">
          Official sources
        </Text>
        <Link label="Exam information (English)" url={GUIDE_SOURCES.info} />
        <Link label="Information for applicants (PDF)" url={GUIDE_SOURCES.applicants} />
        <Link label="Practice test, new format" url={EXAM_SOURCES.newFormatTest} />
        <Link label="Handbook for candidates (PDF, Czech)" url={EXAM_SOURCES.handbook} />
        <Link label="What to watch out for (PDF, Czech)" url={EXAM_SOURCES.watchOut} />
        <Link label="Permanent residence (Ministry of the Interior)" url={GUIDE_SOURCES.ministry} />
        <Text variant="footnote" color="label3">
          Exam format checked {longDate(EXAM_CHECKED_ON)}; registration, dates, fee and the exam day checked {longDate(GUIDE_CHECKED_ON)}. CzechLocal isn’t
          connected with the organiser (NPI ČR). Rules can change: confirm on the official pages before you register.
        </Text>
      </View>
    </ScrollView>
  );
}

function Fact({ icon, label, value, note }: { icon: IconName; label: string; value: string; note: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fact, { backgroundColor: colors.surface, boxShadow: colors.shadow }]} accessible accessibilityLabel={`${label}: ${value}, ${note}`}>
      <Icon name={icon} size={18} color={colors.accent} />
      <Text variant="footnote" color="label2">
        {label}
      </Text>
      <Text variant="title3">{value}</Text>
      <Text variant="caption" color="label3">
        {note}
      </Text>
    </View>
  );
}

function Bullet({ text, n }: { text: string; n?: number }) {
  const { colors } = useTheme();
  return (
    <View style={styles.rule}>
      {n ? (
        <Text variant="footnote" weight="700" color="accent" style={styles.n}>
          {n}
        </Text>
      ) : (
        <View style={[styles.dot, { backgroundColor: colors.label3 }]} />
      )}
      <Text variant="footnote" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

function Rule({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.rule}>
      <Icon name="info" size={16} color={colors.accent} />
      <Text variant="footnote" style={styles.flex}>
        {text}
      </Text>
    </View>
  );
}

function Link({ label, url }: { label: string; url: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" hitSlop={6} style={styles.link}>
      <Text variant="subhead" color="accent" weight="600">
        {label}
      </Text>
      <Icon name="external" size={14} color={colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  head: { gap: space.xs },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  card: { gap: space.md },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  fact: { flexBasis: '47%', flexGrow: 1, borderRadius: radius.tile, borderCurve: 'continuous', padding: space.md, gap: 2 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 44 },
  flip: { transform: [{ rotate: '180deg' }] },
  step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  stepNo: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  part: { flexDirection: 'row', alignItems: 'baseline', gap: space.md },
  task: { gap: 2 },
  rule: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  n: { width: 16 },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 7, marginHorizontal: 5 },
  links: { gap: space.md, paddingHorizontal: space.xs },
  link: { flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'flex-start', minHeight: 32 },
});
