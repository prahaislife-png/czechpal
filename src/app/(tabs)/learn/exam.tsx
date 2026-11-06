import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { longDate } from '@/lib/about';
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
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * The A2 exam for permanent residence, from the organiser's own published sources only: the parts,
 * how passing works, every task with its points, and the rules that cost points.
 */
export default function ExamScreen() {
  const { colors } = useTheme();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="subhead" color="label2" style={styles.note}>
        From the organiser’s website and handbook (NPI ČR), checked {longDate(EXAM_CHECKED_ON)}. Writing and speaking have a new format from{' '}
        {longDate(NEW_FORMAT_FROM)}. Always confirm there before your exam.
      </Text>

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

      <View style={styles.links}>
        <Link label="Official exam page" url={EXAM_SOURCES.overview} color={colors.accent} />
        <Link label="Practice test, new format" url={EXAM_SOURCES.newFormatTest} color={colors.accent} />
        <Link label="Handbook for candidates (PDF, Czech)" url={EXAM_SOURCES.handbook} color={colors.accent} />
        <Link label="What to watch out for (PDF, Czech)" url={EXAM_SOURCES.watchOut} color={colors.accent} />
      </View>
    </ScrollView>
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

function Link({ label, url, color }: { label: string; url: string; color: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} accessibilityRole="link" hitSlop={6} style={styles.link}>
      <Text variant="subhead" color="accent" weight="600">
        {label}
      </Text>
      <Icon name="external" size={14} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs },
  card: { gap: space.md },
  part: { flexDirection: 'row', alignItems: 'baseline', gap: space.md },
  task: { gap: 2 },
  rule: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  links: { gap: space.md, paddingHorizontal: space.xs },
  link: { flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'flex-start', minHeight: 32 },
});
