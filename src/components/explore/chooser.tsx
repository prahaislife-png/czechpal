import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { radius, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

export type ChooserOption<T extends string> = { id: T; label: string; icon?: IconName; note?: string };

/**
 * The choices behind a sentence chip, shown in the sheet in place of the cards. Several can be
 * on (activities) or exactly one (an area, a length of time).
 */
export function Chooser<T extends string>({
  title,
  note,
  options,
  selected,
  multiple,
  onToggle,
  onDone,
}: {
  title: string;
  note?: string;
  options: ChooserOption<T>[];
  selected: T[];
  multiple: boolean;
  onToggle: (id: T) => void;
  onDone: () => void;
}) {
  const { ex } = useExploreTheme();
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.title}>
          <Text variant="title3" style={{ color: ex.ink }} accessibilityRole="header">
            {title}
          </Text>
          {note ? (
            <Text variant="footnote" style={{ color: ex.ink3 }}>
              {note}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onDone}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.done, { backgroundColor: ex.ink, opacity: pressed ? 0.8 : 1 }]}>
          <Text variant="subhead" weight="600" chrome style={{ color: ex.sheet }}>
            Done
          </Text>
        </Pressable>
      </View>

      <View style={[styles.list, { backgroundColor: ex.card, borderColor: ex.line }]}>
        {options.map((o, i) => {
          const on = selected.includes(o.id);
          return (
            <Pressable
              key={o.id}
              onPress={() => onToggle(o.id)}
              accessibilityRole={multiple ? 'checkbox' : 'radio'}
              accessibilityState={{ checked: on }}
              accessibilityLabel={o.note ? `${o.label}, ${o.note}` : o.label}
              style={({ pressed }) => [
                styles.row,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ex.line },
                pressed && { backgroundColor: ex.sheetMuted },
              ]}>
              {o.icon ? (
                <View style={[styles.well, { backgroundColor: on ? ex.chip : ex.sheetMuted }]}>
                  <Icon name={o.icon} size={18} color={on ? ex.chipInk : ex.ink2} />
                </View>
              ) : null}
              <View style={styles.rowText}>
                <Text variant="body" weight={on ? '600' : '400'} style={{ color: ex.ink }}>
                  {o.label}
                </Text>
                {o.note ? (
                  <Text variant="footnote" style={{ color: ex.ink3 }}>
                    {o.note}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  multiple ? styles.box : styles.radio,
                  { borderColor: on ? ex.chipInk : ex.line, backgroundColor: on ? ex.chipInk : 'transparent' },
                ]}>
                {on ? <Icon name="check" size={13} color={ex.sheet} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  title: { flex: 1, gap: 2 },
  done: { minHeight: 36, paddingHorizontal: space.lg, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  list: { borderRadius: radius.card, borderCurve: 'continuous', borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 52, paddingHorizontal: space.lg, paddingVertical: space.sm },
  well: { width: 34, height: 34, borderRadius: radius.well, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, gap: 1 },
  box: { width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
