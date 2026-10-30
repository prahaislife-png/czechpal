import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CaseRow } from '@/components/case-row';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { IconWell, List } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { isThisWeek } from '@/lib/format';
import { useStore } from '@/store/cases';
import { layout, space } from '@/theme/tokens';

export default function HistoryScreen() {
  const cases = useStore((s) => s.cases);
  const groups = useMemo(() => {
    const saved = cases.filter((c) => c.status !== 'draft');
    return [
      { title: 'This week', items: saved.filter((c) => isThisWeek(c.createdAt)) },
      { title: 'Earlier', items: saved.filter((c) => !isThisWeek(c.createdAt)) },
    ].filter((g) => g.items.length > 0);
  }, [cases]);

  if (groups.length === 0) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.empty}>
        <IconWell name="tray" tone="accent" size={64} />
        <View style={styles.emptyText}>
          <Text variant="title3" align="center">
            No messages yet
          </Text>
          <Text variant="callout" color="label2" align="center">
            Every message you explain is kept here, so you can come back to the details and your reply.
          </Text>
        </View>
        <Button label="Explain a message" variant="secondary" size="medium" onPress={() => router.navigate('/')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      {groups.map((group) => (
        <View key={group.title}>
          <SectionHeader title={group.title} />
          <List>
            {group.items.map((item) => (
              <CaseRow key={item.id} item={item} />
            ))}
          </List>
        </View>
      ))}
      <Text variant="footnote" color="label3" align="center">
        Saved on this device only.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  empty: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxxl, gap: space.xl },
  emptyText: { gap: space.sm, maxWidth: 320 },
});
