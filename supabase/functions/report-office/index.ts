import { withSupabase } from 'npm:@supabase/server@1';

import { fail } from '../_shared/claude.ts';

/**
 * POST /report-office
 * { officeId, booked: boolean, wait?: 'under30'|'30to60'|'1to2h'|'over2h', ticketsGone?: boolean }
 *
 * How long someone waited at an immigration office today, or that walk-in tickets had run out.
 * At most one report per office per person every 2 hours, and DAILY_LIMIT a day.
 * Returns the office's updated summary for today.
 */

const DAILY_LIMIT = 10;
const OFFICES = ['zukovskeho', 'chodov', 'hladkov', 'kolbenova', 'pekarska', 'specialised'] as const;
const WAITS = ['under30', '30to60', '1to2h', 'over2h'] as const;

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'Nothing was sent.');
    }
    const officeId = OFFICES.find((o) => o === body.officeId);
    const wait = body.wait === undefined || body.wait === null ? null : WAITS.find((w) => w === body.wait);
    const booked = body.booked;
    const ticketsGone = body.ticketsGone === true;
    if (!officeId || typeof booked !== 'boolean' || wait === undefined || (body.ticketsGone !== undefined && typeof body.ticketsGone !== 'boolean')) {
      return fail(400, 'bad_request', 'Some answers weren’t understood. Please update the app.');
    }
    if (!wait && !ticketsGone) return fail(400, 'empty', 'Say how long you waited, or that tickets had run out.');
    if (booked && ticketsGone) return fail(400, 'bad_request', 'Running out of tickets only affects people without a booking.');

    const admin = ctx.supabaseAdmin;
    const since = (hours: number) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

    const [{ count: recentHere, error: e1 }, { count: today, error: e2 }] = await Promise.all([
      admin.from('office_reports').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('office_id', officeId).gte('created_at', since(2)),
      admin.from('office_reports').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', since(24)),
    ]);
    if (e1 || e2) return fail(500, 'server', 'Something went wrong. Please try again.');
    if ((recentHere ?? 0) > 0) return fail(429, 'too_soon', 'Thanks, you already reported this office in the last 2 hours.');
    if ((today ?? 0) >= DAILY_LIMIT) return fail(429, 'rate_limited', 'You’ve sent a lot of reports today. Thank you! Try again tomorrow.');

    const { error: saveError } = await admin.from('office_reports').insert({ office_id: officeId, user_id: userId, booked, wait, tickets_gone: ticketsGone });
    if (saveError) {
      console.error('saving office report failed', saveError.message);
      return fail(500, 'server', 'Your report couldn’t be saved. Please try again.');
    }

    const { data, error } = await admin.rpc('office_waits_today');
    if (error) return fail(500, 'server', 'Saved, but the page couldn’t be refreshed.');
    const status = (data as { office_id: string }[] | null)?.find((r) => r.office_id === officeId) ?? null;
    return Response.json({ status });
  }),
};
