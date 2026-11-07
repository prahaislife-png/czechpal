import { emailChecks, formChecks, gradeItem, type Answers } from './tasks';
import { mockListeningSets, mockReadingSets, mockWritingTasks } from './tasks/mock';
import { mockListeningSets2, mockReadingSets2, mockWritingTasks2 } from './tasks/mock-2';
import { speakingTasks } from './tasks/speaking';
import type { TaskSet } from './types';
import { examParts, examTasks, passMarks } from '@/lib/learn/exam';

/**
 * The mock exam: the four parts in the exam's order, with the exam's times, on sets kept unseen
 * for it. Reading and listening are marked by rules, one point an item. Writing and speaking are
 * not scored, because CzechPal can't mark them reliably yet; the result says what reading and
 * listening mean for the written pass mark instead of inventing a writing score.
 */

export type MockSection = 'reading' | 'writing' | 'listening' | 'speaking';

export const MOCK_SECTIONS: MockSection[] = ['reading', 'writing', 'listening', 'speaking'];

export const sectionInfo: Record<MockSection, { title: string; cs: string; minutes: number; timed: boolean; note: string }> = {
  reading: { title: 'Reading', cs: 'Čtení', minutes: minutesOf('reading'), timed: true, note: '5 tasks, 25 questions. The time counts down.' },
  writing: { title: 'Writing', cs: 'Psaní', minutes: minutesOf('writing'), timed: true, note: 'A form and an e-mail. The time counts down.' },
  listening: { title: 'Listening', cs: 'Poslech', minutes: minutesOf('listening'), timed: false, note: '5 tasks, 25 questions. Each recording plays twice; the recordings set the pace.' },
  speaking: { title: 'Speaking', cs: 'Mluvení', minutes: minutesOf('speaking'), timed: false, note: 'All 4 tasks, one after the other, recorded. Self-checked, not scored.' },
};

function minutesOf(id: MockSection) {
  return examParts.find((p) => p.id === id)!.minutes;
}

/** A warning when this little time is left, as in the exam's recording. */
export const WARN_SECONDS = 5 * 60;

/** The mocks written so far: each its own unseen questions. */
const variants = [
  { reading: mockReadingSets, listening: mockListeningSets, writing: mockWritingTasks },
  { reading: mockReadingSets2, listening: mockListeningSets2, writing: mockWritingTasks2 },
];
export const MOCK_VARIANTS = variants.length;

const variantOf = (n = 1) => variants[Math.min(Math.max(n, 1), variants.length) - 1];

export const mockSets = (part: 'reading' | 'listening', variant = 1): TaskSet[] => variantOf(variant)[part];

export const mockWriting = (variant = 1) => {
  const w = variantOf(variant).writing;
  return { form: w.find((t) => t.kind === 'form')!, email: w.find((t) => t.kind === 'email')! };
};

/** The mock to start next: the one taken fewest times, the first on a tie. */
export function nextVariant(runs: Pick<MockRun, 'variant'>[]): number {
  const counts = variants.map((_, i) => runs.filter((r) => (r.variant ?? 1) === i + 1).length);
  return counts.indexOf(Math.min(...counts)) + 1;
}

/** One speaking set for each task: the one practised least, so it is as fresh as possible. */
export function mockSpeakingTasks(done: Record<string, number> = {}): string[] {
  return ([1, 2, 3, 4] as const).map((n) => [...speakingTasks.filter((t) => t.task === n)].sort((a, b) => (done[a.id] ?? 0) - (done[b.id] ?? 0))[0].id);
}

export type MarkedSection = { at: string; seconds: number; right: number; total: number; answers: Answers; byTask: Record<number, [number, number]> };
export type WritingSection = { at: string; seconds: number; form: string[]; email: string; formShort: number; emailWords: number; emailZero: boolean };
export type SpeakingSection = { at: string; tasks: Record<string, { recorded: number; prompts: number }> };

export type MockRun = {
  id: string;
  startedAt: string;
  /** Which mock's questions: 1 or 2. Runs saved before there were two are mock 1. */
  variant?: number;
  speakingTasks: string[];
  reading?: MarkedSection;
  writing?: WritingSection;
  listening?: MarkedSection;
  speaking?: SpeakingSection;
};

/** Marks a reading or listening section: one point an item, and the points per task. */
export function markSection(sets: TaskSet[], answers: Answers): Pick<MarkedSection, 'right' | 'total' | 'byTask'> {
  const byTask: Record<number, [number, number]> = {};
  let right = 0;
  let total = 0;
  for (const set of sets) {
    const r = set.items.filter((i) => gradeItem(i, answers[i.id]).correct).length;
    byTask[set.task] = [r, set.items.length];
    right += r;
    total += set.items.length;
  }
  return { right, total, byTask };
}

/** The writing section by the exam's hard rules only: short form answers, and the e-mail's 35-word zero rule. */
export function checkWriting(form: string[], email: string, variant = 1): Pick<WritingSection, 'formShort' | 'emailWords' | 'emailZero'> {
  const f = formChecks(form);
  const e = emailChecks(email, mockWriting(variant).email);
  return { formShort: f.filter((c) => !c.enoughWords).length, emailWords: e.words, emailZero: e.zero };
}

export const sectionDone = (run: MockRun, s: MockSection) =>
  s === 'speaking' ? !!run.speaking && run.speakingTasks.every((id) => run.speaking!.tasks[id]) : !!run[s];

export const mockFinished = (run: MockRun) => MOCK_SECTIONS.every((s) => sectionDone(run, s));

const writingPoints = (n: 1 | 2) => examTasks.find((t) => t.part === 'writing' && t.n === n)!.points;

export type WrittenOutlook = {
  /** Reading and listening together, when both are done. */
  marked: number | null;
  /** Writing points still needed for the written pass mark. */
  need: number | null;
  /** The most writing can give: the e-mail's 12 are lost under 35 words. */
  writingMax: number;
  verdict: 'not-yet' | 'reached' | 'possible' | 'out-of-reach';
};

/**
 * What reading and listening mean for the written part (42 of 70), without guessing a writing score:
 * whether they reach it alone, how many writing points it would still need, or whether even full
 * writing marks couldn't reach it.
 */
export function writtenOutlook(run: MockRun): WrittenOutlook {
  const writingMax = writingPoints(1) + (run.writing?.emailZero ? 0 : writingPoints(2));
  if (!run.reading || !run.listening) return { marked: null, need: null, writingMax, verdict: 'not-yet' };
  const marked = run.reading.right + run.listening.right;
  const need = Math.max(0, passMarks.written.need - marked);
  return { marked, need, writingMax, verdict: need === 0 ? 'reached' : need > writingMax ? 'out-of-reach' : 'possible' };
}

/** The exam tasks to practise next: under 60% in this mock, weakest first. */
export function weakTasks(run: MockRun): { part: 'reading' | 'listening'; task: number; right: number; total: number }[] {
  const out: { part: 'reading' | 'listening'; task: number; right: number; total: number }[] = [];
  for (const part of ['reading', 'listening'] as const) {
    const s = run[part];
    if (!s) continue;
    for (const [task, [right, total]] of Object.entries(s.byTask)) if (right / total < 0.6) out.push({ part, task: Number(task), right, total });
  }
  return out.sort((a, b) => a.right / a.total - b.right / b.total);
}

export const elapsed = (startMs: number, nowMs: number) => Math.max(0, Math.floor((nowMs - startMs) / 1000));

export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
