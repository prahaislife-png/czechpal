import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Text } from './text';

type Props = ViewProps & { padded?: boolean; raised?: boolean };

/** Cards are radius 20 with the single app elevation. */
export function Card({ padded = true, raised, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        padded && styles.padded,
        { backgroundColor: colors.surface, boxShadow: raised ? colors.shadowRaised : colors.shadow },
        style,
      ]}
    />
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <Text variant="subhead" weight="600" color="label2" accessibilityRole="header">
        {title}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderCurve: 'continuous' },
  padded: { padding: space.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
    paddingHorizontal: space.xs,
    marginBottom: space.sm,
  },
});
