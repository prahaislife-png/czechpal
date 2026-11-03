import { Stack } from 'expo-router';

import { largeTitleOptions, stackOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

// A deep link to Your words lands with Learn underneath.
export const unstable_settings = { anchor: 'index' };

export default function LearnStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackOptions(colors)}>
      <Stack.Screen name="index" options={{ ...largeTitleOptions(colors), title: 'Learn' }} />
      <Stack.Screen name="words" options={{ title: 'Your words' }} />
      <Stack.Screen name="missions" options={{ title: 'Missions' }} />
      <Stack.Screen name="progress" options={{ title: 'Progress' }} />
    </Stack>
  );
}
