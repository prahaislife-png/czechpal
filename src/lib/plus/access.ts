import { buildJourney } from '@/lib/academy/journey';
import { MOCK_VARIANTS } from '@/lib/academy/mock';
import { practiceSets } from '@/lib/academy/tasks';
import { speakingTasks } from '@/lib/academy/tasks/speaking';
import { writingTasks } from '@/lib/academy/tasks/writing';

/**
 * What CzechLocal Plus opens, decided in one place. Free: the first unit of the A2 journey, whole
 * (its lessons and one exam task of each part), the dictionary, the daily words, and the free
 * explanations the server counts. Plus: the rest of the journey, the mock exams, and unlimited
 * explanations and form guides.
 *
 * Nothing is locked until the app can actually sell Plus (`live`): a build without the store key
 * behaves as before. No React Native imports, so the tests can run it.
 */

/** Units of the journey that are free. */
export const FREE_UNITS = 1;

/**
 * The entitlement's identifier in the RevenueCat dashboard, where it can't be renamed. It must
 * match PLUS_ENTITLEMENT in supabase/functions/_shared/membership.ts.
 */
export const PLUS_ENTITLEMENT = 'czechpal_pro';

/** `live`: Plus can be bought in this build. `plus`: this person has it. */
export type Access = { live: boolean; plus: boolean };

const shape = buildJourney({}, {}, { canListen: true });
const freeIds = new Set(shape.units.slice(0, FREE_UNITS).flatMap((u) => u.nodes.map((n) => n.id)));
const journeyIds = new Set(shape.units.flatMap((u) => u.nodes.map((n) => n.id)));

/** Something is held back for this person. */
export const gated = (a: Access) => a.live && !a.plus;

/** A lesson or exam task of the journey that needs Plus. Anything outside the journey is never locked here. */
export const stepLocked = (id: string | undefined, a: Access) => gated(a) && !!id && journeyIds.has(id) && !freeIds.has(id);

export const unitLocked = (n: number, a: Access) => gated(a) && n > FREE_UNITS;

/** The mock exams are Plus. */
export const mockLocked = (a: Access) => gated(a);

/** What the course holds, for saying it in numbers. */
export const courseSize = {
  units: shape.units.length,
  lessons: shape.units.reduce((n, u) => n + u.lessonsTotal, 0),
  examTasks: practiceSets.length + writingTasks.length + speakingTasks.length,
  mocks: MOCK_VARIANTS,
  freeLessons: shape.units.slice(0, FREE_UNITS).reduce((n, u) => n + u.lessonsTotal, 0),
};

/** Why the paywall was opened: it leads with what the person was reaching for. */
export type PlusReason = 'course' | 'mock' | 'explain' | 'form' | 'settings';

export const plusHeadline: Record<PlusReason, { title: string; lead: string }> = {
  course: { title: 'Keep going to the exam', lead: `You’ve seen how the lessons work. Plus opens all ${courseSize.units} topics, up to exam day.` },
  mock: { title: 'Sit the exam before the exam', lead: 'A full mock in the real format and times, with a result that says pass or not yet, and what to practise.' },
  explain: { title: 'Never be stuck on a letter', lead: 'You’ve used this month’s free explanations. Plus explains every letter, bill and form, with no monthly count.' },
  form: { title: 'Fill in any Czech form', lead: 'Field by field: what it asks, what to write, and what to bring. Plus has no monthly count.' },
  settings: { title: 'CzechLocal Plus', lead: 'Everything for the A2 exam, and every letter and form explained.' },
};

/** What Plus gives, in the order people care about. */
export const plusBenefits: { icon: 'school' | 'flag' | 'clock' | 'compose' | 'camera' | 'document'; title: string; detail: string }[] = [
  { icon: 'school', title: `The whole A2 course`, detail: `All ${courseSize.units} topics and ${courseSize.lessons} lessons, in small steps` },
  { icon: 'flag', title: 'Exam practice in the real formats', detail: `${courseSize.examTasks} reading, listening, writing and speaking tasks` },
  { icon: 'clock', title: 'Full mock exams', detail: 'Timed like the real one, with a pass or not-yet result' },
  { icon: 'compose', title: 'Feedback on your writing', detail: 'Corrections and an estimate of your points' },
  { icon: 'camera', title: 'Unlimited explanations', detail: 'Every letter, bill, sign and message, no monthly count' },
  { icon: 'document', title: 'Form filling', detail: 'Any Czech form, field by field' },
];

/**
 * Whether a store key may be used in this build. RevenueCat's Test Store keys (`test_…`) make
 * the SDK crash on purpose in any release build, TestFlight included, so one is only ever used
 * in development; a release build with one behaves as if Plus weren't on sale.
 */
export function usableStoreKey(key: string | undefined, isDev: boolean): string | undefined {
  const k = key?.trim();
  if (!k) return undefined;
  if (k.startsWith('test_') && !isDev) return undefined;
  return k;
}

/** How each kind of plan is named on the paywall. */
export const planWords = {
  year: { name: 'Yearly', every: 'a year', renews: 'Renews every year until you cancel.' },
  month: { name: 'Monthly', every: 'a month', renews: 'Renews every month until you cancel.' },
  lifetime: { name: 'Lifetime', every: 'once', renews: 'Paid once. Yours for good, with no renewal.' },
  other: { name: 'Plus', every: '', renews: 'Renews until you cancel.' },
} as const;
