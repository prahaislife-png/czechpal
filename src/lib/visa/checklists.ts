/**
 * "What do I need?" checklists for residence matters of people from outside the EU, transcribed
 * from the Ministry of the Interior's Information Portal for Foreigners (ipc.gov.cz) on 31 Oct 2026.
 * Every checklist links its page. Rules change, so the app shows the date and the link, and points
 * to the ministry's line and free advice when something doesn't fit.
 */

export type ChecklistVariant = {
  /** Who this applies to, e.g. "Long-term visa or long-term residence". */
  forWhom: string;
  /** The rule that matters most, said plainly. */
  when?: string;
  deadline: string;
  fee: string;
  /** Things to bring, with the Czech name people will see on forms. */
  documents: { en: string; cs: string; note?: string }[];
  steps: string[];
  watchOut?: string[];
};

export type Checklist = {
  id: string;
  title: string;
  short: string;
  /** Navigation bar title: under 15 characters (HIG). */
  navTitle: string;
  source: string;
  variants: ChecklistVariant[];
};

export const CHECKLISTS_CHECKED_ON = '2026-10-31';

/** How a notice or application can be handed in, where the ministry allows all of these. */
const SUBMIT_ANY_WAY =
  'Hand it in at a ministry office, or send it by post, through a data box (datová schránka), by email with a recognised electronic signature, or through someone you authorise.';

