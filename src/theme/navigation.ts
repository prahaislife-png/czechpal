import type { NativeStackNavigationOptions } from 'expo-router';

import type { Palette } from './tokens';

const isIOS = process.env.EXPO_OS === 'ios';

export function stackOptions(colors: Palette): NativeStackNavigationOptions {
  return {
    headerTintColor: colors.accent,
    headerTitleStyle: { color: colors.label, fontWeight: '600' },
    headerStyle: { backgroundColor: colors.background },
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: colors.background },
  };
}

/** Large-title tab roots: translucent, collapsing navigation bar on iOS. */
export function largeTitleOptions(colors: Palette): NativeStackNavigationOptions {
  return {
    ...stackOptions(colors),
    headerLargeTitle: true,
    headerTransparent: isIOS,
    headerBlurEffect: isIOS ? 'systemChromeMaterial' : undefined,
    headerLargeStyle: { backgroundColor: 'transparent' },
    headerLargeTitleShadowVisible: false,
    headerLargeTitleStyle: { color: colors.label },
    headerStyle: isIOS ? undefined : { backgroundColor: colors.background },
  };
}
