import type { TopicId } from '@/lib/academy/types';

import type { GrammarId, SpeakGoal, SpeakReview, SpeakSituation, SpeakSkill, WordKind } from './types';

/**
 * Speak Czech: the learner's evidence from conversations, kept on the phone, and what it adds up
 * to. Pure functions, tested in tests/speak.
 *
 * Rules (after Mural's learning engine, MIT, github.com/Chuloo/mural, adapted):
 * - Only unaided speech is independent. Typed turns, turns with the meaning showing, after help,
 *   or copying the partner's words are assisted (decided on the server, applied again here).
 * - A word grows only from independent use on different days, and only becomes steady across
 *   days AND different conversations over at least a week. One good answer never makes it known.
 * - The level moves from evidence, not time: up one after two independent successful answers in
 *   a row, at most one step per conversation; down one after an answer that broke down.
 */

export type EvidenceEvent =
  | { kind: 'turn'; session: string; at: string; context: SpeakSituation; outcome: 'success' | 'partial' | 'breakdown' | 'other'; independent: boolean }
  | { kind: 'word'; session: string; at: string; context: SpeakSituation; lemma: string; meaning: string; form: string; quote: string; type: WordKind }
  | { kind: 'skill'; session: string; at: string; context: SpeakSituation; skill: SpeakSkill; outcome: 'shown' | 'tried'; independent: boolean }
  | { kind: 'weak'; session: string; at: string; context: SpeakSituation; grammar: GrammarId; quote: string; note: string }
  | { kind: 'missed'; session: string; at: string; context: SpeakSituation; note: string };

export type SessionRecord = {
  id: string;
  at: string;
  situation: SpeakSituation;
  /** Voice seconds used (0 for a typed-only conversation). */
  seconds: number;
  mode: 'voice' | 'typed' | 'mixed';
  learnerTurns: number;
  independentTurns: number;
  helpUsed: number;
  /** The level the conversation was pitched at. */
  level: number;
  summary?: string;
  wentWell?: string[];
  corrections?: SpeakReview['corrections'];
};

/** Turns a validated review into evidence events for one session. */
export function eventsFromReview(review: SpeakReview, session: string, at: string, context: SpeakSituation): EvidenceEvent[] {
  return [
    ...review.turns.map((t) => ({ kind: 'turn' as const, session, at, context, outcome: t.outcome, independent: t.independent })),
    ...review.words.map((w) => ({ kind: 'word' as const, session, at, context, lemma: w.lemma, meaning: w.meaning, form: w.form, quote: w.quote, type: w.kind })),
    ...review.skills.map((s) => ({ kind: 'skill' as const, session, at, context, skill: s.skill, outcome: s.outcome, independent: s.independent })),
    ...review.weaknesses.map((w) => ({ kind: 'weak' as const, session, at, context, grammar: w.grammar, quote: w.quote, note: w.note })),
    ...review.comprehension.map((note) => ({ kind: 'missed' as const, session, at, context, note })),
  ];
}

const DAY = 86_400_000;
const dayOf = (iso: string) => iso.slice(0, 10);
const byTime = (a: { at: string }, b: { at: string }) => a.at.localeCompare(b.at);

/** 0–5. Starts at 0: the first conversation is pitched for a beginner and adapts from there. */
export function speakingLevel(events: EvidenceEvent[]): number {
  let level = 0;
  let streak = 0;
  let raisedIn: string | null = null;
  for (const e of events.filter((e) => e.kind === 'turn').sort(byTime)) {
    if (e.kind !== 'turn' || e.outcome === 'other') continue; // Speaking another language doesn't count either way.
    if (e.outcome === 'breakdown') {
      level = Math.max(0, level - 1);
      streak = 0;
    } else if (e.outcome === 'success' && e.independent) {
      streak++;
      if (streak >= 2 && raisedIn !== e.session) {
        level = Math.min(5, level + 1);
        raisedIn = e.session;
        streak = 0;
      }
    } else streak = 0;
  }
  return level;
}

