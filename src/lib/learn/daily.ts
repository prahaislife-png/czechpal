import type { DayLog } from './activity';
import { library, contentById } from './content';
import { dueCards, type Deck } from './deck';
import { isFinished, type ReadingProgress } from './progress';
import { listenTarget, readingLevel, reviewTarget, type LearnProfile } from './profile';
import type { LearningContent } from './types';

/**
 * Today's plan: a few steps sized to the minutes the learner chose, from what's due, what they
 * were reading and what they've met. Worked out fresh each time from their data, so it ticks
 * itself as they go and changes when a new day starts.
 */

export type PlanStep =
  | { kind: 'review'; count: number; done: boolean }
  | { kind: 'read'; content: LearningContent; resume: boolean; done: boolean }
  | { kind: 'listen'; count: number; done: boolean };

export type PlanInput = {
  profile: LearnProfile;
  progress: Record<string, ReadingProgress>;
  lastContentId?: string;
  deck: Deck;
  today: DayLog;
  /** Listening needs the phone's Czech voice. */
  canListen: boolean;
  now?: Date;
};

/** The next text to read: the one in progress, else the first unread at the learner's level, their topics first. */
export function nextText(profile: LearnProfile, progress: Record<string, ReadingProgress>, lastContentId?: string): { content: LearningContent; resume: boolean } | null {
  const last = contentById(lastContentId);
  if (last && !isFinished(progress[last.id], last)) return { content: last, resume: true };
  const level = readingLevel(profile.level);
  const unread = library.filter((c) => !isFinished(progress[c.id], c));
  const score = (c: LearningContent) => (c.level === level ? 0 : c.level < level ? 1 : 2) * 2 + (profile.topics.length && !c.topics.some((t) => profile.topics.includes(t)) ? 1 : 0);
  const pick = unread.map((c, i) => ({ c, i, s: score(c) })).sort((a, b) => a.s - b.s || a.i - b.i)[0];
  return pick ? { content: pick.c, resume: !!progress[pick.c.id] } : null;
}

export function dailyPlan({ profile, progress, lastContentId, deck, today, canListen, now = new Date() }: PlanInput): PlanStep[] {
  const steps: PlanStep[] = [];
  const target = reviewTarget[profile.minutes];
  const due = dueCards(deck, now, target).length;
  if (due > 0 || today.reviews > 0) steps.push({ kind: 'review', count: Math.max(due, 1), done: due === 0 || today.reviews >= target });

  // Five minutes holds either a review or a text, not both.
  const short = profile.minutes === 5 && steps.length > 0 && !steps[0].done;
  const text = nextText(profile, progress, lastContentId);
  if (today.chapters > 0) {
    const read = contentById(lastContentId);
    if (read) steps.push({ kind: 'read', content: read, resume: false, done: true });
  } else if (text && !short) {
    steps.push({ kind: 'read', ...text, done: false });
  }

  if (canListen) steps.push({ kind: 'listen', count: listenTarget[profile.minutes], done: today.listening > 0 });
  return steps;
}

export const planDone = (steps: PlanStep[]) => steps.length > 0 && steps.every((s) => s.done);
