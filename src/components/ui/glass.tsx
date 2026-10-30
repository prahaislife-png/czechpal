import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { camera } from '@/theme/tokens';

// Liquid Glass only exists on iOS 26+; some iOS 26 betas lack the API and crash, so check both.
const hasGlass = process.env.EXPO_OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

/**
 * Chrome floating over live camera content. Blur is earned here (6.3): it sits on media, not on cards.
 * Elsewhere a dark translucent fill stands in.
 */
export function GlassSurface({ style, children }: { style?: StyleProp<ViewStyle>; children?: React.ReactNode }) {
  if (hasGlass) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" isInteractive style={style}>
        {children}
      </GlassView>
    );
  }
  return <View style={[styles.fallback, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: camera.glass },
});
