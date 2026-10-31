import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { insurers } from '@/lib/compose/templates';
import { addressLine, ago, englishLabel, isFresh, type Practice } from '@/lib/help/practices';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Compact status for a list row: only fresh, reported facts, never guesses. */
function rowBadges(p: Practice) {
  const out: { label: string; tone: 'success' | 'danger' | 'accent' | 'neutral' }[] = [];
  if (p.new_patients && isFresh(p.new_patients_at)) {
    out.push(
      p.new_patients === 'yes'
        ? { label: `Taking new patients · ${ago(p.new_patients_at)}`, tone: 'success' }
        : { label: `Not taking new patients · ${ago(p.new_patients_at)}`, tone: 'danger' },
    );
  }
  if (p.english === 'good' || p.english === 'basic') out.push({ label: englishLabel[p.english], tone: p.english === 'good' ? 'accent' : 'neutral' });
  return out;
}

export function PracticeRow({ practice: p, onPress }: { practice: Practice; onPress: () => void }) {
  const { colors } = useTheme();
  const badges = rowBadges(p);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.rowText}>
        <Text variant="callout" weight="600" numberOfLines={2}>
          {p.name}
        </Text>
        <Text variant="footnote" color="label2" numberOfLines={1}>
          {addressLine(p)}
        </Text>
        {badges.length > 0 && (
          <View style={styles.badges}>
            {badges.map((b) => (
              <Badge key={b.label} label={b.label} tone={b.tone} />
            ))}
          </View>
        )}
      </View>
      <Icon name="chevronRight" size={14} color={colors.label3} />
    </Pressable>
  );
}

/** One line of the community status on a practice's page. */
function StatusLine({ icon, title, detail, tone }: { icon: IconName; title: string; detail?: string; tone?: 'success' | 'danger' | 'label' }) {
  const { colors } = useTheme();
  const color = tone === 'success' ? colors.success : tone === 'danger' ? colors.danger : colors.label2;
  return (
    <View style={styles.status}>
      <Icon name={icon} size={20} color={color} />
      <View style={styles.statusText}>
        <Text variant="callout" weight="600" color={tone === 'success' || tone === 'danger' ? tone : 'label'}>
          {title}
        </Text>
        {detail ? (
          <Text variant="footnote" color="label2">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/** What CzechPal users reported about a practice, each with its date. */
export function PracticeStatus({ practice: p }: { practice: Practice }) {
  const recent = p.new_patients_yes + p.new_patients_no;
  const agreeing = p.new_patients === 'yes' ? p.new_patients_yes : p.new_patients_no;
  const counts = recent > 1 ? ` · ${agreeing} of ${recent} reports in the last 3 months agree` : '';
  const insurerNames = p.insurers.map((code) => insurers.find((i) => i.id === code)?.label ?? code);

  return (
    <View style={styles.statusList}>
      {p.new_patients ? (
        isFresh(p.new_patients_at) ? (
          <StatusLine
            icon={p.new_patients === 'yes' ? 'checkCircle' : 'alert'}
            tone={p.new_patients === 'yes' ? 'success' : 'danger'}
            title={p.new_patients === 'yes' ? 'Taking new patients' : 'Not taking new patients'}
            detail={`Reported ${ago(p.new_patients_at)}${counts}`}
          />
        ) : (
          <StatusLine
            icon="clock"
            title="New patients: no recent report"
            detail={`Last reported ${ago(p.new_patients_at)}: ${p.new_patients === 'yes' ? 'taking' : 'not taking'} new patients. It may have changed.`}
          />
        )
      ) : (
        <StatusLine icon="question" title="New patients: not reported yet" detail="Be the first to find out and tell others." />
      )}
      <StatusLine
        icon="translate"
        title={p.english ? englishLabel[p.english] : 'English: not reported yet'}
        detail={p.english_at ? `Reported ${ago(p.english_at)}` : undefined}
      />
      {p.extra_fee ? (
        <StatusLine
          icon="money"
          title={p.extra_fee === 'yes' ? 'Extra charge for foreigners or English' : 'No extra charge for foreigners'}
          detail={`Reported ${ago(p.extra_fee_at)}`}
        />
      ) : null}
      {insurerNames.length > 0 && (
        <StatusLine icon="health" title="Patients with these insurers reported here" detail={insurerNames.join(', ')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 64 },
  rowText: { flex: 1, gap: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, marginTop: space.xs },
  statusList: { gap: space.lg, paddingHorizontal: space.lg, paddingVertical: space.lg },
  status: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  statusText: { flex: 1, gap: 1 },
});
