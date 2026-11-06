import type { ContentMeta, Exercise, TopicId } from './types';

/** The date the current A2 Academy content was written and checked by AI. */
export const CONTENT_CHECKED_ON = '2026-11-06';

export type ExerciseBase = Pick<ContentMeta, 'level' | 'difficulty'> & { topic?: TopicId };

type Body = Omit<Exercise, keyof ContentMeta> & { taskType?: string };

/**
 * One exercise with the provenance every exercise carries: written for CzechPal, original,
 * AI-checked (never shown as teacher-reviewed), version 1 until its content changes.
 */
export function exercise<T extends Body>(id: string, base: ExerciseBase, skill: ContentMeta['skill'], objectives: string[], body: T): T & ContentMeta {
  return {
    id,
    version: 1,
    skill,
    objectives,
    review: 'ai-checked',
    author: 'CzechPal',
    licence: 'original',
    checkedOn: CONTENT_CHECKED_ON,
    ...base,
    ...body,
  };
}
