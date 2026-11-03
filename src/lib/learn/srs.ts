import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';

/**
 * Flashcard scheduling with FSRS (the open-source scheduler Anki uses), through ts-fsrs. Runs on
 * the phone: reviewing costs nothing and works offline. Cards are stored with ISO dates so they
 * survive JSON storage.
 */

export type Answer = 'again' | 'hard' | 'good' | 'easy';

export type Schedule = Omit<Card, 'due' | 'last_review'> & { due: string; last_review?: string };

export type ReviewEntry = { cardId: string; answer: Answer; at: string; nextDue: string };

const grades: Record<Answer, Grade> = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };

const scheduler = fsrs(generatorParameters({ request_retention: 0.9, maximum_interval: 3 * 365, enable_fuzz: true }));

const store = (card: Card): Schedule => ({
  ...card,
  due: card.due.toISOString(),
  last_review: card.last_review ? card.last_review.toISOString() : undefined,
});

/** A card nobody has reviewed yet: due now. */
export const newSchedule = (now = new Date()): Schedule => store(createEmptyCard(now));

/** The card's next schedule after an answer, and the log entry for it. */
export function review(cardId: string, schedule: Schedule, answer: Answer, now = new Date()): { schedule: Schedule; entry: ReviewEntry } {
  const { card } = scheduler.next({ ...schedule, last_review: schedule.last_review ?? null }, now, grades[answer]);
  const next = store(card);
  return { schedule: next, entry: { cardId, answer, at: now.toISOString(), nextDue: next.due } };
}

/** When each answer would bring the card back, for the buttons' labels. */
export function preview(schedule: Schedule, now = new Date()): Record<Answer, Date> {
  const all = scheduler.repeat({ ...schedule, last_review: schedule.last_review ?? null }, now);
  return { again: all[Rating.Again].card.due, hard: all[Rating.Hard].card.due, good: all[Rating.Good].card.due, easy: all[Rating.Easy].card.due };
}

export const isDue = (schedule: Schedule, now = new Date()) => new Date(schedule.due).getTime() <= now.getTime();

export const isNew = (schedule: Schedule) => schedule.state === State.New;

/** "<1 min", "10 min", "3 h", "2 d", "1 mo": how long until a date. */
export function untilLabel(due: Date, now = new Date()) {
  const ms = due.getTime() - now.getTime();
  if (ms < 60_000) return '<1 min';
  const min = Math.round(ms / 60_000);
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 31) return `${d} d`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo} mo`;
  return `${Math.round(d / 365)} y`;
}
