import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { ChoiceList } from '@/components/ui/choice-list';
import { Field } from '@/components/ui/field';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Icon, type IconName } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import {
  compose,
  defaultInput,
  doctorTypes,
  insurers,
  intentNeeds,
  intents,
  problems,
  recipients,
  timesOfDay,
  whens,
  type ComposeInput,
  type DoctorType,
  type IntentId,
  type Line,
  type Recipient,
} from '@/lib/compose/templates';
import { speakCzech, stopSpeaking } from '@/lib/speech';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Mode = 'message' | 'call';
const modes = [
  { value: 'message', label: 'Message' },
  { value: 'call', label: 'Call script' },
] as const;

const isRecipient = (v: unknown): v is Recipient => v === 'trades' || v === 'landlord' || v === 'doctor';
const isDoctorType = (v: unknown): v is DoctorType => doctorTypes.some((d) => d.id === v);
const isIntent = (v: unknown, recipient: Recipient): v is IntentId => intents[recipient].some((i) => i.id === v);

/**
 * Write to any Czech landlord, doctor or tradesperson, not only the English-speaking ones.
 * Modal task with Close. Opened from Home, from Find help, or from a provider
 * (recipient + name + phone, and for a doctor optionally the doctor type and intent).
 */
export default function ComposeScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ recipient?: string; to?: string; phone?: string; doctorType?: string; intent?: string; mode?: string }>();
  const [input, setInput] = useState<ComposeInput>(() => {
    const base = defaultInput(isRecipient(params.recipient) ? params.recipient : 'trades');
    return {
      ...base,
      ...(isIntent(params.intent, base.recipient) ? { intent: params.intent } : {}),
      ...(isDoctorType(params.doctorType) ? { doctorType: params.doctorType } : {}),
    };
  });
  const [mode, setMode] = useState<Mode>(params.mode === 'call' ? 'call' : 'message');
  const [copied, setCopied] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const out = useMemo(() => compose(input), [input]);
  const needs = intentNeeds[input.intent];
  const set = <K extends keyof ComposeInput>(key: K, value: ComposeInput[K]) => setInput((s) => ({ ...s, [key]: value }));
  const phone = params.phone?.replace(/[^\d+]/g, '');

  // Stop any line still being read when the composer closes.
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    setCopied(true);
    setOpenError(null);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Clipboard.setStringAsync(out.czech);
    } catch {
      setCopied(false);
      setOpenError('Couldn’t copy. Select the message text and copy it from there.');
    }
  };

  const open = async (url: string, app: string) => {
    setOpenError(null);
    try {
      await Linking.openURL(url);
    } catch {
      setOpenError(`Couldn’t open ${app} on this device. Copy the message instead.`);
    }
  };

  const body = encodeURIComponent(out.czech);
  const sms = process.env.EXPO_OS === 'ios' ? `sms:${phone ?? ''}&body=${body}` : `sms:${phone ?? ''}?body=${body}`;
  const whatsapp = `https://wa.me/${phone ? phone.replace(/^\+/, '') : ''}?text=${body}`;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerLeft: () => <HeaderTextButton label="Close" /> }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {params.to ? (
          <View style={styles.to}>
            <Text variant="footnote" color="label2">
              To
            </Text>
            <Text variant="headline">{params.to}</Text>
          </View>
        ) : (
          <View>
            <SectionHeader title="Who are you writing to?" />
            <ChoiceList
              options={recipients.map((r) => ({ id: r.id, label: r.label, description: r.hint }))}
              value={input.recipient}
              onChange={(recipient) => setInput((s) => ({ ...s, recipient, intent: intents[recipient][0].id }))}
            />
          </View>
        )}

        <View>
          <SectionHeader title="What do you need?" />
          <ChoiceList options={intents[input.recipient]} value={input.intent} onChange={(v) => set('intent', v)} />
        </View>

        <View style={styles.details}>
          {needs.problem && (
            <Group title="What’s wrong?">
              <ChipGroup options={problems} value={input.problem} onChange={(v) => set('problem', v)} />
            </Group>
          )}
          {needs.doctorType && (
            <Group title="Which doctor?">
              <ChipGroup options={doctorTypes} value={input.doctorType} onChange={(v) => set('doctorType', v)} />
            </Group>
          )}
          {needs.existingAppointment && (
            <Field
              label="Appointment you’re moving"
              value={input.existingAppointment}
              onChangeText={(v) => set('existingAppointment', v)}
              placeholder="12. 11. v 9:00"
              helper="Write the date as it appears on the booking."
            />
          )}
          {needs.when && (
            <Group title="When?">
              <ChipGroup options={whens} value={input.when} onChange={(v) => set('when', v)} />
            </Group>
          )}
          {needs.timeOfDay && (
            <Group title="Time of day">
              <ChipGroup options={timesOfDay} value={input.timeOfDay} onChange={(v) => set('timeOfDay', v)} />
            </Group>
          )}
          {needs.insurer && (
            <Group title="Your health insurer">
              <ChipGroup options={insurers} value={input.insurer} onChange={(v) => set('insurer', v)} />
            </Group>
          )}
          {needs.address && (
            <Field
              label={needs.address === 'required' ? 'Address' : 'Address (optional)'}
              value={input.address}
              onChangeText={(v) => set('address', v)}
              placeholder="Korunní 812/14, Praha 2"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
              helper="Write it the Czech way: street and number, then the district."
            />
          )}
          <Field
            label="Your name (optional)"
            value={input.name}
            onChangeText={(v) => set('name', v)}
            placeholder="Ankit Sharma"
            autoComplete="name"
            textContentType="name"
          />
          <List inset={false}>
            <View style={styles.switchRow}>
              <View style={styles.switchText}>
                <Text variant="callout" weight="500">
                  Say I only speak a little Czech
                </Text>
                <Text variant="footnote" color="label2">
                  Asks them to reply in writing, or to speak slowly on the phone.
                </Text>
              </View>
              <Switch
                value={input.littleCzech}
                onValueChange={(v) => set('littleCzech', v)}
                trackColor={{ true: colors.accentFill }}
                accessibilityLabel="Say I only speak a little Czech"
              />
            </View>
          </List>
        </View>

        <View style={styles.output}>
          <Segmented options={modes} value={mode} onChange={setMode} />
          {mode === 'message' ? (
            <>
              <Card>
                <Text variant="callout" selectable style={styles.message}>
                  {out.czech}
                </Text>
              </Card>
              <View>
                <SectionHeader title="What it says in English" />
                <Card style={{ backgroundColor: colors.surfaceMuted, boxShadow: 'none' }}>
                  <Text variant="subhead" color="label2" selectable style={styles.english}>
                    {out.english}
                  </Text>
                </Card>
              </View>
            </>
          ) : (
            <View style={styles.script}>
              <Text variant="footnote" color="label2" style={styles.scriptHint}>
                Tap a line to hear it in Czech. Capitals show where to stress the word.
              </Text>
              <ScriptGroup title="Start the call" lines={out.call.opening} />
              <ScriptGroup title="Say" lines={out.call.say} />
              <ScriptGroup title="You might hear" lines={out.call.hear} />
              <ScriptGroup title="End the call" lines={out.call.closing} />
            </View>
          )}
        </View>
      </ScrollView>

      <BottomBar inModal>
        {mode === 'call' && phone ? (
          <Button label={`Call ${params.to ?? ''}`.trim()} icon="phone" onPress={() => open(`tel:${phone}`, 'the phone app')} />
        ) : (
          <Button label={copied ? 'Copied' : 'Copy message'} icon={copied ? 'check' : 'copy'} onPress={copy} />
        )}
        <View style={styles.sendRow}>
          <SendButton icon="message" label="SMS" onPress={() => open(sms, 'Messages')} />
          <SendButton icon="personal" label="WhatsApp" onPress={() => open(whatsapp, 'WhatsApp')} />
          <SendButton icon="mail" label="Email" onPress={() => open(`mailto:?body=${body}`, 'Mail')} />
        </View>
        {openError && (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            {openError}
          </Text>
        )}
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View>
      <SectionHeader title={title} />
      {children}
    </View>
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
  details: { gap: space.xl },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  switchText: { flex: 1, gap: 2 },
  output: { gap: space.lg },
  message: { lineHeight: 24 },
  english: { lineHeight: 22 },
  script: { gap: space.lg },
  scriptHint: { paddingHorizontal: space.xs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md },
  lineText: { flex: 1, gap: 2 },
  sendRow: { flexDirection: 'row', justifyContent: 'space-around' },
  send: { flexDirection: 'row', alignItems: 'center', gap: space.xs + 2, minHeight: 44, paddingHorizontal: space.md },
});
