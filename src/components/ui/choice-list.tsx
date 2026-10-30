import { Pressable, StyleSheet, View } from 'react-native';

import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { List } from './list';
import { Text } from './text';

/** Single choice as an inset-grouped list of radio rows, each with a one-line description. */
export function ChoiceList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string; description?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <List inset={false} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
            <View style={styles.text}>
              <Text variant="callout" weight="600">
                {o.label}
              </Text>
              {o.description ? (
                <Text variant="footnote" color="label2">
                  {o.description}
                </Text>
              ) : null}
            </View>
            <Icon name={selected ? 'checkCircle' : 'circle'} size={24} color={selected ? colors.accent : colors.label3} />
          </Pressable>
        );
      })}
    </List>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 64 },
  text: { flex: 1, gap: 2 },
});
