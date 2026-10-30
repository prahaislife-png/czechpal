import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DocumentPaper } from '@/components/document-paper';
import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconWell } from '@/components/ui/list';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { categoryLabels, type Category } from '@/lib/ai';
import { confirm } from '@/lib/dialogs';
import { useCase, useRemainingAnalyses, useStore, type CaseItem } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const topics: Category[] = ['housing', 'utilities', 'school', 'government', 'work', 'finance'];

export default function ReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useCase(id);
  const remaining = useRemainingAnalyses();
  const { setHint, analyze, discardDraft, resetUsage } = useStore.getState();

  // Leaving without explaining discards the draft; a started analysis is no longer a draft.
  useEffect(() => () => discardDraft(id), [id, discardDraft]);

  if (!item) return <Redirect href="/" />;

  const explain = async () => {
    if (remaining === 0) {
      const reset = await confirm({
        title: 'You’ve used this month’s free explanations',
        message: 'CzechReply Pro with unlimited explanations is coming soon. In this demo you can reset your allowance.',
        confirmLabel: 'Reset demo allowance',
      });
      if (!reset) return;
      resetUsage();
    }
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
          <View style={styles.chips}>
            {topics.map((topic) => (
              <Chip
                key={topic}
                label={categoryLabels[topic]}
                selected={item.hint === topic}
                onPress={() => setHint(item.id, item.hint === topic ? undefined : topic)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomBar>
        <Button label="Explain this message" onPress={explain} />
        <Text variant="footnote" color="label3" align="center" tabular>
          {remaining === 1 ? '1 free explanation left this month' : `${remaining} free explanations left this month`}
        </Text>
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
      <Card style={styles.pdf}>
        <IconWell name="pdf" tone="accent" size={48} />
        <View style={styles.pdfText}>
          <Text variant="headline" numberOfLines={2}>
            {item.fileName ?? 'Document.pdf'}
          </Text>
          <Text variant="footnote" color="label2">
            PDF · every page will be read
          </Text>
        </View>
      </Card>
    );
  }
  return (
    <View style={styles.preview}>
      {detected}
      <DocumentPaper text={item.text ?? ''} maxLines={16} />
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      style={[styles.chip, { backgroundColor: selected ? colors.accentFill : colors.fill }]}>
      {selected && <Icon name="check" size={14} color={colors.onAccent} />}
      <Text variant="subhead" weight={selected ? '600' : '500'} color={selected ? 'onAccent' : 'label'}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, gap: space.xxl },
  image: { width: '100%', aspectRatio: 3 / 4, maxHeight: 420, borderRadius: radius.tile },
  preview: { gap: space.md },
  detected: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xs },
  pdf: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  pdfText: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
});
