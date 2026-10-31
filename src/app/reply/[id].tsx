import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Card, SectionHeader } from '@/components/ui/card';
import { ChoiceList } from '@/components/ui/choice-list';
import { SkeletonLine } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { ai, isDemoMode, languageByCode, replierFor, type ReplyDraft } from '@/lib/ai';
import { useCase, useStore } from '@/store/cases';
import { layout, motion, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const EDITOR_MIN_HEIGHT = 180;
const OWN = 'own';

export default function ReplyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  const { colors } = useTheme();
  const analysis = item?.result?.analysis;

  const [intentId, setIntentId] = useState(analysis?.replyIntents[0]?.id ?? OWN);
  // What the reader typed, and what was last sent to be written (only on tap, never per keystroke).
  const [ownWords, setOwnWords] = useState('');
  const [ownSent, setOwnSent] = useState('');
  const aiConsent = useStore((s) => s.aiConsent);
  const [draft, setDraft] = useState<ReplyDraft | null>(null);
  const [edited, setEdited] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  // Web textareas don't auto-grow; native multiline inputs do with scrollEnabled={false}.
  const [editorHeight, setEditorHeight] = useState(EDITOR_MIN_HEIGHT);
  // Uncontrolled editor: edits live in a ref, the draft only seeds it.
  const text = useRef('');

  // The reply being shown: a suggested intent, or the reader's own words once sent. A draft for
  // anything else is stale, so the skeleton shows until the new one lands.
  const own = intentId === OWN;
  const wanted = own ? (ownSent ? `${OWN}:${ownSent}` : null) : intentId;
  const current = draft && draft.intentId === wanted ? draft : null;

  const result = item?.result;
  const sampleId = item?.sampleId;
  const language = item?.language;
  const [attempt, setAttempt] = useState(0);
  // An error belongs to the request that failed; choosing something else starts a fresh one.
  const requestKey = `${wanted}-${attempt}`;
  const [replyError, setReplyError] = useState<{ key: string; message: string } | null>(null);
  const failed = replyError?.key === requestKey ? replyError.message : null;

  useEffect(() => {
    if (!result || !wanted) return;
    let active = true;
    const words = wanted.startsWith(`${OWN}:`) ? wanted.slice(OWN.length + 1) : undefined;
    // An example's suggested replies are built in; anything in the reader's own words is written live.
    (words ? ai : replierFor({ sampleId }))
      .generateReply({ analysis: result.analysis, originalText: result.originalText, sampleId, intentId: wanted, ownWords: words, language })
      .then((d) => {
        if (!active) return;
        text.current = d.czech;
        setEdited(false);
        setCopied(false);
        setEditorHeight(EDITOR_MIN_HEIGHT);
        setDraft(d);
      })
      .catch((e: unknown) => {
        if (!active) return;
        const message = e instanceof Error ? e.message : 'The reply couldn’t be written. Please try again.';
        setReplyError({ key: `${wanted}-${attempt}`, message });
      });
    return () => {
      active = false;
    };
  }, [result, sampleId, wanted, attempt, language]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  if (!item || !analysis) return <Redirect href="/" />;

  // Built-in examples never needed consent; writing from the reader's own words does.
  const needsConsent = !isDemoMode && !aiConsent;
  const sendOwnWords = () => {
    if (ownWords.trim().length < 2) return;
    if (needsConsent) useStore.getState().setAiConsent(true);
    setOwnSent(ownWords.trim());
  };

  // Optimistic: confirm on the same frame as the tap, roll back loudly if the write fails.
  const copy = async () => {
    setCopied(true);
    setCopyError(false);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Clipboard.setStringAsync(text.current);
      useStore.getState().markReplied(item.id);
    } catch {
      setCopied(false);
      setCopyError(true);
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
          <ChoiceList
            options={[
              ...analysis.replyIntents.map((i) => ({ id: i.id, label: i.label, description: i.description })),
              { id: OWN, label: 'In my own words', description: 'Say what you want, in any language' },
            ]}
            value={intentId}
            onChange={setIntentId}
          />
          {own && (
            <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.own}>
              <TextInput
                value={ownWords}
                onChangeText={setOwnWords}
                placeholder="For example: yes, Saturday at 10 works for me"
                placeholderTextColor={colors.label3}
                multiline
                maxLength={1000}
                autoFocus={!ownSent}
                textAlignVertical="top"
                accessibilityLabel="What you want to reply, in any language"
                style={[styles.ownBox, ramp.body, { color: colors.label, backgroundColor: colors.surface, borderColor: colors.separator }]}
              />
              {needsConsent && (
                <Text variant="footnote" color="label2">
                  CzechPal sends this to Anthropic’s Claude AI to write the reply. CzechPal doesn’t keep it, and Anthropic
                  doesn’t use it to train AI models.
                </Text>
              )}
              <Button
                label={needsConsent ? 'Agree and write my reply' : 'Write my reply'}
                variant="secondary"
                size="medium"
                icon="compose"
                disabled={ownWords.trim().length < 2 || ownSent === ownWords.trim()}
                onPress={sendOwnWords}
                style={styles.ownButton}
              />
            </Animated.View>
          )}
        </View>

        <View>
          <SectionHeader title="Your reply in Czech" />
          <Card padded={false} style={styles.editorCard}>
            {own && !ownSent ? (
              <View style={styles.editorSkeleton}>
                <Text variant="callout" color="label2">
                  Write what you want to say above, and your reply in Czech appears here.
                </Text>
              </View>
            ) : current ? (
              <Animated.View entering={FadeIn.duration(motion.base)}>
                <TextInput
                  key={current.intentId}
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
            ) : failed ? (
              <View style={styles.editorSkeleton} accessibilityLiveRegion="polite">
                <Text variant="callout" color="danger">
                  {failed}
                </Text>
                <Button label="Try again" variant="secondary" size="medium" icon="refresh" onPress={() => setAttempt((a) => a + 1)} style={styles.retry} />
              </View>
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
          <SectionHeader title={`What it says in ${languageByCode(language).name}`} />
          <Card style={{ backgroundColor: colors.surfaceMuted, boxShadow: 'none' }}>
            {own && !ownSent ? (
              <Text variant="subhead" color="label3">
                The translation appears with the reply.
              </Text>
            ) : current ? (
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
              You’ve edited the Czech, so the translation above may no longer match.
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
        {copyError && (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            Couldn’t copy. Select the reply text above and copy it from there.
          </Text>
        )}
        <Button label="Open in email" variant="plain" size="medium" icon="mail" onPress={email} disabled={!current} />
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.xxxl, gap: space.xxl },
  editorCard: { overflow: 'hidden' },
  editor: { padding: space.xl, lineHeight: 24, minHeight: EDITOR_MIN_HEIGHT, textAlignVertical: 'top', borderRadius: radius.card },
  editorSkeleton: { padding: space.xl, gap: space.md, minHeight: 180 },
  retry: { alignSelf: 'flex-start' },
  english: { lineHeight: 22 },
  englishSkeleton: { gap: space.sm },
  hint: { marginTop: space.sm, paddingHorizontal: space.xs },
  own: { gap: space.md, marginTop: space.md },
  ownBox: {
    minHeight: 96,
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  ownButton: { alignSelf: 'flex-start' },
});
