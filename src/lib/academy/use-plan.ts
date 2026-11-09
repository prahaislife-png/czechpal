import type { Href } from 'expo-router';
import { useMemo } from 'react';

import { dayKey, today } from '@/lib/learn/activity';
import { contentById } from '@/lib/learn/content';
import { dueCards } from '@/lib/learn/deck';
import { minutesOf } from '@/lib/learn/profile';
import { isFinished } from '@/lib/learn/progress';
import { situationOfTheDay } from '@/lib/learn/upcoming';
import { useUpcoming } from '@/lib/learn/use-upcoming';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';

import { mistakeIds } from './evidence';
import { dailyPlan, stepDoneToday, type PlanStep } from './plan';

export type TodayStep = PlanStep & { done: boolean };

const isToday = (at: string, day: string) => dayKey(new Date(at)) === day;
const ranToday = (runs: Record<string, { at: string }[]>, day: string) => Object.keys(runs).filter((id) => runs[id].some((r) => isToday(r.at, day)));

/**
 * Learn's one daily plan, from what's on this phone. It is worked out from what was done before
 * today, so it holds still all day; what was done today ticks its steps off.
 */
export function useTodayPlan(): TodayStep[] {
  const profile = useLearn((s) => s.profile);
  const deck = useLearn((s) => s.deck);
  const progress = useLearn((s) => s.progress);
  const days = useLearn((s) => s.days);
  const setupAt = useAcademy((s) => s.setupAt);
  const attempts = useAcademy((s) => s.attempts);
  const lessons = useAcademy((s) => s.lessons);
  const diagnostic = useAcademy((s) => s.diagnostic);
  const tasks = useAcademy((s) => s.tasks);
  const writing = useAcademy((s) => s.writing);
  const speaking = useAcademy((s) => s.speaking);
  const grammarSeen = useAcademy((s) => s.grammarSeen);
  const coming = useUpcoming();
  const voice = useCzechVoice();
  const canListen = voice.state === 'available';

  return useMemo(() => {
    const day = dayKey();
    const before = <T extends { at: string }>(list: T[]) => list.filter((x) => !isToday(x.at, day));
    const sets: Record<string, { at: string }[]> = { ...tasks, ...writing, ...speaking };
    const pastLessons = Object.fromEntries(Object.entries(lessons).map(([id, runs]) => [id, before(runs)] as const).filter(([, runs]) => runs.length));
    const pastAttempts = before(attempts);
    const counts = today(days);
    const focus = coming[0] ?? { situation: situationOfTheDay(), reason: 'Today’s situation' };

    const plan = dailyPlan({
      minutes: minutesOf(profile),
      difficulty: profile?.difficulty,
      diagnosticDone: !!diagnostic && !isToday(diagnostic.at, day),
      log: pastLessons,
      attempts: pastAttempts,
      // Words reviewed today were due this morning.
      wordsDue: dueCards(deck, new Date(), 999).length + counts.reviews,
      unread: (id) => {
        const c = contentById(id);
        return !!c && !isFinished(progress[id], c);
      },
      storyTitle: (id) => contentById(id)?.title,
      canListen,
      tasksDone: Object.fromEntries(Object.entries(sets).map(([id, runs]) => [id, before(runs).length])),
      mistakes: mistakeIds(pastAttempts).length,
      academy: !!setupAt,
      everyday: { situation: focus.situation.id, title: focus.situation.title, reason: focus.reason, soon: coming.length > 0 },
    });

    const done = {
      diagnostic: !!diagnostic && isToday(diagnostic.at, day),
      lessons: new Set(ranToday(lessons, day)),
      sets: new Set(ranToday(sets, day)),
      grammar: new Set(Object.keys(grammarSeen).filter((id) => grammarSeen[id] === day || isToday(grammarSeen[id], day))),
      reviews: counts.reviews,
      chapters: counts.chapters,
      listening: counts.listening,
      sessions: counts.sessions,
      reviewed: attempts.filter((a) => a.source === 'review' && isToday(a.at, day)).length,
    };
    return plan.map((s) => ({ ...s, done: stepDoneToday(s, done) }));
  }, [profile, deck, progress, days, setupAt, attempts, lessons, diagnostic, tasks, writing, speaking, grammarSeen, coming, canListen]);
}

export function stepHref(step: PlanStep): Href {
  switch (step.kind) {
    case 'diagnostic':
      return '/diagnostic';
    case 'lesson':
      return { pathname: '/a2-lesson/[id]', params: { id: step.id } };
    case 'retest':
      return { pathname: '/a2-lesson/[id]', params: { id: step.id, retest: '1' } };
    case 'grammar':
      return { pathname: '/learn/grammar/[id]', params: { id: step.id } };
    case 'words':
      return '/flashcards';
    case 'story':
      return { pathname: '/lesson/[id]', params: { id: step.id } };
    case 'listen':
      return '/listen';
    case 'task':
      return { pathname: '/a2-task/[id]', params: { id: step.id } };
    case 'writing':
      return { pathname: '/a2-writing/[id]', params: { id: step.id } };
    case 'speaking':
      return { pathname: '/a2-speaking/[id]', params: { id: step.id } };
    case 'mistakes':
      return '/a2-mistakes';
    case 'session':
      return { pathname: '/session', params: { focus: step.situation, minutes: String(step.minutes) } };
  }
}

export const stepIcon = { diagnostic: 'flag', lesson: 'school', retest: 'refresh', grammar: 'book', words: 'cards', story: 'document', listen: 'ear', task: 'flag', writing: 'compose', speaking: 'mic', mistakes: 'refresh', session: 'message' } as const;
