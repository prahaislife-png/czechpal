import { Children, Fragment, isValidElement } from 'react';
import { Pressable, StyleSheet, View, type ViewProps } from 'react-native';

import { useLargeText } from '@/lib/a11y';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

const ICON_COLUMN = 24;

/**
 * iOS inset-grouped list: a flat surface on the grouped background, no shadow.
 * Hairline separators start where the row text starts.
 */
export function List({ children, style, inset = true, ...rest }: ViewProps & { inset?: boolean }) {
  const { colors } = useTheme();
  const items = Children.toArray(children).filter(isValidElement);
  return (
    <View {...rest} style={[styles.list, { backgroundColor: colors.surface }, style]}>
      {items.map((child, i) => (
        <Fragment key={child.key ?? i}>
          {i > 0 && (
            <View
              style={[
                styles.separator,
                { backgroundColor: colors.separator, marginLeft: inset ? space.lg + ICON_COLUMN + space.md : space.lg },
              ]}
            />
          )}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type WellTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

/** A single large glyph on a tinted ground. Hero use only (empty and error states), never to lead list rows. */
export function IconWell({ name, tone = 'neutral', size = 56 }: { name: IconName; tone?: WellTone; size?: number }) {
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
      <Icon name={name} size={Math.round(size * 0.46)} color={fg} />
    </View>
  );
}

/** The leading glyph of a row: naked, fixed width, secondary colour. */
export function RowIcon({ name, color }: { name: IconName; color?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.rowIcon}>
      <Icon name={name} size={22} color={color ?? colors.label2} />
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  value?: string;
  accessory?: React.ReactNode;
  /** Chevron means "pushes a screen". Off by default; turn on only for rows that navigate. */
  chevron?: boolean;
  destructive?: boolean;
  /** For rows in a pick-one list: announced as selected to screen readers. */
  selected?: boolean;
  /** For rows that show or hide content below them: announced as expanded or collapsed. */
  expanded?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
};

/** List rows highlight their background on press, never scale. */
export function Row({ title, subtitle, icon, value, accessory, chevron, destructive, selected, expanded, onPress, accessibilityHint }: RowProps) {
  const { colors } = useTheme();
  // HIG: "Avoid truncating text in scrollable regions"; at accessibility sizes rows grow instead.
  const lines = useLargeText() ? undefined : 2;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={selected === undefined && expanded === undefined ? undefined : { selected, expanded }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      {icon && <RowIcon name={icon} color={destructive ? colors.danger : undefined} />}
      <View style={styles.rowText}>
        <Text variant="callout" weight="500" color={destructive ? 'danger' : 'label'} numberOfLines={lines}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="label2" numberOfLines={lines}>
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
      {chevron && onPress && <Icon name="chevronRight" size={14} color={colors.label3} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    minHeight: 56,
  },
  rowIcon: { width: ICON_COLUMN, alignItems: 'center' },
  rowText: { flex: 1, gap: 2 },
  well: {
    borderRadius: radius.card,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
