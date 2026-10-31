/**
 * Urgent help in Prague.
 *
 * After-hours services (lékařská a lékárenská pohotovostní služba): the City of Prague's official
 * list at lps.praha.eu, copied on 31 Oct 2026. One-off notes for past dates in that list were left
 * out. Holiday hours change, so the app links to the live page.
 *
 * Support lines: the harmonised 116 numbers listed on the government portal (portal.gov.cz,
 * "Čísla 116"): free, and these four are available nonstop.
 */

export type AfterHoursType = 'adults' | 'children' | 'dentist' | 'pharmacy';

export type Hours = { from: string; to: string } | 'nonstop';

export type AfterHoursService = {
  id: string;
  type: AfterHoursType;
  provider: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  /** Monday to Friday (Fri may differ: see `friday`). */
  weekdays: Hours;
  friday?: Hours;
  weekend: Hours;
  /** null when the city's list doesn't say. */
  holidays: Hours | null;
  /** A closed break within the weekend and holiday hours. */
  weekendBreak?: { from: string; to: string };
  /** Shown as written, e.g. a lunch break. */
  note?: string;
};

export const AFTER_HOURS_SOURCE = { url: 'https://lps.praha.eu', checkedOn: '2026-10-31' };

export const afterHoursTypes: { id: AfterHoursType; title: string; detail: string }[] = [
  { id: 'adults', title: 'Adults', detail: 'After-hours doctor for adults' },
  { id: 'children', title: 'Children', detail: 'After-hours doctor for children and teenagers' },
  { id: 'dentist', title: 'Dentist', detail: 'After-hours dentist' },
  { id: 'pharmacy', title: 'Pharmacy', detail: 'Pharmacy open at night and weekends' },
];

const night = { from: '19:00', to: '06:00' };

export const afterHours: AfterHoursService[] = [
  { id: 'motol-children', type: 'children', provider: 'Fakultní nemocnice v Motole', address: 'V úvalu 84/1', district: 'Praha 5', lat: 50.074343, lng: 14.342904, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'motol-adults', type: 'adults', provider: 'Fakultní nemocnice v Motole', address: 'V úvalu 84/1', district: 'Praha 5', lat: 50.072965, lng: 14.340444, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'vinohrady-children', type: 'children', provider: 'Fakultní nemocnice Královské Vinohrady', address: 'Šrobárova 1150/50', district: 'Praha 10', lat: 50.076001, lng: 14.476171, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'vinohrady-adults', type: 'adults', provider: 'Fakultní nemocnice Královské Vinohrady', address: 'Šrobárova 1150/50', district: 'Praha 10', lat: 50.074546, lng: 14.480518, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'vfn-children', type: 'children', provider: 'Všeobecná fakultní nemocnice v Praze', address: 'Ke Karlovu 455/2', district: 'Praha 2', lat: 50.06987, lng: 14.428702, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'bulovka-children', type: 'children', provider: 'Fakultní nemocnice Bulovka', address: 'Budínova 67/2', district: 'Praha 8', lat: 50.11494, lng: 14.465004, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'bulovka-adults', type: 'adults', provider: 'Fakultní nemocnice Bulovka', address: 'Budínova 67/2', district: 'Praha 8', lat: 50.114964, lng: 14.464913, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'thomayer-children', type: 'children', provider: 'Fakultní Thomayerova nemocnice', address: 'Vídeňská 800', district: 'Praha 4', lat: 50.029527, lng: 14.456879, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'thomayer-adults', type: 'adults', provider: 'Fakultní Thomayerova nemocnice', address: 'Vídeňská 800', district: 'Praha 4', lat: 50.029533, lng: 14.456836, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'thomayer-dentist', type: 'dentist', provider: 'Fakultní Thomayerova nemocnice', address: 'Vídeňská 800', district: 'Praha 4', lat: 50.029538, lng: 14.456836, weekdays: { from: '17:30', to: '22:30' }, weekend: { from: '07:30', to: '22:30' }, holidays: { from: '07:30', to: '22:30' } },
  { id: 'uvn-adults', type: 'adults', provider: 'Ústřední vojenská nemocnice – Vojenská fakultní nemocnice Praha', address: 'U Vojenské nemocnice 1200', district: 'Praha 6', lat: 50.088959, lng: 14.362288, weekdays: { from: '18:00', to: '06:00' }, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'poliklinika-dentist', type: 'dentist', provider: 'Městská poliklinika Praha', address: 'Spálená 78/12', district: 'Praha 1', lat: 50.080305, lng: 14.419968, weekdays: { from: '18:00', to: '23:30' }, friday: { from: '16:00', to: '23:30' }, weekend: { from: '07:00', to: '22:00' }, holidays: { from: '07:00', to: '22:00' }, weekendBreak: { from: '14:00', to: '15:00' }, note: 'Weekends and holidays: break from 14:00 to 15:00.' },
  { id: 'frantisek-pharmacy', type: 'pharmacy', provider: 'Nemocnice Na Františku s poliklinikou', address: 'Palackého 720/5', district: 'Praha 1', lat: 50.092868, lng: 14.421430, weekdays: night, weekend: 'nonstop', holidays: 'nonstop' },
  { id: 'frantisek-dentist', type: 'dentist', provider: 'Nemocnice Na Františku s poliklinikou', address: 'Palackého 720/5', district: 'Praha 1', lat: 50.092868, lng: 14.421430, weekdays: { from: '17:00', to: '22:00' }, weekend: { from: '10:00', to: '22:00' }, holidays: null },
];

