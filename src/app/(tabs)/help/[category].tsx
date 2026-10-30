import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, SectionHeader } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { categoryById, providers, type Provider } from '@/lib/help/directory';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function HelpCategoryScreen() {
  const { colors } = useTheme();
  const { category: id } = useLocalSearchParams<{ category: string }>();
  const category = categoryById(id);
  const [fluentOnly, setFluentOnly] = useState(false);
  const [insuranceOnly, setInsuranceOnly] = useState(false);

  const list = useMemo(
    () =>
      providers.filter(
        (p) =>
          p.category === id &&
          (!fluentOnly || p.english === 'fluent') &&
          (!insuranceOnly || p.publicInsurance === true),
      ),
    [id, fluentOnly, insuranceOnly],
  );

  if (!category) return <Redirect href="/help" />;
  const allSamples = list.length > 0 && list.every((p) => p.verification.status === 'sample');

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: category.title }} />

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

      <View style={styles.filters}>
        <Chip label="Fluent English" role="checkbox" selected={fluentOnly} onPress={() => setFluentOnly((v) => !v)} />
        {id === 'doctors' && (
          <Chip label="Public insurance" role="checkbox" selected={insuranceOnly} onPress={() => setInsuranceOnly((v) => !v)} />
        )}
      </View>

      <View>
        <SectionHeader title={allSamples ? 'Sample listings' : 'Listings'} />
        {list.length ? (
          <List>
            {list.map((p) => (
              <ProviderRow key={p.id} provider={p} />
            ))}
          </List>
        ) : (
          <Text variant="callout" color="label2" style={styles.empty}>
            Nothing matches these filters yet. Turn one off, or write to any Czech provider above.
          </Text>
        )}
        {allSamples && (
          <Text variant="footnote" color="label3" style={styles.note}>
            These are made-up examples showing how listings will look. Real, phone-checked listings replace them before
            launch.
          </Text>
        )}
      </View>

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

function ProviderRow({ provider: p }: { provider: Provider }) {
  const status = p.verification.status;
  return (
    <Row
      title={p.name}
      subtitle={`${p.services.join(', ')} · ${p.area} · ${p.english === 'fluent' ? 'Fluent English' : 'Some English'}`}
      accessory={
        status === 'verified' ? (
          <Badge label="Verified" tone="success" icon="verified" />
        ) : status === 'sample' ? (
          <Badge label="Sample" tone="neutral" />
        ) : (
          <Badge label="Unverified" tone="warning" />
        )
      }
      chevron
      onPress={() => router.push({ pathname: '/help/provider/[id]', params: { id: p.id } })}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  bridge: { gap: space.sm },
  bridgeButton: { alignSelf: 'flex-start', marginTop: space.xs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: -space.sm },
  empty: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.lg, marginTop: space.sm },
  tips: { gap: space.md, paddingHorizontal: space.xs },
  tip: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 9 },
  tipText: { flex: 1 },
});
