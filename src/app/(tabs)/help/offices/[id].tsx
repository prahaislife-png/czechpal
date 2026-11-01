import { Redirect, router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import { OfficeWaitSummary } from '@/components/office-wait';
import { Badge } from '@/components/ui/badge';
import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { BOOKING_URL, CLIENT_CENTRE, officeById, officeMapsUrl, OFFICES_SOURCE } from '@/lib/visa/offices';
import { getWaitsToday, type OfficeWait } from '@/lib/visa/waits';
import { isBackendConfigured } from '@/lib/supabase';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export default function OfficeScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const office = officeById(id);
  const [wait, setWait] = useState<{ value: OfficeWait | undefined } | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getWaitsToday()
        .then((w) => active && setWait({ value: id ? w[id as keyof typeof w] : undefined }))
        .catch(() => active && setWait(null));
      return () => {
        active = false;
      };
    }, [id]),
  );

  if (!office) return <Redirect href="/help/offices" />;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: office.navTitle }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <View style={styles.head}>
          <Text variant="title2" weight="700" accessibilityRole="header">
            {office.short}
          </Text>
          <Text variant="footnote" color="label2" selectable>
            {office.name}
          </Text>
          <View style={styles.badges}>
            {office.bookedOnly && <Badge label="Booked clients only" tone="warning" />}
            <Badge label={office.step === 'yes' ? 'Step-free access' : 'Not step-free'} tone="neutral" />
          </View>
        </View>

        {office.notes.length > 0 && (
          <View style={[styles.notes, { backgroundColor: colors.surfaceMuted }]}>
            {office.notes.map((n) => (
              <View key={n} style={styles.noteLine}>
                <Icon name="info" size={16} color={colors.label2} />
                <Text variant="footnote" style={styles.noteText}>
                  {n}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View>
          <SectionHeader title="Waiting today" />
          <View style={styles.waitBox}>
            {wait ? <OfficeWaitSummary wait={wait.value} /> : <Text variant="footnote" color="label3">Couldn’t load today’s waiting times.</Text>}
          </View>
          {isBackendConfigured && (
            <Button
              label="I’m here: report the wait"
              icon="clock"
              variant="plain"
              size="medium"
              onPress={() => router.push({ pathname: '/office-report/[id]', params: { id: office.id } })}
              style={styles.reportButton}
            />
          )}
        </View>

        <View>
          <SectionHeader title="Who it’s for" />
          <Text variant="callout" style={styles.body}>
            {office.serves}
          </Text>
        </View>

        <View>
          <SectionHeader title="Opening hours" />
          {office.hours ? (
            <List>
              {office.hours.map((h) => (
                <Row key={h.days} title={h.days} subtitle={h.time} />
              ))}
            </List>
          ) : (
            <Text variant="callout" style={styles.body}>
              Booked clients only, by appointment.
            </Text>
          )}
        </View>

        <View>
          <SectionHeader title="Getting there" />
          <List>
            <Row icon="location" title={office.address} subtitle="Open in Maps" onPress={() => Linking.openURL(officeMapsUrl(office))} />
          </List>
        </View>

        <Text variant="footnote" color="label3" style={styles.note}>
          From the Ministry of the Interior’s Information Portal for Foreigners, copied{' '}
          {new Date(`${OFFICES_SOURCE.checkedOn}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Check
          ipc.gov.cz before you go.
        </Text>
      </ScrollView>

      <BottomBar>
        <Button label="Book an appointment" icon="calendar" onPress={() => Linking.openURL(BOOKING_URL)} />
        <Button
          label={`Call ${CLIENT_CENTRE.display}`}
          icon="phone"
          variant="plain"
          size="medium"
          onPress={() => Linking.openURL(`tel:${CLIENT_CENTRE.phone}`)}
        />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  head: { gap: space.sm, paddingTop: space.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  notes: { gap: space.md, padding: space.lg, borderRadius: radius.card, borderCurve: 'continuous' },
  noteLine: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  noteText: { flex: 1 },
  waitBox: { paddingHorizontal: space.xs },
  reportButton: { alignSelf: 'flex-start', marginTop: space.sm },
  body: { paddingHorizontal: space.xs },
  note: { paddingHorizontal: space.xs },
});
