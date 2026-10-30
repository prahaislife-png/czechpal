import type { Analysis, Category } from './types';

/**
 * Demo content. Fictional senders, accounts and reference numbers.
 * Replies are composed from a body per intent so tone changes only the frame, never the facts.
 * English UI strings avoid dashes; Czech source text and Czech drafts keep Czech typography.
 */

type Bilingual = { cs: string; en: string };

type ReplyTemplate = { body: Bilingual; short: Bilingual };

export type Sample = {
  id: string;
  /** Shown in "Try it on". */
  label: string;
  category: Category;
  keywords: string[];
  original: string;
  analysis: Analysis;
  greeting?: Bilingual;
  signature?: Bilingual;
  replies: Record<string, ReplyTemplate>;
};

/* ───────────── Everyday text ───────────── */

const parking: Sample = {
  id: 'parking',
  label: 'Street sign',
  category: 'transport',
  keywords: ['zákaz stání', 'zásobování', 'parkování', 'zóna'],
  original: `ZÁKAZ STÁNÍ
Po–Pá 7–18 h
MIMO VOZIDEL ZÁSOBOVÁNÍ
Platí od 1. 11. 2026`,
  analysis: {
    kind: 'text',
    typeLabel: 'Parking sign',
    title: 'No parking on weekdays',
    category: 'transport',
    verdict: { urgency: 'action', label: 'Don’t park here weekdays 7:00 to 18:00', detail: 'Delivery vehicles are the exception' },
    inShort: 'You can’t park here Monday to Friday between 7:00 and 18:00. Evenings and weekends are fine.',
    lines: [
      { cs: 'ZÁKAZ STÁNÍ', en: 'No standing', note: 'You may stop briefly to drop someone off, but not leave the car.' },
      { cs: 'Po–Pá 7–18 h', en: 'Monday to Friday, 7:00 to 18:00' },
      { cs: 'MIMO VOZIDEL ZÁSOBOVÁNÍ', en: 'Except delivery vehicles' },
      { cs: 'Platí od 1. 11. 2026', en: 'Valid from 1 November 2026' },
    ],
    meaning: [
      '“Zákaz stání” is stricter than no parking: you can’t wait here with the engine off either.',
      'Outside those hours, and all weekend, the restriction doesn’t apply.',
      'Cars parked here during the hours can be fined or towed.',
    ],
    keyFacts: [
      { id: 'when', label: 'Applies', value: 'Mon to Fri, 7:00 to 18:00', icon: 'clock', evidence: 'Po–Pá 7–18 h' },
      { id: 'except', label: 'Exception', value: 'Delivery vehicles', icon: 'transport', evidence: 'MIMO VOZIDEL ZÁSOBOVÁNÍ' },
      { id: 'from', label: 'Valid from', value: '1 November 2026', icon: 'calendar', evidence: 'Platí od 1. 11. 2026' },
    ],
    nextSteps: [],
    notStated: ['Whether residents with a parking card are exempt'],
    translation: `NO STANDING
Monday to Friday, 7:00 to 18:00
EXCEPT DELIVERY VEHICLES
Valid from 1 Nov 2026`,
    replyIntents: [],
  },
  replies: {},
};

const menu: Sample = {
  id: 'menu',
  label: 'Lunch menu',
  category: 'food',
  keywords: ['polední menu', 'polévka', 'knedlík', 'řízek', 'menu'],
  original: `POLEDNÍ MENU
Po–Pá 11:00–14:00

Polévka: česnečka se sýrem a krutony

1. Svíčková na smetaně, houskový knedlík  169 Kč
2. Smažený sýr, hranolky, tatarská omáčka  155 Kč
3. Kuřecí řízek, bramborový salát  159 Kč

K menu polévka zdarma.`,
  analysis: {
    kind: 'text',
    typeLabel: 'Lunch menu',
    title: 'Weekday lunch menu',
    category: 'food',
    inShort: 'A set lunch with three mains from 155 to 169 Kč. Garlic soup comes free with any of them.',
    lines: [
      { cs: 'Česnečka se sýrem a krutony', en: 'Garlic soup with cheese and croutons', note: 'Free with every main' },
      { cs: 'Svíčková na smetaně, houskový knedlík', en: 'Beef sirloin in cream sauce, bread dumplings', note: '169 Kč · the classic Czech dish' },
      { cs: 'Smažený sýr, hranolky, tatarská omáčka', en: 'Fried cheese, fries, tartar sauce', note: '155 Kč · the vegetarian option' },
      { cs: 'Kuřecí řízek, bramborový salát', en: 'Chicken schnitzel, potato salad', note: '159 Kč' },
    ],
    meaning: [
      'Polední menu is a cheaper weekday set lunch, served only at lunchtime.',
      'If you want to try one Czech dish, svíčková is the one.',
      'Smažený sýr is the only option without meat.',
    ],
    keyFacts: [
      { id: 'hours', label: 'Served', value: 'Mon to Fri, 11:00 to 14:00', icon: 'clock', evidence: 'Po–Pá 11:00–14:00' },
      { id: 'price', label: 'Mains', value: '155 to 169 Kč, soup included', icon: 'money', evidence: 'K menu polévka zdarma.' },
    ],
    nextSteps: [],
    notStated: ['Allergens', 'Whether you can pay by card'],
    translation: `LUNCH MENU
Monday to Friday, 11:00 to 14:00

Soup: garlic soup with cheese and croutons

1. Beef sirloin in cream sauce, bread dumplings  169 CZK
2. Fried cheese, fries, tartar sauce  155 CZK
3. Chicken schnitzel, potato salad  159 CZK

Soup free with the menu.`,
    replyIntents: [],
  },
  replies: {},
};

