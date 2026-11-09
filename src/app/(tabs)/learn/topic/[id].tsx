import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MissionRow } from '@/components/learn/mission-row';
import { Badge } from '@/components/ui/badge';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { grammarById } from '@/lib/academy/grammar';
import { lessonById } from '@/lib/academy/lessons';
import { lessonDone, lessonSecure, passed, retestDue, topicProgress, topicStateLabels } from '@/lib/academy/roadmap';
import { topicById } from '@/lib/academy/topics';
import { contentById } from '@/lib/learn/content';
import { missions } from '@/lib/learn/missions';
import { situationById } from '@/lib/learn/situations';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** One topic: what you'll be able to do, its lessons, real-life missions, phrases, texts to read and grammar. */
export default function TopicScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = topicById(id);
  const log = useAcademy((s) => s.lessons);
  const attempts = useAcademy((s) => s.attempts);
  const progress = useMemo(() => (topic ? topicProgress(topic, log, attempts) : null), [topic, log, attempts]);
  const reading = useLearn((s) => s.progress);
  const deck = useLearn((s) => s.deck);
  const listened = useLearn((s) => s.missionListening);
  const missionState = useMemo(() => ({ progress: reading, deck, listened }), [reading, deck, listened]);

  if (!topic || !progress)
    return (
      <View style={styles.missing}>
        <Text variant="callout" color="label2">
          This topic isn’t available.
        </Text>
      </View>
    );

  // A text with a mission is practised through the mission; the rest are just to read.
  const topicMissions = missions.filter((m) => topic.texts.includes(m.contentId));
  const texts = topic.texts
    .filter((t) => !topicMissions.some((m) => m.contentId === t))
    .map((t) => contentById(t))
    .filter((c) => !!c);
  const situations = topic.situations.map((s) => situationById(s)).filter((s) => !!s);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: topic.title }} />
      <View style={styles.head}>
        <Text variant="title2" lang="cs" accessibilityRole="header">
          {topic.cs}
        </Text>
        {progress.available ? <Badge label={topicStateLabels[progress.state]} tone={progress.state === 'mastered' ? 'success' : 'accent'} /> : null}
      </View>

      <Card style={styles.goals}>
        <Text variant="footnote" weight="600" color="label3">
          YOU’LL BE ABLE TO
        </Text>
        {topic.objectives.map((o) => (
          <View key={o} style={styles.goal}>
            <Icon name="check" size={16} color={colors.accent} />
            <Text variant="callout" style={styles.flex}>
              {o}
            </Text>
          </View>
        ))}
      </Card>

      <View>
        <SectionHeader title="Lessons" />
        {topic.lessons.length ? (
          <List>
            {topic.lessons.map((lid) => {
              const lesson = lessonById(lid)!;
              const runs = log[lid];
              const status = lessonSecure(runs)
                ? 'Mastered'
                : retestDue(runs)
                  ? 'Check again today'
                  : runs?.some(passed)
                    ? 'Passed · check again in a few days'
                    : lessonDone(log, lid)
                      ? 'Done · check not passed yet'
                      : lesson.goal;
              return (
                <Row
                  key={lid}
                  icon={lessonSecure(runs) ? 'checkCircle' : 'school'}
                  title={lesson.title}
                  subtitle={status}
                  chevron
                  onPress={() =>
                    router.push({ pathname: '/a2-lesson/[id]', params: retestDue(runs) ? { id: lid, retest: '1' } : { id: lid } })
                  }
                />
              );
            })}
          </List>
        ) : (
          <Text variant="footnote" color="label2" style={styles.note}>
            Lessons for this topic are being written. The missions, phrases and grammar below are ready now.
          </Text>
        )}
      </View>

      {topicMissions.length ? (
        <View>
          <SectionHeader title="Real-life missions" />
          <View style={styles.missions}>
            {topicMissions.map((m) => (
              <MissionRow key={m.id} mission={m} state={missionState} />
            ))}
          </View>
        </View>
      ) : null}

      {texts.length ? (
        <View>
          <SectionHeader title="Read" />
          <List>
            {texts.map((c) => (
              <Row
                key={c.id}
                icon="document"
                title={c.title}
                subtitle={`${c.titleEn} · ${c.level} · ${c.minutes} min`}
                chevron
                onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: c.id } })}
              />
            ))}
          </List>
        </View>
      ) : null}

      {situations.length ? (
        <View>
          <SectionHeader title="Phrases for real life" />
          <List>
            {situations.map((s) => (
              <Row
                key={s.id}
                icon={s.icon}
                title={s.title}
                subtitle={`${s.phrases.length} phrases to say and understand`}
                chevron
                onPress={() => router.push({ pathname: '/prepare/[id]', params: { id: s.id } })}
              />
            ))}
          </List>
        </View>
      ) : null}
      <View>
        <SectionHeader title="Grammar" />
        <List>
          {topic.grammar.map((g) => {
            const item = grammarById(g);
            return item ? <Row key={g} icon="book" title={item.title} chevron onPress={() => router.push({ pathname: '/learn/grammar/[id]', params: { id: g } })} /> : null;
          })}
        </List>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap', paddingHorizontal: space.xs },
  goals: { gap: space.sm },
  goal: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  missions: { gap: space.md },
  note: { paddingHorizontal: space.xs },
});
