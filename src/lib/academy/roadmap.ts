import type { Attempt } from './evidence';
import { lessonById } from './lessons';
import { topics } from './topics';
import type { Lesson, Topic } from './types';

/**
 * The roadmap: each topic's state, worked out from finished lessons and their checks.
 * Mastery needs the same check passed twice, at least two days apart, so it reflects memory and
 * not the minute after the lesson.
 */

/** One finished lesson: how its independent check went (marked items only). */
export type LessonRun = { at: string; right: number; total: number };
export type LessonLog = Record<string, LessonRun[]>;

/** A check passes at 80%. */
export const PASS = 0.8;
/** Days between two passing checks for a lesson to count as secure. */
export const RETEST_DAYS = 2;

export type TopicState = 'not-started' | 'learning' | 'practised' | 'mastered';

export const topicStateLabels: Record<TopicState, string> = {
  'not-started': 'Not started',
  learning: 'Learning',
  practised: 'Practised',
  mastered: 'Mastered',
};

/** Whole calendar days from a to b, on the phone's calendar. */
export function calendarDays(a: Date, b: Date) {
  const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((day(b) - day(a)) / 86_400_000);
}

export const passed = (r: LessonRun) => r.total === 0 || r.right / r.total >= PASS;

export const lessonDone = (log: LessonLog, id: string) => (log[id]?.length ?? 0) > 0;

/** Two passing checks at least RETEST_DAYS apart. */
export function lessonSecure(runs: LessonRun[] = []) {
  const passes = runs.filter(passed).map((r) => new Date(r.at));
  if (passes.length < 2) return false;
  const first = passes[0];
  return passes.some((d) => calendarDays(first, d) >= RETEST_DAYS);
}

/**
 * When a lesson's check should come back: two days after its first pass, or the next day after a
 * check that didn't pass. Null when it's secure or not done yet.
 */
export function retestDue(runs: LessonRun[] = [], now = new Date()) {
  if (runs.length === 0 || lessonSecure(runs)) return false;
  const firstPass = runs.find(passed);
  if (firstPass) return calendarDays(new Date(firstPass.at), now) >= RETEST_DAYS;
  return calendarDays(new Date(runs[runs.length - 1].at), now) >= 1;
}

export type TopicProgress = {
  topic: Topic;
  state: TopicState;
  /** Lessons finished, of those written. */
  done: number;
  total: number;
  /** False while the topic's lessons aren't written yet. */
  available: boolean;
};

export function topicProgress(topic: Topic, log: LessonLog, attempts: Attempt[]): TopicProgress {
  const total = topic.lessons.length;
  const done = topic.lessons.filter((id) => lessonDone(log, id)).length;
  const available = total > 0;
  let state: TopicState = 'not-started';
  if (available && topic.lessons.every((id) => lessonSecure(log[id]))) state = 'mastered';
  else if (available && done === total) state = 'practised';
  else if (done > 0 || attempts.some((a) => a.topic === topic.id && a.source !== 'diagnostic')) state = 'learning';
  return { topic, state, done, total, available };
}

export const roadmap = (log: LessonLog, attempts: Attempt[]) => topics.map((t) => topicProgress(t, log, attempts));

/** The next lesson in teaching order that hasn't been done. */
export function nextLesson(log: LessonLog): Lesson | undefined {
  for (const t of topics) for (const id of t.lessons) if (!lessonDone(log, id)) return lessonById(id);
  return undefined;
}

/** Lessons whose check is due again, oldest first. */
export function retestsDue(log: LessonLog, now = new Date()): Lesson[] {
  return topics
    .flatMap((t) => t.lessons)
    .filter((id) => retestDue(log[id], now))
    .map((id) => lessonById(id)!)
    .filter(Boolean);
}