const medicine: Sample = {
  id: 'medicine',
  label: 'Medicine label',
  category: 'health',
  keywords: ['tablet', 'užívejte', 'denně', 'dávkování', 'dětí'],
  original: `Dávkování: 1 tableta 3× denně po jídle.
Nepřekračujte 6 tablet za 24 hodin.
Mezi dávkami dodržujte odstup nejméně 4 hodiny.
Uchovávejte mimo dohled a dosah dětí.`,
  analysis: {
    kind: 'text',
    typeLabel: 'Medicine label',
    title: 'Dosage instructions',
    category: 'health',
    verdict: { urgency: 'action', label: '1 tablet, 3 times a day, after food', detail: 'Never more than 6 in 24 hours' },
    inShort: 'Take one tablet three times a day after eating, at least 4 hours apart. Don’t take more than 6 in a day.',
    lines: [
      { cs: 'Dávkování: 1 tableta 3× denně po jídle.', en: 'Dosage: 1 tablet 3 times a day after meals.' },
      { cs: 'Nepřekračujte 6 tablet za 24 hodin.', en: 'Do not exceed 6 tablets in 24 hours.' },
      { cs: 'Mezi dávkami dodržujte odstup nejméně 4 hodiny.', en: 'Keep at least 4 hours between doses.' },
      { cs: 'Uchovávejte mimo dohled a dosah dětí.', en: 'Keep out of the sight and reach of children.' },
    ],
    meaning: ['“Po jídle” means after a meal, not on an empty stomach.', 'The maximum of 6 tablets is a safety limit, not a target.'],
    keyFacts: [
      { id: 'dose', label: 'Dose', value: '1 tablet, 3 times a day', icon: 'health', evidence: '1 tableta 3× denně po jídle' },
      { id: 'max', label: 'Maximum', value: '6 tablets in 24 hours', icon: 'alert', evidence: 'Nepřekračujte 6 tablet za 24 hodin' },
      { id: 'gap', label: 'Between doses', value: 'At least 4 hours', icon: 'clock', evidence: 'odstup nejméně 4 hodiny' },
    ],
    nextSteps: [],
    notStated: ['How many days you can take it for', 'Whether it is safe with your other medicines'],
    caution: 'medical',
    translation: `Dosage: 1 tablet 3 times a day after meals.
Do not exceed 6 tablets in 24 hours.
Keep at least 4 hours between doses.
Keep out of the sight and reach of children.`,
    replyIntents: [],
  },
  replies: {},
};

