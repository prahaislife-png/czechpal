import { useIncomingShare } from 'expo-sharing';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { draftFromShare, pickSharedItem, replaceWithReview } from '@/lib/capture';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

/**
 * Reads what another app shared (native share extension / share intent), turns it into a draft
 * and replaces itself with the next screen, so back never returns here.
 * Web has its own file: receiving shares isn't supported there.
 */
export function ShareIntake({ fallback }: { fallback: React.ReactNode }) {
  const { colors } = useTheme();
  const { resolvedSharedPayloads, isResolving, error, clearSharedPayloads } = useIncomingShare();
  const handled = useRef(false);

  useEffect(() => {
    if (isResolving || handled.current) return;
    const item = pickSharedItem(resolvedSharedPayloads);
    if (!item) return;
    handled.current = true;
    const id = draftFromShare(item);
    clearSharedPayloads();
    replaceWithReview(id);
  }, [isResolving, resolvedSharedPayloads, clearSharedPayloads]);

  if (!isResolving && (error || !pickSharedItem(resolvedSharedPayloads))) return fallback;

  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator color={colors.accent} />
      <Text variant="callout" color="label2">
        Opening what you shared…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg },
});