/** What the city says to bring, and what after-hours care is for. */
export const AFTER_HOURS_BRING = [
  { label: 'ID card or passport' },
  { label: 'Health insurance card', detail: 'Or your insurance contract' },
  { label: '90 Kč', detail: 'The fee for after-hours care set by law' },
  { label: 'Allergies and intolerances' },
  { label: 'A list of medicines you take' },
  { label: 'Documents about long-term illnesses', detail: 'For example diabetes' },
  { label: 'Medical records' },
];
export const AFTER_HOURS_PURPOSE =
  'After-hours care is for a sudden change in your health, or an illness that has got worse. It isn’t for things your GP would handle in their normal hours.';

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Whether `t` (minutes after midnight) falls in a day's own window. A window like 19:00–06:00 only
 * counts from its start here; its early-morning part belongs to the next day and is checked as
 * "yesterday's window" there.
 */
const inWindow = (w: Hours, t: number) => {
  if (w === 'nonstop') return true;
  const from = minutes(w.from);
  const to = minutes(w.to);
  return from <= to ? t >= from && t < to : t >= from;
};

/** Prague local weekday (0 = Sunday) and minutes after midnight. */
function pragueNow(now: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Prague', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, t: Number(get('hour')) * 60 + Number(get('minute')) };
}

const hoursFor = (s: AfterHoursService, day: number): Hours => (day === 0 || day === 6 ? s.weekend : day === 5 && s.friday ? s.friday : s.weekdays);

/**
 * Open right now, by the regular hours. Public holidays aren't known to the app, and services are
 * open longer on them, so this only ever says "open", never "closed": on a holiday it may miss an
 * open service, but it can't send anyone to a closed door.
 */
export function isOpenNow(s: AfterHoursService, now = new Date()) {
  let local: { day: number; t: number };
  try {
    local = pragueNow(now);
  } catch {
    return false; // no time-zone support: show the hours, not a guess
  }
  const { day, t } = local;
  if (day < 0 || Number.isNaN(t)) return false;
  const weekend = day === 0 || day === 6;
  if (weekend && s.weekendBreak && t >= minutes(s.weekendBreak.from) && t < minutes(s.weekendBreak.to)) return false;
  if (inWindow(hoursFor(s, day), t)) return true;
  // Still inside yesterday's window that runs past midnight (e.g. Friday 19:00 to Saturday 06:00).
  const yesterday = hoursFor(s, (day + 6) % 7);
  return yesterday !== 'nonstop' && minutes(yesterday.from) > minutes(yesterday.to) && t < minutes(yesterday.to);
}

export const formatHours = (h: Hours | null) =>
  h === null ? 'not stated' : h === 'nonstop' ? 'open all day and night' : `${h.from} to ${h.to}`;

/** Free support lines, available nonstop (government portal, "Čísla 116"). */
export const supportLines = [
  { number: '116 123', label: 'Someone to talk to', detail: 'First psychological help line, for anyone in a difficult moment' },
  { number: '116 111', label: 'For children and teenagers', detail: 'Linka bezpečí, the children’s helpline' },
  { number: '116 006', label: 'Victims of crime', detail: 'Help line for victims of crime' },
  { number: '116 016', label: 'Violence against women', detail: 'Help line for women experiencing violence' },
];
export const SUPPORT_LINES_SOURCE = 'https://portal.gov.cz/informace/cisla-116--harmonizovane-sluzby-se-socialni-hodnotou-INF-415';