const neighbour: Sample = {
  id: 'neighbour',
  label: 'Chat message',
  category: 'personal',
  keywords: ['vrtačk', 'patra', 'půjčila', 'sobotu', 'ahoj'],
  original: `Dobrý den, tady Petra ze 3. patra. Nevadilo by vám, kdybych si v sobotu půjčila vaši vrtačku? V neděli večer ji vrátím. Moc děkuji!`,
  analysis: {
    kind: 'message',
    typeLabel: 'Message from a neighbour',
    title: 'Petra asks to borrow your drill',
    category: 'personal',
    sender: 'Petra, 3rd floor',
    verdict: { urgency: 'none', label: 'A friendly favour', detail: 'Reply when it suits you' },
    inShort: 'Your neighbour Petra would like to borrow your drill on Saturday and bring it back on Sunday evening.',
    meaning: [
      'She writes politely, using “vy”, so a polite reply fits.',
      'Saying no is completely normal; offering another day is a kind touch.',
    ],
    keyFacts: [
      { id: 'when', label: 'Borrow', value: 'Saturday', icon: 'calendar', evidence: 'v sobotu' },
      { id: 'back', label: 'Return', value: 'Sunday evening', icon: 'clock', evidence: 'V neděli večer ji vrátím' },
    ],
    nextSteps: [],
    notStated: ['What time on Saturday she would come'],
    translation:
      'Hello, it’s Petra from the 3rd floor. Would you mind if I borrowed your drill on Saturday? I’ll bring it back on Sunday evening. Thank you very much!',
    replyIntents: [
      { id: 'yes', label: 'Yes, happy to', description: 'Lend it and say she can drop by.' },
      { id: 'when', label: 'Yes, but when?', description: 'Ask what time she will come.' },
      { id: 'no', label: 'Sorry, not this weekend', description: 'Decline kindly and offer next week.' },
    ],
  },
  signature: { cs: '[Vaše jméno]', en: '[Your name]' },
  replies: {
    yes: {
      body: {
        cs: 'samozřejmě, vrtačku si klidně půjčte. Stavte se v sobotu, kdy se vám to hodí.',
        en: 'of course, feel free to borrow the drill. Drop by on Saturday whenever suits you.',
      },
      short: { cs: 'jasně, klidně si ji v sobotu vyzvedněte.', en: 'sure, feel free to pick it up on Saturday.' },
    },
    when: {
      body: {
        cs: 'vrtačku vám klidně půjčím. V kolik hodin byste si pro ni v sobotu přišla?',
        en: 'I’m happy to lend you the drill. What time on Saturday would you come for it?',
      },
      short: { cs: 'jasně. V kolik hodin si pro ni přijdete?', en: 'sure. What time will you come for it?' },
    },
    no: {
      body: {
        cs: 'to mě mrzí, ale tento víkend vrtačku potřebuji. Příští týden by to klidně šlo.',
        en: 'I’m sorry, but I need the drill this weekend. Next week would be fine.',
      },
      short: {
        cs: 'bohužel ji tento víkend potřebuji, příští týden ale klidně.',
        en: 'unfortunately I need it this weekend, but next week is fine.',
      },
    },
  },
};

/* ───────────── Letters and documents ───────────── */

