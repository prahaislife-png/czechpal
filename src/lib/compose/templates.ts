/**
 * Hand-written Czech message and phone-call templates.
 *
 * Rules every template follows (checked by the template tests):
 * - Formal "vy" register, the safe default with landlords, doctors and tradespeople.
 * - No first-person past tense or adjectives, so the Czech never assumes the writer's gender
 *   ("prosím o…", "potřebuji…", "jsem v péči" instead of "chtěl(a) bych…").
 * - User-typed text (address, name, dates) is inserted verbatim and never translated.
 *
 * Dependency-free on purpose: it is unit-tested directly with Node.
 */

export type Recipient = 'trades' | 'landlord' | 'doctor';
export type When = 'asap' | 'thisWeek' | 'nextWeek';
export type TimeOfDay = 'any' | 'morning' | 'afternoon';
export type Problem = 'leak' | 'blocked' | 'noHotWater' | 'heating' | 'electrical' | 'other';
export type DoctorType = 'gp' | 'dentist' | 'paediatrician' | 'gynaecologist';
export type Insurer = '111' | '201' | '205' | '207' | '209' | '211' | '213' | 'private';

export type IntentId = 'repair' | 'quote' | 'defect' | 'deposit' | 'bill' | 'register' | 'appointment' | 'reschedule';

export type ComposeInput = {
  recipient: Recipient;
  intent: IntentId;
  problem: Problem;
  when: When;
  timeOfDay: TimeOfDay;
  doctorType: DoctorType;
  insurer: Insurer;
  address: string;
  /** The appointment being moved, as the user would write it ("12. 11. v 9:00"). */
  existingAppointment: string;
  name: string;
  littleCzech: boolean;
};

/** One spoken line: the Czech, a pronunciation guide (stress is always on the first syllable), the meaning. */
export type Line = { cs: string; en: string; say?: string };

export type Composed = {
  czech: string;
  english: string;
  call: { opening: Line[]; say: Line[]; hear: Line[]; closing: Line[] };
};

/* ───────────── Option lists (labels for the UI) ───────────── */

export const recipients: { id: Recipient; label: string; hint: string }[] = [
  { id: 'trades', label: 'Tradesperson', hint: 'Plumber, electrician, handyman' },
  { id: 'landlord', label: 'Landlord', hint: 'Or the property manager' },
  { id: 'doctor', label: 'Doctor', hint: 'GP, dentist or children’s doctor' },
];

export const intents: Record<Recipient, { id: IntentId; label: string; description: string }[]> = {
  trades: [
    { id: 'repair', label: 'Ask them to come and fix it', description: 'Describe the problem and when to come.' },
    { id: 'quote', label: 'Ask for a price first', description: 'Get a quote before they start.' },
  ],
  landlord: [
    { id: 'defect', label: 'Report something broken', description: 'Ask them to arrange a repair.' },
    { id: 'deposit', label: 'Ask about my deposit', description: 'When and how you get it back.' },
    { id: 'bill', label: 'Question the service charges', description: 'Ask for a breakdown of the yearly bill.' },
  ],
  doctor: [
    { id: 'register', label: 'Register as a new patient', description: 'Ask if they take new patients.' },
    { id: 'appointment', label: 'Book an appointment', description: 'If you’re already their patient.' },
    { id: 'reschedule', label: 'Move or cancel an appointment', description: 'Cancel and ask for a new time.' },
  ],
};

export const problems: { id: Problem; label: string }[] = [
  { id: 'leak', label: 'Leak' },
  { id: 'blocked', label: 'Blocked drain' },
  { id: 'noHotWater', label: 'No hot water' },
  { id: 'heating', label: 'Heating' },
  { id: 'electrical', label: 'Electricity' },
  { id: 'other', label: 'Something else' },
];

export const whens: { id: When; label: string }[] = [
  { id: 'asap', label: 'As soon as possible' },
  { id: 'thisWeek', label: 'This week' },
  { id: 'nextWeek', label: 'Next week' },
];

