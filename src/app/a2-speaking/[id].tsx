import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
  type RecordingStatus,
} from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { deleteRecordings, keepRecording, recordingFor } from '@/lib/academy/recordings';
import { speakingPrompts, speakingTaskById, spoken } from '@/lib/academy/tasks/speaking';
import type { SpeakingPrompt, SpeakingTask } from '@/lib/academy/types';
import { examTasks } from '@/lib/learn/exam';
import { speak, stopSpeaking, useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Speaking practice in the exam's four task formats: hear the examiner (or read the card), answer
 * aloud, play yourself back and compare with one good answer. Recordings stay on this phone, one
 * per prompt. Nothing is scored: CzechPal can't yet judge speech, so the learner checks a list.
 */

/** Mono and modest: speech needs no more, and the files stay small. */
const OPTIONS: RecordingOptions = { ...RecordingPresets.HIGH_QUALITY, numberOfChannels: 1, bitRate: 64000 };
/** A take stops by itself after two minutes, so the microphone is never left on. */
const MAX_SECONDS = 120;

type Mic = 'unknown' | 'granted' | 'denied' | 'blocked' | 'failed';

export default function SpeakingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = speakingTaskById(id);
  const voice = useCzechVoice();
  if (!task)
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2">
          This practice isn’t available.
        </Text>
      </View>
    );
  return (
    <>
      <Stack.Screen options={{ title: `Speaking ${task.task}`, headerLeft: () => <HeaderCloseButton /> }} />
      {voice.state === 'checking' ? null : <Practice task={task} canListen={voice.state === 'available'} voice={voice.voice} />}
    </>
  );
}

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(style);
};

/** Records one take at a time and keeps it under the prompt's id. */
function useTakes() {
  const [takes, setTakes] = useState<Record<string, string>>({});
  const [mic, setMic] = useState<Mic>('unknown');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const target = useRef<string | null>(null);

  const finish = useCallback(async (url: string | null) => {
    const id = target.current;
    target.current = null;
    setRecordingId(null);
    setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    if (!id || !url) return;
    try {
      const saved = await keepRecording(id, url);
      setTakes((t) => ({ ...t, [id]: saved }));
      announce('Recorded');
    } catch {
      setMic('failed');
    }
  }, []);

  const onStatus = useCallback(
    (s: RecordingStatus) => {
      if (s.hasError) {
        target.current = null;
        setRecordingId(null);
        setMic('failed');
      } else if (s.isFinished && target.current) finish(s.url);
    },
    [finish],
  );
  const recorder = useAudioRecorder(OPTIONS, onStatus);
  const state = useAudioRecorderState(recorder, 250);

  useEffect(() => {
    let active = true;
    getRecordingPermissionsAsync()
      .then((p) => active && setMic(p.granted ? 'granted' : p.canAskAgain ? 'unknown' : 'blocked'))
      .catch(() => active && setMic('failed'));
    return () => {
      active = false;
      setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    };
  }, []);

  const start = async (id: string) => {
    if (target.current) return;
    try {
      if (mic !== 'granted') {
        const p = await requestRecordingPermissionsAsync();
        setMic(p.granted ? 'granted' : p.canAskAgain ? 'denied' : 'blocked');
        if (!p.granted) return;
      }
      stopSpeaking();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      target.current = id;
      setRecordingId(id);
      recorder.record({ forDuration: MAX_SECONDS });
      haptic(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      target.current = null;
      setRecordingId(null);
      setMic('failed');
    }
  };

  const stop = async () => {
    if (!target.current) return;
    haptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      await recorder.stop();
    } catch {
      // The status listener reports what happened.
    }
    // Some platforms don't send a finished status for a stop; save it here if it didn't.
    if (target.current) finish(recorder.uri);
  };

  const load = (ids: string[]) =>
    setTakes(Object.fromEntries(ids.map((id) => [id, recordingFor(id)]).filter((e): e is [string, string] => !!e[1])));

  const forget = (ids: string[]) => {
    deleteRecordings(ids);
    setTakes({});
  };

  return { takes, mic, recordingId, millis: state.durationMillis, start, stop, load, forget };
}