const water: Sample = {
  id: 'water',
  label: 'Landlord notice',
  category: 'housing',
  keywords: ['vody', 'voda', 'vodovod', 'nájemník', 'správa domu'],
  original: `Vážení nájemníci,

dovolujeme si Vás informovat, že ve čtvrtek 12. listopadu 2026 proběhne v domě plánovaná oprava vodovodního potrubí. Od 8:00 do 14:00 bude v celém domě přerušena dodávka studené i teplé vody.

Doporučujeme si předem připravit potřebné množství vody. Po obnovení dodávky může být voda krátce zakalená – nechte ji prosím chvíli odtéct.

Děkujeme za pochopení.

Správa domu
Vinohradská 1520/48, Praha 2`,
  analysis: {
    kind: 'document',
    typeLabel: 'Notice from building management',
    title: 'Water shut-off notice',
    category: 'housing',
    sender: 'Building management',
    verdict: { urgency: 'none', label: 'No action needed', detail: 'This is an information notice' },
    inShort: 'Water in your building will be off on Thursday 12 November, 8:00 to 14:00, for planned repairs. You don’t need to reply.',
    meaning: [
      'Both cold and hot water will be off in the whole building.',
      'It’s planned maintenance. Nothing is wrong with your flat.',
      'Water may look cloudy for a moment afterwards. Let it run briefly.',
    ],
    keyFacts: [
      { id: 'date', label: 'Date', value: 'Thursday 12 Nov 2026', icon: 'calendar', evidence: 've čtvrtek 12. listopadu 2026' },
      { id: 'time', label: 'Time', value: '8:00 to 14:00', icon: 'clock', evidence: 'Od 8:00 do 14:00' },
      { id: 'affects', label: 'Affects', value: 'Cold and hot water, whole building', icon: 'water', evidence: 'v celém domě přerušena dodávka studené i teplé vody' },
      { id: 'from', label: 'From', value: 'Building management, Vinohradská 48', icon: 'sender', evidence: 'Správa domu' },
    ],
    nextSteps: [
      { id: 'store', title: 'Fill some water in advance', detail: 'Enough for drinking, cooking and flushing until 14:00.', kind: 'optional' },
      { id: 'run', title: 'Let the tap run after 14:00', detail: 'Only if the water looks cloudy.', kind: 'optional' },
    ],
    notStated: ['Whether the repair could run late', 'Who to contact with questions'],
    translation: `Dear tenants,

We would like to inform you that on Thursday 12 November 2026 a planned repair of the water pipes will take place in the building. From 8:00 to 14:00 the supply of cold and hot water will be interrupted in the entire building.

We recommend preparing the water you need in advance. When the supply is restored, the water may be briefly cloudy, so please let it run for a while.

Thank you for your understanding.

Building management
Vinohradská 1520/48, Prague 2`,
    replyIntents: [
      { id: 'ack', label: 'Confirm I’ve read it', description: 'A short thank-you so they know you saw it.' },
      { id: 'ask', label: 'Ask if it could run late', description: 'Check whether 14:00 is a firm end time.' },
      { id: 'away', label: 'I won’t be home', description: 'Say you’re away and ask if they need access.' },
    ],
  },
  replies: {
    ack: {
      body: {
        cs: 'děkuji za informaci o plánované opravě vodovodního potrubí. Beru na vědomí, že ve čtvrtek 12. listopadu bude od 8:00 do 14:00 přerušena dodávka vody.',
        en: 'thank you for the information about the planned water pipe repair. I note that on Thursday 12 November the water supply will be off from 8:00 to 14:00.',
      },
      short: { cs: 'děkuji za informaci, beru na vědomí.', en: 'thank you for letting me know, noted.' },
    },
    ask: {
      body: {
        cs: 'děkuji za informaci o plánované opravě. Mohu se prosím zeptat, zda je čas od 8:00 do 14:00 konečný, nebo se oprava může protáhnout? Předem děkuji za odpověď.',
        en: 'thank you for the information about the planned repair. May I ask whether the time from 8:00 to 14:00 is final, or whether the repair could take longer? Thank you in advance for your reply.',
      },
      short: { cs: 'mohu se zeptat, zda se oprava může protáhnout po 14:00?', en: 'may I ask whether the repair could run past 14:00?' },
    },
    away: {
      body: {
        cs: 'děkuji za informaci. Ve čtvrtek 12. listopadu nebudu doma. Pokud by byl při opravě potřeba přístup do mého bytu, dejte mi prosím vědět předem, abychom se mohli domluvit.',
        en: 'thank you for the information. I will not be at home on Thursday 12 November. If access to my flat is needed during the repair, please let me know in advance so we can arrange it.',
      },
      short: {
        cs: 've čtvrtek nebudu doma. Pokud bude potřeba přístup do bytu, dejte mi prosím vědět.',
        en: 'I won’t be home on Thursday. If access to the flat is needed, please let me know.',
      },
    },
  },
};