export const checklists: Checklist[] = [
  {
    id: 'registration',
    title: 'Registering after you arrive',
    short: 'Tell the authorities where you live',
    navTitle: 'Registering',
    source: 'https://ipc.gov.cz/povinnosti-cizincu/registrace-po-prijezdu/',
    variants: [
      {
        forWhom: 'Long-term visa',
        deadline: 'Within 3 working days of arriving.',
        fee: 'Not stated by the ministry for this step.',
        documents: [
          { en: 'Passport', cs: 'Cestovní doklad' },
          { en: 'Registration slip', cs: 'Přihlašovací lístek', note: 'Available at the police office' },
          { en: 'Proof of travel health insurance', cs: 'Doklad o cestovním zdravotním pojištění' },
        ],
        steps: ['Register your address with the foreign police department (odbor cizinecké policie) responsible for where you stay.'],
        watchOut: [
          'Not needed if your accommodation did it for you (a hotel, hostel or other shared accommodation), if you are under 15, or in a few other cases.',
        ],
      },
      {
        forWhom: 'Long-term or permanent residence',
        deadline:
          'Within 30 calendar days if you came on a visa for collecting your residence permit (D/VR). Otherwise, for example visa-free with a biometric passport, within 3 working days.',
        fee: 'Not stated by the ministry for this step.',
        documents: [
          { en: 'Passport', cs: 'Cestovní doklad' },
          { en: 'Registration form', cs: 'Registrační formulář' },
        ],
        steps: [
          'Register at a Ministry of the Interior office.',
          'Go for biometrics (fingerprints and photo) for your residence card.',
          'Collect your residence card (biometrická karta).',
        ],
        watchOut: ['These steps usually take more than one visit.'],
      },
    ],
  },
  {
    id: 'address',
    title: 'Reporting a new address',
    short: 'You moved: tell the ministry',
    navTitle: 'New address',
    source: 'https://ipc.gov.cz/povinnosti-cizincu/zmeny-u-obcanu-tretich-zemi/zmena-adresy-u-obcanu-tretich-zemi/',
    variants: [
      {
        forWhom: 'Long-term visa or long-term residence',
        when: 'Only if you will live at the new address for more than 30 days.',
        deadline: 'Within 30 days, after you have actually moved. With a long-term visa for seasonal work: within 15 days, to the police.',
        fee: 'None.',
        documents: [
          { en: 'Passport', cs: 'Cestovní doklad' },
          { en: 'Proof of accommodation', cs: 'Doklad o zajištění ubytování', note: 'Usually signed by your landlord or the owner' },
          { en: 'Form for reporting changes', cs: 'Formulář pro oznámení změn', note: 'Fill in online, or by hand in capital Latin letters' },
        ],
        steps: [
          'Fill in the form, print it and sign it.',
          SUBMIT_ANY_WAY,
          'If you send it by post, call the information line two weeks later to check it was done.',
          'Optional: book a visit to have the new address marked in your passport.',
        ],
        watchOut: [
          'If the first free appointment is after your deadline, send it by post or data box, or go without a booking during office hours.',
          'Missing the deadline can mean a fine.',
        ],
      },
      {
        forWhom: 'Permanent residence',
        when: 'Only if you will live at the new address for more than 180 days.',
        deadline: 'Within 30 working days, after you have actually moved.',
        fee: '1 000 Kč (500 Kč under 15), for the new residence card.',
        documents: [
          { en: 'Passport', cs: 'Cestovní doklad' },
          { en: 'Residence card', cs: 'Průkaz o povolení k pobytu' },
          { en: 'Proof of accommodation', cs: 'Doklad o zajištění ubytování' },
          { en: 'Form for reporting changes', cs: 'Formulář pro oznámení změn' },
        ],
        steps: [
          'Fill in the form, print it and sign it.',
          SUBMIT_ANY_WAY,
          'Go for biometrics when invited. If no invitation comes within 30 days, call the information line.',
          'Collect the new card within 60 days of biometrics.',
        ],
        watchOut: ['Missing the deadline can mean a fine.'],
      },
    ],
  },
  {
    id: 'employer',
    title: 'Changing employer on an employee card',
    short: 'New job, new position or a second job',
    navTitle: 'New employer',
    source: 'https://ipc.gov.cz/typy-viz-a-pobytu/obcane-tretich-zemi/dlouhodobe-pobyty/zamestnanecka-karta/zamestnanecka-karta-zmena-zamestnani/',
    variants: [
      {
        forWhom: 'Employee card, without free access to the labour market (most holders)',
        when: 'Before you start the new job, new position or second job. Moving to another town for the same job counts too.',
        deadline:
          'It must reach the ministry at least 30 days before your start date, and no later than 90 days after your previous job ended, or the card ends.',
        fee: 'None. The ministry has 30 days to respond.',
        documents: [
          {
            en: 'Notice form for a change of employer or position',
            cs: 'Oznámení držitele zaměstnanecké karty o změně zaměstnavatele, pracovního zařazení nebo o zaměstnání na další pracovní pozici',
            note: 'Available in Czech with English, Ukrainian, Russian, Mongolian or Vietnamese',
          },
          { en: 'Confirmation that your current job continues, or when it ended', cs: 'Doklad o trvání nebo skončení původního zaměstnání' },
          {
            en: 'The new employment contract (or a contract to sign one)',
            cs: 'Pracovní smlouva / dohoda o pracovní činnosti',
            note: 'For a position listed for employee card holders',
          },
          {
            en: 'Proof of qualifications, if the job needs them',
            cs: 'Doklady o odborné způsobilosti',
            note: 'For example a diploma, or the employer’s written statement',
          },
        ],
        steps: [
          'Prepare all the documents. Missing ones can’t be added later.',
          'Fill in the notice form.',
          SUBMIT_ANY_WAY,
          'Wait for the written “Sdělení o splnění podmínek” (confirmation the conditions are met).',
          'Start the new job only after it has been delivered, and not before the date on your form.',
        ],
        watchOut: [
          'In the first 6 months after collecting your first employee card you generally can’t change employer (there are exceptions; see the page).',
          'You can’t move to a different job agency.',
          'An incomplete notice counts as not made, and you can’t appeal a negative answer.',
          'With free access to the labour market (often students and researchers), you report the change after you start instead.',
        ],
      },
    ],
  },
  {
    id: 'extend-employee-card',
    title: 'Extending an employee card',
    short: 'Before it runs out',
    navTitle: 'Extending',
    source: 'https://ipc.gov.cz/typy-viz-a-pobytu/obcane-tretich-zemi/dlouhodobe-pobyty/zamestnanecka-karta/',
    variants: [
      {
        forWhom: 'Employee card',
        deadline: 'No earlier than 120 days before your card expires, and no later than its last day of validity.',
        fee: '2 500 Kč. The ministry has 60 days to decide.',
        documents: [
          { en: 'Application form', cs: 'Žádost o vydání nebo prodloužení platnosti zaměstnanecké karty' },
          { en: 'Passport', cs: 'Cestovní doklad' },
          { en: 'Proof of accommodation', cs: 'Doklad o zajištění ubytování' },
          { en: 'Employment contract or agreement', cs: 'Doklad o pracovněprávním vztahu' },
          {
            en: 'Extra documents in some cases',
            cs: 'Další náležitosti',
            note: 'Qualifications, a work permit from the Labour Office, or documents for agency work: see the page',
          },
        ],
        steps: [
          'Prepare the documents and fill in the application.',
          'Apply at the office for your area, or send it any of the ways the ministry allows.',
          'Wait for the decision.',
          'Book and go for biometrics.',
          'Collect your new card.',
        ],
        watchOut: [
          'You stay legally while it is being decided, even if your old card expires (“fikce pobytu”), and you can keep working in the same position.',
          'If you don’t have every document before the deadline, apply anyway: missing the deadline can end your right to stay.',
          'The card is extended for as long as your contract runs, up to 2 years at a time.',
        ],
      },
    ],
  },
  {
    id: 'lost-card',
    title: 'Lost, stolen or damaged card or visa',
    short: 'Report it fast',
    navTitle: 'Lost card',
    source: 'https://ipc.gov.cz/povinnosti-cizincu/ztrata-odcizeni-nebo-poskozeni-dokladu/',
    variants: [
      {
        forWhom: 'Long-term or permanent residence card',
        deadline: 'Within 3 working days.',
        fee: '2 500 Kč (1 000 Kč under 15), for the new card.',
        documents: [
          { en: 'Valid passport', cs: 'Platný cestovní doklad' },
          { en: 'Form for reporting changes, if you report by post', cs: 'Formulář pro oznámení změn' },
          { en: 'The damaged card, if you have it', cs: 'Poškozený průkaz' },
          { en: 'If stolen: the police confirmation that you reported it', cs: 'Potvrzení od policie o oznámení odcizení', note: 'Recommended' },
        ],
        steps: [
          SUBMIT_ANY_WAY,
          'Go to the office, then for biometrics.',
          'Collect your new card.',
        ],
        watchOut: ['Lost abroad? Report it at the Czech embassy or consulate there.'],
      },
      {
        forWhom: 'Long-term visa (visa sticker)',
        deadline: 'Within 3 working days.',
        fee: 'None for a duplicate visa sticker.',
        documents: [{ en: 'Form for reporting a loss (changes)', cs: 'Formulář pro oznámení ztráty (změn)' }],
        steps: ['Fill in the form.', SUBMIT_ANY_WAY, 'Go to the ministry office.'],
      },
    ],
  },
];

export const checklistById = (id: string | undefined) => checklists.find((c) => c.id === id);
