import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { SkeletonLine } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ai, type ReplyDraft, type Tone } from '@/lib/ai';
import { notify } from '@/lib/dialogs';
import { useCase, useStore } from '@/store/cases';
import { layout, motion, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EDITOR_MIN_HEIGHT = 180;

const tones = [
  { value: 'formal', label: 'Formal' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'short', label: 'Short' },
] as const;

export default function ReplyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  const { colors } = useTheme();
  const analysis = item?.result?.analysis;

  const [intentId, setIntentId] = useState(analysis?.replyIntents[0]?.id ?? '');
  const [tone, setTone] = useState<Tone>('formal');
  const [draft, setDraft] = useState<ReplyDraft | null>(null);
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  // Web textareas don't auto-grow; native multiline inputs do with scrollEnabled={false}.
  const [editorHeight, setEditorHeight] = useState(EDITOR_MIN_HEIGHT);
  // Uncontrolled editor: edits live in a ref, the draft only seeds it.
  const text = useRef('');

  // A draft for a different intent or tone is stale: show the skeleton until the new one lands.
  const current = draft && draft.intentId === intentId && draft.tone === tone ? draft : null;

  useEffect(() => {
    if (!item?.result) return;
    let active = true;
    ai.generateReply({
      analysis: item.result.analysis,
      originalText: item.result.originalText,
      sampleId: item.sampleId,
      intentId,
      tone,
    }).then((d) => {
      if (!active) return;
      text.current = d.czech;
      setEdited(false);
      setCopied(false);
      setEditorHeight(EDITOR_MIN_HEIGHT);
      setDraft(d);
    });
    return () => {
      active = false;
    };
  }, [item?.result, item?.sampleId, intentId, tone]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  if (!item || !analysis) return <Redirect href="/" />;

  // Optimistic: confirm on the same frame as the tap, roll back loudly if the write fails.
  const copy = async () => {
    setCopied(true);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Clipboard.setStringAsync(text.current);
      useStore.getState().markReplied(item.id);
    } catch {
      setCopied(false);
      notify('Couldn’t copy the reply', 'Select the text in the reply and copy it manually.');
    }
  };

  const email = () => {
    useStore.getState().markReplied(item.id);
    Linking.openURL(`mailto:?body=${encodeURIComponent(text.current)}`);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          headerLeft: () => <HeaderTextButton label="Close" />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <SectionHeader title="What do you want to say?" />
          <List>
            {analysis.replyIntents.map((intent) => {
              const selected = intent.id === intentId;
              return (
                <Pressable
                  key={intent.id}
                  onPress={() => setIntentId(intent.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  style={({ pressed }) => [styles.intent, pressed && { backgroundColor: colors.fill }]}>
                  <View style={styles.intentText}>
                    <Text variant="callout" weight="600">
                      {intent.label}
                    </Text>
                    <Text variant="footnote" color="label2">
                      {intent.description}
                    </Text>
                  </View>
                  <Icon
                    name={selected ? 'checkCircle' : 'circle'}
                    size={24}
                    color={selected ? colors.accent : colors.label3}
                  />
                </Pressable>
              );
            })}
          </List>
        </View>

        <View>
          <SectionHeader title="Tone" />
          <Segmented options={tones} value={tone} onChange={setTone} />
        </View>

        <View>
          <SectionHeader title="Your reply in Czech" />
          <Card padded={false} style={styles.editorCard}>
            {current ? (
              <Animated.View entering={FadeIn.duration(motion.base)}>
                <TextInput
                  key={`${current.intentId}-${current.tone}`}
                  defaultValue={current.czech}
                  onChangeText={(v) => {
                    text.current = v;
                    if (!edited) setEdited(true);
                  }}
                  multiline
                  scrollEnabled={false}
                  onContentSizeChange={(e) =>
                    setEditorHeight(Math.max(EDITOR_MIN_HEIGHT, e.nativeEvent.contentSize.height))
                  }
                  accessibilityLabel="Czech reply, editable"
                  style={[
                    styles.editor,
                    ramp.callout,
                    { color: colors.label },
                    process.env.EXPO_OS === 'web' && { height: editorHeight },
                  ]}
                />
              </Animated.View>
            ) : (
              <View style={styles.editorSkeleton} accessibilityLabel="Writing your reply">
                <SkeletonLine width="30%" />
                <SkeletonLine />
                <SkeletonLine width="94%" />
                <SkeletonLine width="80%" />
                <SkeletonLine width="40%" />
              </View>
            )}
          </Card>
          <Text variant="footnote" color="label3" style={styles.hint}>
            Tap the text to edit. Replace anything in [brackets] before sending.
          </Text>
        </View>

        <View>
          <SectionHeader title="What it says in English" />
          <Card style={{ backgroundColor: colors.surfaceMuted, boxShadow: 'none' }}>
            {current ? (
              <Text variant="subhead" color="label2" selectable style={styles.english}>
                {current.english}
              </Text>
            ) : (
              <View style={styles.englishSkeleton}>
                <SkeletonLine />
                <SkeletonLine width="70%" />
              </View>
            )}
          </Card>
          {edited && (
            <Text variant="footnote" color="warning" style={styles.hint}>
              You’ve edited the Czech — the English above may no longer match.
            </Text>
          )}
        </View>
      </ScrollView>

      <BottomBar inModal>
        <Button
          label={copied ? 'Copied' : 'Copy Czech reply'}
          icon={copied ? 'check' : 'copy'}
          onPress={copy}
          disabled={!current}
        />
        <Button label="Open in email" variant="plain" size="medium" icon="mail" onPress={email} disabled={!current} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.xxxl, gap: space.xxl },
  intent: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 64 },
  intentText: { flex: 1, gap: 2 },
  editorCard: { overflow: 'hidden' },
  editor: { padding: space.xl, lineHeight: 24, minHeight: EDITOR_MIN_HEIGHT, textAlignVertical: 'top', borderRadius: radius.card },
  editorSkeleton: { padding: space.xl, gap: space.md, minHeight: 180 },
  english: { lineHeight: 22 },
  englishSkeleton: { gap: space.sm },
  hint: { marginTop: space.sm, paddingHorizontal: space.xs },
});
