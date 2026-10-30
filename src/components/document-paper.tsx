import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/use-theme';

type Props = {
  text: string;
  /** Clamp for previews; omit to show the full document. */
  maxLines?: number;
  size?: 'small' | 'regular';
  selectable?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** A document as the user received it: warm paper, ink text. Document previews use radius 14. */
export function DocumentPaper({ text, maxLines, size = 'regular', selectable, style }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.paper,
        size === 'small' && styles.small,
        { backgroundColor: colors.paper, borderColor: colors.separator, boxShadow: colors.shadow },
        style,
      ]}>
      <Text
        variant={size === 'small' ? 'caption' : 'callout'}
        weight="400"
        color="paperInk"
        numberOfLines={maxLines}
        selectable={selectable}
        style={size === 'small' ? styles.smallText : styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    borderRadius: radius.tile,
    borderCurve: 'continuous',
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.xl,
  },
  small: { padding: space.md },
  text: { lineHeight: 24 },
  smallText: { fontSize: 10, lineHeight: 14 },
});
