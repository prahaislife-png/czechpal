import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { fonts, space } from '@/theme/tokens';
import { useExploreTheme } from '@/theme/use-theme';

/** Display type for the sentence: larger and tighter than the app's titles, still the system face. */
/** The sentence reads like a line of a magazine: Newsreader for its words, the system font in the chips. */
const SIZE = { fontSize: 27, lineHeight: 34, letterSpacing: -0.3 } as const;
const MAX_SCALE = 1.6;

/** One line of the sentence; chips wrap onto the next line when they don't fit. */
export function SentenceLine({ children }: { children: ReactNode }) {
  return <View style={styles.line}>{children}</View>;
}

export function Words({ children }: { children: string }) {
  const { ex } = useExploreTheme();
  return (
    <RNText maxFontSizeMultiplier={MAX_SCALE} style={[styles.words, { color: ex.ink }]}>
      {children}
    </RNText>
  );
}

/** A choice inside the sentence: soft blue, tap to change. */
export function SentenceChip({
  label,
  onPress,
  hint,
  open,
}: {
  label: string;
  onPress: () => void;
  /** What tapping does, for VoiceOver ("Change activity"). */
  hint: string;
  open?: boolean;
}) {
  const { ex } = useExploreTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ expanded: !!open }}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: ex.chip, borderColor: open ? ex.chipInk : ex.chipLine, opacity: pressed ? 0.75 : 1 },
      ]}>
      <RNText maxFontSizeMultiplier={MAX_SCALE} numberOfLines={1} style={[styles.chipText, { color: ex.chipInk }]}>
        {label}
      </RNText>
      <Icon name="chevronDown" size={13} color={ex.chipInk} style={open ? styles.flip : undefined} />
    </Pressable>
  );
}

/** "+": add another activity. */
export function AddChip({ onPress, label }: { onPress: () => void; label: string }) {
  const { ex } = useExploreTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.add, { borderColor: ex.chipLine, backgroundColor: pressed ? ex.chip : 'transparent' }]}>
      <Icon name="plus" size={18} color={ex.chipInk} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  line: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.sm, rowGap: space.xs },
  words: { ...SIZE, fontFamily: fonts.displayMedium },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    maxWidth: '100%',
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 19, lineHeight: 24, fontWeight: '600', letterSpacing: -0.3, flexShrink: 1 },
  flip: { transform: [{ rotate: '180deg' }] },
  add: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
