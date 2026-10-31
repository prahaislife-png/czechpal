import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { categoryById } from '@/lib/help/directory';
import { kindIcon, practiceKinds } from '@/lib/help/practices';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HelpCategoryScreen() {
  const { colors } = useTheme();
  const { category: id } = useLocalSearchParams<{ category: string }>();
  const category = categoryById(id);

  if (!category) return <Redirect href="/help" />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: category.title }} />

      {id === 'doctors' && (
        // The live directory: every practice in Prague, with what other foreigners found out.
        <View>
          <SectionHeader title="Find a practice in Prague" />
          <List>
            {practiceKinds.map((k) => (
              <Row
                key={k.id}
                icon={kindIcon[k.id]}
                title={k.title}
                chevron
                onPress={() => router.push({ pathname: '/help/find/[kind]', params: { kind: k.id } })}
              />
            ))}
          </List>
          <Text variant="footnote" color="label3" style={styles.note}>
            Every practice and pharmacy in the official register, with who’s taking new patients and who speaks English, as
            reported by other CzechPal users. Needing a doctor tonight? See After-hours care on the Help page.
          </Text>
        </View>
      )}

      {category.composeRecipient && (
        // The bridge: most good Czech providers don't advertise English, so make all of them reachable.
        <Card style={[styles.bridge, { backgroundColor: colors.accentSoft, boxShadow: 'none' }]}>
          <Text variant="headline">Not limited to English speakers</Text>
          <Text variant="subhead" color="label2">
            Most Czech providers don’t advertise English. Write to any of them in correct Czech, or get a call script.
          </Text>
          <Button
            label={category.composeLabel ?? 'Write in Czech'}
            icon="compose"
            size="medium"
            onPress={() => router.push({ pathname: '/compose', params: { recipient: category.composeRecipient } })}
            style={styles.bridgeButton}
          />
        </Card>
      )}

      {category.officialSearch?.length ? (
        <View>
          <SectionHeader title="Official directories" />
          <List>
            {category.officialSearch.map((s) => (
              <Row
                key={s.url}
                icon="government"
                title={s.title}
                subtitle={s.detail}
                accessory={<Icon name="external" size={14} color={colors.label3} />}
                accessibilityHint="Opens the website"
                onPress={() => Linking.openURL(s.url)}
              />
            ))}
          </List>
          <Text variant="footnote" color="label3" style={styles.note}>
            Official Czech websites, mostly in Czech. Look for the language filter (jazyk).
          </Text>
        </View>
      ) : null}

      <View>
        <SectionHeader title="What to ask" />
        <View style={styles.tips}>
          {category.tips.map((tip) => (
            <View key={tip} style={styles.tip}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]} />
              <Text variant="callout" style={styles.tipText}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  bridge: { gap: space.sm },
  bridgeButton: { alignSelf: 'flex-start', marginTop: space.xs },
  note: { paddingHorizontal: space.lg, marginTop: space.sm },
  tips: { gap: space.md, paddingHorizontal: space.xs },
  tip: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  tipText: { flex: 1 },
});
