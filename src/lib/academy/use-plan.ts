import type { Href } from 'expo-router';
import { useMemo } from 'react';

import { dayKey, today } from '@/lib/learn/activity';
import { dueCards } from '@/lib/learn/deck';
import { minutesOf } from '@/lib/learn/profile';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';

import { mistakeIds } from './evidence';
import { buildJourney, type Journey, type JourneyNode } from './journey';
import { dailyPlan, stepDoneToday, type PlanStep } from './plan';

export type TodayStep = PlanStep & { done: boolean };

const isToday = (at: string, day: string) => dayKey(new Date(at)) === day;
const ranToday = (runs: Record<string, { at: string }[]>, day: string) => Object.keys(runs).filter((id) => runs[id].some((r) => isToday(r.at, day)));

/** Every finished exam task (reading and listening sets, writing, speaking), by id. */
function useExamRuns() {
  const tasks = useAcademy((s) => s.tasks);
  const writing = useAcademy((s) => s.writing);
  const speaking = useAcademy((s) => s.speaking);
  return useMemo((): Record<string, { at: string }[]> => ({ ...tasks, ...writing, ...speaking }), [tasks, writing, speaking]);
}

/** The A2 journey with this learner's progress on it. */
export function useJourney(): Journey {
  const lessons = useAcademy((s) => s.lessons);
  const runs = useExamRuns();
  const canListen = useCzechVoice().state === 'available';
  return useMemo(
    () =>
      buildJourney(
        lessons,
        Object.fromEntries(Object.entries(runs).map(([id, list]) => [id, list.length])),
        { canListen },
      ),
    [lessons, runs, canListen],
  );
}

/**
 * Today's plan, from what's on this phone. It is worked out from what was done before today, so
 * it holds still all day; what was done today ticks its steps off.
 */
export function useTodayPlan(): TodayStep[] {
  const profile = useLearn((s) => s.profile);
  const deck = useLearn((s) => s.deck);
  const days = useLearn((s) => s.days);
  const attempts = useAcademy((s) => s.attempts);
  const lessons = useAcademy((s) => s.lessons);
  const grammarSeen = useAcademy((s) => s.grammarSeen);
  const runs = useExamRuns();
  const canListen = useCzechVoice().state === 'available';

  return useMemo(() => {
    const day = dayKey();
    const before = <T extends { at: string }>(list: T[]) => list.filter((x) => !isToday(x.at, day));
    const pastLessons = Object.fromEntries(
      Object.entries(lessons)
        .map(([id, list]) => [id, before(list)] as const)
        .filter(([, list]) => list.length),
    );
    const pastAttempts = before(attempts);
    const counts = today(days);

    const plan = dailyPlan({
      minutes: minutesOf(profile),
      log: pastLessons,
      attempts: pastAttempts,
      // Words reviewed today were due this morning.
      wordsDue: dueCards(deck, new Date(), 999).length + counts.reviews,
      canListen,
      tasksDone: Object.fromEntries(Object.entries(runs).map(([id, list]) => [id, before(list).length])),
      mistakes: mistakeIds(pastAttempts).length,
    });

    const done = {
      lessons: new Set(ranToday(lessons, day)),
      sets: new Set(ranToday(runs, day)),
      grammar: new Set(Object.keys(grammarSeen).filter((id) => isToday(grammarSeen[id], day))),
      reviews: counts.reviews,
      reviewed: attempts.filter((a) => a.source === 'review' && isToday(a.at, day)).length,
    };
    return plan.map((s) => ({ ...s, done: stepDoneToday(s, done) }));
  }, [profile, deck, days, attempts, lessons, grammarSeen, runs, canListen]);
}

export function stepHref(step: PlanStep): Href {
  switch (step.kind) {
    case 'lesson':
      return { pathname: '/a2-lesson/[id]', params: { id: step.id } };
    case 'retest':
      return { pathname: '/a2-lesson/[id]', params: { id: step.id, retest: '1' } };
    case 'grammar':
      return { pathname: '/learn/grammar/[id]', params: { id: step.id } };
    case 'words':
      return '/flashcards';
    case 'task':
      return { pathname: '/a2-task/[id]', params: { id: step.id } };
    case 'writing':
      return { pathname: '/a2-writing/[id]', params: { id: step.id } };
    case 'speaking':
      return { pathname: '/a2-speaking/[id]', params: { id: step.id } };
    case 'mistakes':
      return '/a2-mistakes';
  }
}

/** Where a step of the journey opens. */
export function nodeHref(node: JourneyNode): Href {
  if (node.kind === 'lesson') return { pathname: '/a2-lesson/[id]', params: node.retest ? { id: node.id, retest: '1' } : { id: node.id } };
  if (node.part === 'writing') return { pathname: '/a2-writing/[id]', params: { id: node.id } };
  if (node.part === 'speaking') return { pathname: '/a2-speaking/[id]', params: { id: node.id } };
  return { pathname: '/a2-task/[id]', params: { id: node.id } };
}

export const stepIcon = { lesson: 'school', retest: 'refresh', grammar: 'book', words: 'cards', task: 'flag', writing: 'compose', speaking: 'mic', mistakes: 'refresh' } as const;

export const partIcon = { reading: 'book', listening: 'ear', writing: 'compose', speaking: 'mic' } as const;
