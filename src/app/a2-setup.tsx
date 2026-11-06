import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { DateField } from '@/components/ui/date-field';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { daysToExam } from '@/lib/learn/exam';
import { difficulties, minuteOptions, type DailyMinutes, type Difficulty, type StartLevel } from '@/lib/learn/profile';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const levels: { id: StartLevel; label: string; detail: string }[] = [
  { id: 'new', label: 'Beginner', detail: 'A few words, or none yet' },
  { id: 'A1', label: 'A1', detail: 'Greetings, numbers, simple sentences' },
  { id: 'A2', label: 'Some A2', detail: 'Short conversations about everyday things' },
  { id: 'unsure', label: 'I’m not sure', detail: 'The starting check will help' },
];

/**
 * A2 Academy setup: where you start, when the exam is, how long a day and what's hardest.
 * Kept as a draft until saved; saving makes the exam Learn's goal and offers the starting check.
 */
export default function A2SetupScreen() {
  const { colors } = useTheme();
  const saved = useLearn((s) => s.profile);
  const setupAt = useAcademy((s) => s.setupAt);
  const diagnosticDone = useAcademy((s) => !!s.diagnostic);
  const [level, setLevel] = useState<StartLevel>(saved?.level ?? 'unsure');
  const [hasDate, setHasDate] = useState<'date' | 'none'>(saved?.examDate ? 'date' : 'none');
  const [examDate, setExamDate] = useState<string | undefined>(saved?.examDate);
  const [minutes, setMinutes] = useState<DailyMinutes>(saved?.minutes ?? 10);
  const [difficulty, setDifficulty] = useState<Difficulty>(saved?.difficulty ?? 'unsure');
  const days = hasDate === 'date' && examDate ? daysToExam(examDate) : null;

  const save = () => {
    useLearn.getState().setProfile({
      goal: 'exam',
      level,
      minutes,
      topics: saved?.topics ?? [],
      examDate: hasDate === 'date' ? examDate : undefined,
      difficulty,
    });
    useAcademy.getState().finishSetup();
    announce('Saved');
    if (diagnosticDone) router.back();
    else router.replace('/diagnostic');
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerLeft: () => <HeaderCloseButton /> }} />
      <Text variant="subhead" color="label2" style={styles.note}>
        Five quick answers. Your plan for each day follows from them, and you can change them any time.
      </Text>

      <View>
        <SectionHeader title="How much Czech do you know?" />
        <List>
          {levels.map((l) => (
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
        <SectionHeader title="Do you have an exam date?" />
        <ChipGroup
          options={[
            { id: 'date', label: 'Yes' },
            { id: 'none', label: 'Not yet' },
          ]}
          value={hasDate}
          onChange={setHasDate}
        />
        {hasDate === 'date' ? (
          <List style={styles.dateList}>
            <View style={styles.dateRow}>
              <Text variant="callout" weight="500" style={styles.flex}>
                Exam date
              </Text>
              <DateField value={examDate} onChange={setExamDate} label="Exam date" />
            </View>
          </List>
        ) : null}
        <Text variant="footnote" color={days !== null && days < 0 ? 'danger' : 'label2'} style={styles.note}>
          {hasDate === 'none'
            ? 'That’s fine. Your plan works without one, and you can add it later.'
            : days === null
              ? 'With a date, the plan counts down to it.'
              : days < 0
                ? 'This date has passed.'
                : days === 0
                  ? 'That’s today. Good luck!'
                  : `In ${days} ${days === 1 ? 'day' : 'days'}.`}
        </Text>
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
        <SectionHeader title="What do you find hardest?" />
        <ChipGroup options={difficulties.map((d) => ({ id: d.id, label: d.label }))} value={difficulty} onChange={setDifficulty} />
        <Text variant="footnote" color="label2" style={styles.note}>
          Your plan starts there.
        </Text>
      </View>

      <View>
        <SectionHeader title="Explanations" />
        <Text variant="footnote" color="label2" style={styles.note}>
          A2 lessons are explained in English for now. Letters you scan still use your explanation language from Settings.
        </Text>
      </View>

      <Button label={setupAt ? 'Save' : diagnosticDone ? 'Make my plan' : 'Next: the starting check'} onPress={save} />
      <Text variant="footnote" color="label3" style={styles.note}>
        Saved on this phone only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  dateList: { marginTop: space.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm },
});
