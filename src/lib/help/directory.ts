import type { IconName } from '@/components/ui/icon';
import type { Recipient } from '@/lib/compose/templates';

/**
 * The "Find help" directory.
 *
 * Trust is the product, so it only ever shows real things:
 * - official public registers (`officialSearch`), checked to exist and to be searchable;
 * - provider listings, each with a verification status:
 *   - verified:   checked by phone by the CzechPal team on `checkedOn` (English level, insurance, prices)
 *   - unverified: self-reported by the provider, shown with that label
 * There is deliberately no "sample" status: made-up listings must never reach users.
 * Rankings are never for sale; paid placement, if it ever exists, is labelled.
 */

export type HelpCategoryId = 'doctors' | 'trades' | 'accountants' | 'legal';

/** A public register run by an official body. Last checked 31 Oct 2026. */
export type OfficialSearch = { title: string; detail: string; url: string };

export type HelpCategory = {
  id: HelpCategoryId;
  title: string;
  short: string;
  icon: IconName;
  /** Lets the user write to any Czech provider of this kind, not only English-speaking ones. */
  composeRecipient?: Recipient;
  composeLabel?: string;
  officialSearch?: OfficialSearch[];
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
      'Your health insurer can tell you which doctors near you work with it. Call the number on your insurance card.',
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
    officialSearch: [
      {
        title: 'Chamber of Tax Advisers directory',
        detail: 'Every registered tax adviser. Filter by language, region and new clients.',
        url: 'https://www.kdpcr.cz/seznam-danovych-poradcu',
      },
    ],
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
    officialSearch: [
      {
        title: 'Czech Bar Association lawyer search',
        detail: 'Every practising lawyer. Filter by language and area of law.',
        // The Bar Association says this search moves to its main website on 1 Jan 2027: recheck then.
        url: 'https://vyhledavac.cak.cz/',
      },
      {
        title: 'Official list of court translators',
        detail: 'Ministry of Justice list. Certified translations come from these translators.',
        url: 'https://seznat.justice.cz/',
      },
    ],
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
  verification: { status: 'verified' | 'unverified'; checkedOn?: string };
};

/**
 * Real provider listings only, added as they are checked. Empty until the first ones are
 * phone-verified; the Help screens show official registers and tips in the meantime.
 */
export const providers: Provider[] = [];

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
