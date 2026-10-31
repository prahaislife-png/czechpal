import Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

/** The model is configuration, not code: set CLAUDE_MODEL as a function secret to switch. */
export const MODEL = Deno.env.get('CLAUDE_MODEL') ?? 'claude-opus-5-5';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the function's secrets

export class AiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    /** Upstream detail for the ai_calls log; never sent to the user. */
    public detail?: string,
  ) {
    super(message);
  }
}

export type Usage = { input: number; output: number; cacheRead: number };

/**
 * One structured call to Claude. The system prompt is cached (it is identical on every call);
 * refusals fall back to another model server-side instead of failing the user's request.
 */
export async function callStructured(opts: {
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  schema: Record<string, unknown>;
}): Promise<{ json: unknown; usage: Usage }> {
  let response: Anthropic.Beta.BetaMessage;
  try {
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: opts.schema } },
      messages: [{ role: 'user', content: opts.content }],
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new AiError(503, 'busy', 'CzechPal is busy right now. Try again in a minute.');
    if (e instanceof Anthropic.APIError) {
      console.error('Claude API error', e.status, e.message);
      throw new AiError(502, 'ai_error', 'The AI service had a problem. Please try again.', `${e.status} ${e.message}`.slice(0, 500));
    }
    throw e;
  }

  const usage: Usage = {
    input: response.usage.input_tokens,
    output: response.usage.output_tokens,
    cacheRead: response.usage.cache_read_input_tokens ?? 0,
  };

  if (response.stop_reason === 'refusal') {
    throw Object.assign(new AiError(422, 'refused', 'This text couldn’t be explained. Try a clearer photo of just the text.'), { usage });
  }
  if (response.stop_reason === 'max_tokens') {
    throw Object.assign(new AiError(422, 'too_long', 'This is too long to explain in one go. Try a photo of one page.'), { usage });
  }

  const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text');
  if (!text) throw Object.assign(new AiError(502, 'ai_error', 'The AI returned no answer. Please try again.'), { usage });
  try {
    return { json: JSON.parse(text.text), usage };
  } catch {
    throw Object.assign(new AiError(502, 'ai_error', 'The AI returned an unreadable answer. Please try again.'), { usage });
  }
}

/** Cost and rate-limit log. Never stores document content. */
export async function logCall(
  admin: SupabaseClient,
  row: { userId: string; kind: 'analyze' | 'reply'; ok: boolean; usage?: Usage; error?: string },
) {
  const { error } = await admin.from('ai_calls').insert({
    user_id: row.userId,
    kind: row.kind,
    model: MODEL,
    ok: row.ok,
    input_tokens: row.usage?.input ?? null,
    output_tokens: row.usage?.output ?? null,
    cache_read_tokens: row.usage?.cacheRead ?? null,
    error: row.error ?? null,
  });
  if (error) console.error('ai_calls insert failed', error.message);
}

/** At most `limit` AI calls per user per minute, across explanations and replies. */
export async function isRateLimited(admin: SupabaseClient, userId: string, limit = 6) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await admin
    .from('ai_calls')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);
  if (error) throw new AiError(500, 'server', 'Something went wrong. Please try again.');
  return (count ?? 0) >= limit;
}

export const fail = (status: number, code: string, message: string) => Response.json({ error: { code, message } }, { status });
