import { withSupabase } from 'npm:@supabase/server@1';

import { composeOutputSchema, validateComposeOutput } from '../_shared/analysis-schema.ts';
import { AiError, callStructured, fail, isRateLimited, logCall, type Usage } from '../_shared/claude.ts';
import { genderedForms } from '../_shared/gender.ts';
import { languageName } from '../_shared/languages.ts';
import { COMPOSE_SYSTEM } from '../_shared/prompts.ts';

/**
 * POST /compose
 * { request, to?, about?, details?: { name?, address?, insurer? }, language? }
 * A new Czech message from what the reader typed in their own words, plus a call script.
 * Like replies, it doesn't use up the free allowance; it is rate-limited only.
 */

const clip = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * The "I only speak a little Czech" line belongs just before "S pozdravem", but the model sometimes
 * puts it after the signature. Move it there, and move the matching paragraph of the translation
 * too (the translation mirrors the Czech paragraph for paragraph; left alone if it doesn't).
 */
function littleCzechBeforeClosing(out: { czech: string; english: string }) {
  const cs = out.czech.split(/\n\s*\n/);
  const en = out.english.split(/\n\s*\n/);
  const from = cs.findIndex((p) => p.includes('Česky mluvím jen trochu'));
  const closing = cs.findIndex((p) => p.trim().startsWith('S pozdravem'));
  if (from < 0 || closing < 0 || from === closing - 1) return out;
  const move = (paras: string[]) => {
    const [line] = paras.splice(from, 1);
    paras.splice(from < closing ? closing - 1 : closing, 0, line);
    return paras.join('\n\n');
  };
  return { ...out, czech: move(cs), english: en.length === cs.length ? move(en) : out.english };
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
      return fail(400, 'bad_request', 'Write what you want to say first.');
    }

    const request = clip(body.request, 1000);
    if (request.length < 3) return fail(400, 'bad_request', 'Write what you want to say first.');
    const to = clip(body.to, 200);
    const about = clip(body.about, 200);
    const details = (body.details ?? {}) as Record<string, unknown>;
    const name = clip(details.name, 80);
    const address = clip(details.address, 200);
    const insurer = clip(details.insurer, 80);
    const language = languageName(body.language);

    const admin = ctx.supabaseAdmin;
    let usage: Usage | undefined;
    try {
      if (await isRateLimited(admin, userId)) return fail(429, 'rate_limited', 'Too many requests. Wait a minute and try again.');

      const brief = [
        to ? `Writing to: ${to}${about ? ` (${about})` : ''}.` : about ? `Writing to: ${about}.` : null,
        name ? `Reader's name: ${name}.` : 'Reader\'s name: not given.',
        address ? `Reader's address: ${address}.` : null,
        insurer ? `Reader's health insurer: ${insurer}.` : null,
        // Spelled out: a short "translate into X" often comes back in English anyway.
        `Write "translation" and every "translated" field entirely in ${language}${language === 'English' ? '' : ', not in English and not in Czech'}, placeholders included.`,
      ]
        .filter(Boolean)
        .join('\n');
      const draft = (extra?: string) =>
        callStructured({
          system: COMPOSE_SYSTEM,
          schema: composeOutputSchema,
          content: [
            { type: 'text', text: `<what_the_reader_wants_to_say>\n${request}\n</what_the_reader_wants_to_say>` },
            { type: 'text', text: `${brief}\n${extra ? `${extra}\n` : ''}Write the message now.` },
          ],
          signal: req.signal,
        });

      const first = await draft();
      usage = first.usage;
      let out = validateComposeOutput(first.json);

      // Same guard as replies: the reader's gender is unknown, so the Czech must not reveal one.
      const czechOf = (o: typeof out) => [o.czech, ...o.call.say.map((l) => l.cs)].join('\n');
      const gendered = genderedForms(czechOf(out));
      let note: string | undefined;
      if (gendered.length) {
        const second = await draft(
          `Do not use these words, because they show the writer's gender: ${gendered.join(', ')}. ` +
            'Use neutral first-person forms instead, such as "prosím o", "chci požádat", "chci se zeptat", "děkuji", "mohu", "potřebuji". ' +
            'Do not write both forms either, as in "volal(a)".',
        );
        usage = { input: usage.input + second.usage.input, output: usage.output + second.usage.output, cacheRead: usage.cacheRead + second.usage.cacheRead };
        const rewritten = validateComposeOutput(second.json);
        const still = genderedForms(czechOf(rewritten));
        note = still.length ? `gender_retry_failed: ${still.join(',')}` : `gender_retry: ${gendered.join(',')}`;
        if (still.length < gendered.length) out = rewritten;
      }

      await logCall(admin, { userId, kind: 'compose', ok: true, usage, error: note });
      return Response.json(littleCzechBeforeClosing(out));
    } catch (e) {
      const known = e instanceof AiError;
      await logCall(admin, { userId, kind: 'compose', ok: false, usage: (e as { usage?: Usage }).usage ?? usage, error: known ? (e.detail ? `${e.code}: ${e.detail}` : e.code) : 'invalid_output' });
      if (known) return fail(e.status, e.code, e.message);
      console.error('compose failed', e);
      return fail(502, 'ai_error', 'The message didn’t come out right. Please try again.');
    }
  }),
};
