/**
 * The Ministry of the Interior's offices for foreigners' residence in Prague (Oddělení pobytu
 * cizinců, OAMP), as published on the ministry's Information Portal for Foreigners
 * (ipc.gov.cz/kontakty, "Pracoviště MV ČR"), copied on 31 Oct 2026. Offices, catchments and notices
 * change, so every screen links to the live page.
 *
 * Which office serves you depends on the district (obvod Praha 1–10) of your registered address.
 * Districts 11–22 and the smaller city parts belong to one of the ten by Decree 346/2020 Coll., § 14
 * (current version 1 Jan 2026).
 */

export type OfficeId = 'zukovskeho' | 'chodov' | 'hladkov' | 'kolbenova' | 'pekarska' | 'specialised';

export type Office = {
  id: OfficeId;
  /** Official name. */
  name: string;
  short: string;
  /** Navigation bar title: under 15 characters (HIG). */
  navTitle: string;
  address: string;
  /** As published; null when the office only sees booked clients. */
  hours: { days: string; time: string }[] | null;
  bookedOnly: boolean;
  /** Who it serves, in plain words. */
  serves: string;
  step: 'yes' | 'no';
  notes: string[];
};

export const OFFICES_SOURCE = { url: 'https://ipc.gov.cz/kontakty/', checkedOn: '2026-10-31' };
export const BOOKING_URL = 'https://ipc.gov.cz/cs/new-reservation';

/** The ministry's information line (Klientské centrum pro poskytování informací cizincům). */
export const CLIENT_CENTRE = {
  phone: '+420974801801',
  display: '+420 974 801 801',
  email: 'pobyty@mv.gov.cz',
  hours: 'Mon to Thu 8:00 to 16:00, Fri 8:00 to 14:00',
  options: [
    { key: '0', label: 'Your application’s reference number and how it’s going' },
    { key: '1', label: 'Booking an appointment at an office' },
    { key: '2', label: 'General questions: what to bring, how to proceed, which office' },
  ],
  note: 'Calls cost the normal rate of your phone tariff.',
};

/** Free legal and social help for foreigners, linked from the ministry's contacts page. */
export const INTEGRATION_CENTRE = { name: 'Integration Centre Prague', url: 'https://icpraha.com/' };

const weekdays = [
  { days: 'Mon, Wed', time: '8:00 to 17:00' },
  { days: 'Tue, Thu', time: '8:00 to 15:00' },
  { days: 'Fri', time: '8:00 to 12:00, booked clients only' },
];

export const offices: Office[] = [
  {
    id: 'zukovskeho',
    name: 'Oddělení pobytu cizinců Praha I – Žukovského',
    short: 'Praha I – Žukovského',
    navTitle: 'Žukovského',
    address: 'Žukovského 888/2, 161 00 Praha 6 – Ruzyně',
    hours: weekdays,
    bookedOnly: true,
    serves: 'People living in Praha 1, 2, 3, 6 and 7 (and Praha 8 by booking).',
    step: 'yes',
    notes: [
      'Building work: until further notice this office only sees booked clients, and the waiting room is limited. The ministry recommends sending things in remotely where you can.',
      'In urgent cases you can go without a booking to Pekařská.',
      'Entrance on the 1st floor; the office is on the 2nd floor.',
    ],
  },
  {
    id: 'chodov',
    name: 'Oddělení pobytu cizinců Praha II – Chodov',
    short: 'Praha II – Chodov',
    navTitle: 'Chodov',
    address: 'Cigánkova 1861/2, 148 00 Praha 4 – Chodov',
    hours: weekdays,
    bookedOnly: false,
    serves: 'People living in Praha 4, 5 and 10.',
    step: 'yes',
    notes: [
      'Entrances: people from outside the EU use entrance A; EU citizens and their family members, and biometrics, use entrance B.',
      'Social and legal advice for foreigners from Arcidiecézní charita Praha in the building.',
      'Walk-in tickets can run out well before closing time. Booking is recommended.',
    ],
  },
  {
    id: 'kolbenova',
    name: 'Oddělení pobytu cizinců Praha V – Kolbenova',
    short: 'Praha V – Kolbenova',
    navTitle: 'Kolbenova',
    address: 'Kolbenova 942/38a, 190 00 Praha 9 – Vysočany',
    hours: null,
    bookedOnly: true,
    serves: 'People living in Praha 8 and 9 (Praha 8 since 17 Aug 2026).',
    step: 'no',
    notes: [
      'Booked clients only. Without a booking, go to Pekařská.',
      'People living in Praha 8 can book here or at Žukovského through their account on the Information Portal for Foreigners.',
      'Entrance and waiting room on the ground floor of the building marked KCD4; counters and biometrics on the 1st floor. No parking nearby: come by public transport.',
    ],
  },
  {
    id: 'hladkov',
    name: 'Oddělení pobytu cizinců Praha III – Hládkov',
    short: 'Praha III – Hládkov (students)',
    navTitle: 'Hládkov',
    address: 'Hládkov 682/9, 169 00 Praha 6 – Střešovice',
    hours: [
      { days: 'Mon to Thu', time: '8:00 to 16:00, booked clients only' },
      { days: 'Fri', time: '8:00 to 12:00, booked clients only' },
    ],
    bookedOnly: true,
    serves: 'University students from outside the EU living anywhere in Prague, Praha-východ or Praha-západ. Only for study and other education.',
    step: 'no',
    notes: ['Booked clients only.'],
  },
  {
    id: 'pekarska',
    name: 'Oddělení pobytu cizinců Střední Čechy – Pekařská',
    short: 'Pekařská (urgent walk-ins)',
    navTitle: 'Pekařská',
    address: 'Pekařská 641/16, 155 00 Praha 5 – Jinonice',
    hours: weekdays,
    bookedOnly: false,
    serves: 'People living in Praha-východ and Praha-západ. Also the office to go to in urgent cases without a booking.',
    step: 'yes',
    notes: ['Walk-in tickets can run out well before closing time. Booking is recommended.'],
  },
  {
    id: 'specialised',
    name: 'Oddělení pobytu cizinců Praha – Specializované pracoviště',
    short: 'Specialised office (Letná)',
    navTitle: 'Letná',
    address: 'Nad Štolou 936/3, 170 00 Praha 7 – Holešovice (Letná)',
    hours: null,
    bookedOnly: true,
    serves: 'Only people the office has invited (summoned) to come.',
    step: 'yes',
    notes: ['Enter from Milady Horákové street, not through the ministry’s main entrance. Everything is on the ground floor.'],
  },
];

