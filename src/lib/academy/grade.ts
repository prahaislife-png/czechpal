import { checkFormAnswer, countWords } from '@/lib/learn/exam';

import type { ChoiceExercise, TypeExercise, WriteExercise } from './types';

/**
 * Deterministic marking. A choice is right or wrong; a typed answer is compared with the accepted
 * answers after tidying spaces, capitals and end punctuation, never accents; a written answer is
 * checked only for what the exam states (words, capital, full stop) and isn't given a score.
 */

export type TypeResult = { correct: boolean; /** Right apart from the accents (háček, čárka). */ accentsOnly: boolean };

export const tidy = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.!?,;:„“"”’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const plain = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

export const gradeChoice = (e: ChoiceExercise, chosen: number) => chosen === e.answer;

export function gradeType(e: TypeExercise, typed: string): TypeResult {
  const t = tidy(typed);
  if (!t) return { correct: false, accentsOnly: false };
  const accepted = e.accept.map(tidy);
  if (accepted.includes(t)) return { correct: true, accentsOnly: false };
  return { correct: false, accentsOnly: accepted.some((a) => plain(a) === plain(t)) };
}

export type WriteResult = { words: number; minWords: number; enoughWords: boolean; capital: boolean; endsWithStop: boolean };

export function checkWrite(e: WriteExercise, text: string): WriteResult {
  const c = checkFormAnswer(text);
  return { words: countWords(text), minWords: e.minWords, enoughWords: c.words >= e.minWords, capital: c.capital, endsWithStop: c.endsWithStop };
}

/**
 * The order options are shown in: shuffled, but the same every time for an item, so the answer
 * isn't always in one place and a retry looks the same.
 */
export function optionOrder(e: Pick<ChoiceExercise, 'id' | 'options'>): number[] {
  let h = 2166136261;
  for (const c of e.id) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const order = e.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
