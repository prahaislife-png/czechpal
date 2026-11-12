import type { Level, Topic } from './types';

/**
 * The learner's plan: why they're learning, where they start and how long a day they have.
 * Everything Learn suggests (today's plan, missions, the level of texts) follows from it.
 */

export type Goal = 'exam' | 'everyday' | 'work';
export type StartLevel = 'new' | 'A1' | 'A2' | 'unsure';
export type DailyMinutes = 5 | 10 | 15 | 20 | 30;
/** What the learner finds hardest, from the A2 setup. */
export type Difficulty = 'reading' | 'listening' | 'writing' | 'speaking' | 'unsure';

export type LearnProfile = {
  goal: Goal;
  level: StartLevel;
  minutes: DailyMinutes;
  /** Topics to read about first; empty means any. */
  topics: Topic[];
  /** The exam date when there is one, YYYY-MM-DD. Only asked when the goal is the exam. */
  examDate?: string;
  /** Optional: what they find hardest. Plans start there. */
  difficulty?: Difficulty;
  updatedAt: string;
};

export const goals: { id: Goal; label: string; detail: string }[] = [
  { id: 'exam', label: 'Pass the A2 exam', detail: 'The Czech exam for permanent residence' },
  { id: 'everyday', label: 'Get by day to day', detail: 'Shops, the doctor, the post office, neighbours' },
  { id: 'work', label: 'Use Czech at work', detail: 'Colleagues, first days, appointments' },
];

export const startLevels: { id: StartLevel; label: string; detail: string }[] = [
  { id: 'new', label: 'Just starting', detail: 'A few words, or none yet' },
  { id: 'A1', label: 'I know the basics', detail: 'Greetings, numbers, simple sentences' },
  { id: 'A2', label: 'I can get by', detail: 'Short conversations about everyday things' },
  { id: 'unsure', label: 'I’m not sure', detail: 'The short check will tell' },
];

export const minuteOptions: DailyMinutes[] = [5, 10, 15, 20, 30];

export const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'reading', label: 'Reading' },
  { id: 'listening', label: 'Listening' },
  { id: 'writing', label: 'Writing' },
  { id: 'speaking', label: 'Speaking' },
  { id: 'unsure', label: 'Not sure yet' },
];

/** A day's minutes before the learner has chosen: room for a lesson and something to go over. */
export const DEFAULT_MINUTES: DailyMinutes = 10;

/** Nothing chosen yet reads as the default; minutes saved by an older version, or anything unexpected, as 5. */
export const minutesOf = (p: { minutes?: number } | undefined): DailyMinutes =>
  p?.minutes === undefined ? DEFAULT_MINUTES : minuteOptions.includes(p.minutes as DailyMinutes) ? (p.minutes as DailyMinutes) : 5;

/** Topics a goal starts with; the learner can change them. */
export const goalTopics: Record<Goal, Topic[]> = {
  exam: [],
  everyday: ['shopping', 'health', 'services', 'food'],
  work: ['work', 'appointments', 'travel'],
};

export function makeProfile(input: Omit<LearnProfile, 'updatedAt'>, now = new Date()): LearnProfile {
  const examDate = input.goal === 'exam' ? input.examDate : undefined;
  return { ...input, topics: [...new Set(input.topics)], examDate, updatedAt: now.toISOString() };
}

/** The library level to read at. Someone just starting reads A1 too: the texts are short and every word can be looked up. */
export const readingLevel = (l: StartLevel): Level => (l === 'A2' ? 'A2' : 'A1');

/** How many cards a day's review covers, by the minutes chosen. */
export const reviewTarget: Record<DailyMinutes, number> = { 5: 10, 10: 20, 15: 30, 20: 40, 30: 60 };

/** How many listening items a day's practice has. */
export const listenTarget: Record<DailyMinutes, number> = { 5: 5, 10: 8, 15: 10, 20: 12, 30: 15 };
