import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Text } from '@/components/ui/text';
import { officeById } from '@/lib/visa/offices';
import { reportOffice, waitLabel, WaitsError, type Wait } from '@/lib/visa/waits';
import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const bookedOptions = [
  { id: 'no', label: 'No, walked in' },
  { id: 'yes', label: 'Yes, booked' },
] as const;
const waitOptions = [
  ...(Object.keys(waitLabel) as Wait[]).map((w) => ({ id: w, label: waitLabel[w] })),
  { id: 'skip', label: 'Didn’t get in' },
] as const;

/** How long the wait was at an office today. Anonymous; others see the latest report and the time. */
export default function ReportOfficeScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const office = officeById(id);
  const [booked, setBooked] = useState<'no' | 'yes'>('no');
  const [wait, setWait] = useState<Wait | 'skip'>('skip');
  const [ticketsGone, setTicketsGone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walkIn = booked === 'no';
  const answered = wait !== 'skip' || (walkIn && ticketsGone);

  const send = async () => {
    if (!office || !answered || sending) return;
    setSending(true);
    setError(null);
    try {
      await reportOffice(office.id, {
        booked: !walkIn,
        ...(wait !== 'skip' ? { wait } : {}),
        ...(walkIn && ticketsGone ? { ticketsGone: true } : {}),
      });
      if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      setSending(false);
      setError(e instanceof WaitsError ? e.message : 'Your report couldn’t be saved. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerLeft: () => <HeaderTextButton label="Cancel" /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        {office ? (
          <Text variant="headline" accessibilityRole="header">
            {office.short}
          </Text>
        ) : null}

        <View>
          <SectionHeader title="Did you have a booking?" />
          <ChipGroup options={bookedOptions} value={booked} onChange={setBooked} />
        </View>

        <View>
          <SectionHeader title="How long did you wait (or so far)?" />
          <ChipGroup options={waitOptions} value={wait} onChange={setWait} />
        </View>

        {walkIn && (
          <View style={styles.toggle}>
            <View style={styles.toggleText}>
              <Text variant="callout" weight="600">
                Walk-in tickets had run out
              </Text>
              <Text variant="footnote" color="label2">
                The office stopped giving out numbers for people without a booking.
              </Text>
            </View>
            <Switch
              value={ticketsGone}
              onValueChange={setTicketsGone}
              trackColor={{ true: colors.accentFill }}
              accessibilityLabel="Walk-in tickets had run out"
            />
          </View>
        )}

        <Text variant="footnote" color="label2" style={styles.hint}>
          Anonymous. Others see the latest report and its time, today only.
        </Text>
      </ScrollView>

      <BottomBar inModal>
        {error && (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <Button label={sending ? 'Sending…' : 'Send'} onPress={send} disabled={!answered || sending || !office} />
        {!answered && (
          <Text variant="footnote" color="label3" align="center">
            {walkIn ? 'Choose how long you waited, or that tickets had run out.' : 'Choose how long you waited.'}
          </Text>
        )}
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.xxxl, gap: space.xxl },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  toggleText: { flex: 1, gap: 2 },
  hint: { paddingHorizontal: space.xs },
});
