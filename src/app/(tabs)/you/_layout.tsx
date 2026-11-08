import { Stack } from 'expo-router';

import { largeTitleOptions, stackOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

// Deep links to History or Settings land with You underneath.
export const unstable_settings = { anchor: 'index' };

/** You: reminders, history, saved places, preferences and privacy. */
export default function YouStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackOptions(colors)}>
      <Stack.Screen name="index" options={{ ...largeTitleOptions(colors), title: 'You' }} />
      <Stack.Screen name="history" options={{ title: 'History' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
