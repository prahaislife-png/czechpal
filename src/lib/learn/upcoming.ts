import { situationById, situations, type Situation, type SituationId } from './situations';

/**
 * What's coming up in the learner's life, as Learn sees it: the residence permit running out,
 * a deadline from a letter they scanned, a recent letter about the doctor or the flat. Each
 * becomes a situation to get ready for, soonest first. Works from data already on the phone.
 */

/** The parts of a reminder, a scanned case and About you that this needs. */
export type UpcomingInput = {
  permitExpires?: string;
  reminders: { kind: 'deadline' | 'permit'; caseId?: string; date: string; title: string }[];
  cases: { id: string; createdAt: string; status: string; category?: string; typeLabel?: string; title?: string }[];
  now?: Date;
};

export type Upcoming = {
  situation: Situation;
  /** "Your permit ends in 34 days", "Pay 1 840 Kč by Friday". */
  reason: string;
  /** Days until it happens, when there's a date. */
  days?: number;
};

/** Letters by category point at a situation; a parcel notice points at the post office. */
const byCategory: Partial<Record<string, SituationId>> = {
  health: 'doctor',
  housing: 'flat',
  utilities: 'bills',
  finance: 'bills',
  government: 'office',
  school: 'office',
  work: 'work',
};
const POST = /z[aá]silk|bal[ií]k|parcel|post office|pošt|doporu[cč]en/i;

/** Within this many days, a permit expiry is worth preparing for (renewal opens 120 days ahead). */
export const PERMIT_WINDOW = 150;
/** A letter without a deadline still counts for this long after it was scanned. */
const RECENT_DAYS = 21;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysUntil = (iso: string, now: Date) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - startOfDay(now).getTime()) / 86_400_000);
};

export const inDays = (days: number) => (days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`);

export function situationForCase(c: UpcomingInput['cases'][number]): SituationId | undefined {
  if (POST.test(`${c.typeLabel ?? ''} ${c.title ?? ''}`)) return 'post';
  return c.category ? byCategory[c.category] : undefined;
}

export function upcoming({ permitExpires, reminders, cases, now = new Date() }: UpcomingInput): Upcoming[] {
  const found: Upcoming[] = [];
  const add = (id: SituationId | undefined, reason: string, days?: number) => {
    const situation = situationById(id);
    if (situation) found.push({ situation, reason, days });
  };

  // The permit: from About you, or from its reminder.
  const permit = permitExpires ?? reminders.find((r) => r.kind === 'permit')?.date;
  if (permit) {
    const days = daysUntil(permit, now);
    if (days >= 0 && days <= PERMIT_WINDOW) add('permit', `Your residence permit ends ${inDays(days)}`, days);
  }

  // Deadlines read from letters.
  const caseById = new Map(cases.map((c) => [c.id, c]));
  for (const r of reminders) {
    if (r.kind !== 'deadline') continue;
    const days = daysUntil(r.date, now);
    if (days < 0) continue;
    const c = r.caseId ? caseById.get(r.caseId) : undefined;
    add(c ? situationForCase(c) : undefined, `${r.title} ${inDays(days)}`, days);
  }

  // Recent letters with no deadline still show what's going on.
  for (const c of cases) {
    if (c.status !== 'ready') continue;
    const age = -daysUntil(c.createdAt.slice(0, 10), now);
    if (age > RECENT_DAYS) continue;
    add(situationForCase(c), `From ${c.title ? `“${c.title}”` : 'a letter'} you scanned ${age === 0 ? 'today' : age === 1 ? 'yesterday' : `${age} days ago`}`);
  }

  // Soonest first; one entry per situation (its most pressing reason).
  const order = (u: Upcoming) => u.days ?? 1000;
  const seen = new Set<SituationId>();
  return found
    .sort((a, b) => order(a) - order(b))
    .filter((u) => (seen.has(u.situation.id) ? false : (seen.add(u.situation.id), true)));
}

/** With nothing coming up, a situation for the day, the same all day and different each day. */
export function situationOfTheDay(now = new Date()): Situation {
  const day = Math.floor(startOfDay(now).getTime() / 86_400_000);
  return situations[((day % situations.length) + situations.length) % situations.length];
}
