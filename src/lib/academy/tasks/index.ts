import { checkFormAnswer, countWords, EMAIL_MIN_WORDS, FORM_MIN_WORDS } from '@/lib/learn/exam';

import { tidy } from '../grade';
import type { ChoiceExercise, ContentMeta, Exercise, TaskItem, TaskSet, TypeExercise, WritingTask } from '../types';
import { listeningSets } from './listening';
import { mockListeningSets, mockReadingSets } from './mock';
import { mockListeningSets2, mockReadingSets2 } from './mock-2';
import { listeningSetsB, readingSetsB } from './practice-b';
import { readingSets } from './reading';

/**
 * Exam-task practice: the sets, how an answer is marked, and how a set scores. One point per item,
 * as in the exam's reading and listening. Marking is by rules only; nothing is guessed.
 */

/** Every set, the mock exam's included, so their items can come back as mistakes. */
export const taskSets: TaskSet[] = [...readingSets, ...readingSetsB, ...listeningSets, ...listeningSetsB, ...mockReadingSets, ...mockListeningSets, ...mockReadingSets2, ...mockListeningSets2];
/** The sets for everyday practice; the mock exam's are kept unseen. */
export const practiceSets: TaskSet[] = taskSets.filter((s) => !s.pool).sort((a, b) => (a.part === b.part ? a.task - b.task || a.id.localeCompare(b.id) : a.part === 'reading' ? -1 : 1));
export const taskSetById = (id: string | undefined) => taskSets.find((s) => s.id === id);

export const LETTERS = 'ABCDEFGH';

/** In exam mode a recording plays this many times, as in the exam. */
export const EXAM_PLAYS = 2;

/** What an item records as evidence. */
export const itemMeta = (set: TaskSet, item: TaskItem): Pick<ContentMeta, 'id' | 'version' | 'skill' | 'objectives' | 'topic'> => ({
  id: item.id,
  version: set.version,
  skill: set.part,
  objectives: set.objectives,
  topic: set.topic,
});

/** The options an item is answered from: its own, or the set's shared choices. */
export const itemOptions = (set: TaskSet, item: TaskItem) => item.options ?? set.choices?.map((c) => c.text) ?? [];

export const isWriteItem = (item: TaskItem) => !!item.accept;

/** Written information: tidied, with "Kč" read as "korun" and dashes as spaces. */
const canon = (s: string) =>
  tidy(s)
    .replace(/\bkč\b/g, 'korun')
    .replace(/[-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const plain = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

export type ItemResult = { correct: boolean; accentsOnly: boolean };

export function gradeItem(item: TaskItem, answer: number | string | null | undefined): ItemResult {
  if (answer === null || answer === undefined || answer === '') return { correct: false, accentsOnly: false };
  if (item.accept) {
    const t = canon(String(answer));
    const ok = item.accept.map(canon);
    if (ok.includes(t)) return { correct: true, accentsOnly: false };
    return { correct: false, accentsOnly: ok.some((a) => plain(a) === plain(t)) };
  }
  return { correct: answer === item.answer, accentsOnly: false };
}

export type Answers = Record<string, number | string>;

export function scoreSet(set: TaskSet, answers: Answers) {
  const right = set.items.filter((i) => gradeItem(i, answers[i.id]).correct).length;
  return { right, total: set.items.length };
}

/** The item as a stand-alone exercise, for going over mistakes. */
export function itemExercise(set: TaskSet, item: TaskItem): Exercise {
  const base = {
    ...itemMeta(set, item),
    level: set.level,
    difficulty: 2 as const,
    review: set.review,
    author: set.author,
    licence: set.licence,
    checkedOn: set.checkedOn,
    taskType: `${set.part}-${set.task}`,
  };
  const spoken = item.audio ?? set.audio;
  const shown = item.text ?? set.passage;
  if (item.accept)
    return {
      ...base,
      kind: 'type',
      prompt: item.prompt,
      text: spoken ?? shown,
      accept: item.accept,
      explain: item.explain,
    } satisfies TypeExercise;
  return {
    ...base,
    kind: 'choice',
    prompt: item.prompt,
    text: spoken ?? shown,
    listen: !!spoken,
    options: itemOptions(set, item),
    answer: item.answer ?? 0,
    explain: item.explain,
  } satisfies ChoiceExercise;
}

/** Every task item that can be gone over again, by id. */
export const taskItems = new Map(taskSets.flatMap((s) => s.items.map((i) => [i.id, { set: s, item: i }] as const)));

// ── Writing ─────────────────────────────────────────────────────────────────

export function formChecks(answers: string[]) {
  return answers.map((a) => {
    const c = checkFormAnswer(a);
    return { ...c, enoughWords: c.words >= FORM_MIN_WORDS };
  });
}

const GREETING = /^(dobrý den|ahoj|čau|milý|milá|milí|vážen[ýáíé]|zdravím)/i;
const CLOSING = /(s pozdravem|se srdečným pozdravem|s přáním|měj se|mějte se|na shledanou|zdraví|ahoj|čau|na viděnou|brzy na viděnou|tvoje|tvůj|vaše|váš)/i;

export type EmailCheck = {
  words: number;
  /** Under 35 words: the task scores 0 in the exam. */
  zero: boolean;
  greeting: boolean;
  closing: boolean;
  signature: boolean;
  /** Sentences in the body, against one for each picture. */
  sentences: number;
  sentencesNeeded: number;
};

/**
 * The e-mail's checkable rules: 35 words, an opening, a closing, a signature and a sentence for
 * each picture. Whether each sentence answers its picture is for the learner to tick.
 */
export function emailChecks(text: string, task: Pick<WritingTask, 'pictures'>): EmailCheck {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const words = countWords(text);
  const first = lines[0] ?? '';
  const last = lines[lines.length - 1] ?? '';
  const middle = lines.slice(1, -1);
  const signature = lines.length >= 3 && countWords(last) >= 1 && countWords(last) <= 3 && /^\p{Lu}/u.test(last) && !/[.?!]$/.test(last);
  const closing = middle.slice(-2).some((l) => CLOSING.test(l) && countWords(l) <= 5);
  const body = lines.slice(1, signature ? -1 : undefined).join(' ');
  const sentences = (body.match(/[.?!](\s|$)/g) ?? []).length;
  return {
    words,
    zero: words < EMAIL_MIN_WORDS,
    greeting: GREETING.test(first),
    closing,
    signature,
    sentences,
    sentencesNeeded: task.pictures?.length ?? 0,
  };
}
