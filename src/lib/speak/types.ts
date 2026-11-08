import type { GrammarId, SpeakReview, SpeakSkill, WordKind } from '../../../supabase/functions/_shared/speak-review-rules';
import type { SpeakGoal, SpeakSituation } from '../../../supabase/functions/_shared/speak-policy';

/**
 * Speak Czech: the shapes shared by the conversation screen, the provider layer and the learner's
 * local evidence. The server's rules (supabase/functions/_shared) are the single source for the
 * review and policy types.
 */

export type { GrammarId, SpeakGoal, SpeakReview, SpeakSituation, SpeakSkill, WordKind };

export type Speaker = 'learner' | 'partner';

/** One turn on screen. Flags say how a learner turn was produced; they decide what counts as evidence. */
export type Turn = {
  id: string;
  role: Speaker;
  text: string;
  /** Typed with "Type instead". */
  typed?: boolean;
  /** The partner's meaning was showing when the learner answered. */
  meaning?: boolean;
  /** The learner asked for help before answering. */
  helped?: boolean;
};

/** Cues the server writes for the session (see speak-policy.ts), sent during it by the app. */
export type Cues = { greeting: string; checkIn: string; help: string; end: string };

/** What the app sends to start a session or a typed reply: small, validated facts, never a prompt. */
export type SpeakRequest = {
  situation: SpeakSituation;
  level: number;
  words: string[];
  goal: SpeakGoal | null;
  language: string;
};
