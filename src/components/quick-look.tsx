import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { QuickTranslation } from '@/lib/ai';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

export type QuickLookState =
  | { state: 'consent'; uri: string }
  | { state: 'loading'; uri: string }
  | { state: 'done'; uri: string; result: QuickTranslation }
  | { state: 'error'; uri: string; message: string };

/**
 * What the camera saw, line by line: the Czech, then its translation. Sits at the top of Home's
 * panel. Explain takes the same photo on to the full explanation.
 */
export function QuickLook({
  look,
  onAllow,
  onExplain,
  onClose,
}: {
  look: QuickLookState;
  onAllow: () => void;
  onExplain: () => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <Icon name="translate" size={16} color={colors.label2} />
        <Text variant="footnote" weight="600" color="label2" style={styles.headText}>
          What it says
        </Text>
        <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close translation">
          <Icon name="close" size={16} color={colors.label3} />
        </Pressable>
      </View>

      {look.state === 'consent' ? (
        <View style={styles.body}>
          <Text variant="callout" color="label2">
            Translating sends this photo to the AI service that reads it for CzechPal. Nothing is kept.
          </Text>
          <Button label="Allow and translate" size="medium" onPress={onAllow} style={styles.start} />
        </View>
      ) : look.state === 'loading' ? (
        <View style={styles.loading} accessibilityLiveRegion="polite">
          <ActivityIndicator color={colors.accent} />
          <Text variant="callout" color="label2">
            Reading…
          </Text>
        </View>
      ) : look.state === 'error' ? (
        <Text variant="callout" color="danger" accessibilityLiveRegion="polite">
          {look.message}
        </Text>
      ) : look.result.status === 'no_text' ? (
        <Text variant="callout" color="label2" accessibilityLiveRegion="polite">
          No Czech text found. Get a little closer, or try more light.
        </Text>
      ) : (
        <View style={styles.body}>
          <View style={styles.lines} accessibilityLiveRegion="polite">
            {look.result.lines.map((line, i) => (
              <View key={`${i}-${line.cs}`} style={[styles.line, i > 0 && { borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text variant="subhead" color="label2" selectable>
                  {line.cs}
                </Text>
                <Text variant="headline" selectable>
                  {line.translated}
                </Text>
              </View>
            ))}
          </View>
          <Button label="Explain this" icon="document" variant="secondary" size="medium" onPress={onExplain} style={styles.start} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  headText: { flex: 1 },
  body: { gap: space.lg },
  loading: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 44 },
  lines: {},
  line: { gap: 2, paddingVertical: space.sm },
  start: { alignSelf: 'flex-start' },
});
