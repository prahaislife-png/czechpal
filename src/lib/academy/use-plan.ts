import type { Href } from 'expo-router';
import { useMemo } from 'react';

import { contentById } from '@/lib/learn/content';
import { dueCards } from '@/lib/learn/deck';
import { minutesOf } from '@/lib/learn/profile';
import { isFinished } from '@/lib/learn/progress';
import { useCzechVoice } from '@/lib/learn/voice';
import { useAcademy } from '@/store/academy';
import { useLearn } from '@/store/learn';

import { mistakeIds } from './evidence';
import { dailyPlan, type PlanStep } from './plan';

/** Today's A2 plan from what's on this phone. */
export function useTodayPlan() {
  const profile = useLearn((s) => s.profile);
  const deck = useLearn((s) => s.deck);
  const progress = useLearn((s) => s.progress);
  const attempts = useAcademy((s) => s.attempts);
  const lessons = useAcademy((s) => s.lessons);
  const diagnosticDone = useAcademy((s) => !!s.diagnostic);
  const tasks = useAcademy((s) => s.tasks);
  const writing = useAcademy((s) => s.writing);
  const speaking = useAcademy((s) => s.speaking);
  const voice = useCzechVoice();
  const canListen = voice.state === 'available';

  return useMemo(
    () =>
      dailyPlan({
        minutes: minutesOf(profile),
        difficulty: profile?.difficulty,
        diagnosticDone,
        log: lessons,
        attempts,
        wordsDue: dueCards(deck, new Date(), 999).length,
        unread: (id) => {
          const c = contentById(id);
          return !!c && !isFinished(progress[id], c);
        },
        storyTitle: (id) => contentById(id)?.title,
        canListen,
        tasksDone: Object.fromEntries([...Object.entries(tasks), ...Object.entries(writing), ...Object.entries(speaking)].map(([id, runs]) => [id, runs.length])),
        mistakes: mistakeIds(attempts).length,
      }),
    [profile, diagnosticDone, lessons, attempts, deck, progress, canListen, tasks, writing, speaking],
  );
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
  }
}

export const stepIcon = { diagnostic: 'flag', lesson: 'school', retest: 'refresh', grammar: 'book', words: 'cards', story: 'document', listen: 'ear', task: 'flag', writing: 'compose', speaking: 'mic', mistakes: 'refresh' } as const;
