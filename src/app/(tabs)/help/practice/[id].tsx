import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { PracticeStatus } from '@/components/practice';
import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { List, Row } from '@/components/ui/list';
import { SkeletonLine } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  addressLine,
  DirectoryError,
  formatPhone,
  getPractice,
  kindById,
  mapsUrl,
  SOURCE_NOTE,
  type Practice,
} from '@/lib/help/practices';
import { layout, space } from '@/theme/tokens';

type Loaded = { id: string; practice: Practice | null; error?: string };

export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Reload whenever the page comes back into view, so a report just sent shows straight away.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const numeric = Number(id);
      if (!Number.isSafeInteger(numeric) || numeric <= 0) {
        setLoaded({ id, practice: null });
        return;
      }
      getPractice(numeric)
        .then((practice) => active && setLoaded({ id, practice }))
        .catch((e: unknown) => {
          if (active) setLoaded({ id, practice: null, error: e instanceof DirectoryError ? e.message : 'Something went wrong.' });
        });
      return () => {
        active = false;
      };
      // `attempt` re-runs this after a failed load.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, attempt]),
  );

  const current = loaded?.id === id ? loaded : null;

  if (!current) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.loading} accessibilityLabel="Loading">
          <SkeletonLine width="80%" height={24} />
          <SkeletonLine width="50%" />
          <SkeletonLine width="65%" />
        </View>
      </ScrollView>
    );
  }
  if (!current.practice) {
    return (
      <View style={styles.message}>
        <Stack.Screen options={{ title: '' }} />
        <Text variant="title3" align="center">
          {current.error ? 'Couldn’t load this practice' : 'This practice isn’t listed any more'}
        </Text>
        <Text variant="callout" color="label2" align="center">
          {current.error ?? 'It may have closed or moved. Go back to see other practices.'}
        </Text>
        {current.error && <Button label="Try again" icon="refresh" variant="secondary" onPress={() => setAttempt((a) => a + 1)} />}
      </View>
    );
  }
  return <PracticeDetails practice={current.practice} />;
}

function PracticeDetails({ practice: p }: { practice: Practice }) {
  // The first kind with a patient list decides the Czech message; a pharmacy has none.
  const doctorType = p.kinds.map((k) => kindById(k)?.doctorType).find(Boolean);
  const ask = (mode: 'message' | 'call') =>
    doctorType &&
    router.push({
      pathname: '/compose',
      params: { recipient: 'doctor', doctorType, to: p.name, phone: p.phone ?? '', mode },
    });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: '' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text variant="title2" weight="700" accessibilityRole="header" selectable>
            {p.name}
          </Text>
          {p.provider_name && p.provider_name !== p.name ? (
            <Text variant="subhead" color="label2" selectable>
              {p.provider_name}
            </Text>
          ) : null}
          <View style={styles.kinds}>
            {p.kinds.map((k) => (
              <Badge key={k} label={kindById(k)?.one ?? k} tone="neutral" />
            ))}
          </View>
        </View>

        <View>
          <SectionHeader title="What CzechPal users found" />
          <List inset={false}>
            <PracticeStatus practice={p} />
          </List>
          <Button
            label="Tell others what you found"
            icon="compose"
            variant="plain"
            size="medium"
            onPress={() =>
              router.push({
                pathname: '/practice-report/[id]',
                params: { id: String(p.id), name: p.name, patients: doctorType ? '1' : '0' },
              })
            }
            style={styles.reportButton}
          />
        </View>

        <View>
          <SectionHeader title="Contact" />
          <List>
            <Row icon="location" title={addressLine(p)} subtitle="Open in Maps" onPress={() => Linking.openURL(mapsUrl(p))} />
            {p.phone ? <Row icon="phone" title={formatPhone(p.phone)} subtitle="Call" onPress={() => Linking.openURL(`tel:${p.phone}`)} /> : null}
            {p.website ? (
              <Row
                icon="globe"
                title={p.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                subtitle="Website"
                onPress={() => Linking.openURL(p.website!)}
              />
            ) : null}
            {p.email ? <Row icon="mail" title={p.email} subtitle="Email" onPress={() => Linking.openURL(`mailto:${p.email}`)} /> : null}
          </List>
          {!p.phone && !p.website && !p.email ? (
            <Text variant="footnote" color="label3" style={styles.note}>
              The register lists no phone, website or email for this practice. Try its address in Maps, which often shows a
              phone number.
            </Text>
          ) : null}
        </View>

        <Text variant="footnote" color="label3" style={styles.note}>
          {SOURCE_NOTE} Reports come from CzechPal users and can change, so confirm when you call.
        </Text>
      </ScrollView>

      <BottomBar>
        {doctorType ? (
          <>
            <Button label="Ask about new patients in Czech" icon="compose" onPress={() => ask('message')} />
            <Button label="Get a call script" icon="phone" variant="plain" size="medium" onPress={() => ask('call')} />
          </>
        ) : (
          <>
            <Button label="Open in Maps" icon="location" onPress={() => Linking.openURL(mapsUrl(p))} />
            {p.phone ? (
              <Button label="Call" icon="phone" variant="plain" size="medium" onPress={() => Linking.openURL(`tel:${p.phone}`)} />
            ) : null}
          </>
        )}
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  head: { gap: space.sm, paddingTop: space.sm },
  kinds: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  reportButton: { alignSelf: 'flex-start', marginTop: space.xs },
  note: { paddingHorizontal: space.lg, marginTop: space.sm },
  loading: { gap: space.md, paddingTop: space.lg },
  message: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md, padding: space.xxxl },
});
