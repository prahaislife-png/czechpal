import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { announce } from '@/lib/a11y';
import { confirm } from '@/lib/dialogs';
import { contentById } from '@/lib/learn/content';
import type { OwnCardError } from '@/lib/learn/deck';
import { isDue, untilLabel } from '@/lib/learn/srs';
import { useLearn } from '@/store/learn';
import { layout, radius, space, type as ramp } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const errors: Record<OwnCardError, string> = {
  empty: 'Write the Czech and what it means.',
  too_long: 'Keep each side under 120 characters.',
  duplicate: 'That word is already in your cards.',
};

/** Every saved card, newest first, and a form to write your own. */
export default function WordsScreen() {
  const { colors } = useTheme();
  const deck = useLearn((s) => s.deck);
  const cards = useMemo(() => Object.values(deck).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [deck]);
  const [cs, setCs] = useState('');
  const [en, setEn] = useState('');
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const problem = useLearn.getState().addOwnCard(cs, en);
    if (problem) return setError(errors[problem]);
    setError(null);
    announce(`${cs.trim()} added`);
    setCs('');
    setEn('');
  };

  const input = [styles.input, ramp.body, { color: colors.label, backgroundColor: colors.fill }];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <View>
        <SectionHeader title="Add your own" />
        <Card style={styles.form}>
          <TextInput value={cs} onChangeText={setCs} placeholder="Czech, e.g. dobrou chuť" placeholderTextColor={colors.label3} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Czech" style={input} />
          <TextInput value={en} onChangeText={setEn} placeholder="Meaning, e.g. enjoy your meal" placeholderTextColor={colors.label3} accessibilityLabel="Meaning" onSubmitEditing={add} returnKeyType="done" style={input} />
          {error && (
            <Text variant="footnote" color="danger" accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
          <Button label="Add card" icon="plus" size="medium" onPress={add} style={styles.addButton} />
        </Card>
      </View>

      <View>
        <SectionHeader title={cards.length ? `${cards.length} ${cards.length === 1 ? 'card' : 'cards'}` : 'No cards yet'} />
        {cards.length === 0 ? (
          <Text variant="callout" color="label2" style={styles.empty}>
            Open a story in Learn and tap any word to save it, or add your own above.
          </Text>
        ) : (
          <View style={[styles.list, { backgroundColor: colors.surface }]}>
            {cards.map((c, i) => {
              const due = new Date(c.schedule.due);
              const from = c.example?.contentId ? contentById(c.example.contentId)?.title : undefined;
              return (
                <View key={c.id} style={[styles.row, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <View style={styles.rowText}>
                    <Text variant="headline">{c.cs}</Text>
                    <Text variant="subhead" color="label2">
                      {c.en}
                    </Text>
                    <Text variant="caption" color="label3">
                      {[isDue(c.schedule) ? 'Due now' : `Next in ${untilLabel(due)}`, c.source === 'own' ? 'Your card' : from].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      const ok = await confirm({ title: `Delete “${c.cs}”?`, message: 'Its review history goes too.', confirmLabel: 'Delete', destructive: true });
                      if (ok) useLearn.getState().removeCard(c.id);
                    }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${c.cs}`}
                    style={styles.delete}>
                    <Icon name="trash" size={18} color={colors.label3} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  form: { gap: space.sm },
  input: { minHeight: 48, paddingHorizontal: space.lg, borderRadius: radius.tile, outlineWidth: 0 },
  addButton: { alignSelf: 'flex-start', marginTop: space.xs },
  empty: { paddingHorizontal: space.xs },
  list: { borderRadius: radius.card, borderCurve: 'continuous', paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  rowText: { flex: 1, gap: 2 },
  delete: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
