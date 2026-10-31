import Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';
import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export type Effort = 'low' | 'medium' | 'high';
/** off = answer straight away; adaptive = the model decides how much to think first. */
export type Thinking = 'off' | 'adaptive';
export type ModelConfig = { model: string; effort: Effort; thinking: Thinking };

const envEffort = Deno.env.get('CLAUDE_EFFORT');
const envThinking = Deno.env.get('CLAUDE_THINKING');

/** The model is configuration, not code: set CLAUDE_MODEL, CLAUDE_EFFORT and CLAUDE_THINKING as function secrets. */
export const DEFAULT_CONFIG: ModelConfig = {
  model: Deno.env.get('CLAUDE_MODEL') ?? 'claude-opus-5-5',
  effort: envEffort === 'low' || envEffort === 'high' ? envEffort : 'medium',
  thinking: envThinking === 'off' ? 'off' : 'adaptive',
};
export const MODEL = DEFAULT_CONFIG.model;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the function's secrets

/**
 * Each model line turns thinking off differently: Sonnet 5.5 uses between_tools (no tools here, so
 * no thinking), Opus 5.5 can't turn it off (effort is its only lever), the rest accept disabled.
 */
function thinkingParam(config: ModelConfig): Record<string, unknown> {
  if (config.thinking === 'adaptive') return { thinking: { type: 'adaptive' } };
  if (config.model.startsWith('claude-opus-5-5')) return {};
  if (config.model.startsWith('claude-sonnet-5-5')) return { thinking: { type: 'between_tools' } };
  return { thinking: { type: 'disabled' } };
}

/** Server-side refusal fallbacks exist for the Opus 5 and Fable lines only (not Haiku). */
const supportsFallbacks = (model: string) => model.startsWith('claude-opus-5') || model.startsWith('claude-fable');

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
 * One structured call to Claude, streamed: `onText` receives the JSON as it is written, so the
 * app can show the first fields long before the last ones exist. The system prompt is cached
 * (it is identical on every call); where available, refusals fall back to another model server-side.
 */
export async function callStructured(opts: {
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  schema: Record<string, unknown>;
  config?: ModelConfig;
  onText?: (delta: string) => void;
  /** Aborts the call when the app has gone away, so nobody pays for an answer no one will read. */
  signal?: AbortSignal;
}): Promise<{ json: unknown; usage: Usage }> {
  const config = opts.config ?? DEFAULT_CONFIG;
  const params = {
    model: config.model,
    max_tokens: 16000,
    ...(supportsFallbacks(config.model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } : {}),
    ...thinkingParam(config),
    system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
    output_config: { effort: config.effort, format: { type: 'json_schema', schema: opts.schema } },
    messages: [{ role: 'user', content: opts.content }],
  } as unknown as Anthropic.Beta.MessageCreateParamsStreaming;

  let response: Anthropic.Beta.BetaMessage;
  try {
    const stream = client.beta.messages.stream(params, { signal: opts.signal });
    if (opts.onText) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') opts.onText(event.delta.text);
      }
    }
    response = await stream.finalMessage();
  } catch (e) {
    if (e instanceof Anthropic.APIUserAbortError || opts.signal?.aborted) {
      throw new AiError(499, 'cancelled', 'The app stopped waiting for this explanation.');
    }
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
    model: `${DEFAULT_CONFIG.model} ${DEFAULT_CONFIG.effort}${DEFAULT_CONFIG.thinking === 'off' ? ' no-thinking' : ''}`,
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
