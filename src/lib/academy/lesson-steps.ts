import type { Lesson, Phrase } from './types';

/**
 * How a lesson is taught, step by step. The written content (phrases, a dialogue, practice and a
 * check) is the same for every lesson; this decides the order it is met in and builds the small
 * warm-ups between: a quick pick after the first phrases, a matching game once all are seen, and
 * word tiles for answers that would otherwise have to be typed with Czech accents.
 *
 * No React Native imports, so the tests can run it.
 */

export type LessonStep =
  | { kind: 'start' }
  /** One new phrase, on its own, with its meaning and sound. */
  | { kind: 'phrase'; i: number }
  /** "Which one means …?" among the phrases met so far. */
  | { kind: 'pick'; pick: QuickPick }
  /** Match every phrase to its meaning. */
  | { kind: 'match' }
  | { kind: 'scene' }
  | { kind: 'practise'; i: number }
  | { kind: 'checkIntro' }
  | { kind: 'check'; i: number };

export type QuickPick = { ask: string; options: string[]; answer: number };

/** Phrases shown before the first quick pick. */
const FIRST_GROUP = 3;

/** A stable shuffle: the same order every time for the same seed, so a retry looks the same. */
export function shuffled<T>(list: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** "Which one means 'I live in Prague'?" from the first phrases; null when there are too few to choose between. */
export function quickPick(lesson: Pick<Lesson, 'id' | 'introduce'>): QuickPick | null {
  const seen = lesson.introduce.slice(0, FIRST_GROUP);
  if (seen.length < 2) return null;
  // Ask about one in the middle of what was just shown, not the one still on screen in memory.
  const target = seen[Math.min(1, seen.length - 1)];
  const options = shuffled(seen, `${lesson.id}:pick`);
  return { ask: target.en, options: options.map((p) => p.cs), answer: options.indexOf(target) };
}

/**
 * The steps of a lesson. A retest is the check alone. Without a Czech voice on the phone,
 * listening items are left out (they can't be answered).
 */
export function lessonSteps(lesson: Lesson, opts: { retest: boolean; canListen: boolean }): LessonStep[] {
  const usable = (e: Lesson['check'][number]) => opts.canListen || !(e.kind === 'choice' && e.listen);
  const check: LessonStep[] = lesson.check.flatMap((e, i) => (usable(e) ? [{ kind: 'check' as const, i }] : []));
  if (opts.retest) return [{ kind: 'checkIntro' }, ...check];

  const phrases = lesson.introduce.map((_, i): LessonStep => ({ kind: 'phrase', i }));
  const pick = quickPick(lesson);
  const learn: LessonStep[] =
    pick && phrases.length > FIRST_GROUP ? [...phrases.slice(0, FIRST_GROUP), { kind: 'pick', pick }, ...phrases.slice(FIRST_GROUP)] : phrases;
  const practise: LessonStep[] = lesson.practise.flatMap((e, i) => (usable(e) ? [{ kind: 'practise' as const, i }] : []));
  return [{ kind: 'start' }, ...learn, ...(lesson.introduce.length >= 2 ? [{ kind: 'match' as const }] : []), { kind: 'scene' }, ...practise, { kind: 'checkIntro' }, ...check];
}

// ── Word tiles ───────────────────────────────────────────────────────────────

/** The words of a Czech sentence as tiles: no end punctuation, no commas. */
export const wordsOf = (sentence: string) =>
  sentence
    .replace(/[.!?…]+$/u, '')
    .split(/\s+/)
    .map((w) => w.replace(/^[„“"(]+|[,;:”“")]+$/gu, ''))
    .filter(Boolean);

/** Every word a lesson teaches, for tiles that don't belong in an answer. */
export function lessonWords(lesson: Pick<Lesson, 'introduce' | 'context'>): string[] {
  const all = [...lesson.introduce, ...lesson.context].flatMap((p: Phrase) => wordsOf(p.cs));
  // Markers of an alternative ("/", "…") and anything in brackets aren't words to offer.
  return [...new Set(all.filter((w) => /^\p{L}+$/u.test(w)))];
}

/** How many extra tiles to mix in. */
const EXTRA_TILES = 3;

/**
 * The tiles for an answer: its own words plus a few that don't belong, in a stable shuffled
 * order. Extra words are ones the lesson teaches, never one that is in the answer.
 */
export function tilesFor(answer: string, pool: readonly string[], seed: string): string[] {
  const words = wordsOf(answer);
  const own = new Set(words.map((w) => w.toLocaleLowerCase('cs')));
  const extra = shuffled(
    pool.filter((w) => !own.has(w.toLocaleLowerCase('cs'))),
    `${seed}:extra`,
  ).slice(0, EXTRA_TILES);
  return shuffled([...words, ...extra], `${seed}:tiles`);
}

// ── Matching ─────────────────────────────────────────────────────────────────

/** The meanings in a shuffled order, each remembering which phrase it belongs to. */
export function matchOrder(lesson: Pick<Lesson, 'id' | 'introduce'>): number[] {
  const order = shuffled(
    lesson.introduce.map((_, i) => i),
    `${lesson.id}:match`,
  );
  // A shuffle that happens to leave everything in place would give the game away.
  return order.every((v, i) => v === i) && order.length > 1 ? [...order.slice(1), order[0]] : order;
}

/**
 * For a phrase written for two speakers ("Mám rád kávu. / Mám ráda kávu."), the first form: what
 * a tile or a short card shows. The full phrase is on its own card.
 */
export const shortForm = (cs: string) => cs.split(' / ')[0].trim();
