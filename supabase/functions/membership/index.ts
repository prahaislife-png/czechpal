import { withSupabase } from 'npm:@supabase/server@1';

import { fail } from '../_shared/claude.ts';
import { checkWithStore } from '../_shared/membership.ts';

/**
 * POST /membership → { plus, until }
 * The app calls this when the store tells it Plus has started, renewed or ended. The server asks
 * the store itself, so an app can't simply claim Plus, and remembers the answer for explanations.
 */
export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');
    try {
      return Response.json(await checkWithStore(ctx.supabaseAdmin, userId));
    } catch (e) {
      console.error('membership check failed', e instanceof Error ? e.message : e);
      return fail(503, 'store_unreachable', 'The store couldn’t be reached. Please try again in a minute.');
    }
  }),
};
