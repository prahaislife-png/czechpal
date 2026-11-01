import { useSyncExternalStore } from 'react';
import { AccessibilityInfo, Platform, useWindowDimensions } from 'react-native';

/**
 * True at the larger accessibility text sizes. HIG: "horizontal views may stack; rows/containers
 * may grow to avoid clipping/overlap and allow multiple lines."
 */
export const useLargeText = () => useWindowDimensions().fontScale >= 1.6;

/**
 * Reads a status or error aloud with VoiceOver. `accessibilityLiveRegion` only works on Android,
 * so on iOS every message that appears on screen without moving focus has to be announced.
 */
export function announce(message: string) {
  if (Platform.OS !== 'ios' || !message.trim()) return;
  AccessibilityInfo.announceForAccessibility(message);
}

/*
 * Increase Contrast (iOS "darker system colors"): read once, then follow changes. Other platforms
 * have no equivalent setting here and always report false.
 */
let increaseContrast = false;
const listeners = new Set<() => void>();
if (Platform.OS === 'ios') {
  AccessibilityInfo.isDarkerSystemColorsEnabled().then((on) => {
    increaseContrast = on;
    listeners.forEach((l) => l());
  });
  AccessibilityInfo.addEventListener('darkerSystemColorsChanged', (on) => {
    increaseContrast = on;
    listeners.forEach((l) => l());
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useIncreaseContrast = () => useSyncExternalStore(subscribe, () => increaseContrast, () => false);
