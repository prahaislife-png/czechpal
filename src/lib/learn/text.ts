import { lexemeById, lexemesForForm } from './lexicon';
import type { LearningContent, Lexeme } from './types';

/** A paragraph cut into words (tappable) and everything between them (spaces, punctuation). */
export type Token = { text: string; word: boolean };

const WORD = /\p{L}+(?:-\p{L}+)*/gu;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of text.matchAll(WORD)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), word: false });
    out.push({ text: m[0], word: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), word: false });
  return out;
}

export const normalize = (form: string) => form.toLocaleLowerCase('cs');

export type WordInfo = {
  /** The word as written. */
  form: string;
  lexeme: Lexeme;
  /** What it means in this text, when that differs from the dictionary meaning. */
  inContext?: string;
  /** A grammar note for this exact form, if the dictionary has one. */
  note?: string;
};

/**
 * What a word in a text is: its dictionary entry, and its meaning here. The text's own senses
 * win over the dictionary. Returns null when the word isn't in the dictionary or is ambiguous
 * without a sense, which the content tests forbid for published texts.
 */
export function lookUp(content: Pick<LearningContent, 'senses'>, form: string): WordInfo | null {
  const key = normalize(form);
  const sense = content.senses?.[key];
  const candidates = sense?.lexeme ? [lexemeById(sense.lexeme)].filter((l): l is Lexeme => !!l) : lexemesForForm(key);
  if (candidates.length !== 1) return null;
  const [lexeme] = candidates;
  return { form, lexeme, inContext: sense?.meaning, note: lexeme.notes?.[key] };
}

/** Every distinct word form in a text, lowercase. */
export function formsIn(content: Pick<LearningContent, 'chapters'>): string[] {
  const forms = new Set<string>();
  for (const chapter of content.chapters) {
    for (const p of chapter.paragraphs) {
      for (const t of tokenize(p.cs)) if (t.word) forms.add(normalize(t.text));
    }
  }
  return [...forms];
}

/** The sentence a word sits in, to keep with a saved flashcard as its example. */
export function sentenceAround(paragraph: string, wordStart: number): string {
  const before = paragraph.slice(0, wordStart);
  const start = Math.max(before.lastIndexOf('. '), before.lastIndexOf('? '), before.lastIndexOf('! '), before.lastIndexOf(': '));
  const rest = paragraph.slice(wordStart);
  const endMatch = rest.match(/[.?!](?:[“”"]|\s|$)/);
  const end = endMatch?.index !== undefined ? wordStart + endMatch.index + 1 : paragraph.length;
  return paragraph
    .slice(start >= 0 ? start + 2 : 0, end)
    .replace(/^[„“"\s]+/, '')
    .trim();
}
