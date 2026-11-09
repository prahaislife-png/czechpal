import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { RoadmapTile } from '@/components/academy/academy-parts';
import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { roadmap } from '@/lib/academy/roadmap';
import { useAcademy } from '@/store/academy';
import { layout, space } from '@/theme/tokens';

/**
 * The course: fourteen everyday topics, each holding its lessons, real-life missions, phrases and
 * texts to read. Before setup, one row offers to add the lessons to the daily plan.
 */
export function CourseSection() {
  const setupAt = useAcademy((s) => s.setupAt);
  const lessons = useAcademy((s) => s.lessons);
  const attempts = useAcademy((s) => s.attempts);
  const map = useMemo(() => roadmap(lessons, attempts), [lessons, attempts]);
  const started = map.filter((t) => t.state !== 'not-started').length;
  const secure = map.filter((t) => t.state === 'mastered').length;

  return (
    <View>
      <SectionHeader
        title="Your course"
        action={
          <Pressable onPress={() => router.push('/learn/topics')} hitSlop={10} accessibilityRole="link" accessibilityLabel="See all topics">
            <Text variant="subhead" weight="600" color="accent" chrome>
              All topics
            </Text>
          </Pressable>
        }
      />
      <Text variant="footnote" color="label2" style={styles.note}>
        {started
          ? `${started} of ${map.length} topics started${secure ? ` · ${secure} secure` : ''}. `
          : `${map.length} everyday topics. `}
        Each one has lessons, real-life missions, phrases and something to read.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.tiles}>
        {map.map((t, i) => (
          <RoadmapTile key={t.topic.id} t={t} n={i + 1} />
        ))}
      </ScrollView>
      {!setupAt ? (
        <List style={styles.setup}>
          <Row
            icon="flag"
            title="Add lessons to your daily plan"
            subtitle="Two minutes: how much Czech you know and a short check"
            chevron
            onPress={() => router.push('/a2-setup')}
          />
        </List>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { paddingHorizontal: space.xs },
  bleed: { marginHorizontal: -layout.gutter, marginTop: space.md },
  tiles: { paddingHorizontal: layout.gutter, gap: space.sm },
  setup: { marginTop: space.md },
});
