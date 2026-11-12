import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui/icon';

/**
 * Help's five areas, named for what is going on in someone's life. Each holds the places to look,
 * what CzechLocal can do about it there and then (explain a letter, write a message), and the
 * phrases worth knowing. Keywords let the search box find an entry by what people type ("leak",
 * "passport", "zubař"), in English or Czech, matched without diacritics.
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

/** Something CzechLocal does for the person in this area: explaining or writing, one tap away. */
export type AreaAction = { id: string; title: string; subtitle: string; icon: IconName; href: Href };

export type AreaTone = 'sky' | 'sage' | 'coral' | 'lavender' | 'neutral';

export type Area = {
  id: AreaId;
  title: string;
  short: string;
  /** One line on what this area is for, shown at its top. */
  intro: string;
  icon: IconName;
  tone: AreaTone;
  entries: AreaEntry[];
  actions: AreaAction[];
  /** The Learn phrase pack that goes with it. */
  phrases?: { situation: string; title: string };
};

const explain = (id: string, title: string, subtitle: string): AreaAction => ({ id, title, subtitle, icon: 'camera', href: '/camera' });
const write = (id: string, title: string, subtitle: string, recipient?: 'doctor' | 'landlord' | 'trades'): AreaAction => ({
  id,
  title,
  subtitle,
  icon: 'compose',
  href: recipient ? { pathname: '/compose', params: { recipient } } : '/compose',
});

const fillForm = (id: string, title: string, subtitle: string): AreaAction => ({ id, title, subtitle, icon: 'document', href: '/form' });

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
  {
    id: 'health',
    title: 'Health',
    short: 'Doctors, pharmacies, after hours',
    intro: 'Find a doctor who takes new patients, care tonight or at the weekend, and a pharmacy near you.',
    icon: 'health',
    tone: 'coral',
    entries: [afterHours, doctors, pharmacies],
    actions: [
      write('write-doctor', 'Write to a doctor in Czech', 'Ask for an appointment or whether they take new patients', 'doctor'),
      explain('explain-medical', 'Explain a report or a prescription', 'Photograph it: what it says and what to do'),
    ],
    phrases: { situation: 'doctor', title: 'Phrases for the doctor' },
  },
  {
    id: 'visa',
    title: 'Visa and residence',
    short: 'Offices, checklists, embassies',
    intro: 'Your immigration office and today’s waits, what to bring for each change, and your embassy.',
    icon: 'government',
    tone: 'sky',
    entries: [immigration, checklists, embassies, translators],
    actions: [
      explain('explain-ministry', 'Explain a letter from the Ministry', 'What it asks for, and by when'),
      fillForm('form-residence', 'Fill in a residence form', 'Field by field: what it asks and what to write'),
      write('write-office', 'Write to the immigration office', 'In correct, polite Czech'),
    ],
    phrases: { situation: 'permit', title: 'Phrases for your permit' },
  },
  {
    id: 'offices',
    title: 'Offices and paperwork',
    short: 'Town halls, tax, labour, social security',
    intro: 'Your town hall, and the offices that letters about tax, work and insurance come from.',
    icon: 'work',
    tone: 'sage',
    entries: [townHalls, letterOffices, immigration],
    actions: [
      explain('explain-official', 'Explain an official letter', 'What it means, what to do, the deadline'),
      fillForm('form-office', 'Fill in a form', 'Field by field: what it asks and what to write'),
      write('reply-office', 'Reply to an office in Czech', 'Say what you need in your own words'),
    ],
    phrases: { situation: 'office', title: 'Phrases for an office' },
  },
  {
    id: 'legal',
    title: 'Legal and money',
    short: 'Notaries, translators, lawyers, accountants',
    intro: 'Certified copies and translations, a lawyer for residence or contracts, and help with tax.',
    icon: 'legal',
    tone: 'lavender',
    entries: [notaries, translators, lawyers, accountants],
    actions: [
      explain('explain-contract', 'Explain a contract or a bill', 'The amounts, the dates and what you agree to'),
      write('write-formal', 'Write a formal message', 'To a bank, an insurer or a company'),
    ],
    phrases: { situation: 'bills', title: 'Phrases for bills and payments' },
  },
  {
    id: 'home',
    title: 'Home and repairs',
    short: 'Landlord, plumbers, electricians',
    intro: 'Something broken at home: who to call, and how to say it in Czech.',
    icon: 'trades',
    tone: 'neutral',
    entries: [trades],
    actions: [
      write('write-landlord', 'Write to your landlord', 'A repair, the rent, moving out', 'landlord'),
      write('write-trades', 'Write to a plumber or electrician', 'Describe the problem and ask the price', 'trades'),
      explain('explain-notice', 'Explain a notice in your building', 'Water off, repairs, building rules'),
    ],
    phrases: { situation: 'flat', title: 'Phrases for your flat and landlord' },
  },
];

export const areaById = (id: string | undefined) => areas.find((a) => a.id === id);

/** Every entry once (some sit in two areas). */
export const allEntries: AreaEntry[] = [...new Map(areas.flatMap((a) => a.entries).map((e) => [e.id, e])).values()];
