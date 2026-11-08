/**
 * Speak Czech: the checks applied to the AI's review of a conversation before anything reaches the
 * learner's progress. No imports, so the app's tests run it under node.
 *
 * The rule, after Mural's vocabulary evidence (MIT, github.com/Chuloo/mural): evidence must be
 * quoted exactly from what the learner said, and only unaided speech counts as independent. A turn
 * typed instead of spoken, answered with the meaning showing, after asking for help, or repeating
 * a word the partner had just said, is assisted, never independent.
 */

export const GRAMMAR_IDS = [
  'pronunciation', 'question-words', 'gender', 'plural', 'cases', 'adjectives', 'pronouns', 'present', 'past',
  'future', 'aspect', 'modals', 'negation', 'prepositions', 'numbers', 'time', 'word-order', 'formal-informal',
] as const;
export type GrammarId = (typeof GRAMMAR_IDS)[number];

export const SKILLS = ['questions', 'past', 'future', 'reasons', 'descriptions'] as const;
export type SpeakSkill = (typeof SKILLS)[number];

export type ReviewTurn = {
  role: 'learner' | 'partner';
  text: string;
  /** Typed with "Type instead". */
  typed?: boolean;
  /** The meaning of the partner's last line was showing. */
  meaning?: boolean;
  /** The learner pressed "A little help" before answering. */
  helped?: boolean;
};

export type WordKind = 'independent' | 'assisted' | 'lapse';
/** other: not an attempt at Czech (the learner asked or chatted in their own language). It doesn't count either way. */
export type TurnOutcome = 'success' | 'partial' | 'breakdown' | 'other';

export type RawReview = {
  summary: string;
  wentWell: string[];
  corrections: { original: string; corrected: string; why: string }[];
  words: { lemma: string; meaning: string; form: string; quote: string; turn: number; kind: WordKind }[];
  skills: { skill: string; outcome: 'shown' | 'tried'; quote: string; turn: number }[];
  weaknesses: { grammar: string; quote: string; turn: number; note: string }[];
  outcomes: { turn: number; outcome: TurnOutcome }[];
  comprehension: { turn: number; note: string }[];
};

export type SpeakReview = {
  summary: string;
  wentWell: string[];
  corrections: { original: string; corrected: string; why: string }[];
  words: { lemma: string; meaning: string; form: string; quote: string; kind: WordKind }[];
  skills: { skill: SpeakSkill; outcome: 'shown' | 'tried'; quote: string; independent: boolean }[];
  weaknesses: { grammar: GrammarId; quote: string; note: string }[];
  /** One per learner turn, in order. */
  turns: { outcome: TurnOutcome; independent: boolean }[];
  comprehension: string[];
  /** Learner turns that were spoken without any help. */
  independentTurns: number;
  helpUsed: number;
};

const norm = (s: string) => s.normalize('NFC').toLocaleLowerCase('cs').replace(/\s+/g, ' ').trim();
const contains = (haystack: string, needle: string) => !!needle.trim() && norm(haystack).includes(norm(needle));
const short = (s: unknown, max: number) => (typeof s === 'string' ? s.trim().slice(0, max) : '');

/** True when the turn was helped in any way, so nothing in it can count as independent. */
export function assistedTurn(turns: ReviewTurn[], index: number): boolean {
  const t = turns[index];
  return !t || t.role !== 'learner' || !!(t.typed || t.meaning || t.helped);
}

/** The partner's line just before a learner turn: a word copied from it is imitation, not recall. */
function previousPartner(turns: ReviewTurn[], index: number): string {
  for (let i = index - 1; i >= 0; i--) if (turns[i].role === 'partner') return turns[i].text;
  return '';
}

export function applyReviewRules(raw: RawReview, turns: ReviewTurn[]): SpeakReview {
  const learner = turns.map((t, i) => ({ ...t, i })).filter((t) => t.role === 'learner');
  const isLearner = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && turns[n]?.role === 'learner';
  const anyLearner = (q: string) => learner.some((t) => contains(t.text, q));

  const corrections = raw.corrections
    .map((c) => ({ original: short(c.original, 200), corrected: short(c.corrected, 200), why: short(c.why, 200) }))
    .filter((c) => c.original && c.corrected && norm(c.original) !== norm(c.corrected) && anyLearner(c.original))
    .slice(0, 5);

  const seen = new Set<string>();
  const words = raw.words
    .filter((w) => isLearner(w.turn) && contains(turns[w.turn].text, w.quote) && contains(w.quote, w.form))
    .map((w) => {
      const lemma = norm(short(w.lemma, 60));
      const copied = contains(previousPartner(turns, w.turn), w.form);
      const kind: WordKind = w.kind === 'independent' && (assistedTurn(turns, w.turn) || copied) ? 'assisted' : w.kind;
      return { lemma, meaning: short(w.meaning, 80), form: short(w.form, 60), quote: short(w.quote, 160), kind };
    })
    .filter((w) => w.lemma && w.meaning && /^[\p{L}\s'-]+$/u.test(w.lemma) && !seen.has(w.lemma) && seen.add(w.lemma))
    .slice(0, 12);

  const skills = raw.skills
    .filter((s) => (SKILLS as readonly string[]).includes(s.skill) && isLearner(s.turn) && contains(turns[s.turn].text, s.quote))
    .map((s) => ({
      skill: s.skill as SpeakSkill,
      outcome: s.outcome === 'shown' ? ('shown' as const) : ('tried' as const),
      quote: short(s.quote, 160),
      independent: !assistedTurn(turns, s.turn),
    }))
    .slice(0, 8);

  const weaknesses = raw.weaknesses
    .filter((w) => (GRAMMAR_IDS as readonly string[]).includes(w.grammar) && isLearner(w.turn) && contains(turns[w.turn].text, w.quote))
    .map((w) => ({ grammar: w.grammar as GrammarId, quote: short(w.quote, 160), note: short(w.note, 160) }))
    .slice(0, 5);

  const byTurn = new Map(raw.outcomes.filter((o) => isLearner(o.turn)).map((o) => [o.turn, o.outcome]));
  const outcomes = learner.map((t) => {
    const outcome: TurnOutcome = byTurn.get(t.i) ?? 'partial';
    return { outcome, independent: !assistedTurn(turns, t.i) };
  });

  const comprehension = raw.comprehension
    .filter((c) => typeof c.turn === 'number' && turns[c.turn]?.role === 'partner')
    .map((c) => short(c.note, 160))
    .filter(Boolean)
    .slice(0, 3);

  return {
    summary: short(raw.summary, 600),
    wentWell: raw.wentWell.map((w) => short(w, 160)).filter(Boolean).slice(0, 3),
    corrections,
    words,
    skills,
    weaknesses,
    turns: outcomes,
    comprehension,
    independentTurns: outcomes.filter((o) => o.independent && o.outcome === 'success').length,
    helpUsed: learner.filter((t, k) => (t.helped || t.meaning || t.typed) && outcomes[k].outcome !== 'other').length,
  };
}

/** The transcript as the reviewer sees it: numbered, with how each learner turn was produced. */
export function reviewTranscript(turns: ReviewTurn[]): string {
  return turns
    .map((t, i) => {
      if (t.role === 'partner') return `[${i}] PARTNER: ${t.text}`;
      const flags = [t.typed && 'typed', t.meaning && 'meaning shown', t.helped && 'asked for help'].filter(Boolean);
      return `[${i}] LEARNER${flags.length ? ` (${flags.join(', ')})` : ''}: ${t.text}`;
    })
    .join('\n');
}
