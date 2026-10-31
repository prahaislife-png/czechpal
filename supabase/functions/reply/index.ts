import { withSupabase } from 'npm:@supabase/server@1';

import { replyOutputSchema, validateReplyOutput } from '../_shared/analysis-schema.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { REPLY_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /reply
 * { originalText, summary: { kind, sender?, inShort }, intent: { label, description }, tone: 'formal'|'friendly'|'short', name? }
 * Replies don't use up the free allowance; they are rate-limited only.
 */

const TONES = ['formal', 'friendly', 'short'] as const;
const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'Nothing to reply to was sent.');
    }

    const originalText = clip(body.originalText, 20_000);
    const summary = (body.summary ?? {}) as Record<string, unknown>;
    const intent = (body.intent ?? {}) as Record<string, unknown>;
    const tone = TONES.find((t) => t === body.tone);
    const name = clip(body.name, 80);
    if (!originalText || !tone || !clip(intent.label, 200)) return fail(400, 'bad_request', 'Nothing to reply to was sent.');

    const admin = ctx.supabaseAdmin;
    let usage: Usage | undefined;
    try {
      if (await isRateLimited(admin, userId)) return fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.');

      const result = await callStructured({
        system: REPLY_SYSTEM,
        schema: replyOutputSchema,
        content: [
          { type: 'text', text: `<original_text>\n${originalText}\n</original_text>` },
          {
            type: 'text',
            text: [
              `What it is: ${clip(summary.kind, 20) || 'message'}${clip(summary.sender, 200) ? `, from ${clip(summary.sender, 200)}` : ''}.`,
              `In short: ${clip(summary.inShort, 600)}`,
              `The reader wants to: ${clip(intent.label, 200)}. ${clip(intent.description, 400)}`,
              `Tone: ${tone}.`,
              name ? `Sign it as: ${name}.` : 'Sign it as: [Vaše jméno].',
              'Write the reply now.',
            ].join('\n'),
          },
        ],
      });
      usage = result.usage;
      const reply = validateReplyOutput(result.json);
      await logCall(admin, { userId, kind: 'reply', ok: true, usage });
      return Response.json(reply);
    } catch (e) {
      const known = e instanceof AiError;
      await logCall(admin, { userId, kind: 'reply', ok: false, usage: (e as { usage?: Usage }).usage ?? usage, error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output' });
      if (known) return fail(e.status, e.code, e.message);
      console.error('reply failed', e);
      return fail(502, 'ai_error', 'The reply didn’t come out right. Please try again.');
    }
  }),
};