export const timesOfDay: { id: TimeOfDay; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
];

export const doctorTypes: { id: DoctorType; label: string }[] = [
  { id: 'gp', label: 'GP' },
  { id: 'dentist', label: 'Dentist' },
  { id: 'paediatrician', label: 'Children’s doctor' },
  { id: 'gynaecologist', label: 'Gynaecologist' },
];

/** Czech public health insurers by their official codes, plus commercial insurance for foreigners. */
export const insurers: { id: Insurer; label: string; spoken: string }[] = [
  { id: '111', label: 'VZP (111)', spoken: 'veh-zet-peh' },
  { id: '201', label: 'VoZP (201)', spoken: 'voh-zet-peh' },
  { id: '205', label: 'ČPZP (205)', spoken: 'cheh-peh-zet-peh' },
  { id: '207', label: 'OZP (207)', spoken: 'oh-zet-peh' },
  { id: '209', label: 'ZPŠ (209)', spoken: 'zet-peh-shah' },
  { id: '211', label: 'ZPMV (211)', spoken: 'zet-peh-em-veh' },
  { id: '213', label: 'RBP (213)', spoken: 'er-beh-peh' },
  { id: 'private', label: 'Commercial, for foreigners', spoken: '' },
];

/** Which inputs each intent uses; the UI shows only these. */
export const intentNeeds: Record<IntentId, { problem?: true; when?: true; timeOfDay?: true; address?: 'required' | 'optional'; doctorType?: true; insurer?: true; existingAppointment?: true }> = {
  repair: { problem: true, when: true, timeOfDay: true, address: 'required' },
  quote: { problem: true, timeOfDay: true, address: 'required' },
  defect: { problem: true, when: true, timeOfDay: true, address: 'optional' },
  deposit: { address: 'optional' },
  bill: { address: 'optional' },
  register: { doctorType: true, insurer: true },
  appointment: { when: true, timeOfDay: true, insurer: true },
  reschedule: { existingAppointment: true, when: true, timeOfDay: true },
};

/* ───────────── Phrase bank ───────────── */

const problemLines: Record<Problem, Line> = {
  leak: { cs: 'Z kohoutku nebo z potrubí kape voda.', en: 'Water is dripping from a tap or a pipe.', say: 'SKOH-hoht-koo NEH-boh SPOH-troo-bee KAH-peh VOH-dah.' },
  blocked: { cs: 'Mám ucpaný odpad.', en: 'My drain is blocked.', say: 'mahm OOTS-pah-nee OT-pat.' },
  noHotWater: { cs: 'Neteče teplá voda.', en: 'There’s no hot water.', say: 'NEH-teh-cheh TEP-lah VOH-dah.' },
  heating: { cs: 'Netopí topení.', en: 'The heating isn’t working.', say: 'NEH-toh-pee TOH-peh-nyee.' },
  electrical: { cs: 'V části bytu nefunguje elektřina.', en: 'The electricity isn’t working in part of the flat.', say: 'FCHAHS-tyi BIH-too NEH-foon-goo-yeh EH-lek-trzhi-nah.' },
  other: { cs: 'Potřebuji opravu v bytě.', en: 'I need a repair in the flat.', say: 'POH-trzheh-boo-yee OH-prah-voo VBI-tyeh.' },
};

const whenCs: Record<When, { cs: string; en: string; say: string }> = {
  asap: { cs: 'co nejdříve', en: 'as soon as possible', say: 'tsoh NEY-dzhree-veh' },
  thisWeek: { cs: 'tento týden', en: 'this week', say: 'TEN-toh TEE-den' },
  nextWeek: { cs: 'příští týden', en: 'next week', say: 'PRZHEESH-tyee TEE-den' },
};

