import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Chip, ChipGroup } from '@/components/ui/chip';
import { DateField } from '@/components/ui/date-field';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { topicsInLibrary } from '@/lib/learn/content';
import { daysToExam } from '@/lib/learn/exam';
import { goals, goalTopics, minuteOptions, startLevels, type DailyMinutes, type Goal, type StartLevel } from '@/lib/learn/profile';
import { topicLabels, type Topic } from '@/lib/learn/types';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Your plan: four short answers that shape Learn. Kept as a draft until Save, so closing the
 * sheet changes nothing.
 */
export default function LearnPlanScreen() {
  const { colors } = useTheme();
  const saved = useLearn((s) => s.profile);
  const [goal, setGoal] = useState<Goal>(saved?.goal ?? 'everyday');
  const [level, setLevel] = useState<StartLevel>(saved?.level ?? 'new');
  const [minutes, setMinutes] = useState<DailyMinutes>(saved?.minutes ?? 10);
  const [topics, setTopics] = useState<Topic[]>(saved?.topics ?? goalTopics.everyday);
  const [examDate, setExamDate] = useState<string | undefined>(saved?.examDate);
  const days = examDate ? daysToExam(examDate) : null;

  const chooseGoal = (g: Goal) => {
    setGoal(g);
    // Until the learner picks topics themselves, the goal's topics follow the goal.
    if (!saved) setTopics(goalTopics[g]);
  };

  const toggleTopic = (t: Topic) => setTopics((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]));

  const save = () => {
    useLearn.getState().setProfile({ goal, level, minutes, topics, examDate });
    announce('Plan saved');
    router.back();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerLeft: () => <HeaderCloseButton /> }} />
      <Text variant="subhead" color="label2" style={styles.intro}>
        Learn builds each day around your answers. You can change them any time.
      </Text>

      <View>
        <SectionHeader title="Why are you learning Czech?" />
        <List>
          {goals.map((g) => (
            <Row
              key={g.id}
              title={g.label}
              subtitle={g.detail}
              selected={g.id === goal}
              accessory={g.id === goal ? <Icon name="check" size={18} color={colors.accent} /> : undefined}
              onPress={() => chooseGoal(g.id)}
            />
          ))}
        </List>
      </View>

      {goal === 'exam' && (
        <View>
          <SectionHeader title="Do you have an exam date?" />
          <List>
            <View style={styles.dateRow}>
              <Text variant="callout" weight="500" style={styles.dateLabel}>
                Exam date
              </Text>
              <DateField value={examDate} onChange={setExamDate} label="Exam date" />
            </View>
          </List>
          <Text variant="footnote" color={days !== null && days < 0 ? 'danger' : 'label2'} style={styles.note}>
            {days === null
              ? 'Optional. With a date, Learn counts down to it.'
              : days < 0
                ? 'This date has passed.'
                : days === 0
                  ? 'That’s today. Good luck!'
                  : `In ${days} ${days === 1 ? 'day' : 'days'}.`}
          </Text>
        </View>
      )}

      <View>
        <SectionHeader title="How much Czech do you know?" />
        <List>
          {startLevels.map((l) => (
            <Row
              key={l.id}
              title={l.label}
              subtitle={l.detail}
              selected={l.id === level}
              accessory={l.id === level ? <Icon name="check" size={18} color={colors.accent} /> : undefined}
              onPress={() => setLevel(l.id)}
            />
          ))}
        </List>
      </View>

      <View>
        <SectionHeader title="How long a day?" />
        <ChipGroup
          options={minuteOptions.map((m) => ({ id: String(m) as `${DailyMinutes}`, label: `${m} min` }))}
          value={String(minutes) as `${DailyMinutes}`}
          onChange={(m) => setMinutes(Number(m) as DailyMinutes)}
        />
      </View>

      <View>
        <SectionHeader title="What do you want to read about?" />
        <View style={styles.topics}>
          {topicsInLibrary.map((t) => (
            <Chip key={t} label={topicLabels[t]} role="checkbox" selected={topics.includes(t)} onPress={() => toggleTopic(t)} />
          ))}
        </View>
        <Text variant="footnote" color="label2" style={styles.note}>
          {topics.length ? 'These come first. Everything else stays open in the library.' : 'None chosen: any topic.'}
        </Text>
      </View>

      <Button label={saved ? 'Save' : 'Make my plan'} onPress={save} />
      <Text variant="footnote" color="label3" style={styles.note}>
        Saved on this phone.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  intro: { paddingHorizontal: space.xs },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm },
  dateLabel: { flex: 1 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
