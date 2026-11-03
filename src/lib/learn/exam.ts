/**
 * The Czech A2 exam for permanent residence, as published by its organiser (NPI ČR on
 * cestina-pro-cizince.cz). Only facts checked on the official pages are written here, each with
 * where it came from and when it was checked. Recheck before relying on them: the format of
 * the writing and speaking parts changed on 11 April 2026.
 */

export const EXAM_CHECKED_ON = '2026-11-03';

export const EXAM_SOURCES = {
  overview: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/',
  newFormatTest: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/priprava-na-zkousku/modelovy-test-novy-format/',
} as const;

/** The date the new format of writing and speaking applies from. */
export const NEW_FORMAT_FROM = '2026-04-11';

export type ExamPart = {
  id: 'reading' | 'writing' | 'listening' | 'speaking';
  label: string;
  minutes: number;
  /** "about 40 minutes" for listening, which follows the recording. */
  approx?: boolean;
  points: number;
};

/** The four parts, their times and maximum points (official overview page). */
export const examParts: ExamPart[] = [
  { id: 'reading', label: 'Reading', minutes: 40, points: 25 },
  { id: 'writing', label: 'Writing', minutes: 25, points: 20 },
  { id: 'listening', label: 'Listening', minutes: 40, approx: true, points: 25 },
  { id: 'speaking', label: 'Speaking', minutes: 15, points: 40 },
];

/** To pass: at least 42 of 70 in the written part (reading, writing, listening) and 24 of 40 in speaking, 60% of each. */
export const passMarks = { written: { need: 42, of: 70 }, speaking: { need: 24, of: 40 } } as const;

/** Whole days from today until the exam date (YYYY-MM-DD), by the local calendar. */
export function daysToExam(date: string, now = new Date()) {
  const [y, m, d] = date.split('-').map(Number);
  const exam = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam.getTime() - today.getTime()) / 86_400_000);
}
