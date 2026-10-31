import { FunctionsHttpError } from '@supabase/supabase-js';
import { fetch as streamingFetch } from 'expo/fetch';

import { ensureSession, functionHeaders, functionsUrl, supabase } from '@/lib/supabase';

import { DEFAULT_LANGUAGE } from './languages';
import { partialAnalysis, type PartialAnalysis } from './partial-analysis';
import { fileAsBase64, imageForUpload } from './prepare';
import {
  AnalyzeError,
  type AIClient,
  type Analysis,
  type AnalyzeInput,
  type AnalyzeResult,
  type ReplyDraft,
  type ReplyInput,
} from './types';

const NETWORK_MESSAGE = 'Couldn’t connect. Check your internet and try again.';
const SLOW_MESSAGE = 'This is taking too long. Check your connection and try again.';
/** How often the screen is updated while an explanation streams in. */
const PARTIAL_INTERVAL_MS = 80;

/**
 * Time limits. An explanation normally starts arriving within a few seconds, so a long silence
 * means the connection is stuck (a tram, a lift), not that the AI is still thinking.
 */
const SESSION_LIMIT_MS = 15_000;
const STALL_LIMIT_MS = 30_000;
const ANALYZE_LIMIT_MS = 120_000;
const REPLY_LIMIT_MS = 45_000;

type ServerError = { error?: { code?: string; message?: string } };

/** Maps the server's error codes onto the app's; the server's message is already user-facing. */
const codeFor = (server: string | undefined): AnalyzeError['code'] => {
  switch (server) {
    case 'too_short':
      return 'too_short';
    case 'unreadable':
    case 'not_czech':
    case 'refused':
    case 'too_long':
      return 'unreadable';
    case 'too_large':
      return 'too_large';
    case 'limit_reached':
      return 'limit';
    case 'rate_limited':
    case 'busy':
      return 'rate';
    default:
      return 'server';
  }
};

/** Signs in (anonymously) if needed, giving up rather than hanging on a dead connection. */
async function accessToken(): Promise<string> {
  if (!supabase) throw new AnalyzeError('server', 'Live explanations aren’t set up in this build.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const session = await Promise.race([
      ensureSession(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), SESSION_LIMIT_MS);
      }),
    ]);
    return session.access_token;
  } catch {
    throw new AnalyzeError('network', NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
}

async function invoke<T>(name: 'reply', body: Record<string, unknown>): Promise<T> {
  await accessToken();
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REPLY_LIMIT_MS);
  try {
    const { data, error } = await supabase!.functions.invoke<T>(name, { body, signal: controller.signal });
    if (!error && data) return data;
    if (error instanceof FunctionsHttpError) {
      let payload: ServerError = {};
      try {
        payload = await error.context.json();
      } catch {
        // Non-JSON error body: fall through to the generic message.
      }
      throw new AnalyzeError(codeFor(payload.error?.code), payload.error?.message ?? 'Something went wrong. Please try again.');
    }
    throw new AnalyzeError('network', timedOut ? SLOW_MESSAGE : NETWORK_MESSAGE);
  } catch (e) {
    if (e instanceof AnalyzeError) throw e;
    throw new AnalyzeError('network', timedOut ? SLOW_MESSAGE : NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
  }
}

type AnalyzeResponse = { analysis: Analysis; originalText: string; remaining: number };

/**
 * /analyze with streaming: the server sends one JSON object per line, "delta" lines with the
 * answer as it is written, then "done" with the checked result (or "error"). Partial results
 * are only for display; the result returned here is always the server-validated one.
 *
 * Gives up after STALL_LIMIT_MS without any data, or ANALYZE_LIMIT_MS in total. Disconnecting
 * makes the server stop and refund the explanation, so giving up costs the user nothing.
 */
async function analyzeStreaming(body: Record<string, unknown>, onPartial?: (p: PartialAnalysis) => void): Promise<AnalyzeResponse> {
  const token = await accessToken();

  const controller = new AbortController();
  let timedOut = false;
  const giveUp = () => {
    timedOut = true;
    controller.abort();
  };
  const hardLimit = setTimeout(giveUp, ANALYZE_LIMIT_MS);
  let stall = setTimeout(giveUp, STALL_LIMIT_MS);
  const progress = () => {
    clearTimeout(stall);
    stall = setTimeout(giveUp, STALL_LIMIT_MS);
  };

  let raw = '';
  let done: AnalyzeResponse | null = null;
  let lastShown = 0;
  const handle = (line: string) => {
    if (!line.trim()) return;
    const msg = JSON.parse(line) as
      | { type: 'delta'; text: string }
      | ({ type: 'done' } & AnalyzeResponse)
      | { type: 'error'; code?: string; message?: string };
    if (msg.type === 'delta') raw += msg.text;
    else if (msg.type === 'done') done = { analysis: msg.analysis, originalText: msg.originalText, remaining: msg.remaining };
    else throw new AnalyzeError(codeFor(msg.code), msg.message ?? 'Something went wrong. Please try again.');
  };

  try {
    const res = await streamingFetch(`${functionsUrl}/analyze`, {
      method: 'POST',
      headers: functionHeaders(token),
      body: JSON.stringify({ ...body, stream: true }),
      signal: controller.signal,
    });
    progress();
    if (!res.ok) {
      const payload: ServerError = await res.json().catch(() => ({}));
      throw new AnalyzeError(codeFor(payload.error?.code), payload.error?.message ?? 'Something went wrong. Please try again.');
    }

    const reader = res.body?.getReader();
    if (!reader) {
      (await res.text()).split('\n').forEach(handle);
    } else {
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done: finished } = await reader.read();
        if (finished) break;
        progress();
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        lines.forEach(handle);
        if (onPartial && Date.now() - lastShown >= PARTIAL_INTERVAL_MS) {
          const partial = partialAnalysis(raw);
          if (partial) {
            lastShown = Date.now();
            onPartial(partial);
          }
        }
      }
      handle(buffer);
    }
  } catch (e) {
    if (e instanceof AnalyzeError) throw e;
    if (timedOut) throw new AnalyzeError('network', SLOW_MESSAGE);
    throw new AnalyzeError('network', raw ? 'The connection dropped while explaining. Please try again.' : NETWORK_MESSAGE);
  } finally {
    clearTimeout(hardLimit);
    clearTimeout(stall);
  }
  if (!done) throw new AnalyzeError('server', 'The explanation didn’t finish. Please try again.');
  return done;
}

