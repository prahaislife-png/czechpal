import { grammarById } from './grammar';
import { topicById } from './topics';
import type { ContentMeta, Skill, TopicId } from './types';

/**
 * Evidence: every answered item, kept on the phone. Readiness is worked out from it, never stored,
 * so the rules can change without migrating anyone's data.
 */

/** Where an answer came from. 'review' is going over a mistake again: never fresh evidence. */
export type AttemptSource = 'diagnostic' | 'practise' | 'check' | 'task' | 'mock' | 'review';

export type Attempt = {
  item: string;
  /** The content version answered; a changed item starts fresh. */
  version: number;
  skill: Skill;
  objectives: string[];
  topic?: TopicId;
  /** Null when there is nothing to mark (a written answer the learner checks themselves). */
  correct: boolean | null;
  /** Without hints, in a check or the diagnostic. Guided practice isn't independent. */
  independent: boolean;
  /** The first time this version of the item was answered. Repeats show memory, not skill. */
  fresh: boolean;
  source: AttemptSource;
  at: string;
};

export const MAX_ATTEMPTS = 3000;

export function makeAttempt(
  item: Pick<ContentMeta, 'id' | 'version' | 'skill' | 'objectives' | 'topic'>,
  correct: boolean | null,
  source: AttemptSource,
  previous: Attempt[],
  now = new Date(),
): Attempt {
  const fresh = !previous.some((a) => a.item === item.id && a.version === item.version);
  return {
    item: item.id,
    version: item.version,
    skill: item.skill,
    objectives: item.objectives,
    topic: item.topic,
    correct,
    independent: source !== 'practise' && source !== 'review',
    fresh,
    source,
    at: now.toISOString(),
  };
}

export const addAttempts = (list: Attempt[], more: Attempt[]) => [...list, ...more].slice(-MAX_ATTEMPTS);

/** Attempts that count as assessed evidence: fresh, independent and marked. */
export const assessed = (attempts: Attempt[], skill?: Skill) =>
  attempts.filter((a) => a.fresh && a.independent && a.correct !== null && (!skill || a.skill === skill));

// ── Readiness ────────────────────────────────────────────────────────────────

/**
 * Where a skill stands. "Ready" needs a full practice test in the exam's format, which comes in a
 * later phase, so it can't be reached yet; the app says so instead of guessing.
 */
export type ReadinessState = 'not-assessed' | 'building' | 'developing' | 'approaching' | 'needs-practice';

export type SkillReadiness = {
  skill: Skill;
  state: ReadinessState;
  /** Assessed items behind it. */
  count: number;
  /** Share right in the latest assessed items, 0–1; null with no evidence. */
  accuracy: number | null;
  /** Enough evidence to show a state at all. */
  enough: boolean;
};

/** Fewer assessed items than this: "Not enough assessed practice yet." */
export const MIN_EVIDENCE = 8;
/** Readiness looks at this many of the latest assessed items. */
export const WINDOW = 30;

const share = (xs: Attempt[]) => (xs.length ? xs.filter((a) => a.correct).length / xs.length : 0);

export function skillReadiness(attempts: Attempt[], skill: Skill): SkillReadiness {
  const all = assessed(attempts, skill);
  if (all.length === 0) return { skill, state: 'not-assessed', count: 0, accuracy: null, enough: false };
  const recent = all.slice(-WINDOW);
  const accuracy = share(recent);
  const enough = all.length >= MIN_EVIDENCE;
  let state: ReadinessState = accuracy < 0.4 ? 'building' : accuracy < 0.6 ? 'developing' : 'approaching';
  // A clear drop in the latest items, against the ones before, needs attention first.
  if (all.length >= 2 * MIN_EVIDENCE) {
    const last = share(all.slice(-MIN_EVIDENCE));
    const before = share(all.slice(-2 * MIN_EVIDENCE, -MIN_EVIDENCE));
    if (last <= before - 0.25) state = 'needs-practice';
  }
  return { skill, state, count: all.length, accuracy, enough };
}

export const readinessLabels: Record<ReadinessState, string> = {
  'not-assessed': 'Not assessed yet',
  building: 'Building',
  developing: 'Developing',
  approaching: 'Getting close',
  'needs-practice': 'Needs practice',
};

// ── What needs work ─────────────────────────────────────────────────────────

export type Weak = { objective: string; label: string; right: number; total: number };

/** The objective an id names, in words: a grammar item or a topic. */
export function objectiveLabel(id: string) {
  const [kind, a] = id.split(':');
  if (kind === 'g') return grammarById(a)?.title ?? a;
  if (kind === 't') return topicById(a)?.title ?? a;
  return id;
}

/**
 * Objectives answered wrong most often in the latest independent answers (at least three, under
 * 60% right), weakest first.
 */
export function weakObjectives(attempts: Attempt[], limit = 3): Weak[] {
  const recent = attempts.filter((a) => a.independent && a.correct !== null).slice(-200);
  const tally = new Map<string, { right: number; total: number }>();
  for (const a of recent)
    for (const o of a.objectives) {
      const t = tally.get(o) ?? { right: 0, total: 0 };
      t.total++;
      if (a.correct) t.right++;
      tally.set(o, t);
    }
  return [...tally.entries()]
    .filter(([, t]) => t.total >= 3 && t.right / t.total < 0.6)
    .sort((x, y) => x[1].right / x[1].total - y[1].right / y[1].total || y[1].total - x[1].total)
    .slice(0, limit)
    .map(([objective, t]) => ({ objective, label: objectiveLabel(objective), ...t }));
}

// ── Mistakes ────────────────────────────────────────────────────────────────

/**
 * Items whose latest marked answer was wrong, newest first. Answering one right (in a review or
 * anywhere else) takes it off the list.
 */
export function mistakeIds(attempts: Attempt[], limit = 30): string[] {
  const latest = new Map<string, Attempt>();
  for (const a of attempts) if (a.correct !== null) latest.set(a.item, a);
  return [...latest.values()]
    .filter((a) => a.correct === false)
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, limit)
    .map((a) => a.item);
}
