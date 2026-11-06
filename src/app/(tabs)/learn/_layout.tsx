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
      <Stack.Screen name="academy" options={{ title: 'A2 Academy' }} />
      <Stack.Screen name="topics" options={{ title: 'Topics' }} />
      <Stack.Screen name="topic/[id]" options={{ title: '' }} />
      <Stack.Screen name="grammar/index" options={{ title: 'Grammar' }} />
      <Stack.Screen name="grammar/[id]" options={{ title: '' }} />
      <Stack.Screen name="exam" options={{ title: 'The A2 exam' }} />
      <Stack.Screen name="practice" options={{ title: 'Exam practice' }} />
    </Stack>
  );
}
