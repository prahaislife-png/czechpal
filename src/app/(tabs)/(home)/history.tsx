import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { CaseRow } from '@/components/case-row';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { IconWell } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { isThisWeek } from '@/lib/format';
import { useStore, type CaseItem } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const cases = useStore((s) => s.cases);
  const sections = useMemo(() => {
    const saved = cases.filter((c) => c.status !== 'draft');
    return [
      { title: 'This week', data: saved.filter((c) => isThisWeek(c.createdAt)) },
      { title: 'Earlier', data: saved.filter((c) => !isThisWeek(c.createdAt)) },
    ].filter((s) => s.data.length > 0);
  }, [cases]);

  if (sections.length === 0) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.empty}>
        <IconWell name="viewfinder" tone="accent" />
        <View style={styles.emptyText}>
          <Text variant="title3" align="center">
            Nothing scanned yet
          </Text>
          <Text variant="callout" color="label2" align="center">
            Everything you scan or type is kept here, so you can come back to the translation and your reply.
          </Text>
        </View>
        <Button label="Scan something" variant="secondary" size="medium" onPress={() => router.push('/scan')} />
      </ScrollView>
    );
  }

  // Virtualized: history grows without bound. Rows are drawn as one inset-grouped list per section.
  return (
    <SectionList<CaseItem>
      sections={sections}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <SectionHeader title={section.title} />
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const first = index === 0;
        const last = index === section.data.length - 1;
        return (
          <View
            style={[
              { backgroundColor: colors.surface },
              first && styles.firstRow,
              last && styles.lastRow,
            ]}>
            {!first && <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
            <CaseRow item={item} />
          </View>
        );
      }}
      ListFooterComponent={
        <Text variant="footnote" color="label3" align="center" style={styles.footer}>
          Saved on this device only.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge },
  sectionHeader: { paddingTop: space.lg },
  firstRow: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  lastRow: { borderBottomLeftRadius: radius.card, borderBottomRightRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg + 24 + space.md },
  footer: { marginTop: space.xxl },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xl },
  emptyText: { gap: space.sm, maxWidth: 320 },
});
