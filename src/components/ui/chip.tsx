import { StyleSheet, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

/** Selected state is the accent (spent on active state, per the colour rules). */
export function Chip({
  label,
  selected,
  onPress,
  role = 'radio',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  role?: 'radio' | 'checkbox';
}) {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole={role}
      accessibilityState={{ checked: selected }}
      style={[styles.chip, { backgroundColor: selected ? colors.accentFill : colors.fill }]}>
      {selected && <Icon name="check" size={14} color={colors.onAccent} />}
      <Text variant="subhead" weight={selected ? '600' : '500'} color={selected ? 'onAccent' : 'label'} chrome>
        {label}
      </Text>
    </PressableScale>
  );
}

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      {options.map((o) => (
        <Chip key={o.id} label={o.label} selected={o.id === value} onPress={() => onChange(o.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    minHeight: 40,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  group: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
