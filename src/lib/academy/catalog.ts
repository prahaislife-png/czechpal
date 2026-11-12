import { diagnostic } from './diagnostic';
import { lessonWords, wordsOf } from './lesson-steps';
import { lessonById, lessonExercises } from './lessons';
import { itemExercise, taskItems } from './tasks';
import type { Exercise } from './types';

/** Any answerable item by id: a lesson exercise, a starting-check item or an exam-task item. */
export function exerciseById(id: string): Exercise | undefined {
  const lesson = lessonExercises.get(id);
  if (lesson) return lesson;
  const diag = diagnostic.find((e) => e.id === id);
  if (diag) return diag;
  const task = taskItems.get(id);
  return task ? itemExercise(task.set, task.item) : undefined;
}

/**
 * Words to mix into the tiles when an item is answered again (Your mistakes): the words of the
 * lesson it came from, or of the text or recording an exam task was about. Without them the
 * tiles would hold nothing but the answer.
 */
export function wordsForExercise(id: string): string[] {
  const lesson = lessonById(id.split('.')[0]);
  if (lesson) return lessonWords(lesson);
  const task = taskItems.get(id);
  if (!task) return [];
  const source = [task.set.passage, task.set.audio, task.item.text, task.item.audio].filter(Boolean).join(' ');
  return [...new Set(wordsOf(source).filter((w) => /^\p{L}+$/u.test(w)))];
}
