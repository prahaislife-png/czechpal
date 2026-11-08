import { FunctionsHttpError } from '@supabase/supabase-js';

import { ensureSession, isBackendConfigured, supabase } from '@/lib/supabase';

import type { Cues, SpeakRequest, SpeakReview, Turn } from './types';

/**
 * Speak Czech's calls to CzechPal's server (supabase/functions/speak). Errors arrive worded for the
 * learner; `code` tells the screen what to offer next (type instead, try tomorrow…).
 */

export class SpeakError extends Error {
  name = 'SpeakError';
  constructor(
    public code: 'offline' | 'voice_off' | 'limit_reached' | 'busy' | 'rate_limited' | 'voice_failed' | 'server',
    message: string,
  ) {
    super(message);
  }
}

const OFFLINE = 'Couldn’t connect. Check your internet and try again.';
const TIMEOUT_MS = 45_000;

export const speakAvailable = isBackendConfigured;

async function call<T>(body: Record<string, unknown>, timeoutMs = TIMEOUT_MS): Promise<T> {
  if (!supabase) throw new SpeakError('voice_off', 'Speak Czech needs CzechPal’s server, which this demo doesn’t use.');
  try {
    await ensureSession();
  } catch {
    throw new SpeakError('offline', OFFLINE);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const { data, error } = await supabase.functions.invoke<T>('speak', { body, signal: controller.signal });
    if (!error && data) return data;
    if (error instanceof FunctionsHttpError) {
      let payload: { error?: { code?: string; message?: string } } = {};
      try {
        payload = await error.context.json();
      } catch {}
      const code = payload.error?.code;
      const known = ['voice_off', 'limit_reached', 'busy', 'rate_limited', 'voice_failed'] as const;
      throw new SpeakError(known.find((k) => k === code) ?? 'server', payload.error?.message ?? 'Something went wrong. Please try again.');
    }
    throw new SpeakError('offline', OFFLINE);
  } catch (e) {
    if (e instanceof SpeakError) throw e;
    throw new SpeakError('offline', OFFLINE);
  } finally {
    clearTimeout(timer);
  }
}

export type SpeakStatus = { voice: boolean; secondsLeft: number; dailySeconds: number };
export type StartedSession = { id: string; sdp: string; limitSeconds: number; secondsLeft: number; cues: Cues };

const history = (turns: Turn[]) => turns.slice(-12).map((t) => ({ role: t.role, text: t.text }));

export const speakApi = {
  status: () => call<SpeakStatus>({ action: 'status' }, 15_000),
  start: (request: SpeakRequest, sdp: string, turns: Turn[]) =>
    call<StartedSession>({ action: 'start', ...request, sdp, history: history(turns) }, 20_000),
  end: (id: string, reason: string) => call<{ ended: boolean; secondsLeft: number }>({ action: 'end', id, reason }, 15_000),
  meaning: (text: string, language: string) => call<{ meaning: string }>({ action: 'meaning', text, language }, 20_000),
  reply: (request: SpeakRequest, turns: Turn[]) =>
    call<{ reply: string }>({ action: 'reply', ...request, turns: turns.slice(-20).map((t) => ({ role: t.role, text: t.text })) }),
  review: (situation: string, turns: Turn[], language: string) =>
    call<SpeakReview>({
      action: 'review',
      situation,
      language,
      turns: turns.map((t) => ({ role: t.role, text: t.text, typed: !!t.typed, meaning: !!t.meaning, helped: !!t.helped })),
    }, 60_000),
};