const timeLine: Record<Exclude<TimeOfDay, 'any'>, Line> = {
  morning: { cs: 'Nejlépe se mi hodí dopoledne.', en: 'Mornings suit me best.', say: 'NEY-leh-peh seh mi HOH-dyee DOH-poh-led-neh.' },
  afternoon: { cs: 'Nejlépe se mi hodí odpoledne.', en: 'Afternoons suit me best.', say: 'NEY-leh-peh seh mi HOH-dyee OT-poh-led-neh.' },
};

/** `patients` overrides "nové pacienty" where Czech uses another word (a gynaecologist takes "pacientky"). */
const doctorCs: Record<DoctorType, { cs: string; en: string; say: string; patients?: { cs: string; say: string } }> = {
  gp: { cs: 'praktického lékaře', en: 'a GP', say: 'PRAK-tits-keh-hoh LEH-kah-rzheh' },
  dentist: { cs: 'zubního lékaře', en: 'a dentist', say: 'ZOOB-nyee-hoh LEH-kah-rzheh' },
  paediatrician: { cs: 'dětského lékaře pro své dítě', en: 'a children’s doctor for my child', say: 'DYET-skeh-hoh LEH-kah-rzheh proh sveh DYEE-tyeh' },
  gynaecologist: {
    cs: 'gynekologa',
    en: 'a gynaecologist',
    say: 'GI-neh-koh-loh-gah',
    patients: { cs: 'nové pacientky', say: 'NOH-veh PAH-tsi-en-tki' },
  },
};

const LITTLE_CZECH_WRITTEN: Line = {
  cs: 'Česky mluvím jen trochu, proto prosím o odpověď písemně.',
  en: 'I only speak a little Czech, so please reply in writing.',
};

const OPEN_HELLO: Line = { cs: 'Dobrý den.', en: 'Hello.', say: 'DOH-bree den.' };
const OPEN_ENGLISH: Line = { cs: 'Mluvíte anglicky?', en: 'Do you speak English?', say: 'MLOO-vee-teh ANG-glits-kee?' };
const OPEN_SLOWLY: Line = {
  cs: 'Mluvím česky jen trochu. Můžete prosím mluvit pomalu?',
  en: 'I only speak a little Czech. Could you please speak slowly?',
  say: 'MLOO-veem CHES-kee yen TROH-khoo. MOO-zheh-teh PROH-seem MLOO-vit POH-mah-loo?',
};
const CLOSE_THANKS: Line = { cs: 'Děkuji, na shledanou.', en: 'Thank you, goodbye.', say: 'DYEH-koo-yee, nah SKHLEH-dah-noh.' };
const HEAR_CALL_BACK: Line = { cs: 'Zavolám vám zpátky.', en: 'I’ll call you back.', say: 'ZAH-voh-lahm vahm SPAHT-kee.' };

const hearBank: Record<Recipient, Line[]> = {
  trades: [
    { cs: 'Jakou máte adresu?', en: 'What’s your address?', say: 'YAH-koh MAH-teh AH-dreh-soo?' },
    { cs: 'Kdy budete doma?', en: 'When will you be at home?', say: 'GDIH BOO-deh-teh DOH-mah?' },
    { cs: 'Pošlete mi fotku.', en: 'Send me a photo.', say: 'POSH-leh-teh mi FOT-koo.' },
    HEAR_CALL_BACK,
  ],
  landlord: [
    { cs: 'Pošlete mi to e-mailem.', en: 'Send it to me by email.', say: 'POSH-leh-teh mi toh EE-meh-ee-lem.' },
    { cs: 'Pošlu tam technika.', en: 'I’ll send a technician.', say: 'POSH-loo tahm TEKH-ni-kah.' },
    HEAR_CALL_BACK,
  ],
  doctor: [
    { cs: 'Jaké máte pojištění?', en: 'Which insurance do you have?', say: 'YAH-keh MAH-teh POH-yish-tyeh-nyee?' },
    { cs: 'Nepřijímáme nové pacienty.', en: 'We’re not taking new patients.', say: 'NEH-przhi-yee-mah-meh NOH-veh PAH-tsi-en-tih.' },
    { cs: 'Máte kartičku pojištěnce?', en: 'Do you have your insurance card?', say: 'MAH-teh KAR-tyich-koo POH-yish-tyen-tseh?' },
    HEAR_CALL_BACK,
  ],
};

