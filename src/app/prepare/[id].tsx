import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { contentById } from '@/lib/learn/content';
import { situationProgress } from '@/lib/learn/session';
import { phraseId, situationById, SITUATIONS_REVIEWED } from '@/lib/learn/situations';
import { useUpcoming } from '@/lib/learn/use-upcoming';
import { speak, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Get ready: one situation from the learner's life, with every phrase they'll need, why it's
 * coming up, and three ways in: practise now, keep the phrases as flashcards, read the scene.
 */
export default function PrepareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const situation = situationById(id);
  const coming = useUpcoming().find((u) => u.situation.id === id);
  const memory = useLearn((s) => s.phrases);
  const rate = useLearn((s) => s.rate);
  const voice = useCzechVoice();
  const [added, setAdded] = useState<number | null>(null);

  if (!situation) return null;
  const { known, total } = situationProgress(situation, memory);
  const scene = contentById(situation.practiceText);
  const canListen = voice.state === 'available';

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
            <Icon name={situation.icon} size={26} color={colors.accent} />
          </View>
          <Text variant="largeTitle" accessibilityRole="header">
            {situation.title}
          </Text>
          <Text variant="title3" weight="500" color="label2" lang="cs">
            {situation.cs}
          </Text>
          {coming ? (
            <View style={[styles.reason, { backgroundColor: colors.warningSoft }]}>
              <Icon name="calendar" size={16} color={colors.warning} />
              <Text variant="subhead" weight="600" style={[styles.flex, { color: colors.warning }]}>
                {coming.reason}
              </Text>
            </View>
          ) : null}
          <Text variant="callout" color="label2">
            {situation.why}
          </Text>
        </View>

        <View style={styles.progressRow}>
          <Text variant="footnote" weight="600" color="label2">
            {known} of {total} phrases you can say
          </Text>
          <View style={[styles.track, { backgroundColor: colors.fill }]}>
            <View style={[styles.fill, { width: `${Math.round((known / total) * 100)}%`, backgroundColor: colors.accent }]} />
          </View>
        </View>

        <Button label="Practise these now" icon="play" onPress={() => router.push({ pathname: '/session', params: { focus: situation.id } })} />

        <Card padded={false}>
          {situation.phrases.map((p, i) => {
            const m = memory[phraseId(situation.id, i)];
            return (
              <View key={p.cs} style={[styles.phrase, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }]}>
                <View style={styles.flex}>
                  <Text variant="callout" weight="600" lang="cs">
                    {p.cs}
                  </Text>
                  <Text variant="subhead" color="label2">
                    {p.en}
                  </Text>
                </View>
                {m?.known ? <Icon name="checkCircle" size={18} color={colors.success} /> : null}
                {canListen ? (
                  <Pressable
                    onPress={() => speak(p.cs, { voice: voice.voice, rate })}
                    accessibilityRole="button"
                    accessibilityLabel={`Play: ${p.en}`}
                    hitSlop={8}
                    style={[styles.play, { backgroundColor: colors.accentSoft }]}>
                    <Icon name="speaker" size={16} color={colors.accent} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </Card>

        <View style={styles.more}>
          <Button
            label={added === null ? 'Add all to my words' : added ? `Added ${added} to your words` : 'Already in your words'}
            variant="secondary"
            icon={added === null ? 'plus' : 'check'}
            disabled={added !== null}
            onPress={() => {
              const n = useLearn.getState().savePhrases(situation);
              setAdded(n);
              announce(n ? `Added ${n} phrases to your words` : 'They are already in your words');
            }}
          />
          {scene ? (
            <Button
              label={`Read the scene: ${scene.title}`}
              variant="secondary"
              icon="book"
              onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: scene.id } })}
            />
          ) : null}
        </View>

        <Text variant="footnote" color="label3" style={styles.note}>
          {SITUATIONS_REVIEWED
            ? 'Phrases reviewed by a native Czech teacher.'
            : 'Phrases written for CzechPal. If one sounds wrong to you, tell us from Help.'}
          {canListen ? ' Audio uses your phone’s own Czech voice.' : ''}
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, gap: space.lg, paddingBottom: space.huge * 2 },
  head: { gap: space.sm },
  icon: { width: 52, height: 52, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
  reason: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderRadius: radius.tile, paddingHorizontal: space.md, paddingVertical: space.sm, marginVertical: space.xs },
  progressRow: { gap: space.sm },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  phrase: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  play: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  more: { gap: space.sm },
  note: { textAlign: 'center', paddingHorizontal: space.lg },
  flex: { flex: 1 },
});
