import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

import { Icon } from './icon';
import { Text } from './text';

/** Text bar button for modal headers (Close / Cancel). Native headers pad it; web needs our own inset. */
export function HeaderTextButton({ label, onPress = () => router.back() }: { label: string; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text variant="body" color="accent" chrome>
        {label}
      </Text>
    </Pressable>
  );
}

/** The standard Close symbol (xmark) for modal headers, named for VoiceOver and Voice Control. */
export function HeaderCloseButton({ onPress = () => router.back() }: { onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Close"
      style={({ pressed }) => [styles.icon, pressed && styles.pressed]}>
      <Icon name="close" size={20} color={colors.label2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  button: { paddingHorizontal: process.env.EXPO_OS === 'web' ? space.lg : 0 },
  pressed: { opacity: 0.4 },
});
