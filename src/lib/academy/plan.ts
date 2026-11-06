import type { DailyMinutes, Difficulty } from '@/lib/learn/profile';

import { weakObjectives, type Attempt } from './evidence';
import { grammarById } from './grammar';
import { lessonDone, nextLesson, retestsDue, type LessonLog } from './roadmap';
import { taskSets } from './tasks';
import { speakingTasks } from './tasks/speaking';
import { writingTasks } from './tasks/writing';
import { topicById, topics } from './topics';

/**
 * Today's plan, by rules: the starting check first; then a check that is due again; the next
 * lesson; mistakes to go over; practice in the exam's own task formats; grammar the learner keeps
 * missing; words that are due; a story for the current topic.
 * It fits the minutes chosen and links only to things that work today.
 */

export type PlanStep =
  | { kind: 'diagnostic'; minutes: number; title: string; why: string }
  | { kind: 'lesson'; id: string; minutes: number; title: string; why: string }
  | { kind: 'retest'; id: string; minutes: number; title: string; why: string }
  | { kind: 'grammar'; id: string; minutes: number; title: string; why: string }
  | { kind: 'words'; count: number; minutes: number; title: string; why: string }
  | { kind: 'story'; id: string; minutes: number; title: string; why: string }
  | { kind: 'listen'; minutes: number; title: string; why: string }
  | { kind: 'task'; id: string; minutes: number; title: string; why: string }
  | { kind: 'writing'; id: string; minutes: number; title: string; why: string }
  | { kind: 'speaking'; id: string; minutes: number; title: string; why: string }
  | { kind: 'mistakes'; count: number; minutes: number; title: string; why: string };

export type PlanInput = {
  minutes: DailyMinutes;
  difficulty?: Difficulty;
  diagnosticDone: boolean;
  log: LessonLog;
  attempts: Attempt[];
  wordsDue: number;
  /** Library texts not yet finished, by id. */
  unread: (id: string) => boolean;
  storyTitle: (id: string) => string | undefined;
  canListen: boolean;
  /** Finished exam-task, writing and speaking sets: how many times each. */
  tasksDone?: Record<string, number>;
  /** Items whose latest answer was wrong. */
  mistakes?: number;
  now?: Date;
};

export const STEP_MINUTES = { diagnostic: 6, lesson: 6, retest: 3, grammar: 2, words: 3, story: 5, listen: 4, task: 6, writing: 8, speaking: 6, mistakes: 3 } as const;

/** Mistakes worth a step of their own. */
export const MISTAKES_STEP = 3;

