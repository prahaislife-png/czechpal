import { createClient } from 'npm:@supabase/supabase-js@2';

import { hangupLiveSession } from '../_shared/openai-live.ts';
import { billedSeconds, GRACE_SECONDS } from '../_shared/speak-policy.ts';

/**
 * POST /speak-sweep (every minute, from pg_cron)
 * Hangs up every Speak Czech session that has run past its limit, so a lost or misbehaving app can
 * never keep a voice session (and its cost) running. It needs no user: it can only end sessions
 * that are already overdue, and it returns nothing but a count. Deploy with --no-verify-jwt.
 */

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

Deno.serve(async () => {
  // Nothing can be overdue before the longest session plus its grace has passed.
  const { data, error } = await admin
    .from('speak_sessions')
    .select('id, created_at, limit_seconds, provider_session_id')
    .in('status', ['starting', 'active'])
    .lt('created_at', new Date(Date.now() - GRACE_SECONDS * 1000).toISOString())
    .limit(100);
  if (error) {
    console.error('speak-sweep: read failed', error.message);
    return Response.json({ closed: 0 }, { status: 500 });
  }
  let closed = 0;
  for (const row of data ?? []) {
    const deadline = Date.parse(row.created_at) + (row.limit_seconds + GRACE_SECONDS) * 1000;
    if (Date.now() < deadline) continue;
    const hungUp = row.provider_session_id ? await hangupLiveSession(row.provider_session_id) : true;
    const now = Date.now();
    // Not confirmed: try again next minute, but give up after ten so a dead id can't loop forever.
    if (!hungUp && now < deadline + 10 * 60_000) continue;
    await admin
      .from('speak_sessions')
      .update({
        status: 'ended',
        ended_at: new Date(now).toISOString(),
        billed_seconds: billedSeconds(Date.parse(row.created_at), now, row.limit_seconds),
        end_reason: 'time limit (server)',
        hangup_confirmed: hungUp,
      })
      .eq('id', row.id)
      .in('status', ['starting', 'active']);
    closed++;
  }
  return Response.json({ closed });
});
