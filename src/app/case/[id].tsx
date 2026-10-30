import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AnalyzingView,
  Bullets,
  CautionNotice,
  DemoNotice,
  KeyFacts,
  NextSteps,
  ResultHero,
  TranslatedLines,
} from '@/components/analysis';
import { DocumentPaper } from '@/components/document-paper';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconWell, List, Row } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import type { Analysis, PaymentInfo } from '@/lib/ai';
import { categoryById, helpForTextCategory } from '@/lib/help/directory';
import { confirm } from '@/lib/dialogs';
import { useCase, useStore, type CaseItem } from '@/store/cases';
import { layout, motion, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Tab = 'summary' | 'english' | 'czech';

const tabs = [
  { value: 'summary', label: 'Summary' },
  { value: 'english', label: 'English' },
  { value: 'czech', label: 'Czech' },
] as const;

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  // Reveal choreography only for a result that lands while the user watches;
  // reopening a saved one shows it instantly.
  const [watchedAnalysis] = useState(() => item?.status === 'analyzing');

  if (!item) return <Redirect href="/" />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: item.status === 'ready' ? item.result?.analysis.title : 'Reading' }} />
      {item.status === 'ready' && item.result ? (
        <Ready item={item} animate={watchedAnalysis} />
      ) : item.status === 'error' ? (
        <Failed item={item} />
      ) : (
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
          <AnalyzingView item={item} />
        </ScrollView>
      )}
    </View>
  );
}

function plainTranslation(a: Analysis) {
  return a.lines?.length ? a.lines.map((l) => l.en).join('\n') : a.translation;
}

function Ready({ item, animate }: { item: CaseItem; animate: boolean }) {
  const [tab, setTab] = useState<Tab>('summary');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const result = item.result!;
  const { analysis } = result;
  const canReply = analysis.replyIntents.length > 0;
  const helpId = helpForTextCategory(analysis.category);
  const help = helpId ? categoryById(helpId) : undefined;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  // Explanation, not decoration: sections arrive in reading order, 40 ms apart, first view only.
  const enter = (i: number) =>
    animate ? FadeInDown.duration(motion.slow).delay(i * 40).easing(motion.easeOut) : undefined;

  const copyTranslation = async () => {
    setCopied(true);
    setCopyError(false);
    if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await Clipboard.setStringAsync(plainTranslation(analysis));
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const remove = async () => {
    const ok = await confirm({
      title: 'Delete this?',
      message: 'The explanation and any reply drafts will be removed from this device.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    router.back();
    useStore.getState().remove(item.id);
  };

  let section = 1;

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        {/* A stand-in result is labelled before it can be mistaken for a reading of the user's text. */}
        {result.demo === 'sample' && <DemoNotice demo={result.demo} />}

        <Animated.View entering={enter(0)}>
          <ResultHero analysis={analysis} />
        </Animated.View>

        {result.demo === 'matched' && <DemoNotice demo={result.demo} />}

        <Animated.View entering={enter(section++)}>
          <Segmented options={tabs} value={tab} onChange={setTab} />
        </Animated.View>

        {tab === 'summary' && (
          <>
            {analysis.caution && (
              <Animated.View entering={enter(section++)}>
                <CautionNotice kind={analysis.caution} />
              </Animated.View>
            )}
            {analysis.lines?.length ? (
              <Animated.View entering={enter(section++)}>
                <TranslatedLines lines={analysis.lines} />
              </Animated.View>
            ) : null}
            {analysis.nextSteps.length > 0 && (
              <Animated.View entering={enter(section++)}>
                <NextSteps steps={analysis.nextSteps} />
              </Animated.View>
            )}
            {analysis.payment && (
              <Animated.View entering={enter(section++)}>
                <PayThisBill caseId={item.id} payment={analysis.payment} />
              </Animated.View>
            )}
            {analysis.keyFacts.length > 0 && (
              <Animated.View entering={enter(section++)}>
                <KeyFacts facts={analysis.keyFacts} />
              </Animated.View>
            )}
            <Animated.View entering={enter(section++)}>
              <Bullets title="What it means" items={analysis.meaning} />
            </Animated.View>
            {analysis.notStated.length > 0 && (
              <Animated.View entering={enter(section++)}>
                <Bullets title="Not mentioned" items={analysis.notStated} muted />
              </Animated.View>
            )}
            {help && (
              <View>
                <SectionHeader title="Need a hand with this?" />
                <List>
                  <Row
                    icon={help.icon}
                    title={`Find ${help.title.toLowerCase()}`}
                    subtitle="English-speaking help, or write to anyone in Czech"
                    chevron
                    onPress={() => router.push({ pathname: '/help/[category]', params: { category: help.id } })}
                  />
                </List>
              </View>
            )}
            <Button label="Delete" variant="quietDestructive" size="medium" onPress={remove} style={styles.delete} />
          </>
        )}

        {tab === 'english' && (
          <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.tab}>
            <Text variant="body" selectable style={styles.longText}>
              {analysis.translation}
            </Text>
            <Text variant="footnote" color="label3">
              Translated by AI. For dates, amounts and names, the Czech original is what counts.
            </Text>
          </Animated.View>
        )}

        {tab === 'czech' && (
          <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.tab}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} contentFit="cover" style={styles.image} accessibilityLabel="Your photo" />
            ) : null}
            <DocumentPaper text={result.originalText} selectable />
          </Animated.View>
        )}
      </ScrollView>

      <BottomBar>
        {canReply ? (
          <Button
            label="Write a reply"
            icon="reply"
            onPress={() => router.push({ pathname: '/reply/[id]', params: { id: item.id } })}
          />
        ) : (
          <Button label={copied ? 'Copied' : 'Copy translation'} icon={copied ? 'check' : 'copy'} onPress={copyTranslation} />
        )}
        {copyError && (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            Couldn’t copy. Open the English tab and copy the text from there.
          </Text>
        )}
      </BottomBar>
    </>
  );
}

