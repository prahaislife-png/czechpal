import { Alert } from 'react-native';

const isWeb = process.env.EXPO_OS === 'web';

/**
 * Destructive confirmations only (everything else is inline state).
 * Native alert on device; the browser's dialog on web, where RN's Alert is a no-op.
 */
export function confirm(opts: {
  title: string;
  message?: string;
  confirmLabel: string;
  destructive?: boolean;
}): Promise<boolean> {
  if (isWeb) {
    return Promise.resolve(window.confirm([opts.title, opts.message].filter(Boolean).join('\n\n')));
  }
  return new Promise((resolve) =>
    Alert.alert(opts.title, opts.message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: opts.confirmLabel, style: opts.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]),
  );
}
