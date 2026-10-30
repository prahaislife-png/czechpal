import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { space } from '@/theme/tokens';

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

const styles = StyleSheet.create({
  button: { paddingHorizontal: process.env.EXPO_OS === 'web' ? space.lg : 0 },
  pressed: { opacity: 0.4 },
});
