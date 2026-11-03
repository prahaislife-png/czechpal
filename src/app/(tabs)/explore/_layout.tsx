import { Stack } from 'expo-router';

import { stackOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

// A deep link to a place lands with the map underneath.
export const unstable_settings = { anchor: 'index' };

export default function ExploreStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackOptions(colors)}>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Explore' }} />
      <Stack.Screen name="place/[id]" options={{ title: '' }} />
    </Stack>
  );
}
