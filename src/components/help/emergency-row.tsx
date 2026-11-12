import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

const call = (number: string) => Linking.openURL(`tel:${number.replace(/\s/g, '')}`);

/** A number to call: the number large, who answers, and one tap to dial. */
export function EmergencyRow({ number, label, detail, prominent }: { number: string; label: string; detail: string; prominent?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => call(number)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${label}, ${number}`}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <Text variant={prominent ? 'title2' : 'title3'} weight="700" color={prominent ? 'danger' : 'label'} tabular style={styles.number}>
        {number}
      </Text>
      <View style={styles.text}>
        <Text variant="callout" weight="600">
          {label}
        </Text>
        <Text variant="footnote" color="label2">
          {detail}
        </Text>
      </View>
      <Icon name="phone" size={18} color={colors.accent} />
    </Pressable>
  );
}

/** A number as a chip: for the three everyone should be able to reach from Help's first screen. */
export function EmergencyChip({ number, label }: { number: string; label: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => call(number)}
      accessibilityRole="button"
      accessibilityLabel={`Call ${label}, ${number}`}
      style={({ pressed }) => [styles.chip, { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 }]}>
      <Text variant="title3" weight="700" color="danger" tabular>
        {number}
      </Text>
      <Text variant="caption" color="label2" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg, paddingVertical: space.md, minHeight: 60 },
  number: { minWidth: 52 },
  text: { flex: 1, gap: 1 },
  chip: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 64, borderRadius: 14, borderCurve: 'continuous', paddingVertical: space.sm },
});
