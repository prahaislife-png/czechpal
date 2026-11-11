import { withSupabase } from 'npm:@supabase/server@1';

import { AiError, callStructured, claimCall, fail, logCall, type Claim, type ModelConfig, type Usage } from '../_shared/claude.ts';
import { FEEDBACK_SYSTEM, feedbackOutputSchema, finishFeedback, type FeedbackKind } from '../_shared/feedback.ts';
import { languageName } from '../_shared/languages.ts';

/**
 * POST /learn-feedback
 * { kind: 'form' | 'email', instruction, questions?, pictures?, register?, texts: string[], language? }
 * Feedback on A2 Academy writing practice: an estimate of the points, the task's requirements
 * judged, corrections and a corrected version. It doesn't use up the free explanations; it has
 * its own per-minute and per-day limits. The text is not stored; only the call's size and result
 * are logged, as for every AI call.
 */

const FEEDBACK: ModelConfig = { model: 'claude-sonnet-5-5', effort: 'medium', thinking: 'adaptive' };
const PER_MINUTE = 3;
const PER_DAY = 10;

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const list = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v.slice(0, n).map((x) => clip(x, max)) : []);

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return fail(405, 'method', 'Use POST.');
    const userId = ctx.userClaims?.id;
    if (!userId) return fail(401, 'unauthorized', 'Please restart the app and try again.');

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return fail(400, 'bad_request', 'Your writing didn’t arrive. Try again.');
    }
    const kind: FeedbackKind | null = body.kind === 'form' || body.kind === 'email' ? body.kind : null;
    if (!kind) return fail(400, 'bad_request', 'Your writing didn’t arrive. Try again.');
    const texts = kind === 'form' ? list(body.texts, 3, 600) : list(body.texts, 1, 2500);
    if (!texts.some((t) => t.length > 0)) return fail(400, 'too_short', 'Write something first.');
    const instruction = clip(body.instruction, 400);
    const questions = list(body.questions, 6, 200);
    const pictures = list(body.pictures, 6, 200);
    const register = body.register === 'ty' || body.register === 'vy' ? body.register : null;
    const language = languageName(body.language);

    const task =
      kind === 'form'
        ? `Task 1, the form. Instruction: ${instruction}\n\n${questions.map((q, i) => `Question ${i + 1}: ${q}\nAnswer ${i + 1}: ${texts[i] || '(no answer)'}`).join('\n\n')}`
        : `Task 2, the e-mail. Instruction: ${instruction}\nThe pictures ask: ${pictures.map((p, i) => `${i + 1}. ${p}`).join(' ')}\n${register ? `Register: ${register}.\n` : ''}\nThe learner's e-mail:\n${texts[0]}`;

    const admin = ctx.supabaseAdmin;
    let usage: Usage | undefined;
    let claim: Claim | undefined;
    try {
      const claimed = await claimCall(admin, userId, 'learn', { perMinute: PER_MINUTE, perDay: PER_DAY, config: FEEDBACK });
      if ('limited' in claimed) {
        return claimed.limited === 'minute'
          ? fail(429, 'rate_limited', 'Give it a minute, then ask again.')
          : fail(429, 'rate_limited', `That’s today’s ${PER_DAY} pieces of feedback. More tomorrow.`);
      }
      claim = claimed;

      const result = await callStructured({
        system: FEEDBACK_SYSTEM,
        schema: feedbackOutputSchema,
        config: FEEDBACK,
        content: [{ type: 'text', text: `${task}\n\nWrite the feedback in ${language}.` }],
        signal: req.signal,
      });
      usage = result.usage;
      const out = finishFeedback(result.json, kind, texts);
      await logCall(admin, { userId, kind: 'learn', ok: true, usage, config: FEEDBACK, claim });
      return Response.json(out);
    } catch (e) {
      const known = e instanceof AiError;
      // A request turned away before it was claimed has nothing to log.
      if (claim) {
        await logCall(admin, {
          userId,
          kind: 'learn',
          ok: false,
          usage: (e as { usage?: Usage }).usage ?? usage,
          config: FEEDBACK,
          error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output',
          claim,
        });
      }
      if (known) return fail(e.status, e.code, e.message);
      console.error('learn-feedback failed', e);
      return fail(502, 'ai_error', 'Feedback didn’t come through. Try again.');
    }
  }),
};