/** Bills get a one-tap path to QR Platba. Amount and due date are copied from the bill, never computed. */
function PayThisBill({ caseId, payment }: { caseId: string; payment: PaymentInfo }) {
  const { colors } = useTheme();
  const amount = payment.amount?.toLocaleString('cs-CZ', { maximumFractionDigits: 2 });
  const due = payment.dueDate
    ? new Date(`${payment.dueDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : undefined;
  return (
    <View>
      <SectionHeader title="Pay this bill" />
      <List inset={false}>
        <View style={styles.pay}>
          <Icon name="qrcode" size={28} color={colors.accent} />
          <View style={styles.payText}>
            <Text variant="headline" tabular>
              {amount ? `${amount} Kč` : 'Amount on the bill'}
            </Text>
            <Text variant="footnote" color="label2">
              {due ? `Due ${due} · ` : ''}Scan the QR code with your banking app
            </Text>
          </View>
          <Button
            label="Pay"
            size="medium"
            variant="secondary"
            onPress={() => router.push({ pathname: '/pay', params: { caseId } })}
          />
        </View>
      </List>
    </View>
  );
}

function Failed({ item }: { item: CaseItem }) {
  const analyze = useStore((s) => s.analyze);
  return (
    <View style={styles.failed}>
      <IconWell name="alert" tone="danger" />
      <View style={styles.failedText}>
        <Text variant="title2" align="center" accessibilityRole="header">
          Couldn’t read this
        </Text>
        <Text variant="callout" color="label2" align="center">
          {item.error ?? 'Something went wrong. Please try again.'}
        </Text>
      </View>
      <View style={styles.failedActions}>
        {item.source === 'text' ? (
          <Button
            label="Type it again"
            onPress={() => {
              router.back();
              router.push('/paste');
            }}
          />
        ) : (
          <Button label="Try again" icon="refresh" onPress={() => analyze(item.id)} />
        )}
        <Button label="Back to home" variant="plain" onPress={() => router.dismissTo('/')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  tab: { gap: space.lg },
  longText: { lineHeight: 26 },
  image: { width: '100%', aspectRatio: 3 / 4, maxHeight: 420, borderRadius: radius.tile },
  delete: { alignSelf: 'center' },
  pay: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  payText: { flex: 1, gap: 2 },
  failed: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xl },
  failedText: { gap: space.sm, maxWidth: 360 },
  failedActions: { alignSelf: 'stretch', gap: space.xs, maxWidth: layout.maxWidth },
});