const electricity: Sample = {
  id: 'electricity',
  label: 'Electricity bill',
  category: 'utilities',
  keywords: ['vyúčtování', 'elektřin', 'nedoplatek', 'záloh', 'odběrné místo'],
  original: `Vyúčtování elektřiny za období 1. 11. 2025 – 31. 10. 2026

Vážený zákazníku,

zasíláme Vám roční vyúčtování dodávky elektřiny pro odběrné místo Korunní 812/14, Praha 2.

Celková cena za období: 14 860 Kč
Zaplacené zálohy: 13 020 Kč
Nedoplatek: 1 840 Kč

Nedoplatek prosím uhraďte do 20. 11. 2026 na účet 123456789/0300, variabilní symbol 5512048873.

Od prosince 2026 se Vaše měsíční záloha zvyšuje z 1 085 Kč na 1 240 Kč.

S pozdravem
Zákaznický servis
Elektro Vltava a. s.`,
  analysis: {
    kind: 'document',
    typeLabel: 'Yearly electricity bill',
    title: 'Electricity bill',
    category: 'utilities',
    sender: 'Elektro Vltava, your supplier',
    verdict: { urgency: 'action', label: 'Pay 1 840 Kč by 20 Nov', detail: 'Bank transfer with the variable symbol' },
    inShort: 'You used more electricity than your monthly advances covered, so you owe 1 840 Kč by Friday 20 November.',
    meaning: [
      'You pay monthly advances (zálohy). Once a year the supplier compares them with what you actually used.',
      'You used 14 860 Kč of electricity but paid 13 020 Kč in advances.',
      'From December your monthly payment rises from 1 085 Kč to 1 240 Kč.',
    ],
    keyFacts: [
      { id: 'amount', label: 'Amount to pay', value: '1 840 Kč', icon: 'money', evidence: 'Nedoplatek: 1 840 Kč' },
      { id: 'due', label: 'Pay by', value: 'Friday 20 Nov 2026', icon: 'calendar', evidence: 'uhraďte do 20. 11. 2026' },
      { id: 'account', label: 'Account', value: '123456789/0300', icon: 'finance', evidence: 'na účet 123456789/0300' },
      { id: 'vs', label: 'Variable symbol', value: '5512048873', icon: 'number', evidence: 'variabilní symbol 5512048873' },
      { id: 'advance', label: 'New monthly advance', value: '1 240 Kč from December', icon: 'utilities', evidence: 'z 1 085 Kč na 1 240 Kč' },
    ],
    nextSteps: [
      {
        id: 'pay',
        title: 'Pay 1 840 Kč by 20 November',
        detail: 'Transfer to 123456789/0300 with variable symbol 5512048873. The symbol is how they match your payment.',
        kind: 'required',
      },
      {
        id: 'order',
        title: 'Raise your standing order to 1 240 Kč',
        detail: 'If you pay advances by standing order, change it before December.',
        kind: 'required',
      },
      { id: 'meter', title: 'Compare the reading with your meter', detail: 'Bills are sometimes based on an estimate.', kind: 'optional' },
    ],
    notStated: ['Whether the meter reading was real or estimated', 'What happens if you pay late'],
    translation: `Electricity bill for 1 Nov 2025 to 31 Oct 2026

Dear customer,

Please find enclosed the annual settlement of the electricity supply for the supply point Korunní 812/14, Prague 2.

Total price for the period: 14 860 CZK
Advances paid: 13 020 CZK
Amount owed: 1 840 CZK

Please pay the amount owed by 20 Nov 2026 to account 123456789/0300, variable symbol 5512048873.

From December 2026 your monthly advance increases from 1 085 CZK to 1 240 CZK.

Kind regards
Customer service
Elektro Vltava a. s.`,
    replyIntents: [
      { id: 'instalments', label: 'Pay in instalments', description: 'Ask to split 1 840 Kč into two payments.' },
      { id: 'explain', label: 'Question the amount', description: 'Ask how it was calculated and if the reading was real.' },
      { id: 'advance', label: 'Keep my advance lower', description: 'Ask to stay at 1 085 Kč a month.' },
    ],
  },
  replies: {
    instalments: {
      body: {
        cs: 'děkuji za zaslané vyúčtování za období 1. 11. 2025 – 31. 10. 2026. Prosím o možnost uhradit nedoplatek ve výši 1 840 Kč ve dvou měsíčních splátkách. Dejte mi prosím vědět, zda je to možné a jaké platební údaje mám použít.\n\nOdběrné místo: Korunní 812/14, Praha 2',
        en: 'thank you for the bill for 1 Nov 2025 to 31 Oct 2026. Could I please pay the outstanding 1 840 CZK in two monthly instalments? Please let me know if this is possible and which payment details I should use.\n\nSupply point: Korunní 812/14, Prague 2',
      },
      short: {
        cs: 'prosím o možnost uhradit nedoplatek 1 840 Kč ve dvou splátkách. Odběrné místo: Korunní 812/14, Praha 2.',
        en: 'please may I pay the 1 840 CZK balance in two instalments? Supply point: Korunní 812/14, Prague 2.',
      },
    },
    explain: {
      body: {
        cs: 'děkuji za zaslané vyúčtování. Prosím o vysvětlení, jak byla vypočtena celková cena 14 860 Kč, a zda vyúčtování vychází ze skutečného odečtu elektroměru, nebo z odhadu.\n\nOdběrné místo: Korunní 812/14, Praha 2',
        en: 'thank you for the bill. Could you please explain how the total price of 14 860 CZK was calculated, and whether it is based on an actual meter reading or an estimate?\n\nSupply point: Korunní 812/14, Prague 2',
      },
      short: {
        cs: 'prosím o vysvětlení výpočtu částky 14 860 Kč. Vychází ze skutečného odečtu, nebo z odhadu?',
        en: 'please explain how the 14 860 CZK was calculated. Is it based on an actual reading or an estimate?',
      },
    },
    advance: {
      body: {
        cs: 'děkuji za zaslané vyúčtování. Nedoplatek uhradím v termínu. Prosím o ponechání měsíční zálohy ve výši 1 085 Kč, protože očekávám nižší spotřebu.\n\nOdběrné místo: Korunní 812/14, Praha 2',
        en: 'thank you for the bill. I will pay the outstanding amount on time. Could you please keep my monthly advance at 1 085 CZK, as I expect lower consumption?\n\nSupply point: Korunní 812/14, Prague 2',
      },
      short: {
        cs: 'nedoplatek uhradím včas. Prosím o ponechání zálohy 1 085 Kč měsíčně.',
        en: 'I’ll pay the balance on time. Please keep my advance at 1 085 CZK a month.',
      },
    },
  },
};

