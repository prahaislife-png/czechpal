import { RAW } from './raw';

/**
 * Slovíčka: every word in one long list to scroll through, in Czech alphabetical order, with a
 * letter rail to jump along it. No React Native imports, so the tests can run it.
 */

export type Word = {
  /** The Czech word or phrase. */
  w: string;
  /** Its type: m, f, n (noun genders), v, adj… See TAGS. */
  t: string;
  /** The meaning in English. */
  en: string;
  /** An example sentence, and the same in English. Many words have none. */
  ex?: string;
  exen?: string;
  /** The letter it is filed under: 'A' … 'Ž', with 'CH' its own letter. */
  letter: string;
};

/** How many words there are, for screens that mention it without loading the list. */
export const WORD_COUNT = 5843;

const TAGS: Record<string, string> = {
  m: 'noun, masculine',
  f: 'noun, feminine',
  n: 'noun, neuter',
  pl: 'noun, plural',
  noun: 'noun',
  v: 'verb',
  vi: 'verb, imperfective',
  vp: 'verb, perfective',
  adj: 'adjective',
  adv: 'adverb',
  phr: 'phrase',
  prep: 'preposition',
  conj: 'conjunction',
  pron: 'pronoun',
  num: 'numeral',
  intj: 'interjection',
  part: 'particle',
};

export const tagLabel = (t: string) => TAGS[t] ?? '';

/** The Czech alphabet as the rail shows it. Long vowels and ď, ť, ň file under their plain letter. */
export const ALPHABET = ['A', 'B', 'C', 'Č', 'D', 'E', 'F', 'G', 'H', 'CH', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ž'];

const PLAIN: Record<string, string> = { á: 'a', é: 'e', ě: 'e', í: 'i', ó: 'o', ú: 'u', ů: 'u', ý: 'y', ď: 'd', ť: 't', ň: 'n' };

export function letterOf(word: string) {
  const s = word.toLowerCase();
  if (s.startsWith('ch')) return 'CH';
  const c = s[0] ?? '';
  return (PLAIN[c] ?? c).toUpperCase();
}

/** The screen's colour changes with the letter, cycling through these. */
const PALETTE = ['#1F3FD6', '#D42A1A', '#0B7A4B', '#6B2FD9', '#C74A00', '#00707F', '#C2187A'];

export function colourFor(letter: string) {
  const k = ALPHABET.indexOf(letter);
  return PALETTE[(k < 0 ? 0 : k) % PALETTE.length];
}

/**
 * A sort key in Czech alphabetical order, the same on every phone (the phone's own collation
 * differs between systems). Letters compare first: č, ř, š, ž and ch are letters of their own,
 * while long vowels and ď, ť, ň only break ties.
 */
const ORDER = 'abcčdefgh\u0001ijklmnopqrřsštuvwxyzž'; // \u0001 stands for "ch"
export function sortKey(word: string) {
  const s = word.toLowerCase();
  let primary = '';
  let accents = '';
  for (let i = 0; i < s.length; i++) {
    let c = s[i];
    if (c === 'c' && s[i + 1] === 'h') {
      c = '\u0001';
      i++;
    }
    const plain = PLAIN[c] ?? c;
    const at = ORDER.indexOf(plain);
    // Letters sort by their place in the alphabet; anything else (a space, a hyphen) comes first.
    primary += at < 0 ? '!' : String.fromCharCode(97 + at);
    accents += plain === c ? '0' : '1';
  }
  return `${primary}\u0000${accents}`;
}

let cached: Word[] | null = null;

/** Every word, sorted. Read from the raw list the first time it's asked for. */
export function allWords(): Word[] {
  if (cached) return cached;
  const keyed = RAW.trim()
    .split('\n')
    .map((line) => {
      const [w, t, en, ex, exen] = line.split('|');
      return { word: { w, t, en, ex: ex || undefined, exen: exen || undefined, letter: letterOf(w) } satisfies Word, key: sortKey(w) };
    });
  keyed.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  cached = keyed.map((k) => k.word);
  return cached;
}

/** The letters a list has, in order, and where each one starts. */
export function letterIndex(list: Word[]) {
  const letters: string[] = [];
  const first: Record<string, number> = {};
  list.forEach((x, i) => {
    if (!(x.letter in first)) {
      first[x.letter] = i;
      letters.push(x.letter);
    }
  });
  return { letters, first };
}

/**
 * Where a finger on the rail points. `fraction` is how far down the rail it is, 0 to 1. A tap
 * lands on the first word of its letter; once the finger is dragging (`fine`), its place within
 * the letter's slot scrubs through that letter's words.
 */
export function railTarget(fraction: number, index: ReturnType<typeof letterIndex>, total: number, fine: boolean) {
  const n = index.letters.length;
  if (!n) return null;
  const f = Math.max(0, Math.min(n - 1e-6, fraction * n));
  const k = Math.floor(f);
  const a = index.first[index.letters[k]];
  const b = k + 1 < n ? index.first[index.letters[k + 1]] : total;
  return { letter: index.letters[k], at: fine ? a + Math.floor((f - k) * (b - a)) : a };
}

/** "5,843": grouped by hand, since not every phone groups numbers the same way. */
export const formatCount = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** What the Listen button reads: the word, then its example. */
export const spokenText = (x: Pick<Word, 'w' | 'ex'>) => (x.ex ? `${x.w}. ${x.ex}` : x.w);