export const levelLabels = ['First words', 'Simple answers', 'Short conversations', 'A2 conversations', 'Longer answers', 'Confident'];

export type WordStrength = 0 | 1 | 2 | 3;
export const strengthLabels: Record<WordStrength, string> = { 0: 'Heard or helped', 1: 'Used once', 2: 'Growing', 3: 'Steady' };

export type WordState = {
  lemma: string;
  meaning: string;
  /** The learner's own words, most recent. */
  example: string;
  strength: WordStrength;
  independentUses: number;
  lastSeen: string;
  /** When it's worth bringing back. */
  dueAt: string;
};

/** Spacing after each strength, in days. */
const INTERVALS = [1, 1, 4, 14];

export function wordStates(events: EvidenceEvent[], now = new Date()): WordState[] {
  const groups = new Map<string, Extract<EvidenceEvent, { kind: 'word' }>[]>();
  for (const e of events) if (e.kind === 'word') groups.set(e.lemma, [...(groups.get(e.lemma) ?? []), e]);
  return [...groups.entries()]
    .map(([lemma, all]) => {
      const seen = all.sort(byTime);
      const last = seen[seen.length - 1];
      const independent = seen.filter((e) => e.type === 'independent');
      const days = new Set(independent.map((e) => dayOf(e.at))).size;
      const contexts = new Set(independent.map((e) => e.session)).size;
      const contextsKinds = new Set(independent.map((e) => e.context)).size;
      const span = independent.length ? Date.parse(independent[independent.length - 1].at) - Date.parse(independent[0].at) : 0;
      let strength: WordStrength = independent.length ? 1 : 0;
      if (days >= 2) strength = 2;
      if (days >= 3 && contexts >= 2 && (contextsKinds >= 2 || contexts >= 3) && span >= 7 * DAY) strength = 3;
      const lastRecall = independent[independent.length - 1]?.at;
      // A clear failure after the last good use pulls it back.
      const lapse = seen.filter((e) => e.type === 'lapse').pop();
      if (lapse && (!lastRecall || lapse.at > lastRecall)) strength = Math.min(strength, 1) as WordStrength;
      const due = new Date(Date.parse(lastRecall ?? last.at) + INTERVALS[strength] * DAY);
      // Unused for a long time: strength fades a step.
      if (strength > 1 && now.getTime() > due.getTime() + INTERVALS[strength] * DAY) strength = (strength - 1) as WordStrength;
      return {
        lemma,
        meaning: last.meaning,
        example: last.quote,
        strength,
        independentUses: independent.length,
        lastSeen: last.at,
        dueAt: due.toISOString(),
      };
    })
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

/** Words worth bringing into the next conversation: due, weakest first. */
export function wordsToRevisit(words: WordState[], now = new Date(), limit = 5): string[] {
  return words
    .filter((w) => w.strength < 3 && Date.parse(w.dueAt) <= now.getTime())
    .sort((a, b) => a.strength - b.strength || a.dueAt.localeCompare(b.dueAt))
    .slice(0, limit)
    .map((w) => w.lemma);
}

export type SkillState = 'not-yet' | 'tried' | 'emerging' | 'reliable';
export const skillLabels: Record<SpeakSkill, string> = {
  questions: 'Asking questions',
  past: 'Talking about the past',
  future: 'Talking about plans',
  reasons: 'Giving reasons',
  descriptions: 'Describing',
};
export const skillStateLabels: Record<SkillState, string> = {
  'not-yet': 'Not heard yet',
  tried: 'Tried',
  emerging: 'Used on your own',
  reliable: 'Reliable',
};

/** Reliable needs independent, correct use in at least 3 conversations on at least 2 days. */
export function skillStates(events: EvidenceEvent[]): Record<SpeakSkill, SkillState> {
  const out = {} as Record<SpeakSkill, SkillState>;
  for (const skill of ['questions', 'past', 'future', 'reasons', 'descriptions'] as SpeakSkill[]) {
    const all = events.filter((e): e is Extract<EvidenceEvent, { kind: 'skill' }> => e.kind === 'skill' && e.skill === skill);
    const good = all.filter((e) => e.outcome === 'shown' && e.independent);
    const sessions = new Set(good.map((e) => e.session)).size;
    const days = new Set(good.map((e) => dayOf(e.at))).size;
    out[skill] = sessions >= 3 && days >= 2 ? 'reliable' : good.length ? 'emerging' : all.length ? 'tried' : 'not-yet';
  }
  return out;
}

/** Grammar that has come up in two or more conversations. */
export function repeatedWeaknesses(events: EvidenceEvent[]): { grammar: GrammarId; sessions: number; example: string }[] {
  const groups = new Map<GrammarId, Extract<EvidenceEvent, { kind: 'weak' }>[]>();
  for (const e of events) if (e.kind === 'weak') groups.set(e.grammar, [...(groups.get(e.grammar) ?? []), e]);
  return [...groups.entries()]
    .map(([grammar, all]) => ({ grammar, sessions: new Set(all.map((e) => e.session)).size, example: all.sort(byTime)[all.length - 1].quote }))
    .filter((g) => g.sessions >= 2)
    .sort((a, b) => b.sessions - a.sessions);
}

/** What to aim the next conversation at, from the learner's own evidence. */
export function nextGoal(events: EvidenceEvent[], level: number): SpeakGoal | null {
  const skills = skillStates(events);
  if (level >= 1 && skills.questions !== 'reliable' && skills.questions !== 'emerging') return 'questions';
  if (level >= 2 && skills.past !== 'reliable') return 'past';
  if (level >= 3 && skills.future !== 'reliable') return 'future';
  if (level >= 3) return 'longer';
  return null;
}

export type Recommendation =
  | { kind: 'grammar'; id: GrammarId; why: string }
  | { kind: 'topic'; id: TopicId; why: string }
  | { kind: 'words'; count: number; why: string };

/** Recommended next exercises, from repeated weaknesses, skills and words. */
export function recommendations(events: EvidenceEvent[], words: WordState[], lastTopic: TopicId | null, now = new Date()): Recommendation[] {
  const out: Recommendation[] = [];
  for (const w of repeatedWeaknesses(events).slice(0, 2)) out.push({ kind: 'grammar', id: w.grammar, why: `Came up in ${w.sessions} conversations` });
  const skills = skillStates(events);
  const level = speakingLevel(events);
  if (level >= 1 && skills.questions === 'not-yet' && !out.some((r) => r.kind === 'grammar' && r.id === 'question-words')) {
    out.push({ kind: 'grammar', id: 'question-words', why: 'You haven’t asked a question yet' });
  }
  if (level >= 2 && (skills.past === 'not-yet' || skills.past === 'tried') && !out.some((r) => r.kind === 'grammar' && r.id === 'past')) {
    out.push({ kind: 'grammar', id: 'past', why: 'The past tense hasn’t come easily yet' });
  }
  const due = words.filter((w) => w.strength < 3 && Date.parse(w.dueAt) <= now.getTime()).length;
  if (due) out.push({ kind: 'words', count: due, why: `${due} ${due === 1 ? 'word is' : 'words are'} ready to use again` });
  if (lastTopic) out.push({ kind: 'topic', id: lastTopic, why: 'The A2 topic behind your last conversation' });
  return out.slice(0, 4);
}

/** Totals for the hub. */
export function totals(sessions: SessionRecord[]) {
  return {
    conversations: sessions.length,
    seconds: sessions.reduce((n, s) => n + s.seconds, 0),
    minutes: Math.round(sessions.reduce((n, s) => n + s.seconds, 0) / 60),
    independent: sessions.reduce((n, s) => n + s.independentTurns, 0),
    helped: sessions.reduce((n, s) => n + s.helpUsed, 0),
  };
}
