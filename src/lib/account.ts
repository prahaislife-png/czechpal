import { supabase } from '@/lib/supabase';

/**
 * Deletes the anonymous account on the server, with everything linked to it (the monthly count,
 * practice and office reports), then forgets the session on this device. The next server call
 * starts a fresh anonymous account. Nothing to do in demo mode or if the server was never used.
 */
export async function deleteServerData(): Promise<void> {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw new Error('Your data on the server couldn’t be deleted. Check your connection and try again.');
  // The account is already gone on the server, so only the local session needs clearing.
  await supabase.auth.signOut({ scope: 'local' });
}
