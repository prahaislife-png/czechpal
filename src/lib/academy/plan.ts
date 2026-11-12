import type { DailyMinutes } from '@/lib/learn/profile';

import { weakObjectives, type Attempt } from './evidence';
import { grammarById } from './grammar';
import { buildJourney, stepLabel, upcomingSteps, type JourneyStep } from './journey';
import { retestsDue, type LessonLog } from './roadmap';

/**
 * Today's plan, by rules: the next steps of the A2 journey, with what needs going over. There is
 * nothing to set up first: on day one the plan is lesson one.
 *
 * In order: a check that is due again; the next step of the journey (a lesson, or an exam task);
 * mistakes to go over; words that are due; grammar the learner keeps missing; then the journey's
 * following steps while the minutes last. It always has at least one step, and links only to
 * things that work today (no listening without a Czech voice).
 */

export type PlanStep =
  | { kind: 'lesson'; id: string; minutes: number; title: string; why: string }
  | { kind: 'retest'; id: string; minutes: number; title: string; why: string }
  | { kind: 'grammar'; id: string; minutes: number; title: string; why: string }
  | { kind: 'words'; count: number; minutes: number; title: string; why: string }
  /** A reading or listening set in the exam's format. */
  | { kind: 'task'; id: string; minutes: number; title: string; why: string }
  | { kind: 'writing'; id: string; minutes: number; title: string; why: string }
  | { kind: 'speaking'; id: string; minutes: number; title: string; why: string }
  | { kind: 'mistakes'; count: number; minutes: number; title: string; why: string };

export type PlanInput = {
  minutes: DailyMinutes;
  log: LessonLog;
  attempts: Attempt[];
  wordsDue: number;
  canListen: boolean;
  /** Finished exam-task, writing and speaking sets: how many times each. */
  tasksDone?: Record<string, number>;
  /** Items whose latest answer was wrong. */
  mistakes?: number;
  now?: Date;
};

export const STEP_MINUTES = { lesson: 6, retest: 3, grammar: 2, words: 3, task: 6, writing: 8, speaking: 6, mistakes: 3 } as const;

/** Mistakes worth a step of their own. */
export const MISTAKES_STEP = 3;

/** How many journey steps a day's plan may hold. */
const JOURNEY_STEPS = 3;

/** A step of the journey as a step of today's plan. */
function journeyStep({ unit, node }: JourneyStep): PlanStep {
  const why = `Unit ${unit.n} · ${unit.topic.title} · ${stepLabel(node).toLowerCase()}`;
  if (node.kind === 'lesson') return { kind: 'lesson', id: node.id, minutes: STEP_MINUTES.lesson, title: node.title, why };
  if (node.part === 'writing') return { kind: 'writing', id: node.id, minutes: STEP_MINUTES.writing, title: node.title, why };
  if (node.part === 'speaking') return { kind: 'speaking', id: node.id, minutes: STEP_MINUTES.speaking, title: node.title, why };
  return { kind: 'task', id: node.id, minutes: STEP_MINUTES.task, title: node.title, why };
}

export function dailyPlan(input: PlanInput): PlanStep[] {
  const { minutes, log, attempts, wordsDue, canListen, tasksDone = {}, mistakes = 0, now = new Date() } = input;

  const retests: PlanStep[] = retestsDue(log, now)
    .slice(0, 2)
    .map((l) => ({ kind: 'retest', id: l.id, minutes: STEP_MINUTES.retest, title: `Check again: ${l.title}`, why: 'A second check, days later, makes it stick.' }));

  const journey = upcomingSteps(buildJourney(log, tasksDone, { canListen, now }), JOURNEY_STEPS, canListen).map(journeyStep);

  const goOver: PlanStep | null =
    mistakes >= MISTAKES_STEP ? { kind: 'mistakes', count: mistakes, minutes: STEP_MINUTES.mistakes, title: 'Go over your mistakes', why: `${mistakes} answers to get right this time` } : null;

  const words: PlanStep | null =
    wordsDue > 0 ? { kind: 'words', count: wordsDue, minutes: STEP_MINUTES.words, title: 'Review your words', why: `${wordsDue} ${wordsDue === 1 ? 'word is' : 'words are'} due` } : null;

  const weak = weakObjectives(attempts, 5).find((w) => w.objective.startsWith('g:') && grammarById(w.objective.slice(2)));
  const grammar: PlanStep | null = weak
    ? { kind: 'grammar', id: weak.objective.slice(2), minutes: STEP_MINUTES.grammar, title: weak.label, why: `${weak.right} of ${weak.total} right lately` }
    : null;

  const candidates = [...retests, journey[0], goOver, words, grammar, ...journey.slice(1)].filter((x): x is PlanStep => !!x);

  const plan: PlanStep[] = [];
  let used = 0;
  for (const c of candidates) {
    if (plan.length > 0 && used + c.minutes > minutes) continue;
    plan.push(c);
    used += c.minutes;
  }
  return plan;
}

export const planMinutes = (plan: PlanStep[]) => plan.reduce((n, s) => n + s.minutes, 0);

/** What the learner did today, to tick off the plan's steps. */
export type TodayEvidence = {
  /** Lessons and checks finished today. */
  lessons: ReadonlySet<string>;
  /** Exam-task, writing and speaking sets finished today. */
  sets: ReadonlySet<string>;
  grammar: ReadonlySet<string>;
  /** Word cards reviewed today. */
  reviews: number;
  /** Mistakes answered again today. */
  reviewed: number;
};

export function stepDoneToday(step: PlanStep, t: TodayEvidence): boolean {
  switch (step.kind) {
    case 'lesson':
    case 'retest':
      return t.lessons.has(step.id);
    case 'task':
    case 'writing':
    case 'speaking':
      return t.sets.has(step.id);
    case 'grammar':
      return t.grammar.has(step.id);
    case 'words':
      return t.reviews > 0;
    case 'mistakes':
      return t.reviewed > 0;
  }
}
