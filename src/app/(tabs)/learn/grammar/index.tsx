import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { grammar } from '@/lib/academy/grammar';
import { useAcademy } from '@/store/academy';
import { layout, space } from '@/theme/tokens';

/** Grammar foundations: short explanations in the order learners need them. */
export default function GrammarScreen() {
  const seen = useAcademy((s) => s.grammarSeen);
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Text variant="subhead" color="label2" style={styles.note}>
        The grammar A2 needs, a few sentences each, with examples you can hear. Learn the phrases; the rules follow.
      </Text>
      <List>
        {grammar.map((g, i) => (
          <Row
            key={g.id}
            title={`${i + 1}. ${g.title}`}
            subtitle={seen[g.id] ? 'Read' : undefined}
            chevron
            onPress={() => router.push({ pathname: '/learn/grammar/[id]', params: { id: g.id } })}
          />
        ))}
      </List>
      <Text variant="footnote" color="label3" style={styles.note}>
        Written for CzechPal and checked by AI. If something looks wrong, tell us from Help.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.lg },
  note: { paddingHorizontal: space.xs },
});
