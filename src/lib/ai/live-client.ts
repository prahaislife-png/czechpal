import { FunctionsFetchError, FunctionsHttpError } from '@supabase/supabase-js';

import { ensureSession, supabase } from '@/lib/supabase';

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

async function invoke<T>(name: 'analyze' | 'reply', body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new AnalyzeError('server', 'Live explanations aren’t set up in this build.');
  try {
    await ensureSession();
  } catch {
    throw new AnalyzeError('network', 'Couldn’t connect. Check your internet and try again.');
  }
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
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
  if (error instanceof FunctionsFetchError) {
    throw new AnalyzeError('network', 'Couldn’t connect. Check your internet and try again.');
  }
  throw new AnalyzeError('server', 'Something went wrong. Please try again.');
}

/**
 * The real AI boundary: a Supabase Edge Function holds the Claude key, checks the
 * free allowance, and validates Claude's structured answer before it reaches the app.
 */
export const liveClient: AIClient = {
  async analyzeDocument(input: AnalyzeInput): Promise<AnalyzeResult> {
    let body: Record<string, unknown>;
    if (input.kind === 'text') {
      const text = (input.text ?? '').trim();
      if (text.length < 20) {
        throw new AnalyzeError('too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
      }
      body = { kind: 'text', text };
    } else {
      if (!input.uri) throw new AnalyzeError('unreadable', 'The file is missing. Please add it again.');
      try {
        body =
          input.kind === 'image'
            ? { kind: 'image', ...(await imageForUpload(input.uri)) }
            : { kind: 'pdf', data: await fileAsBase64(input.uri) };
      } catch {
        throw new AnalyzeError('unreadable', 'This file couldn’t be opened. Try taking the photo again.');
      }
    }
    if (input.hint) body.hint = input.hint;

    const data = await invoke<{ analysis: Analysis; originalText: string; remaining: number }>('analyze', body);
    return { analysis: data.analysis, originalText: data.originalText, demo: null, remaining: data.remaining };
  },

  async generateReply({ analysis, originalText, intentId, tone }: ReplyInput): Promise<ReplyDraft> {
    const intent = analysis.replyIntents.find((i) => i.id === intentId) ?? analysis.replyIntents[0];
    const data = await invoke<{ czech: string; english: string }>('reply', {
      originalText,
      summary: { kind: analysis.kind, sender: analysis.sender, inShort: analysis.inShort },
      intent: { label: intent?.label ?? 'Reply', description: intent?.description ?? '' },
      tone,
    });
    return { intentId, tone, czech: data.czech, english: data.english };
  },
};
