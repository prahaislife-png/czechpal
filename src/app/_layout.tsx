import '@/global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useStore } from '@/store/cases';
import { stackOptions } from '@/theme/navigation';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { scheme, colors } = useTheme();
  const hydrated = useStore((s) => s.hydrated);
  const onboarded = useStore((s) => s.onboarded);

  // Hold the splash until persisted state is known — never flash Welcome before Home.
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

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
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="review/[id]" options={{ title: 'Check your message' }} />
              <Stack.Screen name="case/[id]" options={{ title: '' }} />
              <Stack.Screen name="reply/[id]" options={{ presentation: 'modal', title: 'Write a reply' }} />
              <Stack.Screen name="paste" options={{ presentation: 'modal', title: 'Paste a message' }} />
            </Stack.Protected>
          </Stack>
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, alignItems: 'center' },
  // Phones fill the screen; tablets and desktop web get a readable column.
  column: { flex: 1, width: '100%', maxWidth: process.env.EXPO_OS === 'web' ? layout.maxWidth : undefined },
});
