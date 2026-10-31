import type Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';
import { withSupabase } from 'npm:@supabase/server@1';

import { analyzeOutputSchema, CATEGORIES, validateAnalyzeOutput } from '../_shared/analysis-schema.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { ANALYZE_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /analyze
 * { kind: 'image', mediaType: 'image/jpeg' | 'image/png' | 'image/webp', data: base64 }
 * { kind: 'pdf', data: base64 }
 * { kind: 'text', text: string }
 * optional: hint (a category), language (explanations' language, default English)
 *
 * Reserves one free explanation first and refunds it if the explanation fails.
 */

const FREE_LIMIT = Number(Deno.env.get('FREE_ANALYSES_PER_MONTH') ?? '5');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Claude's per-image limit
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type Input =
  | { kind: 'image'; mediaType: (typeof IMAGE_TYPES)[number]; data: string }
  | { kind: 'pdf'; data: string }
  | { kind: 'text'; text: string };

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4);

function parseInput(body: Record<string, unknown>): Input | Response {
  if (body.kind === 'text') {
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (text.length < 20) return fail(400, 'too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
    if (text.length > MAX_TEXT_CHARS) return fail(413, 'too_large', 'This text is too long. Paste one letter or message at a time.');
    return { kind: 'text', text };
  }
  if (body.kind === 'image' || body.kind === 'pdf') {
    const data = typeof body.data === 'string' ? body.data : '';
    if (!data || !/^[A-Za-z0-9+/]+=*$/.test(data)) return fail(400, 'bad_request', 'The file couldn’t be read. Please try again.');
    if (body.kind === 'pdf') {
      if (base64Bytes(data) > MAX_PDF_BYTES) return fail(413, 'too_large', 'This PDF is too large. Try a photo of the page instead.');
      return { kind: 'pdf', data };
    }
    const mediaType = IMAGE_TYPES.find((t) => t === body.mediaType);
    if (!mediaType) return fail(400, 'bad_request', 'This image type isn’t supported. Use a photo or a screenshot.');
    if (base64Bytes(data) > MAX_IMAGE_BYTES) return fail(413, 'too_large', 'This image is too large. Please try again.');
    return { kind: 'image', mediaType, data };
  }
  return fail(400, 'bad_request', 'Nothing to explain was sent.');
}

function userContent(input: Input, hint: string | undefined, language: string): Anthropic.Beta.BetaContentBlockParam[] {
  const instruction =
    `Explain this for the reader. Write all explanations in ${language}.` +
    (hint ? ` The reader says it is about: ${hint}.` : '');
  switch (input.kind) {
    case 'image':
      return [
        { type: 'image', source: { type: 'base64', media_type: input.mediaType, data: input.data } },
        { type: 'text', text: instruction },
      ];
    case 'pdf':
      return [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.data } },
        { type: 'text', text: instruction },
      ];
    case 'text':
      return [
        { type: 'text', text: `<czech_text>\n${input.text}\n</czech_text>` },
        { type: 'text', text: `${instruction} The Czech text is between the czech_text markers above.` },
      ];
  }
}

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
    let usage: Usage | undefined;
    try {
      const result = await callStructured({ system: ANALYZE_SYSTEM, content: userContent(input, hint, language), schema: analyzeOutputSchema });
      usage = result.usage;
      const out = validateAnalyzeOutput(result.json);

      if (out.status !== 'ok' || !out.analysis) {
        await refund(); // an unreadable photo doesn't use up an explanation
        await logCall(admin, { userId, kind: 'analyze', ok: false, usage, error: out.status });
        return out.status === 'not_czech'
          ? fail(422, 'not_czech', 'This doesn’t look like Czech. CzechPal explains text written in Czech.')
          : fail(422, 'unreadable', 'The photo is hard to read. Try again closer, in good light, with the whole text in the frame.');
      }

      await logCall(admin, { userId, kind: 'analyze', ok: true, usage });
      return Response.json({ analysis: out.analysis, originalText: out.originalText, remaining });
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
      if (known) return fail(e.status, e.code, e.message);
      console.error('analyze failed', e);
      return fail(502, 'ai_error', 'The explanation didn’t come out right. Please try again.');
    }
  }),
};