export function dailyPlan(input: PlanInput): PlanStep[] {
  const { minutes, difficulty, diagnosticDone, log, attempts, wordsDue, unread, storyTitle, canListen, tasksDone = {}, mistakes = 0, now = new Date() } = input;
  const candidates: PlanStep[] = [];

  if (!diagnosticDone)
    candidates.push({ kind: 'diagnostic', minutes: STEP_MINUTES.diagnostic, title: 'Take the starting check', why: 'About five minutes. It shows where to begin.' });

  for (const l of retestsDue(log, now).slice(0, 2))
    candidates.push({ kind: 'retest', id: l.id, minutes: STEP_MINUTES.retest, title: `Check again: ${l.title}`, why: 'A second check, days later, makes it stick.' });

  if (mistakes >= MISTAKES_STEP)
    candidates.push({ kind: 'mistakes', count: mistakes, minutes: STEP_MINUTES.mistakes, title: 'Go over your mistakes', why: `${mistakes} answers to get right this time` });

  const lesson = nextLesson(log);
  if (lesson) candidates.push({ kind: 'lesson', id: lesson.id, minutes: STEP_MINUTES.lesson, title: lesson.title, why: `Next in ${topicById(lesson.topic)?.title ?? 'your roadmap'}` });

  // Exam-format practice starts once there is a first lesson behind the learner.
  const task = diagnosticDone && Object.keys(log).some((id) => lessonDone(log, id)) ? examPractice(difficulty, canListen, tasksDone) : null;

  const weakGrammar = weakObjectives(attempts, 5).find((w) => w.objective.startsWith('g:') && grammarById(w.objective.slice(2)));
  const grammar = weakGrammar
    ? ({ kind: 'grammar', id: weakGrammar.objective.slice(2), minutes: STEP_MINUTES.grammar, title: weakGrammar.label, why: `${weakGrammar.right} of ${weakGrammar.total} right lately` } as const)
    : null;

  const words = wordsDue > 0 ? ({ kind: 'words', count: wordsDue, minutes: STEP_MINUTES.words, title: 'Review your words', why: `${wordsDue} ${wordsDue === 1 ? 'word is' : 'words are'} due` } as const) : null;

  // A story from the topic being learnt, else from the first topic with one unread.
  const topic = topicById(lesson?.topic) ?? topicById('personal');
  const storyId = [...(topic?.texts ?? []), ...topics.flatMap((t) => t.texts)].find((id) => unread(id) && storyTitle(id));
  const story = storyId ? ({ kind: 'story', id: storyId, minutes: STEP_MINUTES.story, title: storyTitle(storyId)!, why: 'Reading practice with a real text' } as const) : null;

  const listen = canListen ? ({ kind: 'listen', minutes: STEP_MINUTES.listen, title: 'Listening practice', why: 'Short Czech sentences, heard and understood' } as const) : null;

  // What the learner finds hardest comes before the rest.
  const extras =
    difficulty === 'reading'
      ? [task, story, grammar, words, listen]
      : difficulty === 'listening'
        ? [task, listen, grammar, words, story]
        : difficulty === 'writing' || difficulty === 'speaking'
          ? [task, grammar, words, story, listen]
          : [grammar, words, task, story, listen];
  candidates.push(...extras.filter((x): x is NonNullable<typeof x> => x !== null));

  const plan: PlanStep[] = [];
  let used = 0;
  for (const c of candidates) {
    if (plan.length > 0 && used + c.minutes > minutes) continue;
    plan.push(c);
    used += c.minutes;
  }
  return plan;
}

const partNames = { reading: 'Reading', listening: 'Listening' } as const;

/**
 * The exam-format practice to do next: in the skill the learner finds hardest, else the skill
 * practised least; within it, the set done fewest times.
 */
function examPractice(difficulty: Difficulty | undefined, canListen: boolean, done: Record<string, number>): PlanStep | null {
  const count = (id: string) => done[id] ?? 0;
  const parts = (['reading', 'listening', 'writing', 'speaking'] as const).filter((p) => p !== 'listening' || canListen);
  const total = (p: (typeof parts)[number]) =>
    (p === 'writing' ? writingTasks : p === 'speaking' ? speakingTasks : taskSets.filter((s) => s.part === p)).reduce((n, s) => n + count(s.id), 0);
  const part = parts.includes(difficulty as (typeof parts)[number]) ? (difficulty as (typeof parts)[number]) : [...parts].sort((a, b) => total(a) - total(b))[0];
  if (part === 'writing') {
    const w = [...writingTasks].sort((a, b) => count(a.id) - count(b.id))[0];
    return { kind: 'writing', id: w.id, minutes: STEP_MINUTES.writing, title: w.title, why: count(w.id) ? 'Writing, as in the exam' : 'New: writing, as in the exam' };
  }
  if (part === 'speaking') {
    const t = [...speakingTasks].sort((a, b) => count(a.id) - count(b.id) || a.task - b.task)[0];
    return { kind: 'speaking', id: t.id, minutes: STEP_MINUTES.speaking, title: `Speaking ${t.task}: ${t.title}`, why: count(t.id) ? 'Say it aloud, then play it back' : 'New: speaking, as in the exam' };
  }
  const set = taskSets.filter((s) => s.part === part).sort((a, b) => count(a.id) - count(b.id) || a.task - b.task)[0];
  return { kind: 'task', id: set.id, minutes: STEP_MINUTES.task, title: `${partNames[part]} ${set.task}: ${set.title}`, why: 'Practice in the exam’s own format' };
}

export const planMinutes = (plan: PlanStep[]) => plan.reduce((n, s) => n + s.minutes, 0);
