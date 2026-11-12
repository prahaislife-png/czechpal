import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseView } from '@/components/academy/exercise';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { exerciseById, wordsForExercise } from '@/lib/academy/catalog';
import { mistakeIds } from '@/lib/academy/evidence';
import type { Exercise } from '@/lib/academy/types';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const ROUND = 10;

/**
 * Mistake memory: the items whose latest answer was wrong, from lessons and exam practice. Get one right and it leaves the list. Going over them never counts as new evidence.
 */
export default function MistakesScreen() {
  const voice = useCzechVoice();
  return (
    <>
      <Stack.Screen options={{ title: 'Your mistakes', headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : <Review canListen={voice.state === 'available'} voice={voice.voice} />}
    </>
  );
}

function Review({ canListen, voice }: { canListen: boolean; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  // Fixed when the round starts, so answering doesn't reshuffle it.
  const [items] = useState<Exercise[]>(() =>
    mistakeIds(useAcademy.getState().attempts)
      .map(exerciseById)
      .filter((e): e is Exercise => !!e && e.kind !== 'write' && (canListen || !(e.kind === 'choice' && e.listen)))
      .slice(0, ROUND),
  );
  const [index, setIndex] = useState(0);
  const [fixed, setFixed] = useState(0);
  const say = useCallback((text: string, slow = false) => speak(text, { voice, rate: slow ? 0.55 : rate }), [voice, rate]);
  useFocusEffect(useCallback(() => stopSpeaking, []));

  if (items.length === 0 || index >= items.length)
    return (
      <View style={[styles.centered, { paddingBottom: insets.bottom }]}>
        <View style={[styles.badge, { backgroundColor: colors.successSoft }]}>
          <Icon name="check" size={32} color={colors.success} />
        </View>
        <Text variant="title2" align="center" accessibilityRole="header">
          {items.length === 0 ? 'No mistakes to go over' : `${fixed} of ${items.length} put right`}
        </Text>
        <Text variant="callout" color="label2" align="center">
          {items.length === 0
            ? 'Answers you get wrong in lessons and practice come back here.'
            : 'The ones you got right have left the list. The rest come back next time.'}
        </Text>
        <Button label="Done" onPress={() => router.back()} />
      </View>
    );

  const e = items[index];
  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.progress} accessibilityLabel={`Mistake ${index + 1} of ${items.length}`}>
        {items.map((_, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View key={e.id} entering={FadeInRight.duration(200)} style={styles.stage}>
          <Text variant="footnote" weight="600" color="label3">
            YOU MISSED THIS BEFORE
          </Text>
          <ExerciseView
            exercise={e}
            mode="practise"
            canListen={canListen}
            say={say}
            words={wordsForExercise(e.id)}
            onAnswered={(correct) => {
              useAcademy.getState().record(e, correct, 'review');
              if (correct) setFixed((n) => n + 1);
            }}
            onNext={() => setIndex((i) => i + 1)}
            nextLabel={index === items.length - 1 ? 'Finish' : 'Next'}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter, gap: space.lg },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
});
