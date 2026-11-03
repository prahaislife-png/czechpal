import { State } from 'ts-fsrs';

import { totals, type Days } from './activity';
import { library, topicsInLibrary } from './content';
import type { Deck, UserCard } from './deck';
import { isFinished, quizScore, type ReadingProgress } from './progress';
import type { Topic } from './types';

/**
 * The numbers on the progress screen. A word counts as known once its next review is three
 * weeks or more away: FSRS's estimate that it will still be remembered then.
 */

const KNOWN_DAYS = 21;

export const isKnown = (c: UserCard) => c.schedule.state === State.Review && c.schedule.scheduled_days >= KNOWN_DAYS;

export function learnStats({ progress, deck, days, now = new Date() }: { progress: Record<string, ReadingProgress>; deck: Deck; days: Days; now?: Date }) {
  const read = library.filter((c) => isFinished(progress[c.id], c));
  const quiz = library.reduce(
    (acc, c) => {
      const s = quizScore(progress[c.id], c);
      return { right: acc.right + s.right, answered: acc.answered + s.answered };
    },
    { right: 0, answered: 0 },
  );
  const cards = Object.values(deck);
  const known = cards.filter(isKnown).length;
  const month = totals(days, 30, now);
  const topics = topicsInLibrary.map((t: Topic) => {
    const all = library.filter((c) => c.topics.includes(t));
    return { topic: t, read: all.filter((c) => isFinished(progress[c.id], c)).length, total: all.length };
  });
  return {
    texts: { read: read.length, total: library.length },
    quiz,
    words: { saved: cards.length, known, learning: cards.length - known },
    month,
    listening: { heard: month.heard, right: month.heardRight },
    topics,
  };
}

export type LearnStats = ReturnType<typeof learnStats>;
