import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { Field } from '@/components/ui/field';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { ai, AnalyzeError, isDemoMode, languageByCode, type ComposeResult } from '@/lib/ai';
import {
  askNewPatients,
  CALL_CLOSING,
  callOpening,
  insurerForMessage,
  insurers,
  startingPoints,
  type DoctorType,
  type Insurer,
  type Line,
  type Recipient,
} from '@/lib/compose/templates';
import { useConfirmDiscard } from '@/hooks/use-confirm-discard';
import { announce, useLargeText } from '@/lib/a11y';
import { speakCzech, stopSpeaking } from '@/lib/speech';
import { useStore } from '@/store/cases';
import { layout, motion, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Mode = 'message' | 'call';
const modes = [
  { value: 'message', label: 'Message' },
  { value: 'call', label: 'Call script' },
] as const;

const recipientAbout: Record<Recipient, string> = {
  trades: 'a tradesperson',
  landlord: 'a landlord or property manager',
  doctor: 'a doctor’s or dentist’s practice',
};

const isRecipient = (v: unknown): v is Recipient => v === 'trades' || v === 'landlord' || v === 'doctor';
const isDoctorType = (v: unknown): v is DoctorType =>
  ['gp', 'dentist', 'paediatrician', 'gynaecologist', 'psychiatrist', 'psychologist'].includes(v as string);

const insurerOptions: readonly { id: Insurer | 'none'; label: string }[] = [{ id: 'none', label: 'Don’t say' }, ...insurers];

/**
 * Write to anyone in Czech: say what you need in your own words, in any language, and the AI
 * writes the Czech message and a call script. Modal task with Close. Opened from Home, from a
 * Help category (recipient), or from a practice (recipient, name, phone and doctor type).
 */
export default function ComposeScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ recipient?: string; to?: string; phone?: string; doctorType?: string; mode?: string }>();
  const recipient = isRecipient(params.recipient) ? params.recipient : undefined;
  const doctorType = isDoctorType(params.doctorType) ? params.doctorType : undefined;
  const details = useStore((s) => s.details);
  const language = useStore((s) => s.language);
  const aiConsent = useStore((s) => s.aiConsent);

  const [request, setRequest] = useState(() => (doctorType ? askNewPatients(doctorType) : ''));
  const [written, setWritten] = useState<{ key: string; result: ComposeResult } | null>(null);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(params.mode === 'call' ? 'call' : 'message');
  const [copied, setCopied] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);
  const alive = useRef(true);
  const largeText = useLargeText();
  // Typing is the work here; once the message was copied or sent on, closing loses nothing.
  const [initialRequest] = useState(request);
  const [used, setUsed] = useState(false);
  useConfirmDiscard(request.trim() !== initialRequest.trim() && !used, {
    title: 'Discard this message?',
    message: 'What you wrote here will be lost.',
  });

  const phone = params.phone?.replace(/[^\d+]/g, '');
  const needsConsent = !isDemoMode && !aiConsent;
  // What the message was written from: change any of it and it needs writing again.
  const key = JSON.stringify([request.trim(), details, language]);
  const stale = !written || written.key !== key;
  const result = written?.result;

  useEffect(
    () => () => {
      alive.current = false;
      stopSpeaking(); // stop any line still being read when the composer closes
    },
    [],
  );
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const write = async () => {
    if (request.trim().length < 3 || writing) return;
    if (needsConsent) useStore.getState().setAiConsent(true);
    setWriting(true);
    setWriteError(null);
    setOpenError(null);
    const writtenFor = key;
    try {
      const out = await ai.composeMessage({
        request: request.trim(),
        to: params.to,
        about: recipient ? recipientAbout[recipient] : undefined,
        details: { name: details.name.trim() || undefined, address: details.address.trim() || undefined, insurer: insurerForMessage(details.insurer) },
        language,
      });
      if (!alive.current) return;
      setWritten({ key: writtenFor, result: out });
      announce('Message written in Czech');
      if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      if (alive.current) setWriteError(e instanceof AnalyzeError ? e.message : 'The message couldn’t be written. Please try again.');
    } finally {
      if (alive.current) setWriting(false);
    }
  };

  const copy = async () => {
    if (!result) return;
    setCopied(true);
    setUsed(true);
    announce('Copied');
    setOpenError(null);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Clipboard.setStringAsync(result.czech);
    } catch {
      setCopied(false);
      setOpenError('Couldn’t copy. Select the message text and copy it from there.');
    }
  };

  const open = async (url: string, app: string) => {
    setOpenError(null);
    setUsed(true);
    try {
      await Linking.openURL(url);
    } catch {
      setOpenError(`Couldn’t open ${app} on this device. Copy the message instead.`);
    }
  };

  const body = encodeURIComponent(result?.czech ?? '');
  const sms = process.env.EXPO_OS === 'ios' ? `sms:${phone ?? ''}&body=${body}` : `sms:${phone ?? ''}?body=${body}`;
  const whatsapp = `https://wa.me/${phone ? phone.replace(/^\+/, '') : ''}?text=${body}`;
  const savedSummary = [details.name.trim(), details.address.trim(), insurers.find((i) => i.id === details.insurer)?.label]
    .filter(Boolean)
    .join(' · ');

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerLeft: () => <HeaderCloseButton /> }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {params.to ? (
          <View style={styles.to}>
            <Text variant="footnote" color="label2">
              To
            </Text>
            <Text variant="headline">{params.to}</Text>
          </View>
        ) : null}

        <View style={styles.ask}>
          <SectionHeader title="What do you want to say?" />
          <TextInput
            value={request}
            onChangeText={setRequest}
            placeholder="For example: my heating stopped working, can someone come tomorrow morning?"
            placeholderTextColor={colors.label3}
            multiline
            maxLength={1000}
            textAlignVertical="top"
            accessibilityLabel="What do you want to say?"
            accessibilityHint="Write it in any language"
            style={[styles.box, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: colors.separator }]}
          />
          <Text variant="footnote" color="label3" style={styles.below}>
            Any language is fine. It’s turned into polite Czech.
          </Text>
        </View>

        {!result && (
          <View>
            <SectionHeader title="Or start from" />
            <List>
              {startingPoints[recipient ?? 'any'].map((s) => (
                <Row key={s} title={s} selected={request === s} onPress={() => setRequest(s)} />
              ))}
            </List>
          </View>
        )}

        <View>
          <List>
            <Row
              icon="person"
              expanded={detailsOpen}
              title="Your name and address"
              subtitle={savedSummary || 'Saved on this phone, added only when the message needs them'}
              accessory={<Icon name={detailsOpen ? 'close' : 'compose'} size={16} color={colors.label3} />}
              onPress={() => setDetailsOpen((v) => !v)}
            />
          </List>
          {detailsOpen && (
            <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.details}>
              <Field
                label="Your name"
                value={details.name}
                onChangeText={(name) => useStore.getState().setDetails({ name })}
                placeholder="Ankit Sharma"
                autoComplete="name"
                textContentType="name"
              />
              <Field
                label="Address"
                value={details.address}
                onChangeText={(address) => useStore.getState().setDetails({ address })}
                placeholder="Korunní 812/14, Praha 2"
                autoComplete="street-address"
                textContentType="fullStreetAddress"
                helper="Street and number, then the district. Used for repairs and visits."
              />
              <View>
                <SectionHeader title="Health insurer" />
                <ChipGroup
                  options={insurerOptions}
                  value={details.insurer ?? 'none'}
                  onChange={(v) => useStore.getState().setDetails({ insurer: v === 'none' ? undefined : v })}
                />
              </View>
            </Animated.View>
          )}
        </View>

        {result && (
          <Animated.View entering={FadeIn.duration(motion.base)} style={[styles.output, stale && styles.staleOutput]}>
            <Segmented options={modes} value={mode} onChange={setMode} />
            {mode === 'message' ? (
              <>
                <Card>
                  <Text variant="callout" selectable style={styles.message}>
                    {result.czech}
                  </Text>
                </Card>
                <View>
                  <SectionHeader title={`What it says in ${languageByCode(language).name}`} />
                  <Card style={{ backgroundColor: colors.surfaceMuted, boxShadow: 'none' }}>
                    <Text variant="subhead" color="label2" selectable style={styles.translation}>
                      {result.english}
                    </Text>
                  </Card>
                </View>
              </>
            ) : (
              <View style={styles.script}>
                <Text variant="footnote" color="label2" style={styles.below}>
                  Tap a line to hear it in Czech.
                </Text>
                <ScriptGroup title="Start the call" lines={callOpening(details.name)} />
                <ScriptGroup title="Say" lines={result.call.say} />
                <ScriptGroup title="You might hear" lines={result.call.hear} />
                <ScriptGroup title="End the call" lines={CALL_CLOSING} />
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      <BottomBar inModal>
        {stale ? (
          <>
            {needsConsent && (
              <Text variant="footnote" color="label2" align="center">
                CzechPal sends what you write to Anthropic’s Claude AI to turn it into Czech. CzechPal doesn’t keep it, and
                Anthropic doesn’t use it to train AI models.
              </Text>
            )}
            <Button
              label={needsConsent ? 'Agree and write it in Czech' : result ? 'Write it again' : 'Write it in Czech'}
              icon="compose"
              loading={writing}
              disabled={request.trim().length < 3}
              onPress={write}
            />
            {writeError ? (
              <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
                {writeError}
              </Text>
            ) : (
              <Text variant="footnote" color="label3" align="center">
                Free, and doesn’t use your explanations.
              </Text>
            )}
          </>
        ) : (
          <>
            {mode === 'call' && phone ? (
              <Button label={`Call ${params.to ?? ''}`.trim()} icon="phone" onPress={() => open(`tel:${phone}`, 'the phone app')} />
            ) : (
              <Button label={copied ? 'Copied' : 'Copy message'} icon={copied ? 'check' : 'copy'} onPress={copy} />
            )}
            <View style={[styles.sendRow, largeText && styles.sendColumn]}>
              <SendButton icon="message" label="SMS" onPress={() => open(sms, 'Messages')} />
              <SendButton icon="personal" label="WhatsApp" onPress={() => open(whatsapp, 'WhatsApp')} />
              <SendButton icon="mail" label="Email" onPress={() => open(`mailto:?body=${body}`, 'Mail')} />
            </View>
            {openError && (
              <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
                {openError}
              </Text>
            )}
          </>
        )}
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

function ScriptGroup({ title, lines }: { title: string; lines: Line[] }) {
  if (!lines.length) return null;
  return (
    <View>
      <SectionHeader title={title} />
      <List inset={false}>
        {lines.map((line) => (
          <ScriptLine key={`${title}-${line.cs}`} line={line} />
        ))}
      </List>
    </View>
  );
}

function ScriptLine({ line }: { line: Line }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => speakCzech(line.cs)}
      accessibilityRole="button"
      accessibilityLabel={`${line.cs}. ${line.en}`}
      accessibilityHint="Plays the Czech aloud"
      style={({ pressed }) => [styles.line, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.lineText}>
        <Text variant="headline" selectable>
          {line.cs}
        </Text>
        {line.say ? (
          <Text variant="subhead" color="accent">
            {line.say}
          </Text>
        ) : null}
        <Text variant="footnote" color="label2">
          {line.en}
        </Text>
      </View>
      <Icon name="speaker" size={20} color={colors.label3} />
    </Pressable>
  );
}

function SendButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Send by ${label}`}
      style={({ pressed }) => [styles.send, pressed && { opacity: 0.5 }]}>
      <Icon name={icon} size={18} color={colors.accent} />
      <Text variant="subhead" weight="600" color="accent" chrome>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.xxxl, gap: space.xxl },
  to: { gap: 2, paddingHorizontal: space.xs },
  ask: { gap: space.xs + 2 },
  box: {
    minHeight: 112,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  below: { paddingHorizontal: space.xs },
  details: { gap: space.xl, marginTop: space.lg },
  output: { gap: space.lg },
  staleOutput: { opacity: 0.5 },
  message: { lineHeight: 24 },
  translation: { lineHeight: 22 },
  script: { gap: space.lg },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  lineText: { flex: 1, gap: 2 },
  sendRow: { flexDirection: 'row', justifyContent: 'space-around' },
  sendColumn: { flexDirection: 'column', alignItems: 'center' },
  send: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2, minHeight: 44, paddingHorizontal: space.md },
});
