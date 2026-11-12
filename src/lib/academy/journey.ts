import { lessonById } from './lessons';
import { lessonDone, lessonSecure, retestDue, type LessonLog } from './roadmap';
import { practiceSets } from './tasks';
import { speakingTasks } from './tasks/speaking';
import { writingTasks } from './tasks/writing';
import { topics } from './topics';
import type { Topic } from './types';

/**
 * The A2 journey: one path from the first lesson to the exam. Fourteen units, one per topic.
 * Each unit teaches its four lessons, then practises the exam itself with one task from each
 * part (reading, listening, writing, speaking), in the exam's own formats. A mock exam marks
 * the end of units 5, 10 and 14. Everything is open from the start; "next" is simply the first
 * step not done yet.
 */

export type ExamPart = 'reading' | 'listening' | 'writing' | 'speaking';

export type JourneyNode =
  | {
      kind: 'lesson';
      id: string;
      title: string;
      /** What the lesson teaches, in a line. */
      detail: string;
      /** Its place in the unit, from 1. */
      n: number;
      of: number;
      done: boolean;
      /** Passed twice, days apart. */
      secure: boolean;
      /** Its check is due again. */
      retest: boolean;
    }
  | { kind: 'task'; part: ExamPart; id: string; title: string; detail: string; done: boolean };

export type JourneyUnit = {
  /** 1 to 14. */
  n: number;
  topic: Topic;
  nodes: JourneyNode[];
  lessonsDone: number;
  lessonsTotal: number;
  tasksDone: number;
  tasksTotal: number;
  complete: boolean;
  /** The mock exam that follows this unit (1, 2 or 3), if one does. */
  mockAfter?: number;
};

export type JourneyStep = { unit: JourneyUnit; node: JourneyNode };

export type Journey = {
  units: JourneyUnit[];
  /** The first step not done yet; null when the whole journey is done. */
  next: JourneyStep | null;
  done: number;
  total: number;
};

/** Units after which a mock exam is suggested. */
export const MOCK_AFTER_UNITS = [5, 10, 14];

const partNames: Record<ExamPart, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

/** "r2-b" → "b": the round a set belongs to. */
const round = (id: string) => id.split('-')[1] ?? '';

/**
 * Exam tasks in the order the journey meets them: round a first, and within a round the exam's
 * own task order, so five units in a row cover all five reading tasks before any format repeats.
 */
const inRounds = <T extends { id: string }>(list: T[], rank: (x: T) => number) =>
  [...list].sort((a, b) => round(a.id).localeCompare(round(b.id)) || rank(a) - rank(b) || a.id.localeCompare(b.id));

const readingSets = inRounds(
  practiceSets.filter((s) => s.part === 'reading'),
  (s) => s.task,
);
const listeningSets = inRounds(
  practiceSets.filter((s) => s.part === 'listening'),
  (s) => s.task,
);
const writing = inRounds(writingTasks, (w) => (w.kind === 'form' ? 1 : 2));
const speaking = inRounds(speakingTasks, (t) => t.task);

/** The exam tasks of unit `i` (from 0): one of each part while there are any; the last unit takes what's left. */
function examTasksFor(i: number, last: boolean): Extract<JourneyNode, { kind: 'task' }>[] {
  const take = <T>(list: T[]) => (last ? list.slice(i) : list.slice(i, i + 1));
  return [
    ...take(readingSets).map((s) => ({ kind: 'task' as const, part: 'reading' as const, id: s.id, title: s.title, detail: `Reading, task ${s.task}`, done: false })),
    ...take(listeningSets).map((s) => ({ kind: 'task' as const, part: 'listening' as const, id: s.id, title: s.title, detail: `Listening, task ${s.task}`, done: false })),
    ...take(writing).map((w) => ({
      kind: 'task' as const,
      part: 'writing' as const,
      id: w.id,
      title: w.title.replace(/^(Form|E-mail): /, '').replace(/^./, (c) => c.toUpperCase()),
      detail: w.kind === 'form' ? 'Writing, task 1: the form' : 'Writing, task 2: the e-mail',
      done: false,
    })),
    ...take(speaking).map((t) => ({ kind: 'task' as const, part: 'speaking' as const, id: t.id, title: t.title, detail: `Speaking, task ${t.task}`, done: false })),
  ];
}

/**
 * The journey with the learner's progress on it. `setsDone` counts finished exam tasks by id
 * (reading and listening sets, writing and speaking tasks). Without a Czech voice on the phone,
 * listening tasks stay on the path but are never "next".
 */
export function buildJourney(log: LessonLog, setsDone: Record<string, number>, opts: { canListen: boolean; now?: Date }): Journey {
  const now = opts.now ?? new Date();
  const units: JourneyUnit[] = topics.map((topic, i) => {
    const lessons = topic.lessons
      .map((id) => lessonById(id))
      .filter((l) => !!l)
      .map(
        (l, k, all): JourneyNode => ({
          kind: 'lesson',
          id: l.id,
          title: l.title,
          detail: l.goal,
          n: k + 1,
          of: all.length,
          done: lessonDone(log, l.id),
          secure: lessonSecure(log[l.id]),
          retest: retestDue(log[l.id], now),
        }),
      );
    const tasks = examTasksFor(i, i === topics.length - 1).map((t) => ({ ...t, done: (setsDone[t.id] ?? 0) > 0 }));
    const lessonsDone = lessons.filter((n) => n.done).length;
    const tasksDone = tasks.filter((n) => n.done).length;
    const mock = MOCK_AFTER_UNITS.indexOf(i + 1);
    return {
      n: i + 1,
      topic,
      nodes: [...lessons, ...tasks],
      lessonsDone,
      lessonsTotal: lessons.length,
      tasksDone,
      tasksTotal: tasks.length,
      complete: lessonsDone === lessons.length && tasksDone === tasks.length,
      mockAfter: mock >= 0 ? mock + 1 : undefined,
    };
  });

  const steps = units.flatMap((unit) => unit.nodes.map((node) => ({ unit, node })));
  const open = steps.filter((s) => !s.node.done && (opts.canListen || !(s.node.kind === 'task' && s.node.part === 'listening')));
  return { units, next: open[0] ?? null, done: steps.filter((s) => s.node.done).length, total: steps.length };
}

/** The next few steps not done yet, in order. */
export function upcomingSteps(journey: Journey, count: number, canListen: boolean): JourneyStep[] {
  return journey.units
    .flatMap((unit) => unit.nodes.map((node) => ({ unit, node })))
    .filter((s) => !s.node.done && (canListen || !(s.node.kind === 'task' && s.node.part === 'listening')))
    .slice(0, count);
}

/** "Lesson 3 of 4" or "Exam practice: Reading". */
export const stepLabel = (node: JourneyNode) => (node.kind === 'lesson' ? `Lesson ${node.n} of ${node.of}` : `Exam practice: ${partNames[node.part]}`);

export const partName = (part: ExamPart) => partNames[part];
