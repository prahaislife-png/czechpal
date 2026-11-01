import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { getPlace, placeKinds, placeMapsUrl, placeTitle, type Place } from '@/lib/help/places';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** The first number in a published phone field ("246 032 422, 246 032 428"), dialable. */
function telUrl(phone: string) {
  const first = phone.split(/[,;/]/)[0].replace(/[^\d+]/g, '');
  if (!first) return null;
  return `tel:${first.startsWith('+') ? first : first.length === 9 ? `+420${first}` : first}`;
}
const webUrl = (url: string) => (/^https?:\/\//.test(url) ? url : `https://${url}`);
/** Some offices list several addresses ("a@x.cz, b@x.cz"): write to the first. */
const mailUrl = (emails: string) => `mailto:${emails.split(/[,;\s]+/)[0]}`;
const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** One official place: how to reach it, when it's open, and where the details come from. */
export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null | undefined>(undefined);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getPlace(id)
      .then((p) => {
        if (active) setPlace(p);
      })
      .catch((e: Error) => {
        if (active) setFailed(e.message);
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);

  if (failed) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Place' }} />
        <Text variant="callout" color="danger" align="center" accessibilityLiveRegion="polite">
          {failed}
        </Text>
        <Button
          label="Try again"
          variant="secondary"
          size="medium"
          icon="refresh"
          onPress={() => {
            setFailed(null);
            setAttempt((a) => a + 1);
          }}
        />
      </View>
    );
  }
  if (place === undefined) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Place' }} />
        <ActivityIndicator accessibilityLabel="Loading" />
      </View>
    );
  }
  if (place === null) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Place' }} />
        <Text variant="callout" color="label2" align="center">
          This place is no longer in the official list.
        </Text>
      </View>
    );
  }
  return <PlaceDetails place={place} />;
}

function PlaceDetails({ place: p }: { place: Place }) {
  const { colors } = useTheme();
  const meta = placeKinds[p.kind === 'consulate' ? 'embassy' : p.kind];
  const isMission = p.kind === 'embassy' || p.kind === 'consulate';
  const tel = p.phone ? telUrl(p.phone) : null;
  const consular = p.extra.consular;
  const external = <Icon name="external" size={14} color={colors.label3} />;

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{ title: p.kind === 'consulate' ? 'Consulate' : isMission && !/embassy/i.test(p.name) ? 'Mission' : meta.one }}
      />

      <View style={styles.head}>
        <Text variant="title2" weight="700" accessibilityRole="header" selectable>
          {placeTitle(p)}
        </Text>
        {isMission || p.kind === 'office' ? (
          <Text variant="subhead" color="label2" selectable>
            {isMission ? p.name : p.extra.about}
          </Text>
        ) : null}
        {p.district ? <Badge label={p.district} tone="neutral" icon="location" /> : null}
      </View>

      <List>
        {p.address ? (
          <Row icon="location" title={p.address} subtitle="Open in Maps" accessory={external} onPress={() => Linking.openURL(placeMapsUrl(p))} />
        ) : null}
        {p.phone && tel ? <Row icon="phone" title={p.phone} subtitle="Call" onPress={() => Linking.openURL(tel)} /> : null}
        {p.email ? <Row icon="mail" title={p.email} subtitle="Email" onPress={() => Linking.openURL(mailUrl(p.email!))} /> : null}
        {p.website ? (
          <Row icon="globe" title="Website" subtitle={p.website.replace(/^https?:\/\//, '')} accessory={external} onPress={() => Linking.openURL(webUrl(p.website!))} />
        ) : null}
      </List>

      {p.extra.serves ? (
        <View>
          <SectionHeader title="Who it serves" />
          <Text variant="callout" style={styles.text}>
            {p.extra.serves}
          </Text>
        </View>
      ) : null}

      {p.hours.length > 0 && (
        <View>
          <SectionHeader title="Office hours" />
          <List inset={false}>
            {p.hours.map((h) => (
              <View key={h} style={styles.hour}>
                <Text variant="callout" tabular selectable>
                  {h}
                </Text>
              </View>
            ))}
          </List>
          <Text variant="footnote" color="label3" style={styles.note}>
            Holidays and summer hours can differ: check the official website before a visit.
          </Text>
        </View>
      )}

      {consular ? (
        <View>
          <SectionHeader title={consular.name} />
          <List>
            {consular.address ? <Row icon="location" title={consular.address} /> : null}
            {consular.phone && telUrl(consular.phone) ? (
              <Row icon="phone" title={consular.phone} subtitle="Call" onPress={() => Linking.openURL(telUrl(consular.phone!)!)} />
            ) : null}
            {consular.email ? (
              <Row icon="mail" title={consular.email} subtitle="Email" onPress={() => Linking.openURL(mailUrl(consular.email!))} />
            ) : null}
            {consular.hours.map((h) => (
              <Row key={h} icon="clock" title={h} />
            ))}
          </List>
        </View>
      ) : null}

      {p.data_box ? (
        <View>
          <SectionHeader title="Data box" />
          <Text variant="callout" style={styles.text} selectable>
            {p.data_box}
          </Text>
          <Text variant="footnote" color="label3" style={styles.note}>
            The ID of its official electronic mailbox (datová schránka), for sending documents online.
          </Text>
        </View>
      ) : null}

      {!isMission && (
        <Button
          label="Write to them in Czech"
          icon="compose"
          variant="secondary"
          onPress={() => router.push({ pathname: '/compose', params: { to: placeTitle(p) } })}
        />
      )}

      <Text variant="footnote" color="label3" style={styles.note}>
        Source: {p.source === 'ovm' ? 'official list of public authorities (czechpoint.cz)' : p.source === 'mzv' ? 'Ministry of Foreign Affairs directory (mzv.gov.cz)' : p.source}, checked{' '}
        {formatDate(p.checked_on)}.
      </Text>
      {p.source_url ? (
        <Button label="Official page" variant="plain" size="medium" icon="external" onPress={() => Linking.openURL(p.source_url!)} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg, padding: layout.gutter },
  head: { gap: space.sm, alignItems: 'flex-start' },
  text: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  hour: { paddingHorizontal: space.lg, paddingVertical: space.md },
});
