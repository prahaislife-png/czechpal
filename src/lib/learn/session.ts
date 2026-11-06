import { dueCards, type Deck, type UserCard } from './deck';
import { buildListening, type ListenItem } from './listening';
import { phraseId, type Phrase, type Situation, type SituationId } from './situations';
import type { DailyMinutes } from './profile';

/**
 * The daily session: about five minutes, made for this learner today. A warm-up with the words
 * that are due, then a few phrases for the situation coming up in their life, then hearing those
 * phrases spoken. Built from their data each time, so it never repeats what they already know.
 */

export type SessionStep =
  | { kind: 'card'; card: UserCard }
  | { kind: 'phrase'; id: string; phrase: Phrase; situation: SituationId }
  | { kind: 'listen'; item: ListenItem };

/** How each practised phrase went: shown and known counts, and the last day it was practised. */
export type PhraseMemory = Record<string, { seen: number; known: number; last: string }>;

export type { DailyMinutes };

/** Sizes for a session of each length: about 20 s a card, 40 s a phrase, 30 s a listen. */
export const sessionSize: Record<DailyMinutes, { cards: number; phrases: number; listen: number }> = {
  5: { cards: 4, phrases: 3, listen: 2 },
  10: { cards: 8, phrases: 5, listen: 3 },
  15: { cards: 12, phrases: 6, listen: 4 },
  20: { cards: 16, phrases: 7, listen: 5 },
  30: { cards: 24, phrases: 9, listen: 6 },
};

/** Phrases to practise next: never shown first, then the ones not known yet, then the least known; in the pack's order. */
export function nextPhrases(situation: Situation, memory: PhraseMemory, count: number) {
  return situation.phrases
    .map((phrase, i) => ({ phrase, id: phraseId(situation.id, i), i }))
    .map((p) => ({ ...p, m: memory[p.id] }))
    .sort((a, b) => {
      // Never shown: 0. Shown but not known yet: 1. Known: higher the more often it was known.
      const score = (x: typeof a) => (x.m ? 1 + x.m.known * 2 : 0);
      return score(a) - score(b) || a.i - b.i;
    })
    .slice(0, count);
}

/** How well a situation's phrases are known: the share practised and answered right at least once. */
export function situationProgress(situation: Situation, memory: PhraseMemory) {
  const known = situation.phrases.filter((_, i) => (memory[phraseId(situation.id, i)]?.known ?? 0) > 0).length;
  return { known, total: situation.phrases.length };
}

export function buildSession({
  deck,
  focus,
  memory,
  minutes = 5,
  canListen,
  seed,
  now = new Date(),
}: {
  deck: Deck;
  focus: Situation;
  memory: PhraseMemory;
  minutes?: DailyMinutes;
  /** Listening needs the phone's Czech voice. */
  canListen: boolean;
  seed: number;
  now?: Date;
}): SessionStep[] {
  const size = sessionSize[minutes];
  const cards: SessionStep[] = dueCards(deck, now, size.cards).map((card) => ({ kind: 'card', card }));
  // No words due yet: more phrases instead, so the session is still about five minutes.
  const phraseCount = size.phrases + (cards.length ? 0 : Math.ceil(size.cards / 3));
  const phrases: SessionStep[] = nextPhrases(focus, memory, phraseCount).map(({ phrase, id }) => ({
    kind: 'phrase',
    id,
    phrase,
    situation: focus.id,
  }));
  const listen: SessionStep[] = canListen
    ? buildListening({ words: [], lines: focus.phrases, count: size.listen, seed }).map((item) => ({ kind: 'listen', item }))
    : [];
  return [...cards, ...phrases, ...listen];
}

/** "4 words · 3 phrases · 2 to listen to". */
export function sessionSummary(steps: SessionStep[]) {
  const n = (kind: SessionStep['kind']) => steps.filter((s) => s.kind === kind).length;
  const parts = [
    n('card') ? `${n('card')} ${n('card') === 1 ? 'word' : 'words'}` : '',
    n('phrase') ? `${n('phrase')} ${n('phrase') === 1 ? 'phrase' : 'phrases'}` : '',
    n('listen') ? `${n('listen')} to listen to` : '',
  ];
  return parts.filter(Boolean).join(' · ');
}

/** Remembers one practised phrase. */
export function rememberPhrase(memory: PhraseMemory, id: string, knew: boolean, day: string): PhraseMemory {
  const m = memory[id] ?? { seen: 0, known: 0, last: day };
  return { ...memory, [id]: { seen: m.seen + 1, known: m.known + (knew ? 1 : 0), last: day } };
}
