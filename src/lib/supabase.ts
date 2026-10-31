import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Live AI is on when the app is configured for a Supabase project; otherwise it runs in demo mode. */
export const isBackendConfigured = !!url && !!publishableKey;

// The publishable key is designed to ship inside apps; secrets live only in Supabase.
export const supabase = isBackendConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        // An anonymous session holds no personal data, so plain storage is enough.
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (supabase && process.env.EXPO_OS !== 'web') {
  // Refresh the session only while the app is in the foreground.
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

/** Every device gets an anonymous account on first use: no sign-up screen, but server-side limits work. */
export async function ensureSession() {
  if (!supabase) throw new Error('Backend not configured');
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const { data: signedIn, error } = await supabase.auth.signInAnonymously();
  if (error || !signedIn.session) throw error ?? new Error('Anonymous sign-in failed');
  return signedIn.session;
}
