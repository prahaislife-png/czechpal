import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { checklists } from '@/lib/visa/checklists';
import { layout, space } from '@/theme/tokens';

/** "What do I need?" for the residence tasks people from outside the EU meet most. */
export default function ChecklistsScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View>
        <SectionHeader title="For people from outside the EU" />
        <List>
          {checklists.map((c) => (
            <Row
              key={c.id}
              icon="document"
              title={c.title}
              subtitle={c.short}
              chevron
              onPress={() => router.push({ pathname: '/help/checklists/[id]', params: { id: c.id } })}
            />
          ))}
        </List>
        <Text variant="footnote" color="label3" style={styles.note}>
          From the Ministry of the Interior’s Information Portal for Foreigners. Each checklist links its official page.
          This explains the rules; it isn’t legal advice.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  note: { paddingHorizontal: space.lg, marginTop: space.sm },
});
