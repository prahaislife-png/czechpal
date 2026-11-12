import '@/global.css';

import { Newsreader_500Medium } from '@expo-google-fonts/newsreader/500Medium';
import { Newsreader_500Medium_Italic } from '@expo-google-fonts/newsreader/500Medium_Italic';
import { Newsreader_600SemiBold } from '@expo-google-fonts/newsreader/600SemiBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, router, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { CrashScreen } from '@/components/crash-screen';
import { reminderHref, useReminderTap } from '@/lib/reminders';
import { useStore } from '@/store/cases';
import { stackOptions } from '@/theme/navigation';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

SplashScreen.preventAutoHideAsync();

// Deep links to a case, review or reply land with Home underneath, so back always has somewhere to go.
export const unstable_settings = { anchor: '(tabs)' };

// Any screen without its own: a crash while drawing shows this instead of a blank screen.
export { CrashScreen as ErrorBoundary };

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.onboarded);
  // The display font: only three weights, so the splash waits for them. A failure falls back to the system font.
  const [fontsLoaded, fontError] = useFonts({ Newsreader_500Medium, Newsreader_500Medium_Italic, Newsreader_600SemiBold });
  const ready = hydrated && (fontsLoaded || !!fontError);

  // Hold the splash until persisted state and fonts are known — never flash Welcome before the app.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // The server decides the free allowance; refresh the app's copy once per launch.
  useEffect(() => {
    if (hydrated && onboarded) useStore.getState().syncAllowance();
  }, [hydrated, onboarded]);

  // A tapped reminder opens its letter, or About you for the permit. Waits until the app is ready.
  const openReminder = useCallback(
    (id: string) => {
      if (!hydrated || !onboarded) return false;
      const reminder = useStore.getState().reminders.find((r) => r.id === id);
      if (reminder) router.push(reminderHref(reminder));
      return true;
    },
    [hydrated, onboarded],
  );
  useReminderTap(openReminder);

  if (!ready) return null;

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.background,
      text: colors.label,
      border: colors.separator,
    },
  };

  return (
    <GestureHandlerRootView style={styles.gestures}>
      <ThemeProvider value={navTheme}>
        <StatusBar style="auto" />
        <View style={[styles.frame, { backgroundColor: colors.background }]}>
          <View style={styles.column}>
            <Stack screenOptions={stackOptions(colors)}>
              {/* One-way door: once onboarding completes, Welcome leaves the stack for good. */}
              <Stack.Protected guard={!onboarded}>
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
              </Stack.Protected>

              <Stack.Protected guard={onboarded}>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="camera"
                  options={{ presentation: 'fullScreenModal', headerShown: false, animation: process.env.EXPO_OS === 'web' ? 'none' : 'fade' }}
                />
                <Stack.Screen
                  name="scan"
                  // Fade into the camera on device; on web the fade leaves a stale transformed layer.
                  options={{ presentation: 'fullScreenModal', headerShown: false, animation: process.env.EXPO_OS === 'web' ? 'none' : 'fade' }}
                />
                <Stack.Screen name="review/[id]" options={{ title: 'Check the text' }} />
                <Stack.Screen name="case/[id]" options={{ title: '' }} />
                <Stack.Screen name="reply/[id]" options={{ presentation: 'modal', title: 'Write a reply' }} />
                <Stack.Screen name="paste" options={{ presentation: 'modal', title: 'Type or paste' }} />
                <Stack.Screen name="compose" options={{ presentation: 'modal', title: 'Write in Czech' }} />
                <Stack.Screen name="language" options={{ presentation: 'modal', title: 'Explanation language' }} />
                <Stack.Screen name="about" options={{ presentation: 'modal', title: 'About you' }} />
                <Stack.Screen name="lesson/[id]" options={{ title: '' }} />
                <Stack.Screen name="flashcards" options={{ presentation: 'fullScreenModal', title: 'Review' }} />
                <Stack.Screen name="listen" options={{ presentation: 'fullScreenModal', title: 'Listening' }} />
                <Stack.Screen name="learn-plan" options={{ presentation: 'modal', title: 'Your plan' }} />
                <Stack.Screen name="mission/[id]" options={{ title: '' }} />
                <Stack.Screen name="session" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="prepare/[id]" options={{ title: '' }} />
                <Stack.Screen name="dictionary" options={{ headerShown: false }} />
                <Stack.Screen name="a2-lesson/[id]" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="a2-task/[id]" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="a2-writing/[id]" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="a2-mock/[section]" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="a2-speaking/[id]" options={{ presentation: 'fullScreenModal', title: '' }} />
                <Stack.Screen name="speak/[situation]" options={{ presentation: 'fullScreenModal', title: '', gestureEnabled: false }} />
                <Stack.Screen name="a2-mistakes" options={{ presentation: 'fullScreenModal', title: 'Your mistakes' }} />
                <Stack.Screen name="practice-report/[id]" options={{ presentation: 'modal', title: 'What did you find out?' }} />
                <Stack.Screen name="office-report/[id]" options={{ presentation: 'modal', title: 'Waiting time today' }} />
                <Stack.Screen name="handle-share" options={{ headerShown: false, animation: 'none' }} />
              </Stack.Protected>
            </Stack>
          </View>
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestures: { flex: 1 },
  frame: { flex: 1, alignItems: 'center' },
  // Phones fill the screen; tablets and desktop web get a readable column.
  column: { flex: 1, width: '100%', maxWidth: process.env.EXPO_OS === 'web' ? layout.maxWidth : undefined },
});