/* ───────────── Builders ───────────── */

const filled = (value: string, placeholder: string) => value.trim() || placeholder;

function insurerLines(insurer: Insurer): { written: Line; spoken: Line } {
  if (insurer === 'private') {
    const line = {
      cs: 'Mám komerční zdravotní pojištění pro cizince.',
      en: 'I have commercial health insurance for foreigners.',
    };
    return { written: line, spoken: { ...line, say: 'mahm KOH-mer-chnyee ZDRAH-vot-nyee POH-yish-tyeh-nyee proh TSI-zin-tseh.' } };
  }
  const { label, spoken } = insurers.find((i) => i.id === insurer)!;
  // On the phone people say the insurer's name, not its code.
  const name = label.replace(/ \(\d+\)$/, '');
  return {
    written: { cs: `Zdravotní pojišťovna: ${label}.`, en: `Health insurer: ${label}.` },
    spoken: { cs: `Moje pojišťovna je ${name}.`, en: `My health insurer is ${name}.`, say: `MOH-yeh POH-yish-tyov-nah yeh ${spoken}.` },
  };
}

/** Czech written body (after "Dobrý den,") and its English mirror, as paragraphs of lines. */
function body(input: ComposeInput): { cs: string[]; en: string[]; say: Line[] } {
  const p = problemLines[input.problem];
  const w = whenCs[input.when];
  const time = input.timeOfDay === 'any' ? null : timeLine[input.timeOfDay];
  const address = input.address.trim();
  const addressCs = filled(address, '[adresa]');
  const addressEn = filled(address, '[address]');
  const flatAt = address ? { cs: ` na adrese ${address}`, en: ` at ${address}` } : { cs: '', en: '' };
  const addressLine: Line = { cs: `Adresa je ${addressCs}.`, en: `The address is ${addressEn}.`, say: 'AH-dreh-sah yeh … (read your address slowly)' };

  switch (input.intent) {
    case 'repair':
      return {
        cs: [
          `potřebuji pomoc s opravou v bytě. ${p.cs}`,
          `Můžete prosím přijít ${w.cs}?${time ? ` ${time.cs}` : ''}\nAdresa: ${addressCs}`,
          'Prosím také o informaci, kolik bude oprava přibližně stát.',
        ],
        en: [
          `I need help with a repair in my flat. ${p.en}`,
          `Could you please come ${w.en}?${time ? ` ${time.en}` : ''}\nAddress: ${addressEn}`,
          'Please also let me know roughly how much the repair will cost.',
        ],
        say: [
          { cs: 'Volám kvůli opravě v bytě.', en: 'I’m calling about a repair in my flat.', say: 'VOH-lahm KVOO-lee OH-prah-vyeh VBI-tyeh.' },
          p,
          { cs: `Můžete prosím přijít ${w.cs}?`, en: `Could you please come ${w.en}?`, say: `MOO-zheh-teh PROH-seem PRZHI-yeet ${w.say}?` },
          ...(time ? [time] : []),
          addressLine,
          { cs: 'Kolik to bude přibližně stát?', en: 'Roughly how much will it cost?', say: 'KOH-lik toh BOO-deh PRZHI-blizh-nyeh staht?' },
        ],
      };
    case 'quote':
      return {
        cs: [
          `prosím o cenovou nabídku na opravu v bytě. ${p.cs}\nAdresa: ${addressCs}`,
          `Kdy by se Vám hodilo přijít se na to podívat?${time ? ` ${time.cs}` : ''}`,
        ],
        en: [
          `I’d like a price quote for a repair in my flat. ${p.en}\nAddress: ${addressEn}`,
          `When would suit you to come and have a look?${time ? ` ${time.en}` : ''}`,
        ],
        say: [
          { cs: 'Prosím o cenovou nabídku na opravu.', en: 'I’d like a price quote for a repair.', say: 'PROH-seem oh TSEH-noh-voh NAH-beet-koo nah OH-prah-voo.' },
          p,
          addressLine,
          { cs: 'Kdy by se vám hodilo přijít se na to podívat?', en: 'When would suit you to come and have a look?', say: 'GDIH bih seh vahm HOH-dyi-loh PRZHI-yeet seh nah toh POH-dyee-vat?' },
          ...(time ? [time] : []),
        ],
      };
    case 'defect':
      return {
        cs: [
          `dovoluji si Vám nahlásit závadu v bytě${flatAt.cs}. ${p.cs}`,
          `Můžete prosím zajistit opravu ${w.cs}?${time ? ` ${time.cs}` : ''}`,
        ],
        en: [
          `I’d like to report a problem in the flat${flatAt.en}. ${p.en}`,
          `Could you please arrange a repair ${w.en}?${time ? ` ${time.en}` : ''}`,
        ],
        say: [
          { cs: 'Volám kvůli závadě v bytě.', en: 'I’m calling about a problem in the flat.', say: 'VOH-lahm KVOO-lee ZAH-vah-dyeh VBI-tyeh.' },
          p,
          { cs: `Můžete prosím zajistit opravu ${w.cs}?`, en: `Could you please arrange a repair ${w.en}?`, say: `MOO-zheh-teh PROH-seem ZAH-yis-tyit OH-prah-voo ${w.say}?` },
          ...(time ? [time] : []),
        ],
      };
    case 'deposit':
      return {
        cs: [
          `prosím o informaci, kdy a jakým způsobem mi bude vrácena kauce za byt${flatAt.cs}.`,
          'Pokud potřebujete číslo mého účtu, pošlu Vám ho.',
        ],
        en: [
          `Could you please let me know when and how my deposit for the flat${flatAt.en} will be returned?`,
          'If you need my account number, I’ll send it to you.',
        ],
        say: [
          { cs: 'Volám kvůli vrácení kauce.', en: 'I’m calling about getting my deposit back.', say: 'VOH-lahm KVOO-lee VRAH-tseh-nyee KOW-tseh.' },
          { cs: 'Kdy a jak mi bude kauce vrácena?', en: 'When and how will the deposit be returned?', say: 'GDIH ah yak mi BOO-deh KOW-tseh VRAH-tseh-nah?' },
        ],
      };
    case 'bill':
      return {
        cs: [
          `prosím o vysvětlení vyúčtování služeb za byt${flatAt.cs}.`,
          'Můžete mi prosím poslat podrobný rozpis nákladů, ze kterého vyúčtování vychází?',
        ],
        en: [
          `Could you please explain the service charges bill for the flat${flatAt.en}?`,
          'Could you please send me a detailed breakdown of the costs the bill is based on?',
        ],
        say: [
          { cs: 'Volám kvůli vyúčtování služeb.', en: 'I’m calling about the service charges bill.', say: 'VOH-lahm KVOO-lee VIH-ooch-toh-vah-nyee SLOO-zhep.' },
          { cs: 'Můžete mi prosím poslat podrobný rozpis nákladů?', en: 'Could you please send me a detailed breakdown of the costs?', say: 'MOO-zheh-teh mi PROH-seem POH-slat POH-drob-nee ROS-pis NAH-kla-doo?' },
        ],
      };
    case 'register': {
      const d = doctorCs[input.doctorType];
      const ins = insurerLines(input.insurer);
      const patients = d.patients ?? { cs: 'nové pacienty', say: 'NOH-veh PAH-tsi-en-tih' };
      return {
        cs: [`hledám ${d.cs} a chci se zeptat, zda přijímáte ${patients.cs}.`, ins.written.cs],
        en: [`I’m looking for ${d.en} and would like to ask whether you are taking new patients.`, ins.written.en],
        say: [
          { cs: `Hledám ${d.cs}.`, en: `I’m looking for ${d.en}.`, say: `HLEH-dahm ${d.say}.` },
          { cs: `Přijímáte ${patients.cs}?`, en: 'Are you taking new patients?', say: `PRZHI-yee-mah-teh ${patients.say}?` },
          ins.spoken,
        ],
      };
    }
    case 'appointment': {
      const ins = insurerLines(input.insurer);
      return {
        cs: [`prosím o termín vyšetření ${w.cs}. U Vás jsem již v péči.${time ? ` ${time.cs}` : ''}`, ins.written.cs],
        en: [`I’d like an appointment ${w.en}. I’m already your patient.${time ? ` ${time.en}` : ''}`, ins.written.en],
        say: [
          { cs: `Prosím o termín vyšetření ${w.cs}.`, en: `I’d like an appointment ${w.en}.`, say: `PROH-seem oh TER-meen VIH-shet-rzheh-nyee ${w.say}.` },
          { cs: 'U vás jsem již v péči.', en: 'I’m already your patient.', say: 'OO vahs sem yizh FPEH-chee.' },
          ...(time ? [time] : []),
          ins.spoken,
        ],
      };
    }
    case 'reschedule': {
      const existing = input.existingAppointment.trim();
      const termCs = existing ? `svůj termín ${existing}` : 'svůj termín';
      const termEn = existing ? `my appointment on ${existing}` : 'my appointment';
      return {
        cs: [
          `potřebuji zrušit ${termCs}. Omlouvám se za komplikace.`,
          `Můžete mi prosím dát nový termín ${w.cs}?${time ? ` ${time.cs}` : ''}`,
        ],
        en: [
          `I need to cancel ${termEn}. I’m sorry for the inconvenience.`,
          `Could you please give me a new appointment ${w.en}?${time ? ` ${time.en}` : ''}`,
        ],
        say: [
          { cs: `Potřebuji zrušit ${termCs}.`, en: `I need to cancel ${termEn}.`, say: 'POH-trzheh-boo-yee ZROO-shit svooy TER-meen … (then read the date)' },
          { cs: `Můžete mi prosím dát nový termín ${w.cs}?`, en: `Could you please give me a new appointment ${w.en}?`, say: `MOO-zheh-teh mi PROH-seem daht NOH-vee TER-meen ${w.say}?` },
          ...(time ? [time] : []),
        ],
      };
    }
  }
}

