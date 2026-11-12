import { withSupabase } from 'npm:@supabase/server@1';

import { FREE_LIMIT } from '../_shared/allowance.ts';
import { fail } from '../_shared/claude.ts';
import { hasPlus } from '../_shared/membership.ts';

/**
 * POST /allowance → { limit, remaining, plus }
 * The user's free explanations this month, so the app shows the server's numbers, not a guess.
 */
export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');
    // With Plus nothing is counted: the month's allowance reads as untouched.
    if (await hasPlus(ctx.supabaseAdmin, userId)) return Response.json({ limit: FREE_LIMIT, remaining: FREE_LIMIT, plus: true });
    const { data, error } = await ctx.supabaseAdmin.rpc('remaining_analyses', { p_user: userId, p_limit: FREE_LIMIT });
    if (error) {
      console.error('remaining_analyses failed', error.message);
      return fail(500, 'server', 'Something went wrong. Please try again.');
    }
    return Response.json({ limit: FREE_LIMIT, remaining: data, plus: false });
  }),
};
