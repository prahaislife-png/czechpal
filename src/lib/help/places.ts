import type { IconName } from '@/components/ui/icon';
import { DirectoryError, fold } from '@/lib/help/practices';
import { supabase } from '@/lib/supabase';

/**
 * Official contacts for the Find tab, other than healthcare.
 *
 * Imported into the `places` table by scripts/import-places.mjs:
 * - town halls and notaries: the list of public authorities (czechpoint.cz open data);
 * - embassies and consulates: the Ministry of Foreign Affairs directory (mzv.gov.cz).
 * The offices people's letters come from (tax, labour, social security) are fewer and their
 * branches change, so they are kept here by hand from the official pages, with the check date.
 */

export type PlaceKind = 'town_hall' | 'notary' | 'embassy' | 'consulate' | 'office';

export type Place = {
  id: string;
  kind: PlaceKind;
  name: string;
  country: string | null;
  address: string | null;
  district: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  data_box: string | null;
  hours: string[];
  extra: {
    consular?: { name: string; address: string | null; phone: string | null; email: string | null; hours: string[] };
    /** Office kept by hand: what it's for, and who it serves. */
    about?: string;
    serves?: string;
  };
  source: string;
  source_url: string | null;
  checked_on: string;
};

export const placeKinds: Record<Exclude<PlaceKind, 'consulate'>, { title: string; one: string; icon: IconName; detail: string; source: string }> = {
  town_hall: {
    title: 'Town halls',
    one: 'Town hall',
    icon: 'government',
    detail: 'Your district office: registering a business, local fees, parking permits, CzechPOINT',
    source: 'Official list of public authorities (czechpoint.cz)',
  },
  notary: {
    title: 'Notaries',
    one: 'Notary',
    icon: 'document',
    detail: 'Certified copies, verified signatures, contracts, CzechPOINT',
    source: 'Official list of public authorities (czechpoint.cz)',
  },
  embassy: {
    title: 'Embassies',
    one: 'Embassy',
    icon: 'globe',
    detail: 'Passports, lost documents, help abroad',
    source: 'Ministry of Foreign Affairs, directory of foreign missions (mzv.gov.cz)',
  },
  office: {
    title: 'Tax, labour and social security',
    one: 'Office',
    icon: 'work',
    detail: 'The offices your letters often come from',
    source: 'Each office’s official website',
  },
};

/** Kept by hand from the official pages: these change rarely but branches do close, so each is dated. */
export const LETTER_OFFICES: Place[] = [
  {
    id: 'static:tax-prague',
    kind: 'office',
    name: 'Tax office for Prague (Finanční úřad pro hlavní město Prahu)',
    country: null,
    address: 'Štěpánská 619/28, 110 00 Praha 1',
    district: 'Praha 1',
    lat: 50.07915210160175,
    lng: 14.425747794217278,
    phone: null,
    email: 'podatelna2000@fs.mfcr.cz',
    website: 'https://financnisprava.gov.cz/cs/financni-sprava/financni-sprava-cr/organizacni-struktura/organy-financni-spravy/financni-urady/2000-financni-urad-pro-hlavni-mesto-prahu',
    data_box: '7nyn2d9',
    // The official list only gives Monday and Wednesday for the head office; branch hours differ,
    // so none are shown rather than suggesting it is closed on other days.
    hours: [],
    extra: {
      about: 'Income tax returns, tax for freelancers, tax letters (výzva, platební výměr).',
      serves: 'Your branch (územní pracoviště) depends on where you live; the official site lists them.',
    },
    source: 'Official list of public authorities and financnisprava.gov.cz',
    source_url: 'https://financnisprava.gov.cz/cs/financni-sprava/financni-sprava-cr/organizacni-struktura/organy-financni-spravy/financni-urady/2000-financni-urad-pro-hlavni-mesto-prahu',
    checked_on: '2026-11-01',
  },
  {
    id: 'static:labour-prague',
    kind: 'office',
    name: 'Labour office for Prague (Úřad práce ČR, krajská pobočka pro hl. m. Prahu)',
    country: null,
    address: 'Hartigova 2660/141, 130 00 Praha 3',
    district: 'Praha 3',
    lat: null,
    lng: null,
    phone: null,
    email: 'podatelna.aa@up.gov.cz',
    website: 'https://mpsv.gov.cz/up-cz/hlavni-mesto-praha',
    data_box: 'w7aznwp',
    hours: ['Mon 08:00–12:00, 13:00–17:00', 'Tue 08:00–11:00', 'Wed 08:00–12:00, 13:00–17:00', 'Thu 08:00–11:00'],
    extra: {
      about: 'Jobs, unemployment, benefits, and work permits.',
      serves: 'Contact workplace for Praha 1, 2, 3, 7 and 8; book a visit online on the official site.',
    },
    source: 'mpsv.gov.cz (Úřad práce ČR)',
    source_url: 'https://mpsv.gov.cz/up-cz/hlavni-mesto-praha',
    checked_on: '2026-11-01',
  },
  {
    id: 'static:labour-foreigners',
    kind: 'office',
    name: 'Labour office: employment of foreigners (Oddělení zaměstnávání zaměstnanců ze zahraničí)',
    country: null,
    address: 'Novodvorská 803/82, 142 00 Praha 4',
    district: 'Praha 4',
    lat: null,
    lng: null,
    phone: null,
    email: 'podatelna.aa@up.gov.cz',
    website: 'https://mpsv.gov.cz/up-cz/hlavni-mesto-praha',
    data_box: 'w7aznwp',
    hours: [],
    extra: {
      about: 'Work permits and employee-card job vacancies for people from outside the EU.',
      serves: 'All of Prague.',
    },
    source: 'mpsv.gov.cz (Úřad práce ČR)',
    source_url: 'https://mpsv.gov.cz/up-cz/hlavni-mesto-praha',
    checked_on: '2026-11-01',
  },
  {
    id: 'static:pssz-trojska',
    kind: 'office',
    name: 'Prague Social Security Administration (Pražská správa sociálního zabezpečení)',
    country: null,
    address: 'Trojská 1997/13a, 182 00 Praha 8',
    district: 'Praha 8',
    lat: null,
    lng: null,
    phone: '+420 283 104 111',
    email: 'posta.xa@cssz.gov.cz',
    website: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    data_box: 'hnhacvt',
    hours: ['Mon 08:00–17:00', 'Tue by appointment', 'Wed 08:00–17:00', 'Thu by appointment'],
    extra: {
      about: 'Social insurance for employees and freelancers, sickness benefits, pensions.',
      serves: 'All of Prague; also contact workplaces in Praha 1 and Praha 9.',
    },
    source: 'cssz.gov.cz',
    source_url: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    checked_on: '2026-11-01',
  },
  {
    id: 'static:pssz-biskupska',
    kind: 'office',
    name: 'Social security contact workplace Praha 1 (Biskupská)',
    country: null,
    address: 'Biskupská 1752/7, 110 02 Praha 1',
    district: 'Praha 1',
    lat: null,
    lng: null,
    phone: '+420 221 995 111',
    email: 'posta.xa@cssz.gov.cz',
    website: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    data_box: 'hnhacvt',
    hours: ['Mon 08:00–17:00', 'Tue by appointment', 'Wed 08:00–17:00', 'Thu by appointment'],
    extra: { about: 'Social insurance, sickness benefits, pensions.' },
    source: 'cssz.gov.cz',
    source_url: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    checked_on: '2026-11-01',
  },
  {
    id: 'static:pssz-sokolovska',
    kind: 'office',
    name: 'Social security contact workplace Praha 9 (Sokolovská)',
    country: null,
    address: 'Sokolovská 855/225, 190 00 Praha 9',
    district: 'Praha 9',
    lat: null,
    lng: null,
    phone: '+420 284 005 111',
    email: 'posta.xa@cssz.gov.cz',
    website: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    data_box: 'hnhacvt',
    hours: ['Mon 08:00–17:00', 'Tue by appointment', 'Wed 08:00–17:00', 'Thu by appointment'],
    extra: { about: 'Social insurance, sickness benefits, pensions.' },
    source: 'cssz.gov.cz',
    source_url: 'https://www.cssz.gov.cz/web/cz/kontakty/region/ossz/praha',
    checked_on: '2026-11-01',
  },
];

