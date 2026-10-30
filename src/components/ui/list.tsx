import { Children, Fragment, isValidElement } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

/** iOS inset-grouped list. Rows get hairline separators inset past the icon well. */
export function List({ children, style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View
      {...rest}
      style={[styles.list, { backgroundColor: colors.surface, boxShadow: colors.shadow }, style]}>
      {items.map((child, i) => (
        <Fragment key={child.key ?? i}>
          {i > 0 && <View style={[styles.separator, { backgroundColor: colors.separator }]} />}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type WellTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

export function IconWell({ name, tone = 'neutral', size = 36 }: { name: IconName; tone?: WellTone; size?: number }) {
  const { colors } = useTheme();
  const map = {
    accent: [colors.accentSoft, colors.accent],
    neutral: [colors.fill, colors.label2],
    success: [colors.successSoft, colors.success],
    warning: [colors.warningSoft, colors.warning],
    danger: [colors.dangerSoft, colors.danger],
  } as const;
  const [bg, fg] = map[tone];
  return (
    <View style={[styles.well, { width: size, height: size, backgroundColor: bg }]}>
      <Icon name={name} size={Math.round(size * 0.5)} color={fg} />
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: WellTone;
  value?: string;
  accessory?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
};

/** List rows highlight their background on press — never scale. */
export function Row({
  title,
  subtitle,
  icon,
  iconTone,
  value,
  accessory,
  chevron = true,
  destructive,
  onPress,
  accessibilityHint,
}: RowProps) {
  const { colors } = useTheme();
  const showChevron = chevron && !!onPress;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      {icon && <IconWell name={icon} tone={destructive ? 'danger' : iconTone} />}
      <View style={styles.rowText}>
        <Text variant="callout" weight="500" color={destructive ? 'danger' : 'label'} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="label2" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text variant="subhead" color="label2" tabular>
          {value}
        </Text>
      ) : null}
      {accessory}
      {showChevron && <Icon name="chevronRight" size={14} color={colors.label3} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg + 36 + space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 60,
  },
  rowText: { flex: 1, gap: 2 },
  well: {
    borderRadius: radius.well,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