/** What /analyze receives for the user's text, photo(s) or PDF. */
async function requestBody(input: AnalyzeInput): Promise<Record<string, unknown>> {
  if (input.kind === 'text') {
    const text = (input.text ?? '').trim();
    if (text.length < 20) {
      throw new AnalyzeError('too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
    }
    return { kind: 'text', text };
  }
  const pages = input.kind === 'image' ? (input.uris ?? (input.uri ? [input.uri] : [])) : [];
  if (input.kind === 'pdf' ? !input.uri : pages.length === 0) {
    throw new AnalyzeError('unreadable', 'The file is missing. Please add it again.');
  }
  try {
    if (input.kind === 'pdf') return { kind: 'pdf', data: await fileAsBase64(input.uri!) };
    if (pages.length === 1) return { kind: 'image', ...(await imageForUpload(pages[0])) };
    // One at a time: several full-size photos in memory at once can be too much for older phones.
    const images = [];
    for (const uri of pages) images.push(await imageForUpload(uri));
    return { kind: 'images', images };
  } catch {
    throw new AnalyzeError('unreadable', 'A photo couldn’t be opened. Try taking it again.');
  }
}

/**
 * The real AI boundary: a Supabase Edge Function holds the Claude key, checks the
 * free allowance, and validates Claude's structured answer before it reaches the app.
 */
export const liveClient: AIClient = {
  async analyzeDocument(input: AnalyzeInput): Promise<AnalyzeResult> {
    const body = await requestBody(input);
    if (input.hint) body.hint = input.hint;
    if (input.requestId) body.requestId = input.requestId;
    body.language = input.language ?? DEFAULT_LANGUAGE;

    const data = await analyzeStreaming(body, input.onPartial);
    return { analysis: data.analysis, originalText: data.originalText, demo: null, remaining: data.remaining };
  },

  async generateReply({ analysis, originalText, intentId, tone, language }: ReplyInput): Promise<ReplyDraft> {
    const intent = analysis.replyIntents.find((i) => i.id === intentId) ?? analysis.replyIntents[0];
    const data = await invoke<{ czech: string; english: string }>('reply', {
      originalText,
      summary: { kind: analysis.kind, sender: analysis.sender, inShort: analysis.inShort },
      intent: { label: intent?.label ?? 'Reply', description: intent?.description ?? '' },
      tone,
      language: language ?? DEFAULT_LANGUAGE,
    });
    return { intentId, tone, czech: data.czech, english: data.english };
  },
};
