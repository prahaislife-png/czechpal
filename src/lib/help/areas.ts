import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui/icon';

/**
 * The Find tab: five areas, each opening its own list of places to look. Keywords let the search
 * box find an entry by what people type ("leak", "passport", "zubař"), in English or Czech,
 * matched without diacritics.
 */

export type AreaId = 'health' | 'visa' | 'offices' | 'legal' | 'home';

export type AreaEntry = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  href: Href;
  keywords: string[];
};

export type Area = { id: AreaId; title: string; short: string; icon: IconName; entries: AreaEntry[] };

const doctors: AreaEntry = {
  id: 'doctors',
  title: 'Doctors and dentists',
  subtitle: 'GPs, dentists, children’s doctors, gynaecologists, mental health',
  icon: 'doctor',
  href: { pathname: '/help/[category]', params: { category: 'doctors' } },
  keywords: ['doctor', 'gp', 'dentist', 'zubar', 'lekar', 'children', 'pediatrician', 'gynaecologist', 'gynecologist', 'psychiatrist', 'psychologist', 'therapist', 'new patients'],
};
const pharmacies: AreaEntry = {
  id: 'pharmacies',
  title: 'Pharmacies',
  subtitle: 'Every pharmacy in Prague',
  icon: 'pills',
  href: { pathname: '/help/find/[kind]', params: { kind: 'pharmacy' } },
  keywords: ['pharmacy', 'lekarna', 'medicine', 'chemist', 'drugstore'],
};
const afterHours: AreaEntry = {
  id: 'urgent',
  title: 'Sick tonight or at the weekend?',
  subtitle: 'After-hours doctors, dentists and night pharmacies',
  icon: 'night',
  href: '/help/urgent',
  keywords: ['night', 'weekend', 'after hours', 'pohotovost', 'urgent', 'emergency doctor', 'night pharmacy'],
};
const immigration: AreaEntry = {
  id: 'immigration',
  title: 'Immigration offices',
  subtitle: 'Which one is yours, hours and today’s waits',
  icon: 'government',
  href: '/help/offices',
  keywords: ['visa', 'residence', 'permit', 'immigration', 'oamp', 'foreign police', 'mvcr', 'ministry of the interior', 'biometrics', 'card'],
};
const checklists: AreaEntry = {
  id: 'checklists',
  title: 'What do I need?',
  subtitle: 'New address, new employer, extending, a lost card',
  icon: 'document',
  href: '/help/checklists',
  keywords: ['checklist', 'extend', 'extension', 'new address', 'employer', 'lost card', 'stolen', 'register', 'arrival'],
};
const embassies: AreaEntry = {
  id: 'embassies',
  title: 'Embassies',
  subtitle: 'Passports, lost documents, consular help',
  icon: 'globe',
  href: { pathname: '/help/places/[kind]', params: { kind: 'embassy' } },
  keywords: ['embassy', 'consulate', 'passport', 'velvyslanectvi', 'konzulat'],
};
const translators: AreaEntry = {
  id: 'translators',
  title: 'Certified translators',
  subtitle: 'Official court translators, by language',
  icon: 'translate',
  href: '/help/translators',
  keywords: ['translator', 'translation', 'interpreter', 'prekladatel', 'tlumocnik', 'certified translation', 'soudni preklad'],
};
const townHalls: AreaEntry = {
  id: 'town_halls',
  title: 'Town halls',
  subtitle: 'Your district office: business licence, local fees, CzechPOINT',
  icon: 'government',
  href: { pathname: '/help/places/[kind]', params: { kind: 'town_hall' } },
  keywords: ['town hall', 'municipal', 'district office', 'urad mestske casti', 'radnice', 'trade licence', 'zivnost', 'czechpoint', 'parking permit'],
};
const letterOffices: AreaEntry = {
  id: 'offices',
  title: 'Tax, labour and social security',
  subtitle: 'The offices your letters often come from',
  icon: 'work',
  href: { pathname: '/help/places/[kind]', params: { kind: 'office' } },
  keywords: ['tax', 'financni urad', 'labour office', 'urad prace', 'unemployment', 'work permit', 'social security', 'cssz', 'pssz', 'sickness', 'pension'],
};
const notaries: AreaEntry = {
  id: 'notaries',
  title: 'Notaries',
  subtitle: 'Certified copies, verified signatures, contracts',
  icon: 'document',
  href: { pathname: '/help/places/[kind]', params: { kind: 'notary' } },
  keywords: ['notary', 'notar', 'certified copy', 'verified signature', 'overeni podpisu', 'overeni kopie'],
};
const lawyers: AreaEntry = {
  id: 'lawyers',
  title: 'Lawyers',
  subtitle: 'The Czech Bar Association’s official search',
  icon: 'legal',
  href: { pathname: '/help/[category]', params: { category: 'legal' } },
  keywords: ['lawyer', 'advokat', 'legal', 'attorney', 'court'],
};
const accountants: AreaEntry = {
  id: 'accountants',
  title: 'Accountants and tax advisers',
  subtitle: 'Tax returns, freelancer paperwork',
  icon: 'accountant',
  href: { pathname: '/help/[category]', params: { category: 'accountants' } },
  keywords: ['accountant', 'tax adviser', 'tax return', 'ucetni', 'danovy poradce', 'freelancer', 'zivnostnik'],
};
const trades: AreaEntry = {
  id: 'trades',
  title: 'Plumbers, electricians, handymen',
  subtitle: 'Repairs at home, and how to write to them in Czech',
  icon: 'trades',
  href: { pathname: '/help/[category]', params: { category: 'trades' } },
  keywords: ['plumber', 'electrician', 'handyman', 'repair', 'leak', 'heating', 'boiler', 'instalater', 'elektrikar'],
};

export const areas: Area[] = [
  { id: 'health', title: 'Health', short: 'Doctors, pharmacies, after hours', icon: 'health', entries: [doctors, pharmacies, afterHours] },
  { id: 'visa', title: 'Visa and residence', short: 'Offices, checklists, embassies', icon: 'government', entries: [immigration, checklists, embassies, translators] },
  { id: 'offices', title: 'Offices', short: 'Town halls, tax, labour, social security', icon: 'work', entries: [townHalls, letterOffices, immigration] },
  { id: 'legal', title: 'Legal and money', short: 'Notaries, translators, lawyers, accountants', icon: 'legal', entries: [notaries, translators, lawyers, accountants] },
  { id: 'home', title: 'Home and repairs', short: 'Plumbers, electricians, handymen', icon: 'trades', entries: [trades] },
];

export const areaById = (id: string | undefined) => areas.find((a) => a.id === id);

/** Every entry once (some sit in two areas). */
export const allEntries: AreaEntry[] = [...new Map(areas.flatMap((a) => a.entries).map((e) => [e.id, e])).values()];
