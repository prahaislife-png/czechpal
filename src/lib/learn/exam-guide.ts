/**
 * The practical side of the A2 exam for permanent residence: who needs it, registering, dates,
 * cost, the exam day and what comes after. Only what the organiser (NPI ČR) publishes, with the
 * source of each fact; see docs/a2/exam-specification-2026.md. Checked 2026-11-09.
 */

export const GUIDE_CHECKED_ON = '2026-11-09';

export const GUIDE_SOURCES = {
  /** G1: the official English information page. */
  info: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/',
  /** G2: Information for applicants (EN, 2026, PDF). */
  applicants: 'https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/04/Information_for_Applicants_EN_2026.pdf',
  registration: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/online-prihlaska/',
  schools: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/kontakty/#skoly',
  practiceTest: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/priprava-na-zkousku/modelovy-test-novy-format/',
  ministry: 'https://www.mvcr.cz/clanek/obcane-tretich-zemi-trvaly-pobyt.aspx',
} as const;

/** The fee for each attempt, retakes included (G1, G2). */
export const EXAM_FEE_CZK = 3200;

export const whoMustTake = [
  'People from outside the EU and EEA applying for permanent residence after 5 years in Czechia, or holding an EU Blue Card, unless exempt.',
  'British citizens who got long-term residence only after 31 December 2020.',
];

export const exemptions = [
  'EU and EEA citizens, and British citizens legally resident long-term before 31 December 2020.',
  'People under 15 or over 60.',
  'People who studied in Czech in the last 20 years: at least 1 school year at a primary or secondary school, or 1 academic year at a university teaching in Czech.',
  'People with a Czech school-leaving exam, a state language exam, a Czech state final or doctoral exam, a CCE certificate at A2 or higher, the citizenship language exam, or a specialisation exam for doctors, dentists or pharmacists.',
  'People with a physical or mental disability that affects their ability to communicate.',
];

/** Registering, in order, with the deadlines that apply (G1, G2). */
export const registrationSteps = [
  { title: 'Register online', detail: 'Use the official online registration. You need a valid passport. Register at least 14 days before the exam: later isn’t possible.' },
  { title: 'Don’t pick a school', detail: 'The organiser recommends choosing no school at all: you’re given a date wherever a place frees up first. Picking one school usually means waiting longer.' },
  { title: 'Get your date by e-mail', detail: 'Applications are handled in the order people register. The date and school are sent to your e-mail address.' },
  { title: 'Confirm and pay at the school', detail: `Go to the school in person, with your passport, at least 8 days before the exam. Check and sign your application (nothing can be changed on the day) and pay the fee, ${EXAM_FEE_CZK.toLocaleString('en-GB')} Kč.` },
];

/** Withdrawing (G2). */
export const withdrawal =
  'You can withdraw in person or in writing up to 15 days before the exam. Later only for health or serious personal reasons: tell the school at once and send written confirmation.';

/** The exam day, in order (G2). */
export const examDay = [
  'Arrive 30 minutes before the start (the exam starts at 9:00). If you’re late you can’t take it that day, and a new date must be paid for again.',
  'Show your passport and sign the attendance sheet. No other document is accepted. You get a card with your registration number.',
  'At your desk, your passport and number card stay on the table. Your phone is switched off and your bags, books and electronics are put away, out of reach.',
  'The written part (reading, writing, listening) takes about 110 minutes, with instructions from a teacher and a video, and a break after the first hour. Your phone stays off in the break too.',
  'You can’t leave the room during the written part, so go to the toilet before it starts or in the break.',
  'The oral part is the same day. If you pass the written part, you’re told your time and room for it; bring your passport again.',
];

/** After the exam (G2; handbook S3 p.10–11). */
export const afterTheExam = [
  'Results are on the website, or from the school, within 9 days.',
  'If you pass, you collect the certificate (Osvědčení o znalosti českého jazyka) at the school, or it’s posted to you, within 30 days.',
  `If you don’t pass, you repeat the whole exam and pay again (${EXAM_FEE_CZK.toLocaleString('en-GB')} Kč): at the earliest 3 months later, at most 3 times a year.`,
  'You can’t see your test papers or answer sheets afterwards.',
];

/**
 * Exam dates the organiser lists (G1, checked 2026-11-09): three a month, on Wednesdays or Saturdays,
 * from 9:00. The list changes; the app shows it with its check date and the link to the source.
 */
export const EXAM_DATES = [
  '2026-11-11', '2026-11-18', '2026-11-28', '2026-12-05', '2026-12-16',
  '2027-01-06', '2027-01-16', '2027-01-23', '2027-02-03', '2027-02-10', '2027-02-20',
  '2027-03-03', '2027-03-13', '2027-03-31', '2027-04-07', '2027-04-17', '2027-04-28',
  '2027-05-12', '2027-05-22', '2027-06-02', '2027-06-12', '2027-06-23', '2027-07-07',
  '2027-08-25', '2027-09-08', '2027-09-15', '2027-09-25', '2027-10-06', '2027-10-16',
  '2027-11-03', '2027-11-13', '2027-11-24', '2027-12-04', '2027-12-15',
];

/** Registration closes 14 days before an exam (G2). */
export const REGISTER_DAYS_BEFORE = 14;

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/**
 * The next listed dates you could still register for (at least 14 days away), soonest first.
 * Dates closer than that are left out: registration has closed for them.
 */
export function bookableDates(now = new Date(), limit = 6): { date: string; registerBy: string }[] {
  const today = dayStart(now);
  return EXAM_DATES.filter((d) => (dayStart(parse(d)) - today) / 86_400_000 >= REGISTER_DAYS_BEFORE)
    .slice(0, limit)
    .map((date) => {
      const by = parse(date);
      by.setDate(by.getDate() - REGISTER_DAYS_BEFORE);
      const registerBy = `${by.getFullYear()}-${String(by.getMonth() + 1).padStart(2, '0')}-${String(by.getDate()).padStart(2, '0')}`;
      return { date, registerBy };
    });
}
