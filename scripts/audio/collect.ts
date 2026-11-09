// Lists every Czech recording the app speaks in listening practice, mock exams and lesson exercises.
import { lessons } from '../../src/lib/academy/lessons';
import { taskSets } from '../../src/lib/academy/tasks/index';

export type Recording = { key: string; text: string; source: string };

export function collectRecordings(): Recording[] {
  const out: Recording[] = [];
  for (const set of taskSets) {
    if (set.part !== 'listening') continue;
    const where = `${set.id} (${set.pool ?? 'practice'})`;
    if (set.audio) out.push({ key: set.id, text: set.audio, source: where });
    for (const item of set.items) if (item.audio) out.push({ key: item.id, text: item.audio, source: where });
  }
  for (const lesson of lessons)
    for (const e of [...lesson.practise, ...lesson.check]) {
      const x = e as { id: string; listen?: boolean; text?: string };
      if (x.listen && x.text) out.push({ key: x.id, text: x.text, source: `lesson ${lesson.id}` });
    }
  return out;
}

if ((require as unknown as { main?: unknown }).main === module) {
  const all = collectRecordings();
  const turns = all.map((r) => r.text.split(/\s+–\s+/).length);
  console.log({
    recordings: all.length,
    characters: all.reduce((n, r) => n + r.text.length, 0),
    dialogues: turns.filter((t) => t > 1).length,
    maxTurns: Math.max(...turns),
    lessons: all.filter((r) => r.source.startsWith('lesson')).length,
    mock: all.filter((r) => r.source.includes('mock')).length,
  });
}
