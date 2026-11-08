import type { SpeakTurn } from './speak-policy.ts';

/**
 * OpenAI GPT-Live, the voice provider behind Speak Czech. The app makes a WebRTC offer; this server
 * exchanges it for the provider's answer with the project key, which never leaves the server.
 * Shape after Mural's hosted provider (MIT, github.com/Chuloo/mural): never retry a create whose
 * result is uncertain, since creating a session is billed.
 */

const ORIGIN = 'https://api.openai.com';
const MODEL = Deno.env.get('OPENAI_LIVE_MODEL') ?? 'gpt-live-1';
const VOICE = Deno.env.get('OPENAI_LIVE_VOICE') ?? 'marin';

export const liveConfigured = () => !!Deno.env.get('OPENAI_API_KEY');
export const liveModel = () => `${MODEL} ${VOICE}`;

export class LiveError extends Error {
  constructor(
    /** rejected: the provider refused before starting (not billed). uncertain: it may have started. */
    public kind: 'rejected' | 'uncertain',
    public status?: number,
  ) {
    super(`live ${kind}${status ? ` ${status}` : ''}`);
  }
}

const sessionPath = (id: string) => {
  if (!id || id.length > 256 || /[\x00-\x20/]/.test(id)) throw new LiveError('uncertain');
  return `/v1/live/sessions/${encodeURIComponent(id)}`;
};

export async function createLiveSession(sdp: string, instructions: string, history: SpeakTurn[]): Promise<{ id: string; sdp: string }> {
  let response: Response;
  try {
    response = await fetch(`${ORIGIN}/v1/live/sessions`, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(12_000),
      headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: {
          model: MODEL,
          store: false,
          instructions,
          input: history.map((t) => ({
            type: 'message',
            role: t.role === 'learner' ? 'user' : 'assistant',
            content: [{ type: t.role === 'learner' ? 'input_text' : 'output_text', text: t.text }],
          })),
          audio: { output: { voice: VOICE } },
        },
        transport: { type: 'webrtc', sdp },
      }),
    });
  } catch {
    throw new LiveError('uncertain');
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('live create failed', response.status, response.headers.get('x-request-id'), detail.slice(0, 500));
    throw new LiveError(response.status >= 400 && response.status < 500 && response.status !== 408 ? 'rejected' : 'uncertain', response.status);
  }
  const raw = await response.json().catch(() => null);
  const id = raw?.session?.id;
  const answer = raw?.transport?.sdp;
  if (typeof id !== 'string' || typeof answer !== 'string') throw new LiveError('uncertain', response.status);
  sessionPath(id);
  return { id, sdp: answer };
}

/** Ends a session from the server. Safe to call on a session that already ended. */
export async function hangupLiveSession(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${ORIGIN}${sessionPath(id)}/hangup`, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(8_000),
      headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
    });
    await response.body?.cancel();
    // A session that already ended may answer 404 or 409: it isn't running either way.
    return response.ok || response.status === 404 || response.status === 409;
  } catch {
    return false;
  }
}
