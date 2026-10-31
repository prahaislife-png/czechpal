import { StyleSheet, View } from 'react-native';

import { flag } from '@/theme/tokens';

/**
 * The CzechPal mark: the Czech flag, drawn natively, inside a speech-bubble silhouette
 * (rounded square with a squared-off bottom-left corner).
 */
export function FlagMark({ size = 28 }: { size?: number }) {
  const r = size * 0.3;
  return (
    <View
      accessibilityLabel="CzechPal"
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderTopLeftRadius: r,
          borderTopRightRadius: r,
          borderBottomRightRadius: r,
          borderBottomLeftRadius: size * 0.08,
        },
      ]}>
      <View style={{ flex: 1, backgroundColor: flag.white }} />
      <View style={{ flex: 1, backgroundColor: flag.red }} />
      <View
        style={[
          styles.wedge,
          {
            borderTopWidth: size / 2,
            borderBottomWidth: size / 2,
            borderLeftWidth: size * 0.5,
            borderLeftColor: flag.blue,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    overflow: 'hidden',
    borderCurve: 'continuous',
    boxShadow: '0px 0px 0px 0.5px rgba(16, 24, 40, 0.18)',
  },
  wedge: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});
