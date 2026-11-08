/**
 * The voice provider seam. The conversation screen only knows these events and calls, so the voice
 * technology (today OpenAI GPT-Live over WebRTC) can change without touching the learning UI.
 * The typed fallback doesn't need a provider: it goes through the server's text helper.
 */

export type VoiceEvent =
  /** The provider is listening and speaking. */
  | { type: 'ready' }
  /** A piece of what someone said, as it is recognised (learner) or spoken (partner). */
  | { type: 'transcript'; speaker: 'learner' | 'partner'; delta: string }
  /** The provider ended the session (time limit, hang-up, its own reasons). */
  | { type: 'closed'; reason?: string }
  /** The provider refused a command; the conversation may carry on. */
  | { type: 'rejected' };

export type VoiceHandlers = {
  onEvent(event: VoiceEvent): void;
  /** 0–1 levels of the learner's microphone and the partner's voice, a few times a second. */
  onLevels(input: number, output: number): void;
  /** The connection dropped. The message is ready to show. */
  onLost(message: string): void;
};

export interface VoiceProvider {
  /** Opens the microphone and the connection; `exchange` trades the offer for the server's answer. */
  connect(exchange: (offer: string) => Promise<string>): Promise<void>;
  /** Something for the partner to say now, in its own words (greet, check in, help). */
  cue(text: string): boolean;
  setMuted(muted: boolean): void;
  /** Ends politely: tells the provider, then releases the microphone. */
  close(): void;
}

export class VoiceError extends Error {
  constructor(
    public code: 'microphone' | 'connection' | 'timeout' | 'cancelled',
    message: string,
  ) {
    super(message);
  }
}
