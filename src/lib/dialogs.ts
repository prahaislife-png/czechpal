import { ActionSheetIOS, Alert } from 'react-native';

const isWeb = process.env.EXPO_OS === 'web';

/**
 * Asks before throwing away what someone typed. iOS uses an action sheet, as the HIG suggests
 * for unsaved changes; elsewhere an alert. Resolves true to discard.
 */
export function confirmDiscard(copy: { title: string; message: string }): Promise<boolean> {
  if (isWeb) return Promise.resolve(window.confirm(`${copy.title}\n\n${copy.message}`));
  if (process.env.EXPO_OS === 'ios') {
    return new Promise((resolve) =>
      ActionSheetIOS.showActionSheetWithOptions(
        { title: copy.title, message: copy.message, options: ['Discard', 'Keep Editing'], destructiveButtonIndex: 0, cancelButtonIndex: 1 },
        (index) => resolve(index === 0),
      ),
    );
  }
  return new Promise((resolve) =>
    Alert.alert(copy.title, copy.message, [
      { text: 'Keep Editing', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Discard', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

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
