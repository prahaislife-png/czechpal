import { lexemeById, grammarLine } from './lexicon';
import { isDue, isNew, newSchedule, review, type Answer, type ReviewEntry, type Schedule } from './srs';

/**
 * The learner's own flashcards: words saved from stories, and cards they write themselves.
 * Plain functions over plain data, like reading progress.
 */

export type UserCard = {
  id: string;
  /** Saved from the dictionary; absent for a card the learner wrote. */
  lexemeId?: string;
  cs: string;
  en: string;
  /** Grammar shown on the back: "noun · feminine". */
  grammar?: string;
  /** The sentence it was met in. */
  example?: { cs: string; contentId?: string };
  source: 'story' | 'own';
  createdAt: string;
  schedule: Schedule;
};

export type Deck = Record<string, UserCard>;

const MAX_TEXT = 120;

export const cardIdFor = (lexemeId: string) => `lex:${lexemeId}`;

export const hasWord = (deck: Deck, lexemeId: string) => !!deck[cardIdFor(lexemeId)];

/** Saves a dictionary word. Saving it again keeps the card and its schedule as they are. */
export function saveWord(deck: Deck, lexemeId: string, example?: UserCard['example'], now = new Date()): Deck {
  const lexeme = lexemeById(lexemeId);
  if (!lexeme || hasWord(deck, lexemeId)) return deck;
  const id = cardIdFor(lexemeId);
  return {
    ...deck,
    [id]: {
      id,
      lexemeId,
      cs: lexeme.lemma,
      en: lexeme.en,
      grammar: grammarLine(lexeme),
      example,
      source: 'story',
      createdAt: now.toISOString(),
      schedule: newSchedule(now),
    },
  };
}

export type OwnCardError = 'empty' | 'too_long' | 'duplicate';

/** A card the learner writes: Czech on the front, their meaning on the back. */
export function addOwnCard(deck: Deck, cs: string, en: string, now = new Date(), id = `own:${now.getTime().toString(36)}`): Deck | OwnCardError {
  const front = cs.trim().replace(/\s+/g, ' ');
  const back = en.trim().replace(/\s+/g, ' ');
  if (!front || !back) return 'empty';
  if (front.length > MAX_TEXT || back.length > MAX_TEXT) return 'too_long';
  const key = front.toLocaleLowerCase('cs');
  if (Object.values(deck).some((c) => c.cs.toLocaleLowerCase('cs') === key)) return 'duplicate';
  return { ...deck, [id]: { id, cs: front, en: back, source: 'own', createdAt: now.toISOString(), schedule: newSchedule(now) } };
}

export function removeCard(deck: Deck, id: string): Deck {
  if (!deck[id]) return deck;
  const { [id]: _removed, ...rest } = deck;
  return rest;
}

/**
 * Applies an answer. A card that isn't due (the same answer sent twice, say from a double tap)
 * is left alone, so one review is never counted twice.
 */
export function answerCard(deck: Deck, id: string, answer: Answer, now = new Date()): { deck: Deck; entry?: ReviewEntry } {
  const card = deck[id];
  if (!card || !isDue(card.schedule, now)) return { deck };
  const { schedule, entry } = review(id, card.schedule, answer, now);
  return { deck: { ...deck, [id]: { ...card, schedule } }, entry };
}

/** Cards to review now: overdue first, new cards last, at most `limit`. */
export function dueCards(deck: Deck, now = new Date(), limit = 20): UserCard[] {
  return Object.values(deck)
    .filter((c) => isDue(c.schedule, now))
    .sort((a, b) => Number(isNew(a.schedule)) - Number(isNew(b.schedule)) || a.schedule.due.localeCompare(b.schedule.due))
    .slice(0, limit);
}

/** When the next card comes due, if none is due now. */
export function nextDue(deck: Deck, now = new Date()): Date | null {
  const later = Object.values(deck)
    .map((c) => new Date(c.schedule.due))
    .filter((d) => d > now)
    .sort((a, b) => a.getTime() - b.getTime());
  return later[0] ?? null;
}