/** One player for every take, so only one plays at a time. */
function usePlayback() {
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [current, setCurrent] = useState<string | null>(null);
  const playing = status.playing ? current : null;
  const toggle = (id: string, uri: string) => {
    stopSpeaking();
    if (playing === id) {
      player.pause();
      return;
    }
    player.replace(uri);
    player.play();
    setCurrent(id);
  };
  const stop = () => {
    if (status.playing) player.pause();
  };
  return { playing, toggle, stop };
}

function Practice({ task, canListen, voice }: { task: SpeakingTask; canListen: boolean; voice?: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const rate = useLearn((s) => s.rate);
  const prompts = speakingPrompts(task);
  const [index, setIndex] = useState(-1);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const takes = useTakes();
  const playback = usePlayback();
  const done = index >= prompts.length;

  const say = useCallback(
    (text: string, onDone?: () => void) => {
      if (!canListen) return onDone?.();
      speak(spoken(text), { voice, rate, onDone });
    },
    [canListen, voice, rate],
  );
  useFocusEffect(useCallback(() => stopSpeaking, []));

  useEffect(() => {
    if (!done) return;
    useAcademy.getState().finishSpeaking(task.id, { recorded: prompts.filter((p) => takes.takes[p.id]).length, prompts: prompts.length });
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (index < 0)
    return (
      <Intro
        task={task}
        canListen={canListen}
        onStart={() => {
          takes.load(prompts.map((p) => p.id));
          setIndex(0);
        }}
      />
    );
  if (done) return <Review task={task} takes={takes} playback={playback} say={say} canListen={canListen} />;

  const prompt = prompts[index];
  const part = task.parts.find((p) => p.prompts.includes(prompt))!;
  const firstOfPart = part.prompts[0] === prompt;
  const revealed = !!shown[prompt.id];
  const micOff = takes.mic === 'denied' || takes.mic === 'blocked' || takes.mic === 'failed';
  const reveal = () => {
    playback.stop();
    // The reply, if there is one, is spoken as it appears.
    setShown((s) => ({ ...s, [prompt.id]: true }));
  };
  const next = () => {
    stopSpeaking();
    playback.stop();
    setIndex((i) => i + 1);
  };

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <View style={styles.progress} accessibilityLabel={`Turn ${index + 1} of ${prompts.length}`}>
        {prompts.map((_, i) => (
          <View key={i} style={[styles.segment, { backgroundColor: i < index ? colors.accent : i === index ? colors.accentSoft : colors.fill }]} />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View key={prompt.id} entering={FadeInRight.duration(200)} style={styles.stage}>
          {firstOfPart && (part.title || part.situation) ? (
            <View style={styles.partHead}>
              {part.title ? (
                <Text variant="footnote" weight="700" color="label3">
                  {part.title.toUpperCase()}
                </Text>
              ) : null}
              {part.situation ? (
                <Text variant="callout" lang="cs">
                  {part.situation}
                </Text>
              ) : null}
            </View>
          ) : null}
          {firstOfPart && part.opening ? <Line who={task.task === 4 ? 'Your friend' : 'The examiner'} text={part.opening} canListen={canListen} say={say} auto /> : null}
          <PromptCard task={task} prompt={prompt} canListen={canListen} say={say} auto={!(firstOfPart && part.opening)} />
          <Recorder id={prompt.id} takes={takes} playback={playback} />
          {revealed ? (
            <Animated.View entering={FadeIn.duration(180)} style={styles.stage}>
              <Model text={prompt.model} canListen={canListen} say={say} task={task.task} own={prompt.cue === 'vaše otázka'} />
              {prompt.reply ? <Line who={task.task === 4 ? 'Your friend' : 'The examiner'} text={prompt.reply} canListen={canListen} say={say} /> : null}
              <Button label={index === prompts.length - 1 ? (Object.keys(takes.takes).length ? 'Play yourself back' : 'Finish') : 'Next'} onPress={next} />
            </Animated.View>
          ) : takes.recordingId === prompt.id ? null : (
            <Button
              label={takes.takes[prompt.id] ? (prompt.reply ? 'Go on' : 'Compare with an answer') : micOff ? 'Show an answer' : 'Skip, show an answer'}
              variant={takes.takes[prompt.id] || micOff ? 'primary' : 'plain'}
              onPress={reveal}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function Intro({ task, canListen, onStart }: { task: SpeakingTask; canListen: boolean; onStart: () => void }) {
  const { colors } = useTheme();
  const points = examTasks.find((t) => t.part === 'speaking' && t.n === task.task)?.points;
  return (
    <ScrollView contentContainerStyle={styles.intro}>
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <Icon name="mic" size={30} color={colors.accent} />
      </View>
      <Text variant="title1" align="center" accessibilityRole="header">
        {task.title}
      </Text>
      <Text variant="headline" align="center" lang="cs">
        {task.instructionCs}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {task.instruction}
      </Text>
      {task.task === 3 || task.task === 4 ? <Pictures task={task} /> : null}
      <Text variant="footnote" color="label3" align="center">
        {points ? `In the exam: speaking task ${task.task}, ${points} points, ` : 'In the exam '}with no time to prepare.
      </Text>
      {!canListen && task.task !== 3 ? (
        <Text variant="footnote" color="label2" align="center">
          There’s no Czech voice on this phone, so read what the {task.task === 4 ? 'friend' : 'examiner'} says yourself.
        </Text>
      ) : null}
      <Button label="Start" icon="play" onPress={onStart} />
      <Text variant="footnote" color="label3" align="center">
        Your answers are recorded so you can play them back. Recordings stay on this phone and are never sent anywhere.
      </Text>
    </ScrollView>
  );
}

function Pictures({ task }: { task: SpeakingTask }) {
  const { colors } = useTheme();
  const pics = speakingPrompts(task).filter((p) => p.icon);
  return (
    <View style={styles.pictures}>
      {pics.map((p, i) => (
        <View key={p.id} style={[styles.picture, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
          <Icon name={p.icon as IconName} size={26} color={colors.accent} />
          <Text variant="caption" color="label2" align="center">
            {task.task === 3 ? `${i + 1}. ` : ''}
            {p.en}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SpeakButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8} style={[styles.speak, { backgroundColor: colors.accentSoft }]}>
      <Icon name="speaker" size={18} color={colors.accent} />
    </Pressable>
  );
}

/** Something the examiner or friend says: spoken when it appears, if the phone has a Czech voice. */
function Line({ who, text, canListen, say, auto }: { who: string; text: string; canListen: boolean; say: (t: string) => void; auto?: boolean }) {
  const { colors } = useTheme();
  useEffect(() => {
    if (auto !== false) say(text);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={[styles.line, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      <View style={styles.flex}>
        <Text variant="footnote" weight="600" color="label3">
          {who.toUpperCase()}
        </Text>
        <Text variant="callout" lang="cs">
          {text}
        </Text>
      </View>
      {canListen ? <SpeakButton label="Hear it again" onPress={() => say(text)} /> : null}
    </View>
  );
}

function PromptCard({ task, prompt, canListen, say, auto }: { task: SpeakingTask; prompt: SpeakingPrompt; canListen: boolean; say: (t: string) => void; auto: boolean }) {
  const { colors } = useTheme();
  useEffect(() => {
    if (auto && prompt.ask) say(prompt.ask);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const story = task.task === 3;
  const label = prompt.ask ? 'THE EXAMINER ASKS' : task.task === 2 ? 'ON YOUR CARD' : story ? `PICTURE ${prompt.id.split('.').pop()}` : 'YOUR TURN';
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <View style={styles.cardHead}>
        <Text variant="footnote" weight="700" color="accent" style={styles.flex}>
          {label}
        </Text>
        {prompt.ask && canListen ? <SpeakButton label="Hear the question again" onPress={() => say(prompt.ask!)} /> : null}
      </View>
      {prompt.icon ? (
        <View style={[styles.bigPicture, { backgroundColor: colors.accentSoft }]}>
          <Icon name={prompt.icon as IconName} size={44} color={colors.accent} />
        </View>
      ) : null}
      {prompt.ask || prompt.cue ? (
        <Text variant="title2" lang={story ? undefined : 'cs'} align={prompt.icon ? 'center' : undefined}>
          {prompt.ask ?? (story ? prompt.en : prompt.cue)}
        </Text>
      ) : null}
      {!story ? (
        <Text variant="subhead" color="label2" align={prompt.icon ? 'center' : undefined}>
          {prompt.en}
        </Text>
      ) : null}
      {prompt.tip ? (
        <Text variant="footnote" color="label3" align={prompt.icon ? 'center' : undefined}>
          {prompt.tip}
        </Text>
      ) : null}
    </View>
  );
}

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function Recorder({ id, takes, playback }: { id: string; takes: ReturnType<typeof useTakes>; playback: ReturnType<typeof usePlayback> }) {
  const { colors } = useTheme();
  const recording = takes.recordingId === id;
  const busyElsewhere = !!takes.recordingId && !recording;
  const take = takes.takes[id];

  if (takes.mic === 'blocked' || takes.mic === 'denied' || takes.mic === 'failed')
    return (
      <View style={[styles.noMic, { backgroundColor: colors.fill }]}>
        <Icon name="mic" size={20} color={colors.label3} />
        <View style={styles.flex}>
          <Text variant="subhead" weight="600">
            {takes.mic === 'failed' ? 'Recording didn’t work' : 'The microphone is off for CzechPal'}
          </Text>
          <Text variant="footnote" color="label2">
            Say your answer aloud anyway, then compare it with the answer below.
          </Text>
          {takes.mic === 'blocked' && process.env.EXPO_OS !== 'web' ? (
            <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link" hitSlop={8}>
              <Text variant="footnote" weight="600" color="accent" chrome>
                Turn it on in Settings
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );

  return (
    <View style={styles.recorder}>
      <Pressable
        onPress={() => (recording ? takes.stop() : takes.start(id))}
        disabled={busyElsewhere}
        accessibilityRole="button"
        accessibilityLabel={recording ? 'Stop recording' : take ? 'Record again' : 'Record your answer'}
        style={({ pressed }) => [styles.mic, { backgroundColor: recording ? colors.danger : colors.accentFill, opacity: pressed ? 0.85 : 1 }]}>
        <Icon name={recording ? 'stop' : 'mic'} size={30} color={colors.onAccent} />
      </Pressable>
      <Text variant="subhead" weight="600" color={recording ? 'danger' : 'label2'} tabular accessibilityLiveRegion="polite">
        {recording ? `Recording · ${clock(takes.millis)}` : take ? 'Recorded. Tap to record again.' : 'Tap and answer aloud'}
      </Text>
      {take && !recording ? (
        <Button
          label={playback.playing === id ? 'Pause' : 'Play your answer'}
          icon={playback.playing === id ? 'pause' : 'play'}
          variant="secondary"
          onPress={() => playback.toggle(id, take)}
        />
      ) : null}
    </View>
  );
}

const modelNotes = {
  1: 'Other answers can be right too. Listen for the verb and the tense.',
  2: 'Other questions can be right too. Check that yours was a question.',
  3: 'Other sentences can be right too. Check that yours is in the past.',
  4: 'Other answers can be right too.',
} as const;

function Model({ text, canListen, say, task, own }: { text: string; canListen: boolean; say: (t: string) => void; task: SpeakingTask['task']; own?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.model, { backgroundColor: colors.accentSoft }]}>
      <View style={styles.cardHead}>
        <Text variant="footnote" weight="700" color="accent" style={styles.flex}>
          {own ? 'FOR EXAMPLE' : task === 2 ? 'ONE GOOD QUESTION' : 'ONE GOOD ANSWER'}
        </Text>
        {canListen ? <SpeakButton label="Hear the answer" onPress={() => say(text)} /> : null}
      </View>
      <Text variant="body" weight="500" lang="cs">
        {text}
      </Text>
      <Text variant="footnote" color="label2">
        {own ? 'Any question that fits the situation is fine.' : modelNotes[task]}
      </Text>
    </View>
  );
}

function Review({
  task,
  takes,
  playback,
  say,
  canListen,
}: {
  task: SpeakingTask;
  takes: ReturnType<typeof useTakes>;
  playback: ReturnType<typeof usePlayback>;
  say: (t: string) => void;
  canListen: boolean;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const prompts = speakingPrompts(task);
  const [ticks, setTicks] = useState<boolean[]>(() => task.checklist.map(() => false));
  const recorded = prompts.filter((p) => takes.takes[p.id]);
  const points = examTasks.find((t) => t.part === 'speaking' && t.n === task.task)?.points;

  return (
    <ScrollView contentContainerStyle={[styles.intro, { paddingBottom: insets.bottom + space.xxl }]}>
      <Text variant="title1" align="center" accessibilityRole="header">
        {recorded.length ? 'Play yourself back' : 'Compare with the answers'}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {recorded.length ? 'Listen to each answer next to the model, then tick what you did.' : 'Say each answer aloud again next to the model, then tick what you did.'}
      </Text>

      <View style={[styles.review, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        {prompts.map((p, i) => {
          const take = takes.takes[p.id];
          return (
            <View key={p.id}>
              {i > 0 ? <View style={[styles.rule, { backgroundColor: colors.separator }]} /> : null}
              <View style={styles.reviewRow}>
                {recorded.length ? (
                <Pressable
                  onPress={() => take && playback.toggle(p.id, take)}
                  disabled={!take}
                  accessibilityRole="button"
                  accessibilityLabel={take ? (playback.playing === p.id ? 'Pause your answer' : 'Play your answer') : 'Not recorded'}
                  style={[styles.smallPlay, { backgroundColor: take ? colors.accentFill : colors.fill }]}>
                  <Icon name={playback.playing === p.id ? 'pause' : 'play'} size={16} color={take ? colors.onAccent : colors.label3} />
                </Pressable>
                ) : null}
                <View style={styles.flex}>
                  <Text variant="subhead" weight="600" lang="cs">
                    {p.ask ?? (task.task === 3 ? `${i + 1}. ${p.en}` : p.cue)}
                  </Text>
                  <Pressable onPress={() => say(p.model)} disabled={!canListen} accessibilityRole={canListen ? 'button' : 'text'} accessibilityLabel={canListen ? `Hear: ${p.model}` : p.model}>
                    <Text variant="footnote" color={canListen ? 'accent' : 'label2'} lang="cs">
                      {p.model}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View>
        <SectionHeader title="Check it yourself" />
        {task.checklist.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => setTicks((t) => t.map((x, j) => (j === i ? !x : x)))}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: ticks[i] }}
            style={styles.tick}>
            <Icon name={ticks[i] ? 'checkCircle' : 'circle'} size={22} color={ticks[i] ? colors.accent : colors.label3} />
            <Text variant="callout" style={styles.flex}>
              {c}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text variant="footnote" color="label3" style={styles.note}>
        CzechPal doesn’t score speaking.{points ? ` In the exam this task gives ${points} points, and pronunciation is marked across the whole speaking part.` : ''}{' '}
        {recorded.length ? `Your ${recorded.length === 1 ? 'recording is' : `${recorded.length} recordings are`} saved on this phone only.` : ''}
      </Text>
      <Button label="Done" onPress={() => router.back()} />
      <Button label="Do it again" variant="secondary" onPress={() => router.replace({ pathname: '/a2-speaking/[id]', params: { id: task.id } })} />
      {recorded.length ? (
        <Button
          label="Delete these recordings"
          variant="quietDestructive"
          onPress={() => {
            playback.stop();
            takes.forget(prompts.map((p) => p.id));
            announce('Recordings deleted');
          }}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.gutter },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: layout.gutter, paddingTop: space.sm },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { padding: layout.gutter, paddingBottom: space.huge },
  stage: { gap: space.lg },
  intro: { padding: layout.gutter, paddingTop: space.xxl, gap: space.lg },
  badge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  partHead: { gap: space.xs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth, padding: space.md },
  card: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bigPicture: { width: 88, height: 88, borderRadius: radius.tile, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  speak: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recorder: { alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  mic: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  noMic: { flexDirection: 'row', gap: space.md, borderRadius: radius.tile, padding: space.lg, alignItems: 'flex-start' },
  model: { borderRadius: radius.tile, padding: space.lg, gap: space.xs },
  pictures: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  picture: { width: '48%', flexGrow: 1, alignItems: 'center', gap: space.xs, padding: space.md, borderRadius: radius.tile, borderWidth: StyleSheet.hairlineWidth },
  review: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg },
  reviewRow: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  smallPlay: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rule: { height: StyleSheet.hairlineWidth, marginVertical: space.md },
  tick: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  note: { paddingHorizontal: space.xs },
});
