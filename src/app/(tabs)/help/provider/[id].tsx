import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { List } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { categoryById, providerById } from '@/lib/help/directory';
import { layout, space } from '@/theme/tokens';

const formatChecked = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = providerById(id);
  if (!p) return <Redirect href="/help" />;

  const category = categoryById(p.category);
  const { status, checkedOn } = p.verification;
  const isSample = status === 'sample';

  const rows: [string, string][] = [
    ['Services', p.services.join(', ')],
    ['Area', p.area],
    ['Languages', p.languages.join(', ')],
    ['English', p.english === 'fluent' ? 'Fluent' : 'Some, enough for basics'],
    ...(p.publicInsurance !== undefined
      ? ([['Public health insurance', p.publicInsurance ? 'Accepted' : 'Not accepted, private fees']] as [string, string][])
      : []),
    ...(p.priceNote ? ([['Prices', p.priceNote]] as [string, string][]) : []),
  ];

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text variant="title1" accessibilityRole="header">
            {p.name}
          </Text>
          {status === 'verified' ? (
            <Badge label={checkedOn ? `Verified ${formatChecked(checkedOn)}` : 'Verified'} tone="success" icon="verified" />
          ) : isSample ? (
            <Badge label="Sample listing" tone="neutral" />
          ) : (
            <Badge label="Unverified, self-reported" tone="warning" />
          )}
        </View>

        <List inset={false}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text variant="subhead" color="label2">
                {label}
              </Text>
              <Text variant="callout" weight="500" style={styles.value} selectable>
                {value}
              </Text>
            </View>
          ))}
        </List>

        <Text variant="footnote" color="label3" style={styles.note}>
          {isSample
            ? 'This is a made-up example showing how a listing will look. It has no phone number and can’t be contacted.'
            : status === 'verified'
              ? 'We phoned to check English, insurance and prices. Things change, so confirm when you book.'
              : 'Details come from the provider and haven’t been checked by us yet.'}
        </Text>
      </ScrollView>

      {!isSample && (
        <BottomBar>
          {category?.composeRecipient ? (
            <Button
              label="Message them in Czech"
              icon="compose"
              onPress={() =>
                router.push({
                  pathname: '/compose',
                  params: { recipient: category.composeRecipient, to: p.name, phone: p.phone ?? '' },
                })
              }
            />
          ) : null}
          {p.phone ? (
            <Button
              label="Call"
              icon="phone"
              variant={category?.composeRecipient ? 'plain' : 'primary'}
              size={category?.composeRecipient ? 'medium' : 'large'}
              onPress={() => Linking.openURL(`tel:${p.phone}`)}
            />
          ) : null}
          {p.website ? (
            <Button label="Website" variant="plain" size="medium" onPress={() => Linking.openURL(p.website!)} />
          ) : null}
        </BottomBar>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xl },
  head: { gap: space.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: space.lg, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 52, alignItems: 'center' },
  value: { flex: 1, textAlign: 'right' },
  note: { paddingHorizontal: space.xs },
});
