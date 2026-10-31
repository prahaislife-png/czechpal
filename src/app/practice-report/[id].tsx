import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BottomBar } from '@/components/ui/bottom-bar';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { HeaderTextButton } from '@/components/ui/header-button';
import { Text } from '@/components/ui/text';
import { insurers, type Insurer } from '@/lib/compose/templates';
import { DirectoryError, reportPractice, type Report } from '@/lib/help/practices';
import { isBackendConfigured } from '@/lib/supabase';
import { layout, space } from '@/theme/tokens';

const newPatientOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'skip', label: 'Didn’t ask' },
] as const;
const englishOptions = [
  { id: 'good', label: 'Good' },
  { id: 'basic', label: 'Some' },
  { id: 'none', label: 'None' },
  { id: 'skip', label: 'Didn’t try' },
] as const;
const feeOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'skip', label: 'Don’t know' },
] as const;
type PublicInsurer = Exclude<Insurer, 'private'>;
// Commercial insurance for foreigners isn't one of the public insurers practices contract with.
const insurerOptions: readonly { id: PublicInsurer | 'skip'; label: string }[] = [
  { id: 'skip', label: 'Rather not say' },
  ...insurers.filter((i): i is (typeof insurers)[number] & { id: PublicInsurer } => i.id !== 'private').map((i) => ({ id: i.id, label: i.label })),
];

/**
 * What the user found out about a practice. Three quick answers, no free text: nothing
 * defamatory, no health details, nothing to moderate. Anonymous; only totals are shown.
 */
export default function ReportPracticeScreen() {
  const { id, name, patients } = useLocalSearchParams<{ id: string; name?: string; patients?: string }>();
  // A pharmacy has no patient list: only the English question applies.
  const forPatients = patients !== '0';
  const [newPatients, setNewPatients] = useState<(typeof newPatientOptions)[number]['id']>('skip');
  const [english, setEnglish] = useState<(typeof englishOptions)[number]['id']>('skip');
  const [fee, setFee] = useState<(typeof feeOptions)[number]['id']>('skip');
  const [insurer, setInsurer] = useState<PublicInsurer | 'skip'>('skip');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = english !== 'skip' || (forPatients && (newPatients !== 'skip' || fee !== 'skip'));

  const send = async () => {
    if (!answered || sending) return;
    setSending(true);
    setError(null);
    const report: Report = {
      ...(forPatients && newPatients !== 'skip' ? { newPatients } : {}),
      ...(english !== 'skip' ? { english } : {}),
      ...(forPatients && fee !== 'skip' ? { extraFee: fee } : {}),
      ...(forPatients && insurer !== 'skip' ? { insurer } : {}),
    };
    try {
      await reportPractice(Number(id), report);
      if (process.env.EXPO_OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      setSending(false);
      setError(e instanceof DirectoryError ? e.message : 'Your report couldn’t be saved. Please try again.');
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerLeft: () => <HeaderTextButton label="Cancel" /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        {name ? (
          <Text variant="headline" accessibilityRole="header">
            {name}
          </Text>
        ) : null}

        {forPatients && (
          <View>
            <SectionHeader title="Are they taking new patients?" />
            <ChipGroup options={newPatientOptions} value={newPatients} onChange={setNewPatients} />
          </View>
        )}

        <View>
          <SectionHeader title="How was their English?" />
          <ChipGroup options={englishOptions} value={english} onChange={setEnglish} />
        </View>

        {forPatients && (
          <>
            <View>
              <SectionHeader title="Extra charge for foreigners or for English?" />
              <ChipGroup options={feeOptions} value={fee} onChange={setFee} />
            </View>

            <View>
              <SectionHeader title="Your health insurer (optional)" />
              <ChipGroup options={insurerOptions} value={insurer} onChange={setInsurer} />
              <Text variant="footnote" color="label3" style={styles.hint}>
                Helps people with the same insurer.
              </Text>
            </View>
          </>
        )}

        <Text variant="footnote" color="label2" style={styles.hint}>
          Your answers are anonymous. Others only see totals, such as “taking new patients, reported 2 days ago”. You can
          correct your answers today by reporting again.
        </Text>
      </ScrollView>

      <BottomBar inModal>
        {error && (
          <Text variant="footnote" color="danger" align="center" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        {!isBackendConfigured ? (
          <Text variant="footnote" color="label2" align="center">
            Reports need the live connection, which isn’t set up in this build.
          </Text>
        ) : null}
        <Button
          label={sending ? 'Sending…' : 'Send'}
          onPress={send}
          disabled={!answered || sending || !isBackendConfigured}
        />
        {!answered && (
          <Text variant="footnote" color="label3" align="center">
            {forPatients ? 'Answer at least one of the first three questions.' : 'Answer the question above.'}
          </Text>
        )}
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: layout.gutter, paddingBottom: space.xxxl, gap: space.xxl },
  hint: { paddingHorizontal: space.xs, marginTop: space.sm },
});
