import { router, type ErrorBoundaryProps } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Shown when a screen throws while drawing, instead of a blank screen or a closed app. Plain
 * React Native parts only: it has to work even when the thing that broke is one of the app's own
 * components. Nothing saved on the phone is touched by a crash, and the screen says so.
 */
export function CrashScreen({ error, retry }: ErrorBoundaryProps) {
  const { colors } = useTheme();
  // A screen that keeps failing would trap "Try again", so there is always a way back to the start.
  const startAgain = () => {
    try {
      router.replace('/');
    } catch {
      // Navigation isn't up: retrying is all that's left.
    }
    retry();
  };
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} accessibilityRole="alert">
      <Text style={[styles.title, { color: colors.label }]} accessibilityRole="header">
        Something went wrong
      </Text>
      <Text style={[styles.body, { color: colors.label2 }]}>
        This screen hit a problem. Your letters, words and progress are saved on this phone and haven’t been touched.
      </Text>
      {__DEV__ ? (
        <Text style={[styles.detail, { color: colors.label2 }]} selectable>
          {error.message}
        </Text>
      ) : null}
      <Pressable
        onPress={retry}
        accessibilityRole="button"
        style={({ pressed }) => [styles.button, { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>Try again</Text>
      </Pressable>
      <Pressable onPress={startAgain} accessibilityRole="button" hitSlop={8} style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}>
        <Text style={[styles.linkLabel, { color: colors.accent }]}>Go to the start</Text>
      </Pressable>
      <Text style={[styles.hint, { color: colors.label2 }]}>If it keeps happening, close CzechLocal and open it again.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 23, textAlign: 'center', maxWidth: 420 },
  detail: { fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 420 },
  button: { minHeight: 50, minWidth: 180, paddingHorizontal: space.xxl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  buttonLabel: { fontSize: 17, fontWeight: '600' },
  link: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.lg },
  linkLabel: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 13, lineHeight: 18, textAlign: 'center', maxWidth: 420 },
});
