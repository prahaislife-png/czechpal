/**
 * What the learner did each day, by local date: the plan's ticks, the streak and the progress
 * screen all read it. Counts only, never content.
 */

export type DayLog = {
  reviews: number;
  chapters: number;
  /** Listening sessions finished. */
  listening: number;
  heard: number;
  heardRight: number;
  /** Phrases practised for a situation. */
  phrases: number;
  /** Daily sessions finished. */
  sessions: number;
  /** Course work: lesson checks, exam practice, writing, speaking and the starting check. */
  study: number;
};

export type Days = Record<string, DayLog>;

const KEEP_DAYS = 400;

const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar day, YYYY-MM-DD: a review at 23:30 counts for that evening, wherever the phone is. */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const daysBefore = (now: Date, n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - n, 12);

export const emptyDay = (): DayLog => ({ reviews: 0, chapters: 0, listening: 0, heard: 0, heardRight: 0, phrases: 0, sessions: 0, study: 0 });

/** Adds to today's counts. Old days beyond about a year are dropped. */
export function logDay(days: Days, add: Partial<DayLog>, now = new Date()): Days {
  const key = dayKey(now);
  // Days saved before a count existed simply start it at 0.
  const day = { ...emptyDay(), ...days[key] };
  const next: DayLog = { ...day };
  for (const k of Object.keys(add) as (keyof DayLog)[]) next[k] = day[k] + Math.max(0, add[k] ?? 0);
  const all = { ...days, [key]: next };
  const keys = Object.keys(all).sort();
  if (keys.length <= KEEP_DAYS) return all;
  return Object.fromEntries(keys.slice(-KEEP_DAYS).map((k) => [k, all[k]]));
}

export const isActive = (d: DayLog | undefined) => !!d && d.reviews + d.chapters + d.listening + (d.phrases ?? 0) + (d.sessions ?? 0) + (d.study ?? 0) > 0;

export const today = (days: Days, now = new Date()): DayLog => ({ ...emptyDay(), ...days[dayKey(now)] });

/**
 * Days in a row with some practice. Today counts once something is done; until then the streak
 * from yesterday still stands, so it doesn't read 0 every morning.
 */
export function streak(days: Days, now = new Date()): number {
  let n = 0;
  let i = isActive(days[dayKey(now)]) ? 0 : 1;
  while (isActive(days[dayKey(daysBefore(now, i))])) {
    n++;
    i++;
  }
  return n;
}

/** The last seven days, oldest first, for the week strip. */
export function lastWeek(days: Days, now = new Date()) {
  return Array.from({ length: 7 }, (_, k) => {
    const d = daysBefore(now, 6 - k);
    const key = dayKey(d);
    return { key, weekday: d.getDay(), active: isActive(days[key]), today: k === 6 };
  });
}

/** Totals over the last `n` days, today included. */
export function totals(days: Days, n: number, now = new Date()): DayLog {
  const sum = emptyDay();
  for (let i = 0; i < n; i++) {
    const d = days[dayKey(daysBefore(now, i))];
    if (!d) continue;
    // Days saved before a count existed don't have it.
    for (const k of Object.keys(sum) as (keyof DayLog)[]) sum[k] += d[k] ?? 0;
  }
  return sum;
}
