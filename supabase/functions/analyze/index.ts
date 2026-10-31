import { withSupabase } from 'npm:@supabase/server@1';

import { analyzeOutputSchema, CATEGORIES, validateAnalyzeOutput } from '../_shared/analysis-schema.ts';
import { parseInput, userContent } from '../_shared/analyze-input.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { ANALYZE_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /analyze with a body described in _shared/analyze-input.ts
 * optional: hint (a category), language (explanations' language, default English)
 *
 * Reserves one free explanation first and refunds it if the explanation fails.
 */

const FREE_LIMIT = Number(Deno.env.get('FREE_ANALYSES_PER_MONTH') ?? '5');

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
    const language = body.language === undefined ? 'English' : String(body.language).slice(0, 40);

    const admin = ctx.supabaseAdmin;
    try {
      if (await isRateLimited(admin, userId)) return fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.');
    } catch (e) {
      if (e instanceof AiError) return fail(e.status, e.code, e.message);
      throw e;
    }

    const { data: remaining, error: reserveError } = await admin.rpc('reserve_analysis', {
      p_user: userId,
      p_limit: FREE_LIMIT,
    });
    if (reserveError) {
      console.error('reserve_analysis failed', reserveError.message);
      return fail(500, 'server', 'Something went wrong. Please try again.');
    }
    if (remaining < 0) {
      return fail(402, 'limit_reached', 'You’ve used this month’s free explanations. Pro with unlimited explanations is coming soon.');
    }

    const refund = () => admin.rpc('refund_analysis', { p_user: userId });

    /** The explanation itself; `onText` streams Claude's JSON as it is written. */
    const explain = async (onText?: (delta: string) => void): Promise<Outcome> => {
      let usage: Usage | undefined;
      try {
        const result = await callStructured({
          system: ANALYZE_SYSTEM,
          content: userContent(input, hint, language),
          schema: analyzeOutputSchema,
          onText,
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

        await logCall(admin, { userId, kind: 'analyze', ok: true, usage });
        // Pasted text isn't echoed back by Claude (that would only slow it down); the server has it.
        const originalText = input.kind === 'text' ? input.text : out.originalText;
        return { result: { analysis: out.analysis, originalText, remaining } };
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
        const send = (line: Record<string, unknown>) => controller.enqueue(encoder.encode(JSON.stringify(line) + '\n'));
        const outcome = await explain((text) => send({ type: 'delta', text }));
        send('result' in outcome ? { type: 'done', ...outcome.result } : { type: 'error', code: outcome.error.code, message: outcome.error.message });
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store' },
    });
  }),
};

type Outcome =
  | { result: { analysis: unknown; originalText: string; remaining: number } }
  | { error: { status: number; code: string; message: string } };
