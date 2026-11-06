import { diagnostic } from './diagnostic';
import { lessonExercises } from './lessons';
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
