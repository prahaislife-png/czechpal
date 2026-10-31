import { withSupabase } from 'npm:@supabase/server@1';

import { analyzeOutputSchema, CATEGORIES, validateAnalyzeOutput } from '../_shared/analysis-schema.ts';
import { FREE_LIMIT, LIMIT_REACHED_MESSAGE } from '../_shared/allowance.ts';
import { parseInput, userContent, type Input } from '../_shared/analyze-input.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { languageName } from '../_shared/languages.ts';
import { ANALYZE_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /analyze with a body described in _shared/analyze-input.ts
 * optional: hint (a category), language (a code from _shared/languages.ts, default English),
 * stream (true: NDJSON as the explanation is written)
 *
 * Reserves one free explanation first and refunds it if the explanation fails.
 */


export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'Nothing to explain was sent.');
    }
    const input = parseInput(body);
    if (input instanceof Response) return input;
    const hint = CATEGORIES.find((c) => c === body.hint);
    // A code from a fixed list; free text here would end up inside the prompt.
    const language = languageName(body.language);

    const admin = ctx.supabaseAdmin;
    try {
      if (await isRateLimited(admin, userId)) return fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.');
    } catch (e) {
      if (e instanceof AiError) return fail(e.status, e.code, e.message);
      throw e;
    }

    // A retry of a case whose result never reached the app (same id, same content, within
    // 15 minutes) isn't charged again. See migrations/…_free_retry_after_lost_result.sql.
    const requestId = typeof body.requestId === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(body.requestId) ? body.requestId : null;
    const inputHash = requestId ? await fingerprint(input) : null;
    let free = false;
    if (requestId && inputHash) {
      const { data, error } = await admin.rpc('already_charged', { p_user: userId, p_request: requestId, p_hash: inputHash });
      if (error) console.error('already_charged failed', error.message);
      free = data === true;
    }

    const { data: remaining, error: reserveError } = free
      ? await admin.rpc('remaining_analyses', { p_user: userId, p_limit: FREE_LIMIT })
      : await admin.rpc('reserve_analysis', { p_user: userId, p_limit: FREE_LIMIT });
    if (reserveError) {
      console.error('reserving an explanation failed', reserveError.message);
      return fail(500, 'server', 'Something went wrong. Please try again.');
    }
    if (remaining < 0) {
      return fail(402, 'limit_reached', LIMIT_REACHED_MESSAGE);
    }

    // Gives the explanation back. A free retry reserved nothing, so there is nothing to give back.
    const refund = async () => {
      if (free) return;
      await admin.rpc('refund_analysis', { p_user: userId });
      if (requestId) await admin.rpc('forget_charge', { p_user: userId, p_request: requestId });
    };
    // The app may give up (timeout, closed app, lost signal). Then stop paying for the answer and refund it.
    const gone = new AbortController();
    req.signal.addEventListener('abort', () => gone.abort());

    /** The explanation itself; `onText` streams Claude's JSON as it is written. */
    const explain = async (onText?: (delta: string) => void): Promise<Outcome> => {
      let usage: Usage | undefined;
      try {
        const result = await callStructured({
          system: ANALYZE_SYSTEM,
          content: userContent(input, hint, language),
          schema: analyzeOutputSchema,
          onText,
          signal: gone.signal,
        });
        usage = result.usage;
        const out = validateAnalyzeOutput(result.json);

        if (out.status !== 'ok' || !out.analysis) {
          await refund(); // an unreadable photo doesn't use up an explanation
          await logCall(admin, { userId, kind: 'analyze', ok: false, usage, error: out.status });
          return out.status === 'not_czech'
            ? { error: { status: 422, code: 'not_czech', message: 'This doesn’t look like Czech. CzechPal explains text written in Czech.' } }
            : { error: { status: 422, code: 'unreadable', message: 'The photo is hard to read. Try again closer, in good light, with the whole text in the frame.' } };
        }

        await logCall(admin, { userId, kind: 'analyze', ok: true, usage, error: free ? 'free_retry' : undefined });
        if (requestId && inputHash && !free) {
          await admin.rpc('record_charge', { p_user: userId, p_request: requestId, p_hash: inputHash });
        }
        // Pasted text isn't echoed back by Claude (that would only slow it down); the server has it.
        const originalText = input.kind === 'text' ? input.text : out.originalText;
        return { result: { analysis: out.analysis, originalText, remaining, limit: FREE_LIMIT } };
      } catch (e) {
        await refund();
        const known = e instanceof AiError;
        await logCall(admin, {
          userId,
          kind: 'analyze',
          ok: false,
          usage: (e as { usage?: Usage }).usage ?? usage,
          error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output',
        });
        if (known) return { error: { status: e.status, code: e.code, message: e.message } };
        console.error('analyze failed', e);
        return { error: { status: 502, code: 'ai_error', message: 'The explanation didn’t come out right. Please try again.' } };
      }
    };

    if (body.stream !== true) {
      const outcome = await explain();
      return 'result' in outcome ? Response.json(outcome.result) : fail(outcome.error.status, outcome.error.code, outcome.error.message);
    }

    // Streaming: one JSON object per line. "delta" lines carry Claude's raw JSON as it is
    // written (for showing early); the final "done" line carries the validated result, which
    // is the only one the app keeps. Errors after the stream has started arrive as "error".
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
        const outcome = await explain((text) => send({ type: 'delta', text }));
        send('result' in outcome ? { type: 'done', ...outcome.result } : { type: 'error', code: outcome.error.code, message: outcome.error.message });
        // Finished, but the app left before it could receive the result: it doesn't count.
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
    return new Response(stream, {
      headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' },
    });
  }),
};

type Outcome =
  | { result: { analysis: unknown; originalText: string; remaining: number; limit: number } }
  | { error: { status: number; code: string; message: string } };

/** One-way SHA-256 of what is being explained: recognises a retry without storing the content. */
async function fingerprint(input: Input): Promise<string> {
  const parts =
    input.kind === 'text' ? ['text', input.text] : input.kind === 'pdf' ? ['pdf', input.data] : ['images', ...input.images.map((i) => i.data)];
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('\u0000')));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
