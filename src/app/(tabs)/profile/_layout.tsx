import { Stack } from 'expo-router';

import { largeTitleOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

export default function ProfileStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={largeTitleOptions(colors)}>
      <Stack.Screen name="index" options={{ title: 'Profile' }} />
    </Stack>
  );
}
