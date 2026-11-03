import type { LearningContent } from './types';

/**
 * Reading progress, as plain functions over plain data: the store calls them, and the tests
 * check them without a phone. Each returns a new object; nothing is mutated.
 */

export type ReadingProgress = {
  contentId: string;
  /** The chapter open last. */
  chapter: number;
  /** Scroll position in that chapter, to come back to the same place. */
  offset: number;
  completedChapters: number[];
  /** Answers by question id: the option chosen last. */
  answers: Record<string, number>;
  bookmarked: boolean;
  updatedAt: string;
};

export const emptyProgress = (contentId: string, now = new Date()): ReadingProgress => ({
  contentId,
  chapter: 0,
  offset: 0,
  completedChapters: [],
  answers: {},
  bookmarked: false,
  updatedAt: now.toISOString(),
});

const clampChapter = (content: Pick<LearningContent, 'chapters'>, chapter: number) =>
  Math.min(Math.max(0, Math.floor(chapter)), content.chapters.length - 1);

/** Opening another chapter starts at its top; reopening the same one keeps the place. */
export function openChapter(p: ReadingProgress, content: Pick<LearningContent, 'chapters'>, chapter: number, now = new Date()): ReadingProgress {
  const next = clampChapter(content, chapter);
  return { ...p, chapter: next, offset: next === p.chapter ? p.offset : 0, updatedAt: now.toISOString() };
}

export function saveOffset(p: ReadingProgress, chapter: number, offset: number, now = new Date()): ReadingProgress {
  // A late scroll event from a chapter already left must not move the place in the new one.
  if (chapter !== p.chapter || !Number.isFinite(offset)) return p;
  return { ...p, offset: Math.max(0, Math.round(offset)), updatedAt: now.toISOString() };
}

/** Marking a chapter done twice changes nothing. */
export function completeChapter(p: ReadingProgress, content: Pick<LearningContent, 'chapters'>, chapter: number, now = new Date()): ReadingProgress {
  const c = clampChapter(content, chapter);
  if (p.completedChapters.includes(c)) return p;
  return { ...p, completedChapters: [...p.completedChapters, c].sort((a, b) => a - b), updatedAt: now.toISOString() };
}

export function answerQuestion(p: ReadingProgress, content: Pick<LearningContent, 'questions'>, questionId: string, option: number, now = new Date()): ReadingProgress {
  const q = content.questions.find((x) => x.id === questionId);
  if (!q || option < 0 || option >= q.options.length) return p;
  return { ...p, answers: { ...p.answers, [questionId]: option }, updatedAt: now.toISOString() };
}

export const toggleBookmark = (p: ReadingProgress, now = new Date()): ReadingProgress => ({ ...p, bookmarked: !p.bookmarked, updatedAt: now.toISOString() });

/** Share of chapters read, 0 to 1. */
export const readShare = (p: ReadingProgress | undefined, content: Pick<LearningContent, 'chapters'>) =>
  p ? p.completedChapters.length / content.chapters.length : 0;

export const isFinished = (p: ReadingProgress | undefined, content: Pick<LearningContent, 'chapters'>) =>
  !!p && p.completedChapters.length === content.chapters.length;

/** Right answers out of the questions answered. */
export function quizScore(p: ReadingProgress | undefined, content: Pick<LearningContent, 'questions'>) {
  const answered = content.questions.filter((q) => p?.answers[q.id] !== undefined);
  return { right: answered.filter((q) => p!.answers[q.id] === q.answer).length, answered: answered.length, total: content.questions.length };
}
