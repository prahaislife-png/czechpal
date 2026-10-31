import { withSupabase } from 'npm:@supabase/server@1';

import { fail } from '../_shared/claude.ts';

/**
 * POST /report-provider
 * { providerId, newPatients?: 'yes'|'no', english?: 'good'|'basic'|'none', extraFee?: 'yes'|'no', insurer?: '111'|… }
 *
 * What a CzechPal user found out about a practice. One report per person per practice per day
 * (sending again that day corrects it), at most DAILY_LIMIT reports per person per day.
 * Returns the practice's updated public summary.
 */

const DAILY_LIMIT = 20;
const ENGLISH = ['good', 'basic', 'none'] as const;
const YES_NO = ['yes', 'no'] as const;
const INSURERS = ['111', '201', '205', '207', '209', '211', '213'] as const;

const pick = <T extends string>(allowed: readonly T[], v: unknown): T | null | undefined =>
  v === undefined || v === null ? null : allowed.find((a) => a === v);

/** The summary columns the app shows; never the individual reports. */
export const STATUS_COLUMNS =
  'id, new_patients, new_patients_at, new_patients_yes, new_patients_no, english, english_at, extra_fee, extra_fee_at, insurers, reports, last_report_at';

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
    const providerId = Number(body.providerId);
    const newPatients = pick(YES_NO, body.newPatients);
    const english = pick(ENGLISH, body.english);
    const extraFee = pick(YES_NO, body.extraFee);
    const insurer = pick(INSURERS, body.insurer);
    if (!Number.isSafeInteger(providerId) || providerId <= 0) return fail(400, 'bad_request', 'Unknown practice.');
    if (newPatients === undefined || english === undefined || extraFee === undefined || insurer === undefined) {
      return fail(400, 'bad_request', 'Some answers weren’t understood. Please update the app.');
    }
    if (!newPatients && !english && !extraFee) return fail(400, 'empty', 'Answer at least one question.');

    const admin = ctx.supabaseAdmin;
    const { data: provider, error: providerError } = await admin.from('providers').select('id').eq('id', providerId).eq('removed', false).maybeSingle();
    if (providerError) return fail(500, 'server', 'Something went wrong. Please try again.');
    if (!provider) return fail(404, 'not_found', 'This practice is no longer listed.');

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error: countError } = await admin
      .from('provider_reports')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since);
    if (countError) return fail(500, 'server', 'Something went wrong. Please try again.');
    if ((count ?? 0) >= DAILY_LIMIT) return fail(429, 'rate_limited', 'You’ve sent a lot of reports today. Thank you! Try again tomorrow.');

    // A second report the same day corrects the first; answers it leaves out are kept.
    const reportDay = new Date().toISOString().slice(0, 10);
    const { data: earlier } = await admin
      .from('provider_reports')
      .select('new_patients, english, extra_fee, insurer')
      .eq('provider_id', providerId)
      .eq('user_id', userId)
      .eq('report_day', reportDay)
      .maybeSingle();
    const { error: saveError } = await admin.from('provider_reports').upsert(
      {
        provider_id: providerId,
        user_id: userId,
        report_day: reportDay,
        created_at: new Date().toISOString(),
        new_patients: newPatients ?? earlier?.new_patients ?? null,
        english: english ?? earlier?.english ?? null,
        extra_fee: extraFee ?? earlier?.extra_fee ?? null,
        insurer: insurer ?? earlier?.insurer ?? null,
      },
      { onConflict: 'provider_id,user_id,report_day' },
    );
    if (saveError) {
      console.error('saving report failed', saveError.message);
      return fail(500, 'server', 'Your report couldn’t be saved. Please try again.');
    }

    const { error: refreshError } = await admin.rpc('refresh_provider_status', { p_provider: providerId });
    if (refreshError) console.error('refresh_provider_status failed', refreshError.message);

    const { data: status, error: statusError } = await admin.from('providers').select(STATUS_COLUMNS).eq('id', providerId).single();
    if (statusError) return fail(500, 'server', 'Saved, but the page couldn’t be refreshed.');
    return Response.json({ status });
  }),
};
