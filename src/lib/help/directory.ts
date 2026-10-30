import type { IconName } from '@/components/ui/icon';
import type { Recipient } from '@/lib/compose/templates';

/**
 * The "Find help" directory.
 *
 * Trust is the product, so every listing carries a verification status:
 * - verified:   checked by phone by the CzechReply team on `checkedOn` (English level, insurance, prices)
 * - unverified: self-reported by the provider, shown with that label
 * - sample:     made-up demo data that only shows how listings look. Never callable.
 * Rankings are never for sale; paid placement, if it ever exists, is labelled.
 */

export type HelpCategoryId = 'doctors' | 'trades' | 'accountants' | 'legal';

export type HelpCategory = {
  id: HelpCategoryId;
  title: string;
  short: string;
  icon: IconName;
  /** Lets the user write to any Czech provider of this kind, not only English-speaking ones. */
  composeRecipient?: Recipient;
  composeLabel?: string;
  tips: string[];
};

export const helpCategories: HelpCategory[] = [
  {
    id: 'doctors',
    title: 'Doctors and dentists',
    short: 'GPs, dentists, children’s doctors',
    icon: 'doctor',
    composeRecipient: 'doctor',
    composeLabel: 'Write to any Czech doctor',
    tips: [
      'Ask whether they take your health insurer, by name and code (for example VZP, 111).',
      'Ask if there is an extra charge for English. Some clinics add one.',
      'GPs and dentists may not be taking new patients; ask that first.',
    ],
  },
  {
    id: 'trades',
    title: 'Plumbers, electricians, handymen',
    short: 'Repairs at home',
    icon: 'trades',
    composeRecipient: 'trades',
    composeLabel: 'Write to any Czech tradesperson',
    tips: [
      'Ask for the hourly rate and the call-out fee before they come.',
      'Ask for an invoice (faktura) if your landlord should pay.',
      'In a rented flat, check with your landlord first: many repairs are theirs to arrange.',
    ],
  },
  {
    id: 'accountants',
    title: 'Accountants and tax',
    short: 'Tax returns, freelancer paperwork',
    icon: 'accountant',
    tips: [
      'Freelancers (OSVČ) also file yearly overviews for social and health insurance, not just the tax return. Ask if that is included.',
      'Ask whether they can act for you with the tax office by power of attorney.',
    ],
  },
  {
    id: 'legal',
    title: 'Immigration lawyers and translators',
    short: 'Residence, contracts, certified translations',
    icon: 'legal',
    tips: [
      'Foreign documents for the immigration office usually need an official certified translation (soudní překlad).',
      'For residence matters, ask how often they handle your permit type.',
    ],
  },
];

export type Provider = {
  id: string;
  name: string;
  category: HelpCategoryId;
  services: string[];
  /** Prague district or city. */
  area: string;
  languages: string[];
  english: 'fluent' | 'basic';
  /** Doctors only: works with Czech public health insurance. */
  publicInsurance?: boolean;
  priceNote?: string;
  phone?: string;
  website?: string;
  verification: { status: 'verified' | 'unverified' | 'sample'; checkedOn?: string };
};

/**
 * SAMPLE DATA. Made-up names, no phone numbers, never presented as real.
 * Replace with phone-verified listings (status 'verified' + checkedOn) before launch.
 */
export const providers: Provider[] = [
  { id: 's-gp-vinohrady', name: 'Vinohrady family practice', category: 'doctors', services: ['GP'], area: 'Prague 2', languages: ['Czech', 'English'], english: 'fluent', publicInsurance: true, priceNote: 'No English surcharge', verification: { status: 'sample' } },
  { id: 's-dent-karlin', name: 'Karlín dental studio', category: 'doctors', services: ['Dentist'], area: 'Prague 8', languages: ['Czech', 'English', 'Ukrainian'], english: 'fluent', publicInsurance: true, priceNote: 'Basic care on insurance, extras paid', verification: { status: 'sample' } },
  { id: 's-ped-dejvice', name: 'Dejvice children’s clinic', category: 'doctors', services: ['Children’s doctor'], area: 'Prague 6', languages: ['Czech', 'English'], english: 'basic', publicInsurance: true, verification: { status: 'sample' } },
  { id: 's-int-centre', name: 'Old Town international clinic', category: 'doctors', services: ['GP', 'Specialists'], area: 'Prague 1', languages: ['English', 'German', 'Russian'], english: 'fluent', publicInsurance: false, priceNote: 'Private fees, membership plans', verification: { status: 'sample' } },
  { id: 's-plumb-zizkov', name: 'Žižkov plumbing', category: 'trades', services: ['Plumber'], area: 'Prague 3', languages: ['Czech', 'English'], english: 'basic', priceNote: 'Hourly rate plus call-out fee', verification: { status: 'sample' } },
  { id: 's-elec-smichov', name: 'Smíchov electrical', category: 'trades', services: ['Electrician'], area: 'Prague 5', languages: ['Czech', 'English'], english: 'fluent', verification: { status: 'sample' } },
  { id: 's-handy-holesovice', name: 'Holešovice handyman', category: 'trades', services: ['Handyman', 'Furniture assembly'], area: 'Prague 7', languages: ['Czech', 'English', 'Ukrainian'], english: 'fluent', verification: { status: 'sample' } },
  { id: 's-acc-freelance', name: 'Freelancer tax desk', category: 'accountants', services: ['Tax returns', 'OSVČ overviews'], area: 'Prague 2', languages: ['Czech', 'English'], english: 'fluent', priceNote: 'Fixed price per return', verification: { status: 'sample' } },
  { id: 's-acc-payroll', name: 'Riverside accounting', category: 'accountants', services: ['Accounting', 'Payroll'], area: 'Prague 4', languages: ['Czech', 'English', 'Vietnamese'], english: 'fluent', verification: { status: 'sample' } },
  { id: 's-law-residence', name: 'Residence law office', category: 'legal', services: ['Residence permits', 'Employee cards'], area: 'Prague 1', languages: ['Czech', 'English', 'Russian'], english: 'fluent', verification: { status: 'sample' } },
  { id: 's-trans-certified', name: 'Certified translations studio', category: 'legal', services: ['Certified translations'], area: 'Prague 2', languages: ['Czech', 'English', 'Ukrainian'], english: 'fluent', priceNote: 'Priced per page', verification: { status: 'sample' } },
];

export const categoryById = (id: string | undefined) => helpCategories.find((c) => c.id === id);
export const providerById = (id: string | undefined) => providers.find((p) => p.id === id);

/** Which help a scanned text might lead to. Undefined when nothing fits. */
export function helpForTextCategory(category: string): HelpCategoryId | undefined {
  switch (category) {
    case 'health':
      return 'doctors';
    case 'housing':
      return 'trades';
    case 'government':
      return 'legal';
    case 'finance':
    case 'work':
      return 'accountants';
    default:
      return undefined;
  }
}

/** Emergency numbers in Czechia. 112 is the EU number; its operators also speak English. */
export const emergencyNumbers: { number: string; label: string; detail: string }[] = [
  { number: '112', label: 'Emergency', detail: 'Any emergency. Operators also speak English.' },
  { number: '155', label: 'Ambulance', detail: 'Medical emergency' },
  { number: '150', label: 'Fire', detail: 'Fire and rescue' },
  { number: '158', label: 'Police', detail: 'Crime and danger' },
  { number: '156', label: 'City police', detail: 'Local issues like noise or parking' },
];
