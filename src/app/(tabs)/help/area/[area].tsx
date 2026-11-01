import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { List, Row } from '@/components/ui/list';
import { areaById } from '@/lib/help/areas';
import { layout, space } from '@/theme/tokens';

/** One area of Find (Health, Offices…): the lists inside it. */
export default function AreaScreen() {
  const { area: id } = useLocalSearchParams<{ area: string }>();
  const area = areaById(id);
  if (!area) return <Redirect href="/help" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: area.title }} />
      <List>
        {area.entries.map((e) => (
          <Row key={e.id} icon={e.icon} title={e.title} subtitle={e.subtitle} chevron onPress={() => router.push(e.href)} />
        ))}
      </List>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
});
