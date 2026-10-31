import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { clock, waitLabel, type OfficeWait } from '@/lib/visa/waits';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Today's reported waits at an office. Says plainly when nobody has reported yet. */
export function OfficeWaitSummary({ wait, compact }: { wait: OfficeWait | undefined; compact?: boolean }) {
  const { colors } = useTheme();
  if (!wait) {
    return (
      <Text variant="footnote" color="label3">
        No waiting times reported today
      </Text>
    );
  }
  const lines: { icon: 'clock' | 'alert'; text: string; tone?: 'danger' }[] = [];
  if (wait.tickets_gone_at) lines.push({ icon: 'alert', text: `Walk-in tickets ran out, reported at ${clock(wait.tickets_gone_at)}`, tone: 'danger' });
  if (wait.walk_in_wait && wait.walk_in_at) lines.push({ icon: 'clock', text: `Without a booking: ${waitLabel[wait.walk_in_wait].toLowerCase()} (${clock(wait.walk_in_at)})` });
  if (wait.booked_wait && wait.booked_at) lines.push({ icon: 'clock', text: `With a booking: ${waitLabel[wait.booked_wait].toLowerCase()} (${clock(wait.booked_at)})` });
  return (
    <View style={styles.list}>
      {(compact ? lines.slice(0, 1) : lines).map((l) => (
        <View key={l.text} style={styles.line}>
          <Icon name={l.icon} size={14} color={l.tone === 'danger' ? colors.danger : colors.label2} />
          <Text variant="footnote" color={l.tone === 'danger' ? 'danger' : 'label2'} style={styles.text}>
            {l.text}
          </Text>
        </View>
      ))}
      {!compact && (
        <Text variant="footnote" color="label3">
          {wait.reports === 1 ? '1 report today' : `${wait.reports} reports today`}, latest shown
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: space.xs },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  text: { flexShrink: 1 },
});
