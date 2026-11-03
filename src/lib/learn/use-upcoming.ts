import { useMemo } from 'react';

import { useStore } from '@/store/cases';

import { situationOfTheDay, upcoming, type Upcoming } from './upcoming';

/** What's coming up in the learner's life, from About you, reminders and scanned letters. */
export function useUpcoming(): Upcoming[] {
  const expires = useStore((s) => s.about.expires);
  const reminders = useStore((s) => s.reminders);
  const cases = useStore((s) => s.cases);
  return useMemo(
    () =>
      upcoming({
        permitExpires: expires,
        reminders,
        cases: cases.map((c) => ({
          id: c.id,
          createdAt: c.createdAt,
          // Samples tried on the first visit aren't the learner's life.
          status: c.source === 'example' ? 'example' : c.status,
          category: c.result?.analysis.category,
          typeLabel: c.result?.analysis.typeLabel,
          title: c.result?.analysis.title,
        })),
      }),
    [expires, reminders, cases],
  );
}

/** The situation today's session practises: the one coming up soonest, else one for the day. */
export function useFocus(): Upcoming {
  const coming = useUpcoming();
  return coming[0] ?? { situation: situationOfTheDay(), reason: 'Today’s situation' };
}
