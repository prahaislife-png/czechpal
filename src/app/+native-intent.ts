/**
 * Content shared into CzechReply (share extension on iOS, share intent on Android) arrives as an
 * `expo-sharing` URL. Send it to the handler screen; every other link passes through untouched.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (new URL(path).hostname === 'expo-sharing') return '/handle-share';
  } catch {
    // Relative paths aren't URLs; they are normal in-app links.
  }
  return path;
}
