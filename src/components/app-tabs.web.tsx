import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/** Web stand-in for the native tab bar: same three peers, iOS tab-bar proportions. */
export default function AppTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabList
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.separator,
            paddingBottom: Math.max(insets.bottom, space.sm),
          },
        ]}>
        <TabTrigger name="(home)" href="/" asChild>
          <TabButton icon="home" label="Home" />
        </TabTrigger>
        <TabTrigger name="history" href="/history" asChild>
          <TabButton icon="history" label="History" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <TabButton icon="profile" label="Profile" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

type ButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

// React 19: `ref` arrives as a regular prop.
function TabButton({ icon, label, isFocused, ref, ...props }: ButtonProps) {
  const { colors } = useTheme();
  const tint = isFocused ? colors.accent : colors.label3;
  return (
    <Pressable
      {...props}
      // expo-router types the slot ref as the View component; at runtime it is the host instance.
      ref={ref as never}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.tab}>
      <Icon name={icon} size={24} color={tint} />
      <Text variant="caption" style={{ color: tint, fontSize: 10, lineHeight: 12 }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slot: { flex: 1 },
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: space.xs,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 49, cursor: 'pointer' },
});