/** Current notices that apply to every office. */
export const OFFICE_NOTICES = ['All Ministry of the Interior offices, and the Client Centre’s phone lines and email, are closed on the public holiday of 17 November 2026.'];

export const officeById = (id: string | undefined) => offices.find((o) => o.id === id);

/** Maps search by the official address (no coordinates are published for these offices). */
export const officeMapsUrl = (o: Office) =>
  process.env.EXPO_OS === 'ios'
    ? `https://maps.apple.com/?q=${encodeURIComponent(o.address)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`;

/* ───────────── Which office is mine? ───────────── */

/** Decree 346/2020 Coll., § 14: city parts that belong to each district (obvod) Praha 1–10. */
const DISTRICT_OF: Record<string, number> = {
  'Praha 11': 4, 'Praha 12': 4, 'Praha 13': 5, 'Praha 14': 9, 'Praha 15': 10, 'Praha 16': 5, 'Praha 17': 6,
  'Praha 18': 9, 'Praha 19': 9, 'Praha 20': 9, 'Praha 21': 9, 'Praha 22': 10,
};

/** The smaller city parts, by district (same decree). */
export const SMALLER_PARTS: { district: number; parts: string[] }[] = [
  { district: 4, parts: ['Kunratice', 'Libuš', 'Šeberov', 'Újezd'] },
  { district: 5, parts: ['Lipence', 'Lochkov', 'Řeporyje', 'Slivenec', 'Velká Chuchle', 'Zbraslav', 'Zličín'] },
  { district: 6, parts: ['Lysolaje', 'Nebušice', 'Přední Kopanina', 'Suchdol'] },
  { district: 7, parts: ['Troja'] },
  { district: 8, parts: ['Březiněves', 'Ďáblice', 'Dolní Chabry'] },
  { district: 9, parts: ['Běchovice', 'Čakovice', 'Dolní Počernice', 'Klánovice', 'Koloděje', 'Satalice', 'Vinoř'] },
  { district: 10, parts: ['Benice', 'Dolní Měcholupy', 'Dubeč', 'Kolovraty', 'Královice', 'Křeslice', 'Nedvězí', 'Petrovice', 'Štěrboholy'] },
];

/** City part ("Praha 1" … "Praha 22") → district number 1–10. */
export const districtOf = (part: string) => DISTRICT_OF[part] ?? Number(part.replace('Praha ', ''));

/** The office for a district (1–10), with anything the person should know. */
export function officeForDistrict(district: number): { office: Office; also?: string } {
  if ([1, 2, 3, 6, 7].includes(district)) return { office: officeById('zukovskeho')! };
  if (district === 8) return { office: officeById('kolbenova')!, also: 'You can also book at Žukovského.' };
  if (district === 9) return { office: officeById('kolbenova')! };
  return { office: officeById('chodov')! }; // 4, 5, 10
}