const school: Sample = {
  id: 'school',
  label: 'School note',
  category: 'school',
  keywords: ['rodiče', 'exkurz', 'výlet', 'žáci', 'třídní', 'škol'],
  original: `Vážení rodiče,

ve středu 18. listopadu 2026 pojedou žáci 3. B na exkurzi do Národního technického muzea. Odjezd je v 8:15 od školy, návrat kolem 13:00.

Cena exkurze je 350 Kč (doprava a vstupné). Částku prosím pošlete po dítěti v obálce nebo uhraďte na účet školy do pondělí 16. 11.

Prosíme o vyplnění a podepsání přiloženého souhlasu. Dětem dejte s sebou svačinu, pití a vhodné oblečení.

Děkuji.
Mgr. Jana Horáková
třídní učitelka 3. B`,
  analysis: {
    kind: 'document',
    typeLabel: 'Note from your child’s teacher',
    title: 'School trip to the Technical Museum',
    category: 'school',
    sender: 'Class teacher, 3. B',
    verdict: { urgency: 'action', label: 'Pay and sign by Mon 16 Nov', detail: '350 Kč and the consent form' },
    inShort: 'Class 3. B is visiting the National Technical Museum on Wednesday 18 November. Pay 350 Kč and sign the consent form by Monday.',
    meaning: [
      'The trip is during school hours: leaving at 8:15, back around 13:00.',
      '350 Kč covers transport and entry.',
      'You can send cash in an envelope with your child, or pay to the school’s account.',
    ],
    keyFacts: [
      { id: 'date', label: 'Trip', value: 'Wednesday 18 Nov 2026', icon: 'calendar', evidence: 've středu 18. listopadu 2026' },
      { id: 'time', label: 'Times', value: 'Leaves 8:15, back about 13:00', icon: 'clock', evidence: 'Odjezd je v 8:15 od školy, návrat kolem 13:00' },
      { id: 'cost', label: 'Cost', value: '350 Kč', icon: 'money', evidence: 'Cena exkurze je 350 Kč' },
      { id: 'due', label: 'Deadline', value: 'Monday 16 Nov', icon: 'alert', evidence: 'do pondělí 16. 11.' },
    ],
    nextSteps: [
      { id: 'sign', title: 'Sign the consent form', detail: 'It came with the letter. Your child brings it back to school.', kind: 'required' },
      { id: 'pay', title: 'Pay 350 Kč by Monday', detail: 'Cash in an envelope, or a transfer to the school’s account.', kind: 'required' },
      { id: 'pack', title: 'Pack a snack, a drink and suitable clothes', kind: 'optional' },
    ],
    notStated: ['The school’s account number', 'What to write in the payment message'],
    translation: `Dear parents,

On Wednesday 18 November 2026 pupils of class 3. B will go on an excursion to the National Technical Museum. Departure is at 8:15 from the school, return around 13:00.

The excursion costs 350 CZK (transport and admission). Please send the amount with your child in an envelope or pay it to the school’s account by Monday 16 Nov.

Please fill in and sign the attached consent form. Give the children a snack, a drink and suitable clothing.

Thank you.
Jana Horáková
Class teacher, 3. B`,
    replyIntents: [
      { id: 'confirm', label: 'Confirm we’ll do it', description: 'Say you’ll sign and send the money.' },
      { id: 'account', label: 'Ask for payment details', description: 'Request the account number and reference.' },
      { id: 'absent', label: 'My child won’t go', description: 'Ask whether there’s supervision at school.' },
    ],
  },
  replies: {
    confirm: {
      body: {
        cs: 'děkuji za informaci o exkurzi do Národního technického muzea. Souhlas podepíšeme a částku 350 Kč pošleme v obálce do pondělí 16. listopadu.',
        en: 'thank you for the information about the trip to the National Technical Museum. We will sign the consent form and send the 350 CZK in an envelope by Monday 16 November.',
      },
      short: { cs: 'souhlas podepíšeme a 350 Kč pošleme do pondělí.', en: 'we’ll sign the form and send the 350 CZK by Monday.' },
    },
    account: {
      body: {
        cs: 'děkuji za informaci o exkurzi. Rádi bychom částku 350 Kč uhradili převodem. Mohu Vás prosím požádat o číslo účtu školy a o údaje, které mám uvést do zprávy pro příjemce?',
        en: 'thank you for the information about the trip. We would like to pay the 350 CZK by bank transfer. Could you please send me the school’s account number and what I should write in the payment message?',
      },
      short: {
        cs: 'rádi bychom zaplatili převodem. Můžete mi prosím poslat číslo účtu a co uvést do zprávy?',
        en: 'we’d like to pay by transfer. Could you send the account number and what to put in the message?',
      },
    },
    absent: {
      body: {
        cs: 'děkuji za informaci o exkurzi. [Jméno dítěte] se jí bohužel nebude moci zúčastnit. Mohu se prosím zeptat, zda bude mít v tento den ve škole zajištěný dozor?',
        en: 'thank you for the information about the trip. Unfortunately [child’s name] will not be able to take part. May I ask whether supervision will be provided at school that day?',
      },
      short: {
        cs: '[jméno dítěte] se exkurze bohužel nezúčastní. Bude mít ve škole zajištěný dozor?',
        en: '[child’s name] won’t be joining the trip. Will there be supervision at school?',
      },
    },
  },
};

