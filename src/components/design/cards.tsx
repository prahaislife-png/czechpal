import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Text } from '@/components/ui/text';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { toneColors, type Tone } from './tone';

/**
 * A large tinted card that leads somewhere: an eyebrow, a Newsreader title, a line of detail.
 * Learn uses it for the day's practice and the big destinations; Help for its main actions.
 */
export function LearningCard({
  eyebrow,
  title,
  detail,
  icon,
  tone = 'sky',
  onPress,
  accessibilityLabel,
  style,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  icon?: IconName;
  tone?: Tone;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? [eyebrow, title, detail].filter(Boolean).join('. ')}
      style={[styles.learning, { backgroundColor: tint }, style]}>
      <View style={styles.learningTop}>
        {eyebrow ? (
          <Text variant="footnote" weight="600" style={[styles.eyebrow, { color: ink }]} numberOfLines={1}>
            {eyebrow.toUpperCase()}
          </Text>
        ) : (
          <View />
        )}
        {icon ? (
          <View style={[styles.learningIcon, { backgroundColor: colors.surface }]}>
            <Icon name={icon} size={18} color={ink} />
          </View>
        ) : null}
      </View>
      <Text variant="title2" style={{ color: ink }}>
        {title}
      </Text>
      {detail ? (
        <Text variant="subhead" style={{ color: ink, opacity: 0.85 }}>
          {detail}
        </Text>
      ) : null}
    </PressableScale>
  );
}

/**
 * Progress from the learner's own data. `value` is 0–1, or null when there isn't enough evidence:
 * then no bar is drawn and `note` says why. Never a made-up percentage.
 */
export function ProgressCard({
  title,
  summary,
  value,
  note,
  tone = 'sage',
  onPress,
}: {
  title: string;
  summary: string;
  value: number | null;
  note?: string;
  tone?: Tone;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  const body = (
    <>
      <Text variant="headline">{title}</Text>
      <Text variant="footnote" color="label2">
        {summary}
      </Text>
      {value !== null ? (
        <View style={[styles.track, { backgroundColor: colors.fill }]} accessibilityElementsHidden>
          <View style={[styles.bar, { backgroundColor: tint, borderColor: ink, width: `${Math.max(4, Math.round(value * 100))}%` }]} />
        </View>
      ) : null}
      {note ? (
        <Text variant="footnote" color="label3">
          {note}
        </Text>
      ) : null}
    </>
  );
  return onPress ? (
    <PressableScale onPress={onPress} accessibilityRole="button" style={[styles.progress, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>
      {body}
    </PressableScale>
  ) : (
    <View style={[styles.progress, { backgroundColor: colors.surface, boxShadow: colors.shadow }]}>{body}</View>
  );
}

/** When there's nothing yet: a calm icon, one line of what goes here, and one way to start. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
  tone = 'neutral',
}: {
  icon: IconName;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  tone?: Tone;
}) {
  const { colors } = useTheme();
  const { tint, ink } = toneColors(colors, tone);
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={24} color={ink} />
      </View>
      <Text variant="headline" align="center">
        {title}
      </Text>
      <Text variant="callout" color="label2" align="center">
        {body}
      </Text>
      {action && onAction ? <Button label={action} variant="secondary" size="medium" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  learning: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg + 2, gap: space.xs, minHeight: 132 },
  learningTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.xs },
  learningIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { letterSpacing: 0.8, flexShrink: 1 },
  progress: { borderRadius: radius.card, borderCurve: 'continuous', padding: space.lg, gap: space.xs },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginTop: space.xs },
  bar: { height: 8, borderRadius: 4, borderWidth: 0 },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xxl, paddingHorizontal: space.lg },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs },
});
