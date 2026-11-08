import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Orb } from '@/components/speak/orb';
import { Button } from '@/components/ui/button';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useCzechVoice } from '@/lib/learn/voice';
import { speakApi, speakAvailable, type SpeakStatus } from '@/lib/speak/api';
import { levelLabels } from '@/lib/speak/evidence';
import { situationById, type SituationInfo } from '@/lib/speak/situations';
import type { SpeakReview, Turn } from '@/lib/speak/types';
import { useConversation } from '@/lib/speak/use-conversation';
import { useLearn } from '@/store/learn';
import { useSpeak } from '@/store/speak';
import { useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Speak Czech: one conversation. Voice first (the orb, the partner's line, the microphone), typing
 * as the fallback, then a short review. Close (×) or End always stops the voice session.
 */
export default function SpeakScreen() {
  const { situation } = useLocalSearchParams<{ situation: string }>();
  const info = situationById(situation);
  const voice = useCzechVoice();
  if (!info)
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />
        <Text variant="callout" color="label2">
          This conversation isn’t available.
        </Text>
      </View>
    );
  if (voice.state === 'checking') return <Stack.Screen options={{ title: '', headerLeft: () => <HeaderCloseButton /> }} />;
  return <Conversation info={info} czechVoice={voice.state === 'available' ? (voice.voice ?? undefined) : null} />;
}

const clock = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const haptic = () => {
  if (process.env.EXPO_OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

function Conversation({ info, czechVoice }: { info: SituationInfo; czechVoice: string | undefined | null }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const c = useConversation(info.id, czechVoice);
  const meaningOn = useSpeak((s) => s.meaningOn);
  const [showTranscript, setShowTranscript] = useState(false);

  const inSession = c.phase === 'connecting' || c.phase === 'live';
  const title = c.phase === 'review' || c.phase === 'reviewing' ? 'Feedback' : '';
  const close = () => {
    if (c.phase === 'live' || c.phase === 'typed' || c.phase === 'lost') void c.end();
    else router.back();
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title,
          headerLeft: () => <HeaderCloseButton onPress={close} />,
          headerRight: () =>
            c.phase === 'live' || c.phase === 'typed' || c.phase === 'lost' ? (
              <Pressable onPress={() => void c.end()} hitSlop={10} accessibilityRole="button" accessibilityLabel="End conversation">
                <Text variant="body" weight="600" color="danger" chrome>
                  End
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      {c.phase === 'intro' ? (
        <Intro info={info} c={c} />
      ) : c.phase === 'reviewing' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
          <Text variant="callout" color="label2" align="center">
            Reading your conversation…
          </Text>
        </View>
      ) : c.phase === 'review' ? (
        <Review info={info} c={c} />
      ) : c.phase === 'typed' ? (
        <Typed info={info} c={c} canTalk={speakAvailable} />
      ) : (
        <View style={[styles.live, { paddingBottom: insets.bottom + space.md }]}>
          <View style={styles.liveTop}>
            <View style={[styles.chip, { backgroundColor: colors.accentSoft }]}>
              <Text variant="footnote" weight="600" color="accent" chrome>
                {info.titleCs}
              </Text>
            </View>
            {c.phase === 'live' && c.limit ? (
              <Text variant="footnote" color={c.limit - c.elapsed <= 30 ? 'warning' : 'label3'} tabular accessibilityLabel={`${clock(c.limit - c.elapsed)} left`}>
                {clock(c.limit - c.elapsed)} left
              </Text>
            ) : null}
          </View>

          {showTranscript ? (
            <TranscriptList turns={c.turns} meanings={c.meanings} meaningOn={meaningOn} />
          ) : (
            <View style={styles.stage}>
              <Orb
                size={200}
                input={c.levels.input}
                output={c.levels.output}
                state={c.phase === 'connecting' ? 'connecting' : c.phase === 'lost' ? 'idle' : c.muted ? 'muted' : c.partnerSpeaking ? 'speaking' : 'listening'}
              />
              <Text variant="footnote" color="label3" accessibilityLiveRegion="polite">
                {c.phase === 'connecting'
                  ? 'Connecting…'
                  : c.phase === 'lost'
                    ? 'Disconnected'
                    : c.partnerSpeaking
                      ? 'CzechLocal is speaking'
                      : c.muted
                        ? 'Microphone off'
                        : 'Listening… take your time'}
              </Text>
              <LastLines turns={c.turns} meanings={c.meanings} meaningOn={meaningOn} />
            </View>
          )}

          {c.phase === 'lost' ? (
            <View style={styles.lost}>
              <Text variant="callout" color="label2" align="center">
                {c.error?.message ?? 'The connection was lost.'}
              </Text>
              <Button label="Reconnect" icon="refresh" onPress={() => void c.startVoice()} />
              <Button label="Type instead" icon="keyboard" variant="secondary" onPress={() => void c.typeInstead()} />
              <Button label="End and get feedback" variant="plain" onPress={() => void c.end()} />
            </View>
          ) : (
            <>
              <View style={styles.controls}>
                <Control
                  icon="translate"
                  label="Meaning"
                  active={meaningOn}
                  onPress={() => {
                    haptic();
                    useSpeak.getState().setMeaningOn(!meaningOn);
                  }}
                />
                <Pressable
                  onPress={() => {
                    haptic();
                    c.setMuted(!c.muted);
                  }}
                  disabled={c.phase !== 'live'}
                  accessibilityRole="button"
                  accessibilityLabel={c.muted ? 'Turn microphone on' : 'Turn microphone off'}
                  accessibilityState={{ disabled: c.phase !== 'live' }}
                  style={({ pressed }) => [
                    styles.mic,
                    { backgroundColor: c.muted ? colors.fill : colors.accentFill, opacity: c.phase !== 'live' ? 0.5 : pressed ? 0.85 : 1 },
                  ]}>
                  <Icon name={c.muted ? 'mic' : 'mic'} size={30} color={c.muted ? colors.label2 : colors.onAccent} />
                  {c.muted ? <View style={[styles.micSlash, { backgroundColor: colors.label2 }]} /> : null}
                </Pressable>
                <Control icon="text" label="Transcript" active={showTranscript} onPress={() => setShowTranscript((v) => !v)} />
              </View>
              <Text variant="footnote" color="label3" align="center">
                {c.muted ? 'Microphone off · tap to talk' : c.request.mode === 'immersion' ? 'Microphone on · Czech only' : 'Microphone on · talk in any language'}
              </Text>
              <View style={styles.secondary}>
                <Pressable onPress={() => void c.typeInstead()} hitSlop={8} accessibilityRole="button" style={styles.link}>
                  <Icon name="keyboard" size={16} color={colors.label2} />
                  <Text variant="subhead" color="label2" chrome>
                    Type instead
                  </Text>
                </Pressable>
                <Pressable onPress={c.help} disabled={c.phase !== 'live'} hitSlop={8} accessibilityRole="button" style={styles.link}>
                  <Icon name="question" size={16} color={colors.label2} />
                  <Text variant="subhead" color="label2" chrome>
                    A little help
                  </Text>
                </Pressable>
              </View>
            </>
          )}
          {inSession && c.error ? (
            <Text variant="footnote" color="danger" align="center">
              {c.error.message}
            </Text>
          ) : null}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

type C = ReturnType<typeof useConversation>;

function Control({ icon, label, active, onPress }: { icon: IconName; label: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: active }} accessibilityLabel={label} style={styles.control} hitSlop={6}>
      <View style={[styles.controlWell, { backgroundColor: active ? colors.accentSoft : colors.surface, boxShadow: colors.shadow }]}>
        <Icon name={icon} size={20} color={active ? colors.accent : colors.label2} />
      </View>
      <Text variant="caption" color={active ? 'accent' : 'label2'} chrome>
        {label}
      </Text>
    </Pressable>
  );
}

/** The partner's latest line, big, with its meaning, and the learner's latest under it. */
function LastLines({ turns, meanings, meaningOn }: { turns: Turn[]; meanings: Record<string, string | null>; meaningOn: boolean }) {
  const partner = [...turns].reverse().find((t) => t.role === 'partner' && t.text.trim());
  const lastIndex = turns.length - 1;
  const learner = turns[lastIndex]?.role === 'learner' ? turns[lastIndex] : null;
  if (!partner && !learner) return <View style={styles.lines} />;
  return (
    <View style={styles.lines}>
      {partner ? (
        <Animated.View key={partner.id} entering={FadeIn.duration(180)} style={styles.lineGap}>
          <Text variant="title2" align="center" lang="cs">
            {partner.text.trim()}
          </Text>
          {meaningOn ? (
            <Text variant="callout" color="label2" align="center">
              {meanings[partner.id] ?? '…'}
            </Text>
          ) : null}
        </Animated.View>
      ) : null}
      {learner ? (
        <Text variant="subhead" color="label2" align="center" lang="cs">
          <Text variant="caption" weight="700" color="label3">
            YOU{'  '}
          </Text>
          {learner.text.trim()}
        </Text>
      ) : null}
    </View>
  );
}

function TranscriptList({ turns, meanings, meaningOn }: { turns: Turn[]; meanings: Record<string, string | null>; meaningOn: boolean }) {
  const { colors } = useTheme();
  const ref = useRef<React.ComponentRef<typeof ScrollView>>(null);
  return (
    <ScrollView ref={ref} style={styles.flex} contentContainerStyle={styles.transcript} onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}>
      {turns.length === 0 ? (
        <Text variant="callout" color="label3" align="center">
          The conversation appears here as you talk.
        </Text>
      ) : null}
      {turns.map((t) => (
        <View
          key={t.id}
          style={[
            styles.bubble,
            t.role === 'learner'
              ? { alignSelf: 'flex-end', backgroundColor: colors.accentSoft }
              : { alignSelf: 'flex-start', backgroundColor: colors.surface, boxShadow: colors.shadow },
          ]}>
          <Text variant="callout" lang="cs">
            {t.text.trim()}
          </Text>
          {t.role === 'partner' && meaningOn && meanings[t.id] ? (
            <Text variant="footnote" color="label2">
              {meanings[t.id]}
            </Text>
          ) : null}
          {t.role === 'learner' && (t.typed || t.helped || t.meaning) ? (
            <Text variant="caption" color="label3">
              {[t.typed && 'typed', t.helped && 'with help', t.meaning && 'meaning shown'].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

function Intro({ info, c }: { info: SituationInfo; c: C }) {
  const { colors } = useTheme();
  // Withdrawing AI consent in Settings withdraws this one too.
  const speakConsent = useSpeak((s) => s.consent);
  const aiConsent = useStore((s) => s.aiConsent);
  const consent = speakConsent && aiConsent;
  const czechOnly = useSpeak((s) => s.czechOnly);
  const [status, setStatus] = useState<SpeakStatus | null>(null);
  const [statusError, setStatusError] = useState(false);
  useEffect(() => {
    let active = true;
    speakApi
      .status()
      .then((s) => active && setStatus(s))
      .catch(() => active && setStatusError(true));
    return () => {
      active = false;
    };
  }, [c.error]);

  const noTime = status ? status.secondsLeft < 30 : false;
  const voiceOff = !speakAvailable || (status ? !status.voice : false) || c.error?.code === 'voice_off';
  const agree = () => {
    useSpeak.getState().setConsent(true);
    useStore.getState().setAiConsent(true);
  };
  const micBlocked = c.error?.code === 'microphone';

  return (
    <ScrollView contentContainerStyle={styles.intro} contentInsetAdjustmentBehavior="automatic">
      <View style={styles.introHead}>
        <Orb size={120} input={c.levels.input} output={c.levels.output} state="idle" />
        <Text variant="title1" align="center" accessibilityRole="header">
          {info.title}
        </Text>
        <Text variant="callout" color="label2" align="center" lang="cs">
          {info.titleCs}
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <Text variant="footnote" weight="700" color="accent">
          YOU’LL PRACTISE
        </Text>
        {info.objectives.map((o) => (
          <View key={o} style={styles.bullet}>
            <Icon name="check" size={16} color={colors.accent} />
            <Text variant="callout" style={styles.flex}>
              {o}
            </Text>
          </View>
        ))}
        <Text variant="footnote" color="label3">
          Pitched for you: {levelLabels[c.request.level].toLowerCase()}. It adapts to how you answer.
        </Text>
      </View>

      <View style={[styles.card, styles.modeRow, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <View style={styles.flex}>
          <Text variant="headline">Czech only</Text>
          <Text variant="footnote" color="label2">
            {czechOnly
              ? 'CzechLocal speaks only Czech, like a real conversation. Fewer corrections.'
              : 'Off: talk in any language. CzechLocal answers in yours, teaches you Czech and corrects you as you go.'}
          </Text>
        </View>
        <Switch
          value={czechOnly}
          onValueChange={(v) => useSpeak.getState().setCzechOnly(v)}
          trackColor={{ true: colors.accentFill }}
          accessibilityLabel="Czech only"
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
        <Text variant="footnote" weight="700" color="accent">
          USEFUL PHRASES
        </Text>
        {info.phrases.map((p) => (
          <View key={p.cs} style={styles.phrase}>
            <Text variant="callout" weight="600" lang="cs">
              {p.cs}
            </Text>
            <Text variant="footnote" color="label2">
              {p.en}
            </Text>
          </View>
        ))}
      </View>

      {!consent && !voiceOff ? (
        <Text variant="footnote" color="label2" align="center">
          Speak Czech sends your voice to OpenAI, which runs the conversation, and the text of it to Anthropic’s Claude for meanings and feedback. Neither is
          kept by CzechLocal, and no recording is saved. Your progress stays on this phone.
        </Text>
      ) : null}

      {micBlocked ? (
        <View style={styles.introActions}>
          <Text variant="callout" color="danger" align="center">
            {c.error!.message}
          </Text>
          {process.env.EXPO_OS !== 'web' ? <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} /> : null}
        </View>
      ) : c.error ? (
        <Text variant="callout" color="danger" align="center">
          {c.error.message}
        </Text>
      ) : null}

      <View style={styles.introActions}>
        {voiceOff ? (
          <Text variant="footnote" color="label2" align="center">
            Talking out loud isn’t available right now. You can have the same conversation by typing.
          </Text>
        ) : (
          <Button
            label={!consent ? 'Agree and start talking' : 'Start talking'}
            icon="mic"
            disabled={noTime}
            onPress={() => {
              if (!consent) agree();
              void c.startVoice();
            }}
          />
        )}
        <Button
          label={!consent && voiceOff ? 'Agree and type' : 'Type instead'}
          icon="keyboard"
          variant="secondary"
          onPress={() => {
            if (!consent) agree();
            void c.typeInstead();
          }}
        />
        <Text variant="footnote" color="label3" align="center" tabular>
          {status
            ? noTime
              ? 'That’s today’s speaking time. It comes back tomorrow; typing is still open.'
              : `${clock(status.secondsLeft)} of ${clock(status.dailySeconds)} speaking time left today`
            : statusError
              ? 'Couldn’t check today’s speaking time.'
              : ' '}
        </Text>
      </View>
    </ScrollView>
  );
}

function Typed({ info, c, canTalk }: { info: SituationInfo; c: C; canTalk: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const meaningOn = useSpeak((s) => s.meaningOn);
  const [draft, setDraft] = useState('');
  const send = async () => {
    const text = draft;
    setDraft('');
    const ok = await c.sendTyped(text);
    if (!ok) setDraft(text);
  };
  return (
    <View style={[styles.flex, { paddingBottom: insets.bottom + space.sm }]}>
      <View style={styles.typedTop}>
        <View style={[styles.chip, { backgroundColor: colors.accentSoft }]}>
          <Text variant="footnote" weight="600" color="accent" chrome>
            {info.titleCs} · typing
          </Text>
        </View>
        <Pressable
          onPress={() => useSpeak.getState().setMeaningOn(!meaningOn)}
          accessibilityRole="switch"
          accessibilityState={{ checked: meaningOn }}
          accessibilityLabel="Meaning"
          hitSlop={8}
          style={styles.link}>
          <Icon name="translate" size={16} color={meaningOn ? colors.accent : colors.label2} />
          <Text variant="subhead" color={meaningOn ? 'accent' : 'label2'} chrome>
            Meaning
          </Text>
        </Pressable>
      </View>
      <TranscriptList turns={c.turns} meanings={c.meanings} meaningOn={meaningOn} />
      {c.waiting ? (
        <Text variant="footnote" color="label3" align="center">
          CzechLocal is writing…
        </Text>
      ) : null}
      {c.error ? (
        <Text variant="footnote" color="danger" align="center">
          {c.error.message}
        </Text>
      ) : null}
      <View style={[styles.composer, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Odpovězte česky…"
          placeholderTextColor={colors.label3}
          style={[styles.input, { color: colors.label }]}
          multiline
          maxLength={400}
          accessibilityLabel="Your answer in Czech"
        />
        <Pressable
          onPress={() => void send()}
          disabled={!draft.trim() || c.waiting}
          accessibilityRole="button"
          accessibilityLabel="Send"
          style={[styles.send, { backgroundColor: draft.trim() && !c.waiting ? colors.accentFill : colors.fill }]}>
          <Icon name="arrowRight" size={20} color={draft.trim() && !c.waiting ? colors.onAccent : colors.label3} />
        </Pressable>
      </View>
      {canTalk ? (
        <Pressable onPress={() => void c.startVoice()} hitSlop={8} accessibilityRole="button" style={[styles.link, styles.talkAgain]}>
          <Icon name="mic" size={16} color={colors.accent} />
          <Text variant="subhead" color="accent" chrome>
            Talk instead
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Review({ info, c }: { info: SituationInfo; c: C }) {
  const { colors } = useTheme();
  const r = c.review;
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const save = (w: SpeakReview['words'][number]) => {
    const err = useLearn.getState().addOwnCard(w.lemma, w.meaning);
    if (!err || err === 'duplicate') setSaved((s) => ({ ...s, [w.lemma]: true }));
  };
  return (
    <ScrollView contentContainerStyle={styles.review} contentInsetAdjustmentBehavior="automatic">
      {c.notice ? (
        <Text variant="footnote" color="label2" align="center">
          {c.notice}
        </Text>
      ) : null}
      {c.reviewError ? (
        <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
          <Text variant="headline">Feedback didn’t come through</Text>
          <Text variant="callout" color="label2">
            {c.reviewError} Your conversation is saved on this phone without it.
          </Text>
          <Button label="Try again" size="medium" onPress={() => void c.retryReview()} />
        </View>
      ) : !r ? (
        <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
          <Text variant="headline">Nothing to review this time</Text>
          <Text variant="callout" color="label2">
            CzechLocal didn’t hear an answer from you, so there’s no feedback and nothing was added to your progress. Try again whenever you like.
          </Text>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(220)} style={styles.reviewBody}>
          <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
            <Text variant="footnote" weight="700" color="accent">
              FEEDBACK FROM AI
            </Text>
            <Text variant="callout">{r.summary}</Text>
            <Text variant="footnote" color="label3">
              {r.independentTurns} {r.independentTurns === 1 ? 'answer' : 'answers'} on your own{r.helpUsed ? ` · ${r.helpUsed} with help` : ''}
            </Text>
          </View>

          {r.wentWell.length ? (
            <Section title="What went well">
              {r.wentWell.map((w) => (
                <View key={w} style={styles.bullet}>
                  <Icon name="checkCircle" size={18} color={colors.success} />
                  <Text variant="callout" style={styles.flex}>
                    {w}
                  </Text>
                </View>
              ))}
            </Section>
          ) : null}

          {r.corrections.length ? (
            <Section title="Worth fixing">
              {r.corrections.map((x, i) => (
                <View key={i} style={[styles.correction, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.separator }]}>
                  <Text variant="callout" color="danger" lang="cs" style={styles.strike}>
                    {x.original}
                  </Text>
                  <Text variant="callout" weight="600" color="success" lang="cs">
                    {x.corrected}
                  </Text>
                  {x.why ? (
                    <Text variant="footnote" color="label2">
                      {x.why}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Section>
          ) : null}

          {r.words.length ? (
            <Section title="Words you used">
              {r.words.map((w) => (
                <View key={w.lemma} style={styles.word}>
                  <View style={styles.flex}>
                    <Text variant="callout" weight="600" lang="cs">
                      {w.lemma}
                    </Text>
                    <Text variant="footnote" color="label2">
                      {w.meaning} · {w.kind === 'independent' ? 'on your own' : w.kind === 'assisted' ? 'with help' : 'not quite yet'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => save(w)}
                    disabled={saved[w.lemma]}
                    accessibilityRole="button"
                    accessibilityLabel={saved[w.lemma] ? `${w.lemma} saved to your words` : `Save ${w.lemma} to your words`}
                    hitSlop={8}
                    style={[styles.save, { backgroundColor: saved[w.lemma] ? colors.successSoft : colors.accentSoft }]}>
                    <Icon name={saved[w.lemma] ? 'check' : 'plus'} size={16} color={saved[w.lemma] ? colors.success : colors.accent} />
                  </Pressable>
                </View>
              ))}
              <Text variant="footnote" color="label3">
                Saved words go to Your words for spaced review. A word counts as known only after you use it on your own on different days.
              </Text>
            </Section>
          ) : null}

          {r.comprehension.length ? (
            <Section title="Harder to understand">
              {r.comprehension.map((n) => (
                <Text key={n} variant="callout" color="label2">
                  {n}
                </Text>
              ))}
            </Section>
          ) : null}

          <Text variant="footnote" color="label3" style={styles.disclaimer}>
            Written by AI from the text of your conversation, so it can make mistakes and can’t judge pronunciation. Speech recognition can mishear, too. Saved on
            this phone only.
          </Text>
        </Animated.View>
      )}
      <View style={styles.introActions}>
        <Button label="Done" onPress={() => router.back()} />
        <Button label="Talk again" variant="secondary" onPress={() => router.replace({ pathname: '/speak/[situation]', params: { situation: info.id } })} />
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      <Text variant="headline">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: layout.gutter },
  live: { flex: 1, paddingHorizontal: layout.gutter, gap: space.md },
  liveTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: space.sm },
  chip: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs + 2 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm },
  lines: { minHeight: 120, gap: space.sm, alignSelf: 'stretch', justifyContent: 'flex-start', paddingTop: space.md },
  lineGap: { gap: space.xs },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  control: { alignItems: 'center', gap: space.xs, minWidth: 72 },
  controlWell: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  mic: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  micSlash: { position: 'absolute', width: 36, height: 2.5, borderRadius: 2, transform: [{ rotate: '-45deg' }] },
  secondary: { flexDirection: 'row', justifyContent: 'center', gap: space.xxl },
  link: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 44 },
  lost: { gap: space.sm, paddingBottom: space.md },
  transcript: { gap: space.sm, paddingVertical: space.md },
  bubble: { maxWidth: '86%', borderRadius: radius.tile, paddingHorizontal: space.md, paddingVertical: space.sm, gap: space.xxs },
  intro: { padding: layout.gutter, paddingBottom: space.huge, gap: space.lg },
  introHead: { alignItems: 'center', gap: space.xs },
  introActions: { gap: space.sm },
  card: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.sm },
  bullet: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  modeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  phrase: { gap: 1 },
  typedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.gutter, paddingTop: space.sm },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    marginHorizontal: layout.gutter,
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.sm,
    paddingLeft: space.md,
  },
  input: { flex: 1, fontSize: 17, minHeight: 36, maxHeight: 120, paddingVertical: space.xs },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  talkAgain: { alignSelf: 'center' },
  review: { padding: layout.gutter, paddingBottom: space.huge, gap: space.lg },
  reviewBody: { gap: space.lg },
  correction: { gap: 2, paddingTop: space.sm },
  strike: { textDecorationLine: 'line-through' },
  word: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  save: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  disclaimer: { paddingHorizontal: space.xs },
});
