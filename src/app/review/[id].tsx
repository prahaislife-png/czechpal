import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DocumentPaper } from '@/components/document-paper';
import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List } from '@/components/ui/list';
import { Chip } from '@/components/ui/chip';
import { Text } from '@/components/ui/text';
import { categoryLabels, type Category } from '@/lib/ai';
import { useCase, useRemainingAnalyses, useStore, type CaseItem } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const topics: Category[] = [
  'transport',
  'food',
  'health',
  'housing',
  'utilities',
  'school',
  'government',
  'work',
  'personal',
];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  const remaining = useRemainingAnalyses();
  const { setHint, analyze, discardDraft, resetUsage } = useStore.getState();

  // Leaving without explaining discards the draft; a started analysis is no longer a draft.
  useEffect(() => () => discardDraft(id), [id, discardDraft]);

  if (!item) return <Redirect href="/" />;

  const explain = () => {
    analyze(item.id);
    // Replace: coming back to this screen after the analysis would be stale.
    router.replace({ pathname: '/case/[id]', params: { id: item.id } });
  };

  return (
    <View style={styles.root}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Preview item={item} />

        <View>
          <SectionHeader title="What is it about? (optional)" />
          <Text variant="footnote" color="label2" style={styles.hintCopy}>
            A topic helps when the photo is hard to read.
          </Text>
          <View style={styles.chips}>
            {topics.map((topic) => (
              <Chip
                key={topic}
                role="checkbox"
                label={categoryLabels[topic]}
                selected={item.hint === topic}
                onPress={() => setHint(item.id, item.hint === topic ? undefined : topic)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        {remaining > 0 ? (
          <>
            <Button label="Explain" onPress={explain} />
            <Text variant="footnote" color="label3" align="center" tabular>
              {remaining === 1
                ? '1 free explanation left this month'
                : `${remaining} free explanations left this month`}
            </Text>
          </>
        ) : (
          // The allowance gate is inline state, not an alert.
          <>
            <Text variant="footnote" color="label2" align="center">
              You’ve used this month’s free explanations. Pro with unlimited explanations is coming soon.
            </Text>
            <Button label="Reset demo allowance" variant="secondary" onPress={resetUsage} />
          </>
        )}
      </BottomBar>
    </View>
  );
}

function Preview({ item }: { item: CaseItem }) {
  const { colors } = useTheme();
  const detected = (
    <View style={styles.detected}>
      <Badge label="Czech detected" tone="success" icon="checkCircle" />
      <Text variant="footnote" color="label3">
        Check that everything is readable
      </Text>
    </View>
  );

  if (item.imageUri) {
    return (
      <View style={styles.preview}>
        {detected}
        <Image
          source={{ uri: item.imageUri }}
          contentFit="cover"
          style={[styles.image, { backgroundColor: colors.fill }]}
          accessibilityLabel="Your photo"
        />
      </View>
    );
  }
  if (item.source === 'pdf') {
    return (
      <List>
        <View style={styles.pdf}>
          <Icon name="pdf" size={32} color={colors.accent} />
          <View style={styles.pdfText}>
            <Text variant="headline" numberOfLines={2}>
              {item.fileName ?? 'Document.pdf'}
            </Text>
            <Text variant="footnote" color="label2">
              PDF · every page will be read
            </Text>
          </View>
        </View>
      </List>
    );
  }
  return (
    <View style={styles.preview}>
      {detected}
      <DocumentPaper text={item.text ?? ''} maxLines={16} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, gap: space.xxl },
  image: { width: '100%', aspectRatio: 3 / 4, maxHeight: 420, borderRadius: radius.tile },
  preview: { gap: space.md },
  detected: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.xl },
  pdfText: { flex: 1, gap: 2 },
  hintCopy: { paddingHorizontal: space.xs, marginTop: -space.xs, marginBottom: space.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
