import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { roadmap, topicStateLabels, type TopicState } from '@/lib/academy/roadmap';
import { useAcademy } from '@/store/academy';
import { layout, space } from '@/theme/tokens';

const tones: Record<TopicState, BadgeTone> = { 'not-started': 'neutral', learning: 'accent', practised: 'warning', mastered: 'success' };

/** The roadmap: fourteen everyday topics in teaching order, each with its state. */
export default function TopicsScreen() {
  const attempts = useAcademy((s) => s.attempts);
  const lessons = useAcademy((s) => s.lessons);
  const map = useMemo(() => roadmap(lessons, attempts), [lessons, attempts]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="subhead" color="label2" style={styles.note}>
        Everyday topics from A1 to A2, in the order CzechLocal teaches them. The exam draws on everyday life like this, but it has no fixed list of topics.
      </Text>
      <List>
        {map.map((t, i) => (
          <Row
            key={t.topic.id}
            title={`${i + 1}. ${t.topic.title}`}
            subtitle={t.available ? `${t.done} of ${t.total} lessons · ${t.topic.cs}` : `Lessons coming · grammar and texts ready`}
            accessory={t.available ? <Badge label={topicStateLabels[t.state]} tone={tones[t.state]} /> : undefined}
            chevron
            onPress={() => router.push({ pathname: '/learn/topic/[id]', params: { id: t.topic.id } })}
          />
        ))}
      </List>
      <Text variant="footnote" color="label3" style={styles.note}>
        Learning: you’ve started. Practised: every lesson done. Mastered: every lesson’s check passed twice, at least two days apart.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.lg },
  note: { paddingHorizontal: space.xs },
});
