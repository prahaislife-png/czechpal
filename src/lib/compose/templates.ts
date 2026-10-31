/**
 * The fixed parts of Write in Czech. The message itself is written by the AI from what the
 * reader types (the compose function); these are the pieces that never change:
 * - one-tap starting points, so nobody faces an empty box;
 * - the call script's greeting and goodbye, with a pronunciation guide (stress is always on the
 *   first syllable);
 * - the health insurers and the doctor types the directory links to.
 *
 * Every Czech line avoids gendered forms ("prosím o…", "potřebuji…", never "chtěl(a) bych…").
 * Dependency-free on purpose.
 */

/** Who the composer was opened for, which only picks the starting points. */
export type Recipient = 'trades' | 'landlord' | 'doctor';
export type DoctorType = 'gp' | 'dentist' | 'paediatrician' | 'gynaecologist' | 'psychiatrist' | 'psychologist';
export type Insurer = '111' | '201' | '205' | '207' | '209' | '211' | '213' | 'private';

/** One spoken line: the Czech, a pronunciation guide when there is one, the meaning. */
export type Line = { cs: string; en: string; say?: string };

/** Czech public health insurers by their official codes, plus commercial insurance for foreigners. */
export const insurers: { id: Insurer; label: string }[] = [
  { id: '111', label: 'VZP (111)' },
  { id: '201', label: 'VoZP (201)' },
  { id: '205', label: 'ČPZP (205)' },
  { id: '207', label: 'OZP (207)' },
  { id: '209', label: 'ZPŠ (209)' },
  { id: '211', label: 'ZPMV (211)' },
  { id: '213', label: 'RBP (213)' },
  { id: 'private', label: 'Commercial, for foreigners' },
];

/** How the insurer is described to the AI, so the message names it the Czech way. */
export const insurerForMessage = (id: Insurer | undefined) =>
  !id ? undefined : id === 'private' ? 'commercial health insurance for foreigners' : insurers.find((i) => i.id === id)?.label;

const doctorNames: Record<DoctorType, string> = {
  gp: 'a GP',
  dentist: 'a dentist',
  paediatrician: 'a children’s doctor for my child',
  gynaecologist: 'a gynaecologist',
  psychiatrist: 'a psychiatrist',
  psychologist: 'a psychologist',
};

/** What the box starts with when the composer opens from a practice. */
export const askNewPatients = (doctor: DoctorType) =>
  `I’m looking for ${doctorNames[doctor]}. Are you taking new patients?`;

/** One tap fills the box; the reader can change any word before it's written. */
export const startingPoints: Record<Recipient | 'any', string[]> = {
  any: [
    'My heating isn’t working. Please come and fix it this week.',
    'When and how will I get my deposit back?',
    'Are you taking new patients?',
    'I need to cancel my appointment. Can I have a new one next week?',
  ],
  trades: [
    'Water is leaking from a pipe. Can you come as soon as possible?',
    'How much would it cost? I’d like a price before you start.',
    'My heating isn’t working. Please come and fix it this week.',
  ],
  landlord: [
    'Something in the flat is broken. Please arrange a repair.',
    'When and how will I get my deposit back?',
    'Please send me a breakdown of the yearly service charges.',
  ],
  doctor: [
    'Are you taking new patients?',
    'I’d like an appointment next week, in the morning if possible.',
    'I need to cancel my appointment. Can I have a new one?',
  ],
};

/** The start and end of every call; the AI writes what's in between. */
export function callOpening(name: string): Line[] {
  return [
    { cs: 'Dobrý den.', en: 'Hello.', say: 'DOH-bree den.' },
    { cs: 'Mluvíte anglicky?', en: 'Do you speak English?', say: 'MLOO-vee-teh ANG-glits-kee?' },
    {
      cs: 'Mluvím česky jen trochu. Můžete prosím mluvit pomalu?',
      en: 'I only speak a little Czech. Could you please speak slowly?',
      say: 'MLOO-veem CHES-kee yen TROH-khoo. MOO-zheh-teh PROH-seem MLOO-vit POH-mah-loo?',
    },
    ...(name.trim() ? [{ cs: `Jmenuji se ${name.trim()}.`, en: `My name is ${name.trim()}.`, say: 'MEH-noo-yee seh … (then your name)' }] : []),
  ];
}

export const CALL_CLOSING: Line[] = [
  { cs: 'Můžete mi to prosím poslat SMS?', en: 'Could you please send it to me by text message?', say: 'MOO-zheh-teh mi toh PROH-seem POH-slat es-em-es?' },
  { cs: 'Děkuji, na shledanou.', en: 'Thank you, goodbye.', say: 'DYEH-koo-yee, nah SKHLEH-dah-noh.' },
];
