import { Stack } from 'expo-router';

import { largeTitleOptions, stackOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

// Deep links to a category or provider land with the Help list underneath.
export const unstable_settings = { anchor: 'index' };

export default function HelpStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackOptions(colors)}>
      <Stack.Screen name="index" options={{ ...largeTitleOptions(colors), title: 'Help' }} />
      <Stack.Screen name="[category]" options={{ title: '' }} />
      <Stack.Screen name="find/[kind]" options={{ title: '' }} />
      <Stack.Screen name="urgent" options={{ title: 'After-hours care' }} />
      <Stack.Screen name="offices/index" options={{ title: 'Immigration offices' }} />
      <Stack.Screen name="offices/[id]" options={{ title: '' }} />
      <Stack.Screen name="checklists/index" options={{ title: 'What do I need?' }} />
      <Stack.Screen name="checklists/[id]" options={{ title: '' }} />
      <Stack.Screen name="practice/[id]" options={{ title: '' }} />
      <Stack.Screen name="provider/[id]" options={{ title: '' }} />
    </Stack>
  );
}