export function compose(input: ComposeInput): Composed {
  const { cs, en, say } = body(input);
  const nameCs = filled(input.name, '[Vaše jméno]');
  const nameEn = filled(input.name, '[Your name]');
  const little = input.littleCzech ? [LITTLE_CZECH_WRITTEN] : [];

  const czech = ['Dobrý den,', ...cs, ...little.map((l) => l.cs), `S pozdravem\n${nameCs}`].join('\n\n');
  const english = ['Hello,', ...en, ...little.map((l) => l.en), `Kind regards\n${nameEn}`].join('\n\n');

  const name = input.name.trim();
  const opening: Line[] = [
    OPEN_HELLO,
    ...(input.littleCzech ? [OPEN_ENGLISH, OPEN_SLOWLY] : []),
    ...(name ? [{ cs: `Jmenuji se ${name}.`, en: `My name is ${name}.`, say: 'MEH-noo-yee seh … (then your name)' }] : []),
  ];

  return { czech, english, call: { opening, say, hear: hearBank[input.recipient], closing: [CLOSE_THANKS] } };
}

export const defaultInput = (recipient: Recipient = 'trades'): ComposeInput => ({
  recipient,
  intent: intents[recipient][0].id,
  problem: 'leak',
  when: 'asap',
  timeOfDay: 'any',
  doctorType: 'gp',
  insurer: '111',
  address: '',
  existingAppointment: '',
  name: '',
  littleCzech: true,
});
