import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

/** Status is never colour alone: every badge carries a word, optionally an icon. */
export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: BadgeTone; icon?: IconName }) {
  const { colors } = useTheme();
  const map = {
    neutral: [colors.fill, colors.label2],
    accent: [colors.accentSoft, colors.accent],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Icon name={icon} size={12} color={fg} />}
      <Text variant="caption" weight="600" style={{ color: fg }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
});
