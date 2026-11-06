import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView } from '@/components/academy/exercise';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { diagnosticFor } from '@/lib/academy/diagnostic';
import type { Skill } from '@/lib/academy/types';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLOW = 0.55;
type Tally = Partial<Record<Skill, { right: number; total: number }>>;

/** The starting check: a few minutes of original items, then where to begin. */
export default function DiagnosticScreen() {
  const voice = useCzechVoice();
  return (
    <>
      <Stack.Screen options={{ title: 'Starting check', headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : <Check canListen={voice.state === 'available'} voice={voice.voice} />}
    </>
  );
}

function Check({ canListen, voice }: { canListen: boolean; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const [items] = useState(() => diagnosticFor(canListen));
  const [index, setIndex] = useState(-1);
  const [tally, setTally] = useState<Tally>({});
  const done = index >= items.length;
  const say = useCallback((text: string, slow = false) => speak(text, { voice, rate: slow ? SLOW : rate }), [voice, rate]);
  useFocusEffect(useCallback(() => stopSpeaking, []));

  useEffect(() => {
    if (!done) return;
    const marked = Object.values(tally).reduce((n, t) => ({ right: n.right + t.right, total: n.total + t.total }), { right: 0, total: 0 });
    useAcademy.getState().finishDiagnostic(marked.right, marked.total);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    announce('Check finished');
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (index < 0)
    return (
      <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: insets.bottom + space.xxl }]}>
        <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
          <Icon name="flag" size={32} color={colors.accent} />
        </View>
        <Text variant="title1" align="center" accessibilityRole="header">
          A short starting check
        </Text>
        <Text variant="callout" color="label2" align="center">
          {items.length} questions, about five minutes: reading, {canListen ? 'listening, ' : ''}and a short written answer. Just answer what you can; it only sets where your plan begins.
        </Text>
        {!canListen ? (
          <Text variant="footnote" color="label3" align="center">
            Listening is left out: this phone has no Czech voice installed.
          </Text>
        ) : null}
        <Text variant="footnote" color="label3" align="center">
          It isn’t an exam score or a level. Speaking isn’t checked yet.
        </Text>
        <Button label="Start" icon="play" onPress={() => setIndex(0)} />
      </ScrollView>
    );

  if (done) return <Result tally={tally} canListen={canListen} />;

  const item = items[index];
  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.progress} accessibilityLabel={`Question ${index + 1} of ${items.length}`}>
        {items.map((_, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={item.id} entering={FadeInRight.duration(220)}>
          <ExerciseView
            exercise={item}
            mode="check"
            canListen={canListen}
            say={say}
            onAnswered={(correct) => {
              useAcademy.getState().record(item, correct, 'diagnostic');
              if (correct === null) return;
              setTally((t) => {
                const s = t[item.skill] ?? { right: 0, total: 0 };
                return { ...t, [item.skill]: { right: s.right + (correct ? 1 : 0), total: s.total + 1 } };
              });
            }}
            onNext={() => setIndex((i) => i + 1)}
            nextLabel={index === items.length - 1 ? 'See the result' : 'Next'}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const skillNames: Record<Skill, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

function Result({ tally, canListen }: { tally: Tally; canListen: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const marked = Object.values(tally).reduce((n, t) => ({ right: n.right + t.right, total: n.total + t.total }), { right: 0, total: 0 });
  const share = marked.total ? marked.right / marked.total : 0;
  const start =
    share < 0.5
      ? 'Start with the first topic, About me and my family. The lessons begin from the basics.'
      : share < 0.8
        ? 'Start with the first topics. You’ll move through the easier parts quickly.'
        : 'A strong start. Go through the first topics quickly; their checks show what you already know.';

  return (
    <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: insets.bottom + space.xxl }]}>
      <Animated.View entering={FadeIn} style={[styles.badge, { backgroundColor: colors.successSoft }]}>
        <Icon name="check" size={32} color={colors.success} />
      </Animated.View>
      <Text variant="title1" align="center" accessibilityRole="header">
        Check finished
      </Text>
      <Text variant="callout" color="label2" align="center">
        {start}
      </Text>
      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {(['reading', 'listening', 'writing', 'speaking'] as Skill[]).map((s, i) => {
          const t = tally[s];
          return (
            <View key={s}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <View style={styles.skillRow}>
                <Text variant="headline" style={styles.flex}>
                  {skillNames[s]}
                </Text>
                <Text variant="callout" color={t ? 'label' : 'label3'} tabular>
                  {t ? `${t.right} of ${t.total}` : s === 'speaking' ? 'Not in this check' : s === 'writing' ? 'Checked by you' : canListen ? 'Not checked' : 'Needs a Czech voice'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text variant="footnote" color="label3" align="center">
        A few questions per skill aren’t enough to judge it. Your readiness builds up from the checks in each lesson.
      </Text>
      <Button label="See today’s plan" onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn/academy'))} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  intro: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg, alignItems: 'stretch' },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  card: { borderRadius: radius.card, borderCurve: 'continuous', paddingHorizontal: space.lg },
  skillRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: space.md },
  rule: { height: StyleSheet.hairlineWidth },
});
