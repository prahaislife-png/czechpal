import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { space } from '@/theme/tokens';

/**
 * A screen's editorial opening: a small eyebrow, a Newsreader headline, an optional lead.
 * One per screen, at the top of the content.
 */
export function EditorialHeading({
  eyebrow,
  title,
  lead,
  size = 'large',
  style,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  size?: 'large' | 'medium';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.root, style]}>
      {eyebrow ? (
        <Text variant="footnote" weight="600" color="label3" style={styles.eyebrow}>
          {eyebrow.toUpperCase()}
        </Text>
      ) : null}
      <Text variant={size === 'large' ? 'largeTitle' : 'title1'} accessibilityRole="header">
        {title}
      </Text>
      {lead ? (
        <Text variant="callout" color="label2">
          {lead}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: space.xs },
  eyebrow: { letterSpacing: 0.8 },
});
