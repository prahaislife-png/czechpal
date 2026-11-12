import { daysUntil, ELSEWHERE, hasExpiry, longDate, type AboutMe } from '@/lib/about';
import { districtOf, officeForDistrict, type Office } from '@/lib/visa/offices';

/**
 * Help's "For you": what About you (district, permit and its end date) already tells the app
 * about where this person has to go and what is coming up. Only facts the app has; nothing is
 * guessed. No React Native imports, so the tests can run it.
 */

export type ForYou = {
  /** The immigration office for the person's part of Prague. */
  office?: { office: Office; also?: string; district: string };
  /** The permit's end date, when it is close enough to act on. */
  permit?: { days: number; title: string; detail: string; checklist?: string };
  /** The district, for looking up the town hall. */
  townHallDistrict?: string;
  /** Nothing is known yet: ask. */
  empty: boolean;
};

/** A permit this close to its end is shown: a little before the first reminder, which comes 120 days ahead. */
export const PERMIT_SOON_DAYS = 180;

export function forYou(about: AboutMe): ForYou {
  const inPrague = !!about.district && about.district !== ELSEWHERE;
  const result: ForYou = { empty: !about.district && !about.expires && !about.stay };

  if (inPrague) {
    const found = officeForDistrict(districtOf(about.district!));
    result.office = { ...found, district: about.district! };
    result.townHallDistrict = about.district;
  }

  if (about.expires && hasExpiry(about)) {
    const days = daysUntil(about.expires);
    if (days >= 0 && days <= PERMIT_SOON_DAYS) {
      result.permit = {
        days,
        title: days === 0 ? 'Your permit ends today' : `Your permit ends in ${days} ${days === 1 ? 'day' : 'days'}`,
        detail: `${longDate(about.expires)} · what to bring to extend it`,
        // The one extension checklist the app has is for the employee card; others see the full list.
        checklist: about.stay === 'employee_card' ? 'extend-employee-card' : undefined,
      };
    }
  }
  return result;
}

/** "today", "tomorrow", "in 5 days". */
export const dueLabel = (days: number) => (days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`);
