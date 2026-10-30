import { Stack } from 'expo-router';

import { stackOptions } from '@/theme/navigation';
import { useTheme } from '@/theme/use-theme';

export default function HomeStack() {
  const { colors } = useTheme();
  return (
    <Stack screenOptions={stackOptions(colors)}>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
    </Stack>
  );
}
