import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { IconWell } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { buildListening, linesOf, listeningLines, listeningWords, type ListenItem } from '@/lib/learn/listening';
import { LISTEN_PASS, missionById, missionWords } from '@/lib/learn/missions';
import { listenTarget, readingLevel } from '@/lib/learn/profile';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const SLOW = 0.6;

const prompts: Record<ListenItem['kind'], string> = {
  word: 'Which word did you hear?',
  meaning: 'What does it mean?',
  line: 'What did they say?',
};

/** Builds a session from the learner's words and texts, or from one mission's. */
function makeSession(missionId: string | undefined, seed: number): ListenItem[] {
  const { deck, progress, profile } = useLearn.getState();
  const mission = missionById(missionId);
  if (mission) {
    const words = missionWords(mission);
    return buildListening({ words, lines: linesOf([mission.contentId]), count: words.length + 2, seed });
  }
  const words = listeningWords(deck, progress, readingLevel(profile?.level ?? 'new'));
  return buildListening({ words, lines: listeningLines(progress), count: listenTarget[profile?.minutes ?? 10], seed });
}

/**
 * Listening practice: the phone says it, the learner picks what they heard or what it means.
 * Uses the phone's own Czech voice; without one there's nothing to hear, and the screen says so.
 */
export default function ListenScreen() {
  const { mission: missionId } = useLocalSearchParams<{ mission?: string }>();
  const mission = missionById(missionId);
  const voice = useCzechVoice();

  return (
    <>
      <Stack.Screen options={{ title: mission ? mission.title : 'Listening', headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : voice.state === 'missing' ? (
        <Message
          title="No Czech voice on this phone"
          body="Listening uses your phone’s own Czech voice. On iPhone, add one in Settings › Accessibility › Spoken Content › Voices › Czech, then come back."
        />
      ) : (
        <Session missionId={mission?.id} voice={voice.voice} />
      )}
    </>
  );
}

function Session({ missionId, voice }: { missionId?: string; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const [seed, setSeed] = useState(() => Date.now());
  const [items, setItems] = useState(() => makeSession(missionId, seed));
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const item = items[index];
  const finished = items.length > 0 && index >= items.length;

  const say = useCallback((text: string, slow = false) => speak(text, { voice, rate: slow ? SLOW : rate }), [voice, rate]);

  // Each item plays as it appears.
  useEffect(() => {
    if (item) say(item.say);
  }, [item, say]);

  useFocusEffect(useCallback(() => stopSpeaking, []));

  if (items.length === 0) {
    return <Message title="Nothing to listen to yet" body="Open a story in Learn or save a few words, then come back." />;
  }

  const pick = (i: number) => {
    if (chosen !== null || !item) return;
    setChosen(i);
    const ok = i === item.answer;
    if (ok) setRight((r) => r + 1);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(ok ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    announce(ok ? 'Right' : `Not quite. It was ${item.options[item.answer]}`);
  };

  const next = () => {
    setChosen(null);
    if (index + 1 >= items.length) {
      useLearn.getState().finishListening(right, items.length, missionId);
      announce('Listening finished');
    }
    setIndex((i) => i + 1);
  };

  const again = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    setItems(makeSession(missionId, nextSeed));
    setIndex(0);
    setRight(0);
    setChosen(null);
  };

  if (finished) {
    const passed = right / items.length >= LISTEN_PASS;
    return (
      <View style={[styles.center, { paddingBottom: insets.bottom + space.lg }]}>
        <IconWell name={passed ? 'check' : 'ear'} tone={passed ? 'success' : 'accent'} size={64} />
        <Text variant="title1" align="center" accessibilityRole="header">
          {right} of {items.length} right
        </Text>
        <Text variant="callout" color="label2" align="center">
          {missionId
            ? passed
              ? 'That’s this mission’s listening step done.'
              : `${Math.round(LISTEN_PASS * 100)}% passes this step. Another go mixes the order.`
            : passed
              ? 'Well heard. That’s today’s listening.'
              : 'That’s today’s listening. The ones you missed will come round again.'}
        </Text>
        <View style={styles.doneButtons}>
          <Button label="Close" onPress={() => router.back()} />
          <Button label="Go again" variant="secondary" onPress={again} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xl }]}>
      <View style={styles.progressRow}>
        <Text variant="footnote" weight="600" color="label2" tabular>
          {index + 1} of {items.length}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.fill }]}>
          <View style={[styles.fill, { backgroundColor: colors.accentFill, width: `${(index / items.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.stage}>
        <Pressable
          onPress={() => say(item.say)}
          accessibilityRole="button"
          accessibilityLabel="Play again"
          style={({ pressed }) => [styles.play, { backgroundColor: colors.accentFill, opacity: pressed ? 0.85 : 1 }]}>
          <Icon name="speaker" size={40} color={colors.onAccent} />
        </Pressable>
        <Pressable onPress={() => say(item.say, true)} accessibilityRole="button" hitSlop={8} style={[styles.slow, { backgroundColor: colors.fill }]}>
          <Text variant="subhead" weight="600" chrome>
            Slower
          </Text>
        </Pressable>
        <Text variant="title3" align="center" accessibilityRole="header">
          {prompts[item.kind]}
        </Text>
      </View>

      <View style={styles.options} accessibilityRole="radiogroup">
        {item.options.map((o, i) => {
          const answered = chosen !== null;
          const isRight = answered && i === item.answer;
          const isWrong = answered && i === chosen && i !== item.answer;
          return (
            <Pressable
              key={o}
              onPress={() => pick(i)}
              disabled={answered}
              accessibilityRole="radio"
              accessibilityState={{ checked: chosen === i, disabled: answered }}
              style={[
                styles.option,
                {
                  borderColor: isRight ? colors.success : isWrong ? colors.danger : colors.separator,
                  backgroundColor: isRight ? colors.successSoft : isWrong ? colors.dangerSoft : colors.surface,
                },
              ]}>
              <Text variant={item.kind === 'line' ? 'callout' : 'headline'} style={styles.optionText}>
                {o}
              </Text>
              {isRight && <Icon name="check" size={18} color={colors.success} />}
              {isWrong && <Icon name="close" size={18} color={colors.danger} />}
            </Pressable>
          );
        })}
      </View>

      {chosen !== null && (
        <View style={styles.after}>
          <View style={[styles.reveal, { backgroundColor: colors.fill }]} accessibilityLiveRegion="polite">
            <Text variant="headline">{item.reveal.cs}</Text>
            <Text variant="subhead" color="label2">
              {item.reveal.en}
            </Text>
          </View>
          <Button label={index + 1 >= items.length ? 'See how you did' : 'Next'} icon="arrowRight" onPress={next} />
        </View>
      )}
    </ScrollView>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.center}>
      <IconWell name="ear" tone="neutral" size={64} />
      <Text variant="title2" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {body}
      </Text>
      <Button label="Close" variant="secondary" onPress={() => router.back()} style={styles.messageButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: layout.gutter + space.lg },
  content: { padding: layout.gutter, gap: space.xl, maxWidth: layout.maxWidth, width: '100%', alignSelf: 'center' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  stage: { alignItems: 'center', gap: space.md, paddingVertical: space.lg },
  play: { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center' },
  slow: { minHeight: 36, paddingHorizontal: space.lg, borderRadius: radius.pill, justifyContent: 'center' },
  options: { gap: space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: radius.tile, borderCurve: 'continuous', borderWidth: 1.5 },
  optionText: { flex: 1 },
  after: { gap: space.lg },
  reveal: { borderRadius: radius.tile, borderCurve: 'continuous', padding: space.lg, gap: 2 },
  doneButtons: { alignSelf: 'stretch', gap: space.sm, marginTop: space.lg },
  messageButton: { alignSelf: 'stretch', marginTop: space.lg },
});
