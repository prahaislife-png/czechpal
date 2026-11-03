import type { LearningContent, Level, Topic } from '../types';
import { stories } from './stories';

/**
 * The library. Bundled with the app for now, so it reads offline and costs nothing to serve;
 * the shape matches the content tables a publishing workflow will fill later.
 */
export const library: LearningContent[] = stories;

export const contentById = (id: string | undefined) => library.find((c) => c.id === id);

export const levelsInLibrary: Level[] = (['A1', 'A2', 'B1'] as const).filter((l) => library.some((c) => c.level === l));

export const topicsInLibrary: Topic[] = [...new Set(library.flatMap((c) => c.topics))];

export function filterLibrary(level: Level | null, topic: Topic | null) {
  return library.filter((c) => (!level || c.level === level) && (!topic || c.topics.includes(topic)));
}
