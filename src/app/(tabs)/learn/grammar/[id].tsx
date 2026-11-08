import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SpeakRow } from '@/components/academy/exercise';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { grammarById } from '@/lib/academy/grammar';
import { topics } from '@/lib/academy/topics';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** One grammar item: the short explanation, examples to hear, what to watch out for. */
export default function GrammarItemScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = grammarById(id);
  const voice = useCzechVoice();
  const rate = useLearn((s) => s.rate);
  const canListen = voice.state === 'available';
  const say = useCallback((text: string, slow = false) => speak(text, { voice: voice.voice, rate: slow ? 0.55 : rate }), [voice.voice, rate]);
  useFocusEffect(useCallback(() => stopSpeaking, []));

  useEffect(() => {
    if (item) useAcademy.getState().seeGrammar(item.id);
  }, [item]);

  if (!item)
    return (
      <View style={styles.missing}>
        <Text variant="callout" color="label2">
          This page isn’t available.
        </Text>
      </View>
    );

  const usedIn = topics.filter((t) => t.grammar.includes(item.id));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: item.title }} />
      <Text variant="body" style={styles.explain}>
        {item.explain}
      </Text>

      <View>
        <SectionHeader title="Examples" />
        <Card style={styles.examples}>
          {item.examples.map((ex, i) => (
            <View key={ex.cs}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <View style={styles.example}>
                <View style={styles.flex}>
                  <Text variant="headline" lang="cs">
                    {ex.cs}
                  </Text>
                  <Text variant="subhead" color="label2">
                    {ex.en}
                  </Text>
                </View>
                {canListen ? <SpeakRow text={ex.cs} say={say} canListen compact /> : null}
              </View>
            </View>
          ))}
        </Card>
      </View>

      {item.watchOut ? (
        <View style={[styles.watch, { backgroundColor: colors.warningSoft }]}>
          <Icon name="warning" size={20} color={colors.warning} />
          <Text variant="callout" style={styles.flex}>
            {item.watchOut}
          </Text>
        </View>
      ) : null}

      {usedIn.length ? (
        <View>
          <SectionHeader title="Topics that use it" />
          <List>
            {usedIn.map((t) => (
              <Row key={t.id} icon="map" title={t.title} chevron onPress={() => router.push({ pathname: '/learn/topic/[id]', params: { id: t.id } })} />
            ))}
          </List>
        </View>
      ) : null}

      <Text variant="footnote" color="label3" style={styles.note}>
        Written for CzechLocal and checked by AI. If something looks wrong, tell us from Help.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  explain: { paddingHorizontal: space.xs },
  examples: { paddingVertical: space.md },
  example: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.md },
  watch: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.tile, alignItems: 'flex-start' },
  note: { paddingHorizontal: space.xs },
});
