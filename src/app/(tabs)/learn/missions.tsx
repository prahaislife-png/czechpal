import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { MissionRow } from '@/components/learn/mission-row';
import { Text } from '@/components/ui/text';
import { recommendMissions } from '@/lib/learn/missions';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';

/** Every mission, the ones that suit the learner's plan first. */
export default function MissionsScreen() {
  const progress = useLearn((s) => s.progress);
  const deck = useLearn((s) => s.deck);
  const listened = useLearn((s) => s.missionListening);
  const profile = useLearn((s) => s.profile);
  const state = useMemo(() => ({ progress, deck, listened }), [progress, deck, listened]);
  const list = useMemo(() => recommendMissions(profile, state), [profile, state]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="callout" color="label2" style={styles.intro}>
        Real things to get done in Czech. Each mission is a text to read, its words to learn and a listening check. Steps tick themselves as you go.
      </Text>
      <View style={styles.list}>
        {list.map((m) => (
          <MissionRow key={m.id} mission={m} state={state} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl },
  intro: { paddingHorizontal: space.xs },
  list: { gap: space.md },
});
