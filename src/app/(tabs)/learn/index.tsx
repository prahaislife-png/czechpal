import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ExamSection } from '@/components/learn/exam-section';
import { JourneySection } from '@/components/learn/journey-section';
import { QuickTiles } from '@/components/learn/quick-tiles';
import { TodayCard } from '@/components/learn/today-card';
import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { grammar } from '@/lib/academy/grammar';
import { minutesOf } from '@/lib/learn/profile';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';

/**
 * Learn is one thing: the A2 journey, from the first lesson to the exam.
 *
 * Top to bottom: the three things reached for at any moment (dictionary, own words, the speaking
 * tutor); today, on the dark card; the journey, unit by unit; the exam itself; and the rest.
 * There is nothing to set up and no test to take first: lesson one is waiting.
 */
export default function LearnScreen() {
  const profile = useLearn((s) => s.profile);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <QuickTiles />

      <TodayCard />

      <JourneySection />

      <ExamSection />

      <View>
        <SectionHeader title="More" />
        <List>
          <Row icon="book" title="Grammar" subtitle={`${grammar.length} short explanations`} chevron onPress={() => router.push('/learn/grammar')} />
          <Row icon="chart" title="Progress" subtitle="Your streak, lessons done and the exam parts" chevron onPress={() => router.push('/learn/progress')} />
          <Row
            icon="settings"
            title="Your plan"
            subtitle={`${minutesOf(profile)} min a day${profile?.examDate ? '' : ' · no exam date yet'}`}
            chevron
            onPress={() => router.push('/learn-plan')}
          />
        </List>
      </View>

      <Text variant="footnote" color="label3" style={styles.note}>
        Lessons and exam practice are written for CzechLocal in the exam’s own formats and checked by AI, not by a teacher. Your progress is saved on this phone only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  note: { paddingHorizontal: space.xs },
});