const residence: Sample = {
  id: 'residence',
  label: 'Government letter',
  category: 'government',
  keywords: ['ministerstvo', 'pobyt', 'žádost', 'výzva', 'odbor azylové', 'lhůt'],
  original: `Ministerstvo vnitra
Odbor azylové a migrační politiky

Č. j.: OAM-12345-7/DP-2026

Výzva k odstranění vad žádosti

Vážená paní, vážený pane,

ve věci Vaší žádosti o prodloužení doby platnosti povolení k dlouhodobému pobytu za účelem zaměstnání Vás vyzýváme k odstranění vad žádosti.

Ve lhůtě 15 dnů ode dne doručení této výzvy předložte:
1. doklad o zajištění ubytování na území,
2. potvrzení zaměstnavatele o výši měsíční mzdy.

Doklady lze předložit osobně na pracovišti odboru nebo zaslat poštou.

Nebudou-li vady ve stanovené lhůtě odstraněny, bude řízení zastaveno.`,
  analysis: {
    kind: 'document',
    typeLabel: 'Letter from the Ministry of the Interior',
    title: 'Residence permit letter',
    category: 'government',
    sender: 'Ministry of the Interior (OAMP)',
    verdict: { urgency: 'urgent', label: 'Respond within 15 days', detail: 'Counted from the day you received it' },
    inShort: 'The Ministry needs two more documents for your residence extension. Send them within 15 days of receiving this letter, or the application will be stopped.',
    meaning: [
      'Your application isn’t refused. It’s incomplete.',
      'The 15 days count from the day the letter was delivered to you, not the date it was written.',
      'If you miss the deadline, the proceedings are stopped and you would have to apply again.',
    ],
    keyFacts: [
      { id: 'deadline', label: 'Deadline', value: '15 days from delivery', icon: 'alert', evidence: 'Ve lhůtě 15 dnů ode dne doručení této výzvy' },
      { id: 'docs', label: 'Documents needed', value: 'Proof of accommodation, employer’s salary confirmation', icon: 'document', evidence: 'doklad o zajištění ubytování … potvrzení zaměstnavatele o výši měsíční mzdy' },
      { id: 'ref', label: 'Reference number', value: 'OAM-12345-7/DP-2026', icon: 'number', evidence: 'Č. j.: OAM-12345-7/DP-2026' },
      { id: 'how', label: 'How to submit', value: 'In person at an OAMP office, or by post', icon: 'location', evidence: 'předložit osobně na pracovišti odboru nebo zaslat poštou' },
    ],
    nextSteps: [
      {
        id: 'accommodation',
        title: 'Get proof of accommodation',
        detail: 'Usually your rental contract, or the official accommodation confirmation form signed by the owner.',
        kind: 'required',
      },
      { id: 'salary', title: 'Ask your employer for a salary confirmation', detail: 'It must state your monthly wage.', kind: 'required' },
      {
        id: 'submit',
        title: 'Submit both within 15 days',
        detail: 'Quote OAM-12345-7/DP-2026. If posting, send it by registered mail (doporučeně) and keep the receipt.',
        kind: 'required',
      },
    ],
    notStated: ['The date you received the letter. Check the envelope or delivery slip', 'Whether originals or copies are required'],
    caution: 'official',
    translation: `Ministry of the Interior
Department for Asylum and Migration Policy

Ref.: OAM-12345-7/DP-2026

Request to remedy deficiencies in an application

Dear Madam or Sir,

Regarding your application to extend the validity of your long-term residence permit for the purpose of employment, we request that you remedy the deficiencies of the application.

Within 15 days of the day this request is delivered, submit:
1. proof of accommodation in the territory,
2. your employer’s confirmation of your monthly wage.

The documents may be submitted in person at the department’s office or sent by post.

If the deficiencies are not remedied within the set deadline, the proceedings will be discontinued.`,
    replyIntents: [
      { id: 'cover', label: 'Send the documents', description: 'A cover letter listing what you’re enclosing.' },
      { id: 'extend', label: 'Ask for more time', description: 'Request a 15-day extension of the deadline.' },
      { id: 'question', label: 'Ask what counts as proof', description: 'Check if a rental contract is enough.' },
    ],
  },
  greeting: { cs: 'Vážená paní, vážený pane,', en: 'Dear Madam or Sir,' },
  signature: { cs: '[Vaše jméno]\n[Datum narození]', en: '[Your name]\n[Date of birth]' },
  replies: {
    cover: {
      body: {
        cs: 'na základě výzvy k odstranění vad žádosti č. j. OAM-12345-7/DP-2026 v příloze zasílám:\n1. doklad o zajištění ubytování,\n2. potvrzení zaměstnavatele o výši měsíční mzdy.',
        en: 'further to the request to remedy the deficiencies of my application, ref. OAM-12345-7/DP-2026, please find enclosed:\n1. proof of accommodation,\n2. my employer’s confirmation of my monthly wage.',
      },
      short: {
        cs: 'v příloze zasílám doklady požadované výzvou č. j. OAM-12345-7/DP-2026.',
        en: 'please find enclosed the documents requested under ref. OAM-12345-7/DP-2026.',
      },
    },
    extend: {
      body: {
        cs: 've věci řízení č. j. OAM-12345-7/DP-2026 Vás žádám o prodloužení lhůty k odstranění vad žádosti o 15 dnů. Potvrzení zaměstnavatele mi bude vystaveno až po termínu stanoveném ve výzvě. Doklady předložím neprodleně, jakmile je obdržím.',
        en: 'regarding proceedings ref. OAM-12345-7/DP-2026, I request a 15-day extension of the deadline to remedy the deficiencies of my application. My employer will only issue the confirmation after the deadline set in the request. I will submit the documents as soon as I receive them.',
      },
      short: {
        cs: 'žádám o prodloužení lhůty k odstranění vad žádosti (č. j. OAM-12345-7/DP-2026) o 15 dnů z důvodu čekání na potvrzení zaměstnavatele.',
        en: 'I request a 15-day extension of the deadline (ref. OAM-12345-7/DP-2026) as I am waiting for my employer’s confirmation.',
      },
    },
    question: {
      body: {
        cs: 've věci řízení č. j. OAM-12345-7/DP-2026 si dovoluji položit dotaz, zda jako doklad o zajištění ubytování postačí nájemní smlouva, nebo je nutné předložit potvrzení o zajištění ubytování s úředně ověřeným podpisem vlastníka.',
        en: 'regarding proceedings ref. OAM-12345-7/DP-2026, I would like to ask whether a rental contract is sufficient as proof of accommodation, or whether an accommodation confirmation with the owner’s officially certified signature is required.',
      },
      short: {
        cs: 'postačí jako doklad o zajištění ubytování nájemní smlouva? (č. j. OAM-12345-7/DP-2026)',
        en: 'is a rental contract sufficient as proof of accommodation? (ref. OAM-12345-7/DP-2026)',
      },
    },
  },
};

/** Ordered for "Try it on": everyday text first, letters after. */
export const samples: Sample[] = [parking, menu, neighbour, medicine, water, electricity, school, residence];

export const sampleById = (id?: string) => samples.find((s) => s.id === id);

/** Demo-mode matcher for pasted text: the sample whose keywords appear most often. */
export function matchSample(text: string): Sample | undefined {
  const t = text.toLowerCase();
  let best: { sample: Sample; score: number } | undefined;
  for (const sample of samples) {
    const score = sample.keywords.filter((k) => t.includes(k)).length;
    if (score > 0 && (!best || score > best.score)) best = { sample, score };
  }
  return best?.sample;
}
