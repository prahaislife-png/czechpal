import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { DateField } from '@/components/ui/date-field';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { List } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { daysToExam } from '@/lib/learn/exam';
import { minuteOptions, minutesOf, type DailyMinutes } from '@/lib/learn/profile';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';

/**
 * Your plan: the two answers that shape each day. How long a day, and when the exam is, if
 * there's a date. Nothing here is needed to start: the journey begins without it. Kept as a
 * draft until Save, so closing the sheet changes nothing.
 */
export default function LearnPlanScreen() {
  const saved = useLearn((s) => s.profile);
  const [minutes, setMinutes] = useState<DailyMinutes>(minutesOf(saved));
  const [hasDate, setHasDate] = useState<'date' | 'none'>(saved?.examDate ? 'date' : 'none');
  const [examDate, setExamDate] = useState<string | undefined>(saved?.examDate);
  const days = hasDate === 'date' && examDate ? daysToExam(examDate) : null;

  const save = () => {
    // Answers from earlier versions of this screen (a goal, a level, topics) are kept as they were.
    useLearn.getState().setProfile({
      goal: saved?.goal ?? 'exam',
      level: saved?.level ?? 'unsure',
      topics: saved?.topics ?? [],
      difficulty: saved?.difficulty,
      minutes,
      examDate: hasDate === 'date' ? examDate : undefined,
    });
    announce('Plan saved');
    router.back();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerLeft: () => <HeaderCloseButton /> }} />
      <Text variant="subhead" color="label2" style={styles.intro}>
        Today’s steps are sized to the time you have. Change these any time.
      </Text>

      <View>
        <SectionHeader title="How long a day?" />
        <ChipGroup
          options={minuteOptions.map((m) => ({ id: String(m) as `${DailyMinutes}`, label: `${m} min` }))}
          value={String(minutes) as `${DailyMinutes}`}
          onChange={(m) => setMinutes(Number(m) as DailyMinutes)}
        />
        <Text variant="footnote" color="label2" style={styles.note}>
          A lesson takes about six minutes; an exam task six to eight.
        </Text>
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
            ? 'That’s fine. The journey works without one, and you can add it later.'
            : days === null
              ? 'With a date, Learn counts down to it.'
              : days < 0
                ? 'This date has passed.'
                : days === 0
                  ? 'That’s today. Good luck!'
                  : `In ${days} ${days === 1 ? 'day' : 'days'}.`}
        </Text>
      </View>

      <Button label="Save" onPress={save} />
      <Text variant="footnote" color="label3" style={styles.note}>
        Saved on this phone only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  intro: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  dateList: { marginTop: space.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm },
});
