import { withSupabase } from 'npm:@supabase/server@1';

import { translateOutputSchema, validateTranslateOutput } from '../_shared/analysis-schema.ts';
import { AiError, callStructured, claimCall, fail, logCall, type Claim, type ModelConfig, type Usage } from '../_shared/claude.ts';
import { languageName } from '../_shared/languages.ts';
import { TRANSLATE_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /translate
 * { image: { mediaType, data (base64) }, language? }
 * A quick look at what the camera sees: the Czech lines and their translation, no explanation.
 * It doesn't use up the free explanations; it has its own per-minute and per-day limits.
 */

/** The fastest model, no thinking: this has to come back in a second or two. */
const QUICK: ModelConfig = { model: 'claude-haiku-5-5', effort: 'low', thinking: 'off' };
const PER_MINUTE = 12;
const PER_DAY = 150;
const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'The photo didn’t arrive. Try again.');
    }
    const image = (body.image ?? {}) as Record<string, unknown>;
    const mediaType = TYPES.find((t) => t === image.mediaType);
    const data = typeof image.data === 'string' ? image.data : '';
    if (!mediaType || !data) return fail(400, 'bad_request', 'The photo didn’t arrive. Try again.');
    if ((data.length * 3) / 4 > MAX_BYTES) return fail(413, 'too_large', 'The photo is too large. Try again.');
    const language = languageName(body.language);

    const admin = ctx.supabaseAdmin;
    let usage: Usage | undefined;
    let claim: Claim | undefined;
    try {
      const claimed = await claimCall(admin, userId, 'translate', { perMinute: PER_MINUTE, perDay: PER_DAY, config: QUICK });
      if ('limited' in claimed) {
        return claimed.limited === 'minute'
          ? fail(429, 'rate_limited', 'That’s a lot of quick looks. Wait a minute and try again.')
          : fail(429, 'rate_limited', 'That’s today’s quick translations. Explaining a photo still works.');
      }
      claim = claimed;

      const result = await callStructured({
        system: TRANSLATE_SYSTEM,
        schema: translateOutputSchema,
        config: QUICK,
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
          { type: 'text', text: `Translate the Czech text in this photo into ${language}.` },
        ],
        signal: req.signal,
      });
      usage = result.usage;
      const out = validateTranslateOutput(result.json);
      await logCall(admin, { userId, kind: 'translate', ok: true, usage, config: QUICK, error: out.status === 'no_text' ? 'no_text' : undefined, claim });
      return Response.json(out);
    } catch (e) {
      const known = e instanceof AiError;
      // A request turned away before it was claimed has nothing to log.
      if (claim) {
        await logCall(admin, {
          userId,
          kind: 'translate',
          ok: false,
          usage: (e as { usage?: Usage }).usage ?? usage,
          config: QUICK,
          error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output',
          claim,
        });
      }
      if (known) return fail(e.status, e.code, e.message);
      console.error('translate failed', e);
      return fail(502, 'ai_error', 'Couldn’t read that. Try again, a little closer.');
    }
  }),
};
