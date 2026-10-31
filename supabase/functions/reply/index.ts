import { withSupabase } from 'npm:@supabase/server@1';

import { replyOutputSchema, validateReplyOutput } from '../_shared/analysis-schema.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { genderedForms } from '../_shared/gender.ts';
import { languageName } from '../_shared/languages.ts';
import { REPLY_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /reply
 * { originalText, summary: { kind, sender?, inShort }, intent?: { label, description }, ownWords?, name?, language? }
 * Either a suggested intent or the reader's own words (any language). The tone follows the original.
 * Replies don't use up the free allowance; they are rate-limited only.
 */

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
    const ownWords = clip(body.ownWords, 1000);
    const name = clip(body.name, 80);
    if (!originalText || (!ownWords && !clip(intent.label, 200))) return fail(400, 'bad_request', 'Nothing to reply to was sent.');

    const admin = ctx.supabaseAdmin;
    let usage: Usage | undefined;
    try {
      if (await isRateLimited(admin, userId)) return fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.');

      const request = [
        `What it is: ${clip(summary.kind, 20) || 'message'}${clip(summary.sender, 200) ? `, from ${clip(summary.sender, 200)}` : ''}.`,
        `In short: ${clip(summary.inShort, 600)}`,
        ownWords
          ? `What the reader wants to reply, in their own words:
<own_words>
${ownWords}
</own_words>`
          : `The reader wants to: ${clip(intent.label, 200)}. ${clip(intent.description, 400)}`,
        // Spelled out: a short "translate into X" often comes back in English anyway.
        `Write the "translation" field entirely in ${languageName(body.language)}${languageName(body.language) === 'English' ? '' : ', not in English and not in Czech'}, placeholders included.`,
        name ? `Sign it as: ${name}.` : 'Sign it as: [Vaše jméno].',
      ].join('\n');
      const draft = (extra?: string) =>
        callStructured({
          system: REPLY_SYSTEM,
          schema: replyOutputSchema,
          content: [
            { type: 'text', text: `<original_text>\n${originalText}\n</original_text>` },
            { type: 'text', text: `${request}\n${extra ? `${extra}\n` : ''}Write the reply now.` },
          ],
          signal: req.signal,
        });

      const first = await draft();
      usage = first.usage;
      let reply = validateReplyOutput(first.json);

      // The reader's gender is unknown, so the Czech must not reveal one. The prompt says so, but a
      // small model still slips ("Rád bych požádal"); check, and ask once for a neutral rewrite.
      const gendered = genderedForms(reply.czech);
      let note: string | undefined;
      if (gendered.length) {
        const second = await draft(
          `Do not use these words, because they show the writer's gender: ${gendered.join(', ')}. ` +
            'Use neutral first-person forms instead, such as "prosím o", "chci požádat", "chci se zeptat", "děkuji", "mohu", "potřebuji". ' +
            'Do not write both forms either, as in "obdržel(a)".',
        );
        usage = { input: usage.input + second.usage.input, output: usage.output + second.usage.output, cacheRead: usage.cacheRead + second.usage.cacheRead };
        const rewritten = validateReplyOutput(second.json);
        const still = genderedForms(rewritten.czech);
        note = still.length ? `gender_retry_failed: ${still.join(',')}` : `gender_retry: ${gendered.join(',')}`;
        // Keep the rewrite only if it is actually better.
        if (still.length < gendered.length) reply = rewritten;
      }

      await logCall(admin, { userId, kind: 'reply', ok: true, usage, error: note });
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
