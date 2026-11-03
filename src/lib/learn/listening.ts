import { contentById, library } from './content';
import type { Deck } from './deck';
import { lexemeById, lexicon } from './lexicon';
import type { ReadingProgress } from './progress';
import type { Lexeme, Level } from './types';

/**
 * Listening practice: the phone says something in Czech and the learner picks what they heard
 * or what it means. Built from words they saved and lines from texts they've opened, so it
 * practises what they've already met. Needs the device's Czech voice.
 */

export type ListenKind = 'word' | 'meaning' | 'line';

export type ListenItem = {
  id: string;
  kind: ListenKind;
  /** What the voice says. */
  say: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Shown after answering: the Czech and its meaning. */
  reveal: { cs: string; en: string };
};

export type Line = { cs: string; en: string };

/** Short enough to hold in mind after one hearing. */
const MAX_LINE = 80;

/** A small seeded random generator, so a session (and a test) can be replayed exactly. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const same = (a: string, b: string) => a.toLocaleLowerCase('cs') === b.toLocaleLowerCase('cs');

/**
 * Words to listen for: saved words first, then words from texts opened, then (for a new learner)
 * words from texts at their level. Unique lexeme ids.
 */
export function listeningWords(deck: Deck, progress: Record<string, ReadingProgress>, level: Level = 'A1'): string[] {
  const saved = Object.values(deck).flatMap((c) => (c.lexemeId ? [c.lexemeId] : []));
  const opened = Object.keys(progress).flatMap((id) => contentById(id)?.vocabulary ?? []);
  const starter = library.filter((c) => c.level === level).flatMap((c) => c.vocabulary);
  return [...new Set([...saved, ...opened, ...starter])].filter((id) => !!lexemeById(id));
}

/** Short lines, with their translations, from the texts the learner has opened. */
export const listeningLines = (progress: Record<string, ReadingProgress>) => linesOf(Object.keys(progress));

/** Short lines, with their translations, from these texts. */
export function linesOf(contentIds: string[]): Line[] {
  return contentIds
    .flatMap((id) => contentById(id)?.chapters.flatMap((c) => c.paragraphs) ?? [])
    .filter((p) => p.cs.length <= MAX_LINE)
    .map((p) => ({ cs: p.cs, en: p.en }));
}

function distractors<T>(pool: T[], key: (x: T) => string, answer: string, n: number, rand: () => number): string[] {
  const out: string[] = [];
  for (const x of shuffle(pool, rand)) {
    const k = key(x);
    if (same(k, answer) || out.some((o) => same(o, k))) continue;
    out.push(k);
    if (out.length === n) break;
  }
  return out;
}

/** Other lemmas that could be confused with this one: same part of speech, similar start first. */
function lookalikes(l: Lexeme) {
  const kin = lexicon.filter((x) => x.id !== l.id && x.pos === l.pos && x.pos !== 'phrase');
  const close = kin.filter((x) => x.lemma[0]?.toLocaleLowerCase('cs') === l.lemma[0]?.toLocaleLowerCase('cs'));
  return close.length >= 3 ? close : kin;
}

function item(kind: ListenKind, id: string, say: string, answer: string, wrong: string[], reveal: Line, rand: () => number): ListenItem | null {
  if (wrong.length < 2) return null;
  const options = shuffle([answer, ...wrong], rand);
  return { id, kind, say, options, answer: options.indexOf(answer), reveal };
}

/**
 * A session of `count` items, mixing: hear a word and pick it (word), hear a word and pick its
 * meaning (meaning), hear a line and pick its translation (line). Same inputs and seed, same session.
 */
export function buildListening({ words, lines, count, seed }: { words: string[]; lines: Line[]; count: number; seed: number }): ListenItem[] {
  const rand = seeded(seed);
  const lexemes = shuffle(words.map((id) => lexemeById(id)).filter((l): l is Lexeme => !!l), rand);
  const pickedLines = shuffle(lines, rand);
  const canLine = lines.length >= 3;
  const items: ListenItem[] = [];
  let w = 0;
  let li = 0;
  for (let i = 0; items.length < count && (w < lexemes.length || (canLine && li < pickedLines.length)); i++) {
    const turn = i % 3;
    if (turn === 2 && canLine && li < pickedLines.length) {
      const line = pickedLines[li++];
      const made = item('line', `line:${li}`, line.cs, line.en, distractors(lines, (x) => x.en, line.en, 2, rand), line, rand);
      if (made) items.push(made);
      continue;
    }
    if (w >= lexemes.length) continue;
    const l = lexemes[w++];
    const reveal = { cs: l.lemma, en: l.en };
    const made =
      turn === 0
        ? item('word', `word:${l.id}`, l.lemma, l.lemma, distractors(lookalikes(l), (x) => x.lemma, l.lemma, 3, rand), reveal, rand)
        : item('meaning', `meaning:${l.id}`, l.lemma, l.en, distractors(lexicon.filter((x) => x.pos === l.pos), (x) => x.en, l.en, 3, rand), reveal, rand);
    if (made) items.push(made);
  }
  return items;
}

/** Right answers as a share, 0 to 1. */
export const listeningScore = (right: number, total: number) => (total > 0 ? right / total : 0);
