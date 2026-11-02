import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';

import { List, Row } from '@/components/ui/list';
import { Text } from '@/components/ui/text';
import { shortDate } from '@/lib/about';
import type { Deadline } from '@/lib/ai';
import { DEADLINE_DAYS, scheduleReminder } from '@/lib/reminders';
import { useStore } from '@/store/cases';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const reminderId = (caseId: string) => `deadline:${caseId}`;

/**
 * The letter's deadline with a switch to be reminded before it: a notification 3 days before and
 * the day before, at 9:00. Shown only while the date is still ahead.
 */
export function DeadlineReminder({ caseId, deadline }: { caseId: string; deadline: Deadline }) {
  const { colors } = useTheme();
  const id = reminderId(caseId);
  const on = useStore((s) => s.reminders.some((r) => r.id === id));
  const [denied, setDenied] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (!next) {
        await useStore.getState().dropReminder(id);
        setDenied(false);
        return;
      }
      const { reminder, denied: no } = await scheduleReminder({ id, kind: 'deadline', caseId, date: deadline.date, title: deadline.title });
      setDenied(no);
      useStore.getState().saveReminder(reminder);
    } finally {
      setBusy(false);
    }
  };

  const [first, last] = [DEADLINE_DAYS[0], DEADLINE_DAYS.at(-1)];
  return (
    <View>
      <List>
        <Row
          icon="bell"
          title={`${deadline.title} by ${shortDate(deadline.date)}`}
          subtitle={on ? 'You’ll get a reminder before then' : `Remind me ${first} days before and the day before`}
          onPress={() => toggle(!on)}
          accessory={
            <Switch
              value={on}
              onValueChange={toggle}
              disabled={busy}
              trackColor={{ true: colors.accentFill }}
              accessibilityLabel={`Remind me ${first} days and ${last} day before`}
            />
          }
        />
      </List>
      {denied && (
        <Pressable onPress={() => Linking.openSettings()} accessibilityRole="link" style={styles.note}>
          <Text variant="footnote" color="label2">
            Notifications are off for CzechPal, so this reminder only shows on Home.{' '}
            <Text variant="footnote" color="accent" weight="600">
              Turn them on in Settings
            </Text>
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { paddingHorizontal: space.xs, marginTop: space.sm },
});
