import { withSupabase } from 'npm:@supabase/server@1';

import { FREE_LIMIT, LIMIT_REACHED_MESSAGE } from '../_shared/allowance.ts';
import { aboutReader, parseInput } from '../_shared/analyze-input.ts';
import { AiError, callStructured, claimCall, fail, logCall, type Claim, type Usage } from '../_shared/claude.ts';
import { FORM_SYSTEM, formContent, formGuideOutputSchema, validateFormGuide } from '../_shared/form-guide.ts';
import { languageName } from '../_shared/languages.ts';
import { hasPlus } from '../_shared/membership.ts';

/**
 * POST /form-guide with the same body as /analyze (a photo, pages, a PDF or pasted text)
 * optional: language, about, stream (true: NDJSON, "delta" lines then "done" or "error")
 *
 * A Czech form walked through field by field. It counts as one explanation of the month (none
 * with CzechLocal Plus) and is given back when the guide fails or the photo isn't a form.
 * Nothing of the form is stored; only the call's size and result are logged.
 */

/** Explanations, form guides, replies and new messages together, per minute. */
const PER_MINUTE = 6;
const PER_DAY = 20;

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'The form didn’t arrive. Try again.');
    }
    const input = parseInput(body);
    if (input instanceof Response) return input;
    const language = languageName(body.language);
    const about = aboutReader(body.about);

    const admin = ctx.supabaseAdmin;
    let claim: Claim;
    try {
      const claimed = await claimCall(admin, userId, 'form', { perMinute: PER_MINUTE, perDay: PER_DAY });
      if ('limited' in claimed) {
        return claimed.limited === 'minute'
          ? fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.')
          : fail(429, 'rate_limited', 'That’s a lot of forms for one day. Try again tomorrow.');
      }
      claim = claimed;
    } catch (e) {
      if (e instanceof AiError) return fail(e.status, e.code, e.message);
      throw e;
    }

    // Plus: no monthly count, so nothing is reserved and there is nothing to give back.
    const plus = await hasPlus(admin, userId);
    let remaining = FREE_LIMIT;
    if (!plus) {
      const { data, error } = await admin.rpc('reserve_analysis', { p_user: userId, p_limit: FREE_LIMIT });
      if (error) {
        console.error('reserving a form guide failed', error.message);
        await logCall(admin, { userId, kind: 'form', ok: false, error: 'reserve_failed', claim });
        return fail(500, 'server', 'Something went wrong. Please try again.');
      }
      if (data < 0) {
        await logCall(admin, { userId, kind: 'form', ok: false, error: 'limit_reached', claim });
        return fail(402, 'limit_reached', LIMIT_REACHED_MESSAGE);
      }
      remaining = data;
    }
    const refund = async () => {
      if (!plus) await admin.rpc('refund_analysis', { p_user: userId });
    };
    // The app may give up (timeout, closed app, lost signal). Then stop paying for the answer and refund it.
    const gone = new AbortController();
    req.signal.addEventListener('abort', () => gone.abort());

    const guideIt = async (onText?: (delta: string) => void): Promise<Outcome> => {
      let usage: Usage | undefined;
      try {
        const result = await callStructured({ system: FORM_SYSTEM, content: formContent(input, language, about), schema: formGuideOutputSchema, onText, signal: gone.signal });
        usage = result.usage;
        const out = validateFormGuide(result.json);
        if (out.status !== 'ok') {
          await refund(); // a photo that isn't a form, or can't be read, costs nothing
          await logCall(admin, { userId, kind: 'form', ok: false, usage, error: out.status, claim });
          return {
            error:
              out.status === 'not_a_form'
                ? { status: 422, code: 'not_a_form', message: 'This doesn’t look like a form to fill in. To understand a letter or a bill, use Explain instead.' }
                : out.status === 'not_czech'
                  ? { status: 422, code: 'not_czech', message: 'This doesn’t look like Czech. CzechLocal guides you through forms written in Czech.' }
                  : { status: 422, code: 'unreadable', message: 'The form is hard to read. Try again closer, in good light, with the whole page in the frame.' },
          };
        }
        await logCall(admin, { userId, kind: 'form', ok: true, usage, claim });
        return { result: { guide: out.guide, remaining, limit: FREE_LIMIT, plus } };
      } catch (e) {
        await refund();
        const known = e instanceof AiError;
        await logCall(admin, {
          userId,
          kind: 'form',
          ok: false,
          usage: (e as { usage?: Usage }).usage ?? usage,
          error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output',
          claim,
        });
        if (known) return { error: { status: e.status, code: e.code, message: e.message } };
        console.error('form-guide failed', e);
        return { error: { status: 502, code: 'ai_error', message: 'The guide didn’t come out right. Please try again.' } };
      }
    };

    if (body.stream !== true) {
      const outcome = await guideIt();
      return 'result' in outcome ? Response.json(outcome.result) : fail(outcome.error.status, outcome.error.code, outcome.error.message);
    }

    // Streaming keeps the connection alive while a long form is worked through: "delta" lines as
    // the guide is written, then "done" with the checked guide, the only one the app keeps.
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (line: Record<string, unknown>) => {
          if (gone.signal.aborted) return;
          try {
            controller.enqueue(encoder.encode(JSON.stringify(line) + '\n'));
          } catch {
            gone.abort(); // the app has disconnected
          }
        };
        const outcome = await guideIt((text) => send({ type: 'delta', text }));
        send('result' in outcome ? { type: 'done', ...outcome.result } : { type: 'error', code: outcome.error.code, message: outcome.error.message });
        if ('result' in outcome && gone.signal.aborted) await refund();
        try {
          controller.close();
        } catch {
          // Already closed by a disconnect.
        }
      },
      cancel() {
        gone.abort();
      },
    });
    return new Response(stream, { headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' } });
  }),
};

type Outcome = { result: { guide: unknown; remaining: number; limit: number; plus: boolean } } | { error: { status: number; code: string; message: string } };
