import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Cover } from '@/components/learn/cover';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { contentById } from '@/lib/learn/content';
import { cardIdFor, hasWord } from '@/lib/learn/deck';
import { lexemeById } from '@/lib/learn/lexicon';
import { missionById, missionSteps, missionWords, type Mission, type MissionStep, type StepId } from '@/lib/learn/missions';
import { topicLabels } from '@/lib/learn/types';
import { useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** One mission: why it matters, its steps (each ticks itself from what you do), and its words. */
export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mission = missionById(id);
  if (!mission) return <Redirect href="/learn" />;
  return <MissionView mission={mission} />;
}

function MissionView({ mission }: { mission: Mission }) {
  const { colors } = useTheme();
  const progress = useLearn((s) => s.progress);
  const deck = useLearn((s) => s.deck);
  const listened = useLearn((s) => s.missionListening);
  const voice = useCzechVoice();
  const content = contentById(mission.contentId)!;
  const words = missionWords(mission);
  const steps = useMemo(() => missionSteps(mission, { progress, deck, listened }), [mission, progress, deck, listened]);
  const done = steps.filter((s) => s.done).length;
  const next = steps.find((s) => !s.done);

  const saveAll = () => {
    const example = { cs: '', contentId: mission.contentId };
    words.forEach((w) => useLearn.getState().saveWord(w, example));
    announce('Words saved');
  };

  /** Each step's own action; the first unfinished one is also the main button. */
  const actions: Record<StepId, { label: string; run: () => void; disabled?: boolean }> = {
    read: { label: 'Read', run: () => router.push({ pathname: '/lesson/[id]', params: { id: mission.contentId } }) },
    questions: { label: 'Answer', run: () => router.push({ pathname: '/lesson/[id]', params: { id: mission.contentId } }) },
    save: { label: 'Save all', run: saveAll },
    practise: {
      label: 'Practise',
      run: () => router.push({ pathname: '/flashcards', params: { cards: words.map(cardIdFor).join(',') } }),
      disabled: !words.every((w) => hasWord(deck, w)),
    },
    listen: {
      label: 'Listen',
      run: () => router.push({ pathname: '/listen', params: { mission: mission.id } }),
      disabled: voice.state !== 'available',
    },
  };

  const nextAction = next ? actions[next.id] : null;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '' }} />
      <View style={styles.hero}>
        <Cover cover={content.cover} width={72} height={96} />
        <View style={styles.heroText}>
          <Text variant="footnote" weight="600" color="label2">
            {[mission.level, topicLabels[mission.topic]].join(' · ')}
          </Text>
          <Text variant="title1" accessibilityRole="header">
            {mission.title}
          </Text>
          <Text variant="callout" color="accent" weight="600">
            {mission.cs}
          </Text>
        </View>
      </View>
      <Text variant="body" color="label2">
        {mission.why}
      </Text>

      <View>
        <SectionHeader title={`${done} of ${steps.length} done`} />
        <View style={[styles.steps, { backgroundColor: colors.surface }]}>
          {steps.map((s, i) => (
            <StepRow key={s.id} step={s} index={i} action={actions[s.id]} isNext={s === next} />
          ))}
        </View>
        {!next && (
          <Text variant="footnote" color="success" weight="600" style={styles.note}>
            Mission complete. Your words stay in review so they stick.
          </Text>
        )}
        {next?.id === 'listen' && voice.state === 'missing' && (
          <Text variant="footnote" color="label2" style={styles.note}>
            Listening needs a Czech voice on this phone: Settings › Accessibility › Spoken Content › Voices.
          </Text>
        )}
      </View>

      {nextAction && !nextAction.disabled && <Button label={nextAction.label} icon="arrowRight" onPress={nextAction.run} />}

      <View>
        <SectionHeader title="Words for this mission" />
        <View style={[styles.steps, { backgroundColor: colors.surface }]}>
          {words.map((w, i) => {
            const l = lexemeById(w);
            if (!l) return null;
            const saved = hasWord(deck, w);
            return (
              <View key={w} style={[styles.word, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={styles.wordText}>
                  <Text variant="callout" weight="600">
                    {l.lemma}
                  </Text>
                  <Text variant="footnote" color="label2">
                    {l.en}
                  </Text>
                </View>
                {saved && <Icon name="check" size={16} color={colors.success} />}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

function StepRow({ step, index, action, isNext }: { step: MissionStep; index: number; action: { label: string; run: () => void; disabled?: boolean }; isNext: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.step, index > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}
      accessible
      accessibilityLabel={`${step.label}. ${step.detail}. ${step.done ? 'Done' : 'Not done yet'}`}
      accessibilityActions={!step.done && !action.disabled ? [{ name: 'activate', label: action.label }] : undefined}
      onAccessibilityAction={() => action.run()}>
      <Icon name={step.done ? 'checkCircle' : 'circle'} size={22} color={step.done ? colors.success : isNext ? colors.accent : colors.label3} />
      <View style={styles.stepText}>
        <Text variant="callout" weight="600" color={step.done ? 'label2' : 'label'}>
          {step.label}
        </Text>
        <Text variant="footnote" color="label2">
          {step.detail}
        </Text>
      </View>
      {!step.done && !action.disabled && !isNext && (
        <Pressable onPress={action.run} hitSlop={8} accessibilityRole="button" style={[styles.stepButton, { backgroundColor: colors.fill }]}>
          <Text variant="subhead" weight="600" color="accent" chrome>
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl, maxWidth: layout.maxWidth, width: '100%', alignSelf: 'center' },
  hero: { flexDirection: 'row', gap: space.lg, alignItems: 'center' },
  heroText: { flex: 1, gap: space.xs },
  steps: { borderRadius: radius.card, borderCurve: 'continuous', paddingHorizontal: space.lg },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingVertical: space.md },
  stepText: { flex: 1, gap: 2 },
  stepButton: { minHeight: 36, paddingHorizontal: space.md, borderRadius: radius.pill, justifyContent: 'center' },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  word: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingVertical: space.sm },
  wordText: { flex: 1, gap: 2 },
});
