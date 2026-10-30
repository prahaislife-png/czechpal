import { Image } from 'expo-image';
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  AnalyzingView,
  Bullets,
  DemoNotice,
  KeyFacts,
  NextSteps,
  OfficialNotice,
  VerdictCard,
} from '@/components/analysis';
import { DocumentPaper } from '@/components/document-paper';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconWell, List, Row } from '@/components/ui/list';
import { Segmented } from '@/components/ui/segmented';
import { Text } from '@/components/ui/text';
import { confirm } from '@/lib/dialogs';
import { useCase, useStore, type CaseItem } from '@/store/cases';
import { layout, motion, radius, space } from '@/theme/tokens';

type View_ = 'summary' | 'translation' | 'original';

const views = [
  { value: 'summary', label: 'Summary' },
  { value: 'translation', label: 'English' },
  { value: 'original', label: 'Czech' },
] as const;

export default function CaseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  // Reveal choreography only for an analysis that finishes while the user watches —
  // reopening a saved case shows it instantly.
  const [watchedAnalysis] = useState(() => item?.status === 'analyzing');

  if (!item) return <Redirect href="/" />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: item.status === 'ready' ? item.result?.analysis.title : '' }} />
      {item.status === 'ready' && item.result ? (
        <Ready item={item} animate={watchedAnalysis} />
      ) : item.status === 'error' ? (
        <Failed item={item} />
      ) : (
        <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
          <AnalyzingView />
        </ScrollView>
      )}
    </View>
  );
}

function Ready({ item, animate }: { item: CaseItem; animate: boolean }) {
  const [view, setView] = useState<View_>('summary');
  const result = item.result!;
  const { analysis } = result;

  // Explanation, not decoration: sections arrive in reading order, 40 ms apart.
  const enter = (i: number) =>
    animate ? FadeInDown.duration(motion.slow).delay(i * 40).easing(motion.easeOut) : undefined;

  const remove = async () => {
    const ok = await confirm({
      title: 'Delete this message?',
      message: 'The explanation and any reply drafts will be removed from this device.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    router.back();
    useStore.getState().remove(item.id);
  };

  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        {/* A stand-in result is labelled before it can be mistaken for a reading of the user's document. */}
        {result.demo === 'sample' && <DemoNotice demo={result.demo} />}

        <Animated.View entering={enter(0)}>
          <VerdictCard analysis={analysis} />
        </Animated.View>

        {result.demo === 'matched' && <DemoNotice demo={result.demo} />}

        <Animated.View entering={enter(1)}>
          <Segmented options={views} value={view} onChange={setView} />
        </Animated.View>

        {view === 'summary' && (
          <>
            {analysis.officialMatter && (
              <Animated.View entering={enter(2)}>
                <OfficialNotice />
              </Animated.View>
            )}
            <Animated.View entering={enter(2)}>
              <NextSteps steps={analysis.nextSteps} />
            </Animated.View>
            <Animated.View entering={enter(3)}>
              <KeyFacts facts={analysis.keyFacts} />
            </Animated.View>
            <Animated.View entering={enter(4)}>
              <Bullets title="What it means" items={analysis.meaning} />
            </Animated.View>
            {analysis.notStated.length > 0 && (
              <Animated.View entering={enter(5)}>
                <Bullets title="Not mentioned in the letter" items={analysis.notStated} muted />
              </Animated.View>
            )}
            <List>
              <Row title="Delete this message" icon="trash" destructive chevron={false} onPress={remove} />
            </List>
          </>
        )}

        {view === 'translation' && (
          <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.tab}>
            <Card>
              <Text variant="callout" selectable style={styles.longText}>
                {analysis.translation}
              </Text>
            </Card>
            <Text variant="footnote" color="label3" style={styles.caption}>
              Translated by AI. For dates, amounts and names, the Czech original is what counts.
            </Text>
          </Animated.View>
        )}

        {view === 'original' && (
          <Animated.View entering={FadeIn.duration(motion.fast)} style={styles.tab}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} contentFit="cover" style={styles.image} accessibilityLabel="Your photo" />
            ) : null}
            <DocumentPaper text={result.originalText} selectable />
          </Animated.View>
        )}
      </ScrollView>

      <BottomBar>
        <Button
          label="Write a reply"
          icon="reply"
          onPress={() => router.push({ pathname: '/reply/[id]', params: { id: item.id } })}
        />
      </BottomBar>
    </>
  );
}

function Failed({ item }: { item: CaseItem }) {
  const analyze = useStore((s) => s.analyze);
  return (
    <View style={styles.failed}>
      <IconWell name="alert" tone="danger" size={56} />
      <View style={styles.failedText}>
        <Text variant="title2" align="center" accessibilityRole="header">
          Couldn’t explain this message
        </Text>
        <Text variant="callout" color="label2" align="center">
          {item.error ?? 'Something went wrong. Please try again.'}
        </Text>
      </View>
      <View style={styles.failedActions}>
        {item.source === 'text' ? (
          <Button
            label="Paste the full message"
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
  tab: { gap: space.md },
  longText: { lineHeight: 25 },
  caption: { paddingHorizontal: space.xs },
  image: { width: '100%', aspectRatio: 3 / 4, maxHeight: 420, borderRadius: radius.tile },
  failed: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xl },
  failedText: { gap: space.sm, maxWidth: 360 },
  failedActions: { alignSelf: 'stretch', gap: space.xs, maxWidth: layout.maxWidth },
});
