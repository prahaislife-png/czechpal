import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Pinned action area. Clears the home indicator; content scrolls behind a hairline. */
export function BottomBar({ children, inModal }: { children: React.ReactNode; inModal?: boolean }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
          paddingBottom: Math.max(insets.bottom, inModal ? space.xxl : space.lg) + (insets.bottom ? 0 : space.xs),
        },
      ]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.md,
    paddingHorizontal: layout.gutter,
    alignItems: 'center',
  },
  inner: { width: '100%', maxWidth: layout.maxWidth, gap: space.sm },
});
