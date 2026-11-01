import { withSupabase } from 'npm:@supabase/server@1';

import { fail } from '../_shared/claude.ts';

/**
 * POST /delete-account
 * Deletes the caller's anonymous account and everything linked to it: the monthly count
 * (usage), free-retry records (analysis_charges), and their practice and office reports, all of
 * which cascade with the account. The cost log (ai_calls) holds no content; it keeps its rows
 * without the link to the account (on delete set null).
 * Practices the user reported on get their public summary recomputed without those reports.
 */

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');
    const admin = ctx.supabaseAdmin;

    // Read first: once the account is gone, its reports are too.
    const { data: reported, error: readError } = await admin.from('provider_reports').select('provider_id').eq('user_id', userId);
    if (readError) {
      console.error('delete-account: reading reports failed', readError.message);
      return fail(500, 'server', 'Your data couldn’t be deleted. Please try again.');
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error('delete-account: deleteUser failed', deleteError.message);
      return fail(500, 'server', 'Your data couldn’t be deleted. Please try again.');
    }

    for (const providerId of new Set((reported ?? []).map((r) => r.provider_id as number))) {
      const { error } = await admin.rpc('refresh_provider_status', { p_provider: providerId });
      if (error) console.error('delete-account: refresh_provider_status failed', providerId, error.message);
    }

    return Response.json({ deleted: true });
  }),
};
