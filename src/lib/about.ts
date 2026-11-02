/**
 * "About you": three optional answers that make explanations, reminders and Find fit the person.
 * Saved on this phone. Sent to the server only as a one-line summary with an explanation request
 * (see `aboutSummary`), and only after the person agreed to AI processing.
 */

export type StayId =
  | 'employee_card'
  | 'blue_card'
  | 'study'
  | 'family'
  | 'business'
  | 'protection'
  | 'permanent'
  | 'eu'
  | 'other';

export type AboutMe = {
  stay?: StayId;
  /** When the residence permit or card expires, YYYY-MM-DD. */
  expires?: string;
  /** 'Praha 3', or ELSEWHERE. */
  district?: string;
  /** The Home card asking for this was closed. */
  dismissed?: boolean;
};

/** What lets the person live in Czechia. `expires`: whether a permit or card with an end date goes with it. */
export const stays: { id: StayId; label: string; detail?: string; expires: boolean }[] = [
  { id: 'employee_card', label: 'Employee card', detail: 'Zaměstnanecká karta', expires: true },
  { id: 'blue_card', label: 'EU Blue Card', detail: 'Modrá karta', expires: true },
  { id: 'study', label: 'Studying', detail: 'Long-term visa or residence for study', expires: true },
  { id: 'family', label: 'Family', detail: 'Living with a family member', expires: true },
  { id: 'business', label: 'Own business', detail: 'Trade licence (živnostenský list)', expires: true },
  { id: 'protection', label: 'Temporary protection', detail: 'Dočasná ochrana', expires: true },
  { id: 'permanent', label: 'Permanent residence', detail: 'Trvalý pobyt', expires: true },
  { id: 'eu', label: 'EU, EEA or Swiss citizen', expires: false },
  { id: 'other', label: 'Something else', expires: true },
];

export const stayById = (id: StayId | undefined) => stays.find((s) => s.id === id);

export const ELSEWHERE = 'Elsewhere in Czechia';
export const districts = [...Array.from({ length: 22 }, (_, i) => `Praha ${i + 1}`), ELSEWHERE];

/** Asks for an expiry date: a stay that has one, or none chosen yet. */
export const hasExpiry = (about: AboutMe) => stayById(about.stay)?.expires ?? true;

/** One line for the explanation request, e.g. "Employee card, expires 2027-03-01. Lives in Praha 3." */
export function aboutSummary(about: AboutMe): string | undefined {
  const stay = stayById(about.stay);
  const parts = [
    stay && stay.id !== 'other' ? `${stay.label}${about.expires && stay.expires ? `, expires ${about.expires}` : ''}.` : null,
    about.district && about.district !== ELSEWHERE ? `Lives in ${about.district}.` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : undefined;
}

/** "1 March 2027" from YYYY-MM-DD, read as a local date. */
export const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/** "Fri 20 Nov" from YYYY-MM-DD. */
export const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Whole days from today to YYYY-MM-DD; negative once it has passed. */
export function daysUntil(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const now = new Date();
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000);
}

export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(`${v}T12:00:00`).getTime());
