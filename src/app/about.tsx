import { Stack } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { SectionHeader } from '@/components/ui/card';
import { ChipGroup } from '@/components/ui/chip';
import { DateField } from '@/components/ui/date-field';
import { HeaderCloseButton } from '@/components/ui/header-button';
import { Icon } from '@/components/ui/icon';
import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { daysUntil, districts, hasExpiry, longDate, stayById, stays } from '@/lib/about';
import { PERMIT_DAYS, scheduleReminder } from '@/lib/reminders';
import { useStore } from '@/store/cases';
import { layout, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const PERMIT_REMINDER = 'permit';

/**
 * About you: three optional answers, each saved as it's chosen (no Save button). The permit's
 * expiry date can also set reminders before it runs out.
 */
export default function AboutScreen() {
  const { colors } = useTheme();
  const about = useStore((s) => s.about);
  const permitReminder = useStore((s) => s.reminders.find((r) => r.id === PERMIT_REMINDER));
  const [denied, setDenied] = useState(false);
  const stay = stayById(about.stay);
  const askExpiry = hasExpiry(about);

  /** Replaces the permit reminder for `date`, or removes it. */
  const syncReminder = async (date: string | undefined, on: boolean) => {
    const { dropReminder, saveReminder } = useStore.getState();
    await dropReminder(PERMIT_REMINDER);
    if (!on || !date || daysUntil(date) < 0) return;
    const { reminder, denied: no } = await scheduleReminder({
      id: PERMIT_REMINDER,
      kind: 'permit',
      date,
      title: 'Residence permit expires',
    });
    setDenied(no);
    saveReminder(reminder);
  };

  const chooseStay = (id: typeof about.stay) => {
    const keepsDate = stayById(id)?.expires ?? true;
    useStore.getState().setAbout({ stay: id, expires: keepsDate ? about.expires : undefined });
    if (!keepsDate && permitReminder) syncReminder(undefined, false);
  };

  const setExpires = (date: string | undefined) => {
    useStore.getState().setAbout({ expires: date });
    // A new date moves the reminders; the first date turns them on.
    syncReminder(date, Boolean(permitReminder) || !about.expires);
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerLeft: () => <HeaderCloseButton /> }} />
      <Text variant="subhead" color="label2" style={styles.intro}>
        Three optional questions. Explanations, reminders and Find then fit your situation.
      </Text>

      <View>
        <SectionHeader title="What lets you live in Czechia?" />
        <List>
          {stays.map((s) => (
            <Row
              key={s.id}
              title={s.label}
              subtitle={s.detail}
              selected={s.id === about.stay}
              accessory={s.id === about.stay ? <Icon name="check" size={18} color={colors.accent} /> : undefined}
              onPress={() => chooseStay(s.id)}
            />
          ))}
        </List>
      </View>

      {askExpiry && (
        <View>
          <SectionHeader title={stay?.id === 'permanent' ? 'When does your card expire?' : 'When does it expire?'} />
          <List>
            <View style={styles.dateRow}>
              <Text variant="callout" weight="500" style={styles.dateLabel}>
                Valid until
              </Text>
              <DateField value={about.expires} onChange={setExpires} label="Valid until" />
            </View>
            {about.expires ? (
              <View style={[styles.dateRow, styles.divided, { borderTopColor: colors.separator }]}>
                <View style={styles.dateLabel}>
                  <Text variant="callout" weight="500">
                    Remind me before it expires
                  </Text>
                  <Text variant="footnote" color="label2">
                    {PERMIT_DAYS.slice(0, -1).join(', ')} and {PERMIT_DAYS.at(-1)} days before
                  </Text>
                </View>
                <Switch
                  value={Boolean(permitReminder)}
                  onValueChange={(on) => syncReminder(about.expires, on)}
                  trackColor={{ true: colors.accentFill }}
                  accessibilityLabel="Remind me before it expires"
                />
              </View>
            ) : null}
          </List>
          {about.expires && daysUntil(about.expires) < 0 ? (
            <Text variant="footnote" color="danger" style={styles.note} accessibilityLiveRegion="polite">
              This date has passed. Check the date on your card.
            </Text>
          ) : about.expires ? (
            <Text variant="footnote" color="label2" style={styles.note}>
              Expires on {longDate(about.expires)}, in {daysUntil(about.expires)} days.
            </Text>
          ) : null}
          {denied && (
            <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link" style={styles.note}>
              <Text variant="footnote" color="label2">
                Notifications are off for CzechLocal, so reminders only show in the app.{' '}
                <Text variant="footnote" color="accent" weight="600">
                  Turn them on in Settings
                </Text>
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View>
        <SectionHeader title="Where do you live?" />
        <ChipGroup
          options={districts.map((d) => ({ id: d, label: d }))}
          value={about.district ?? ''}
          onChange={(district) => useStore.getState().setAbout({ district })}
        />
      </View>

      <View style={[styles.privacy, { backgroundColor: colors.fill, borderRadius: radius.tile }]}>
        <Icon name="lock" size={16} color={colors.label2} />
        <Text variant="footnote" color="label2" style={styles.privacyText}>
          Saved on this phone. When you ask for an explanation, these answers go with it so it fits you. You can change
          or delete them any time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: layout.gutter, paddingBottom: space.huge, gap: space.xxl },
  intro: { paddingHorizontal: space.xs },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 56, paddingHorizontal: space.lg, paddingVertical: space.sm },
  divided: { borderTopWidth: StyleSheet.hairlineWidth },
  dateLabel: { flex: 1, gap: 2 },
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
  privacy: { flexDirection: 'row', gap: space.sm, padding: space.lg },
  privacyText: { flex: 1 },
});