const OFFLINE = 'Couldn’t load the list. Check your connection and try again.';
const COLUMNS = 'id, kind, name, country, address, district, lat, lng, phone, email, website, data_box, hours, extra, source, source_url, checked_on';

/** Embassies and consulates are one list; the rest one kind each. Static offices need no network. */
export async function listPlaces(kind: Exclude<PlaceKind, 'consulate'>): Promise<Place[]> {
  if (kind === 'office') return LETTER_OFFICES;
  if (!supabase) throw new DirectoryError('The directory needs the live connection, which isn’t set up in this build.');
  const kinds = kind === 'embassy' ? ['embassy', 'consulate'] : [kind];
  const { data, error } = await supabase
    .from('places')
    .select(COLUMNS)
    .in('kind', kinds)
    .order(kind === 'embassy' ? 'country' : 'name')
    .limit(500);
  if (error) throw new DirectoryError(OFFLINE);
  return (data ?? []) as Place[];
}

export async function getPlace(id: string): Promise<Place | null> {
  const local = LETTER_OFFICES.find((p) => p.id === id);
  if (local) return local;
  if (!supabase) throw new DirectoryError('The directory needs the live connection, which isn’t set up in this build.');
  const { data, error } = await supabase.from('places').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw new DirectoryError(OFFLINE);
  return (data as Place | null) ?? null;
}

/** Name, country, street or district, without diacritics. */
export async function searchPlaces(query: string): Promise<Place[]> {
  const q = fold(query);
  const local = LETTER_OFFICES.filter((p) => fold(`${p.name} ${p.extra.about ?? ''} ${p.address}`).includes(q));
  if (!supabase || q.length < 2) return local;
  // The query is folded to letters, digits and spaces, so it is safe inside the ilike pattern.
  const safe = q.replace(/[^a-z0-9 ]/g, ' ').trim();
  if (!safe) return local;
  const { data, error } = await supabase.from('places').select(COLUMNS).ilike('search', `%${safe}%`).limit(20);
  if (error) throw new DirectoryError(OFFLINE);
  return [...local, ...((data ?? []) as Place[])];
}

/** "Embassy of the Republic of Albania" is long; lists lead with the country. */
export const placeTitle = (p: Place) => (p.kind === 'embassy' || p.kind === 'consulate') && p.country ? p.country : p.name;

export function placeMapsUrl(p: Place) {
  const query = encodeURIComponent(p.address ?? p.name);
  if (process.env.EXPO_OS === 'ios') return `https://maps.apple.com/?q=${query}${p.lat && p.lng ? `&ll=${p.lat},${p.lng}` : ''}`;
  return `https://www.google.com/maps/search/?api=1&query=${p.lat && p.lng ? `${p.lat},${p.lng}` : query}`;
}
