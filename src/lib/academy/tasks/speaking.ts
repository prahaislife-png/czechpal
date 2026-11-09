import { CONTENT_CHECKED_ON } from '../make';
import type { SpeakingTask } from '../types';

/**
 * Speaking practice shaped like the exam's four tasks. Written for CzechLocal, never copied from a
 * real test. Nothing here is marked automatically: the learner records, plays it back, compares
 * with a model answer and checks it against the list.
 */

const meta = { version: 1, review: 'ai-checked', author: 'CzechLocal', licence: 'original', checkedOn: CONTENT_CHECKED_ON } as const;

const CHECKS = {
  1: [
    'Each answer is a full sentence with a verb',
    'The tense matches the question: past for the past',
    'I answered what was asked: kde, kdy, proč…',
    'I answered straight away, without long pauses',
  ],
  2: ['Each one was a question, not a statement', 'I used vy: máte, můžu, kolik stojí…', 'I asked a question of my own in each dialogue'],
  3: ['Every sentence is in the past tense', 'I talked about the person in the pictures, not about me', 'At least one sentence for each picture'],
  4: ['I offered all three pictures', 'I used ty: chceš, můžeme, pojďme…', 'I chose one and said why (protože…)'],
};

export const speakingTasks: SpeakingTask[] = [
  {
    ...meta,
    id: 's1-a',
    task: 1,
    title: 'Housing and free time',
    instructionCs: 'Odpovězte na otázky celou větou.',
    instruction: 'Answer each question straight away, in a full sentence, in the tense of the question.',
    objectives: ['t:housing:home', 't:free-time:hobbies', 'g:present', 'g:past', 'g:future'],
    parts: [
      {
        title: 'Bydlení · Housing',
        prompts: [
          { id: 's1-a.1', ask: 'Kde bydlíte?', en: 'Where do you live?', model: 'Bydlím v Praze na Žižkově.', tip: 'About you: bydlím, not bydlíte.' },
          { id: 's1-a.2', ask: 'S kým bydlíte?', en: 'Who do you live with?', model: 'Bydlím s rodinou, máme dvě děti.' },
          { id: 's1-a.3', ask: 'Jaký je váš byt?', en: 'What is your flat like?', model: 'Můj byt je malý, ale je světlý a má balkon.' },
          { id: 's1-a.4', ask: 'Kde jste bydlel/a předtím?', en: 'Where did you live before?', model: 'Předtím jsem bydlel/a v Brně.', tip: 'Past: jsem bydlel (a man) or jsem bydlela (a woman).' },
        ],
      },
      {
        title: 'Volný čas · Free time',
        prompts: [
          { id: 's1-a.5', ask: 'Co děláte rád/a ve volném čase?', en: 'What do you like doing in your free time?', model: 'Ve volném čase rád/a čtu a chodím na procházky.', tip: 'rád (a man) or ráda (a woman), then a verb.' },
          { id: 's1-a.6', ask: 'Jak často sportujete?', en: 'How often do you do sport?', model: 'Sportuju dvakrát týdně, chodím plavat.' },
          { id: 's1-a.7', ask: 'Co jste dělal/a minulý víkend?', en: 'What did you do last weekend?', model: 'Minulý víkend jsem byl/a na výletě v Kutné Hoře.', tip: 'The question is in the past, so answer in the past.' },
          { id: 's1-a.8', ask: 'Co budete dělat o víkendu?', en: 'What will you do at the weekend?', model: 'O víkendu budu odpočívat a vařit.', tip: 'Future: budu + an infinitive.' },
        ],
      },
    ],
    checklist: CHECKS[1],
  },
  {
    ...meta,
    id: 's1-b',
    task: 1,
    title: 'Food and work',
    instructionCs: 'Odpovězte na otázky celou větou.',
    instruction: 'Answer each question straight away, in a full sentence, in the tense of the question.',
    objectives: ['t:food:meals', 't:work:jobs', 'g:present', 'g:past', 'g:future'],
    parts: [
      {
        title: 'Jídlo · Food',
        prompts: [
          { id: 's1-b.1', ask: 'Co rád/a jíte?', en: 'What do you like to eat?', model: 'Rád/a jím těstoviny a zeleninu.' },
          { id: 's1-b.2', ask: 'Kde nakupujete jídlo?', en: 'Where do you buy food?', model: 'Jídlo nakupuju v supermarketu blízko domu.' },
          { id: 's1-b.3', ask: 'Co jste měl/a včera k večeři?', en: 'What did you have for dinner yesterday?', model: 'Včera jsem měl/a k večeři polévku a chleba.', tip: 'Past: jsem měl (a man) or jsem měla (a woman).' },
          { id: 's1-b.4', ask: 'Vaříte rád/a? Proč?', en: 'Do you like cooking? Why?', model: 'Ano, vařím rád/a, protože mě to baví.', tip: 'Proč? Answer with protože…' },
        ],
      },
      {
        title: 'Práce · Work',
        prompts: [
          { id: 's1-b.5', ask: 'Kde pracujete?', en: 'Where do you work?', model: 'Pracuju v kanceláři v centru Prahy.' },
          { id: 's1-b.6', ask: 'Jak jezdíte do práce?', en: 'How do you get to work?', model: 'Do práce jezdím tramvají.', tip: 'By tram, by bus: tramvají, autobusem.' },
          { id: 's1-b.7', ask: 'Kdy jste začal/a pracovat v Česku?', en: 'When did you start working in Czechia?', model: 'Začal/a jsem pracovat v Česku před dvěma lety.' },
          { id: 's1-b.8', ask: 'Co budete dělat zítra v práci?', en: 'What will you do at work tomorrow?', model: 'Zítra budu mít v práci poradu.', tip: 'Future: budu + an infinitive.' },
        ],
      },
    ],
    checklist: CHECKS[1],
  },
  {
    ...meta,
    id: 's2-a',
    task: 2,
    title: 'A language school and the station',
    instructionCs: 'Zeptejte se na informace z kartičky a položte jednu vlastní otázku.',
    instruction: 'Ask the questions on the card, then one of your own. You are talking to a stranger, so use vy.',
    register: 'vy',
    objectives: ['g:question-words', 'g:formal-informal', 't:education:course', 't:travel:train'],
    parts: [
      {
        title: 'A language school',
        situation: 'Jste v jazykové škole. Chcete chodit na kurz češtiny.',
        opening: 'Dobrý den, jak vám můžu pomoct?',
        prompts: [
          { id: 's2-a.1', cue: 'začátek kurzu?', en: 'When does the course start?', model: 'Kdy začíná kurz?', reply: 'Kurz začíná prvního října.' },
          { id: 's2-a.2', cue: 'cena?', en: 'How much is it?', model: 'Kolik stojí kurz?', reply: 'Kurz stojí pět tisíc korun.' },
          { id: 's2-a.3', cue: 'počet studentů?', en: 'How many students?', model: 'Kolik studentů je ve skupině?', reply: 'Ve skupině je osm studentů.' },
          { id: 's2-a.4', cue: 'vaše otázka', en: 'A question of your own about the course', model: 'Je kurz také večer?' },
        ],
      },
      {
        title: 'At the station',
        situation: 'Jste na nádraží. Chcete jet vlakem do Brna.',
        opening: 'Dobrý den, co si přejete?',
        prompts: [
          { id: 's2-a.5', cue: 'odjezd vlaku?', en: 'When does the train leave?', model: 'V kolik hodin jede vlak do Brna?', reply: 'Vlak jede v deset hodin dvacet minut.', tip: 'Say “V kolik hodin…”, not “V který čas…”.' },
          { id: 's2-a.6', cue: 'cena jízdenky?', en: 'How much is a ticket?', model: 'Kolik stojí jízdenka do Brna?', reply: 'Jízdenka stojí dvě stě dvacet korun.' },
          { id: 's2-a.7', cue: 'nástupiště?', en: 'Which platform?', model: 'Ze kterého nástupiště jede vlak?', reply: 'Vlak jede z nástupiště číslo dvě.' },
          { id: 's2-a.8', cue: 'vaše otázka', en: 'A question of your own about the journey', model: 'Musím v Pardubicích přestupovat?' },
        ],
      },
    ],
    checklist: CHECKS[2],
  },
  {
    ...meta,
    id: 's2-b',
    task: 2,
    title: 'The doctor and a clothes shop',
    instructionCs: 'Zeptejte se na informace z kartičky a položte jednu vlastní otázku.',
    instruction: 'Ask the questions on the card, then one of your own. You are talking to a stranger, so use vy.',
    register: 'vy',
    objectives: ['g:question-words', 'g:formal-informal', 't:health:doctor', 't:shopping:clothes'],
    parts: [
      {
        title: 'At the doctor’s',
        situation: 'Jste v ordinaci praktického lékaře. Chcete se objednat.',
        opening: 'Dobrý den, prosím?',
        prompts: [
          { id: 's2-b.1', cue: 'volný termín?', en: 'Is there a free appointment?', model: 'Máte volný termín tento týden?', reply: 'Ano, ve čtvrtek v devět hodin.' },
          { id: 's2-b.2', cue: 'ordinační hodiny?', en: 'When is the surgery open?', model: 'Kdy máte ordinační hodiny?', reply: 'Ordinujeme každý den od osmi do dvou.' },
          { id: 's2-b.3', cue: 'co přinést?', en: 'What should you bring?', model: 'Co mám přinést s sebou?', reply: 'Přineste kartičku pojišťovny.' },
          { id: 's2-b.4', cue: 'vaše otázka', en: 'A question of your own about the visit', model: 'Mluví pan doktor anglicky?' },
        ],
      },
      {
        title: 'In a clothes shop',
        situation: 'Jste v obchodě s oblečením. Chcete koupit bundu.',
        opening: 'Dobrý den, můžu vám pomoct?',
        prompts: [
          { id: 's2-b.5', cue: 'větší velikost?', en: 'Is there a bigger size?', model: 'Máte tuhle bundu ve větší velikosti?', reply: 'Ano, máme ji ve velikosti L.' },
          { id: 's2-b.6', cue: 'cena?', en: 'How much is it?', model: 'Kolik stojí tahle bunda?', reply: 'Stojí dva tisíce korun.' },
          { id: 's2-b.7', cue: 'platba kartou?', en: 'Can you pay by card?', model: 'Můžu platit kartou?', reply: 'Ano, samozřejmě.' },
          { id: 's2-b.8', cue: 'vaše otázka', en: 'A question of your own about the jacket', model: 'Kde je kabinka?' },
        ],
      },
    ],
    checklist: CHECKS[2],
  },
  {
    ...meta,
    id: 's3-a',
    task: 3,
    title: 'Pavel’s Saturday',
    instructionCs: 'Co dělal Pavel včera? Vyprávějte podle obrázků. Ke každému obrázku řekněte alespoň jednu větu.',
    instruction: 'Tell what Pavel did yesterday, from the pictures, in the past tense. At least one sentence per picture.',
    objectives: ['g:past', 't:routine:day'],
    parts: [
      {
        prompts: [
          { id: 's3-a.1', icon: 'sun', cue: 'Obrázek 1', en: 'Got up at seven', model: 'Ráno Pavel vstal v sedm hodin.', tip: 'About Pavel: vstal, with no jsem.' },
          { id: 's3-a.2', icon: 'run', cue: 'Obrázek 2', en: 'Went running in the park', model: 'Potom běhal v parku.' },
          { id: 's3-a.3', icon: 'cart', cue: 'Obrázek 3', en: 'Did the shopping', model: 'Odpoledne nakoupil v supermarketu.' },
          { id: 's3-a.4', icon: 'film', cue: 'Obrázek 4', en: 'Cinema with a friend in the evening', model: 'Večer šel s kamarádkou do kina.' },
        ],
      },
    ],
    checklist: CHECKS[3],
  },
  {
    ...meta,
    id: 's3-b',
    task: 3,
    title: 'Jana’s day',
    instructionCs: 'Co dělala Jana včera? Vyprávějte podle obrázků. Ke každému obrázku řekněte alespoň jednu větu.',
    instruction: 'Tell what Jana did yesterday, from the pictures, in the past tense. At least one sentence per picture.',
    objectives: ['g:past', 't:routine:day', 't:work:jobs'],
    parts: [
      {
        prompts: [
          { id: 's3-b.1', icon: 'work', cue: 'Obrázek 1', en: 'Worked in the office', model: 'Ráno Jana pracovala v kanceláři.', tip: 'About Jana: pracovala, with -la for a woman.' },
          { id: 's3-b.2', icon: 'cup', cue: 'Obrázek 2', en: 'Coffee with a colleague at noon', model: 'V poledne pila kávu s kolegyní.' },
          { id: 's3-b.3', icon: 'tram', cue: 'Obrázek 3', en: 'Went home by tram', model: 'Odpoledne jela domů tramvají.' },
          { id: 's3-b.4', icon: 'food', cue: 'Obrázek 4', en: 'Cooked dinner', model: 'Večer uvařila večeři pro rodinu.' },
        ],
      },
    ],
    checklist: CHECKS[3],
  },
  {
    ...meta,
    id: 's4-a',
    task: 4,
    title: 'Plans for Saturday',
    instructionCs: 'Domluvte se s kamarádem, co budete dělat v sobotu. Nabídněte všechny tři možnosti a jednu vyberte.',
    instruction: 'Agree with a friend what to do on Saturday. Offer each picture, choose one and say why. Use ty.',
    register: 'ty',
    objectives: ['g:formal-informal', 'g:modals', 't:free-time:plans'],
    parts: [
      {
        opening: 'Ahoj! Co budeme dělat v sobotu?',
        prompts: [
          { id: 's4-a.1', icon: 'film', cue: 'Navrhněte kino.', en: 'Suggest the cinema', model: 'Můžeme jít do kina.', reply: 'Do kina? V kině jsem byl minulý týden.' },
          { id: 's4-a.2', icon: 'swim', cue: 'Navrhněte bazén.', en: 'Suggest the swimming pool', model: 'Nebo můžeme jít plavat do bazénu.', reply: 'Hm, v sobotu je v bazénu moc lidí.' },
          { id: 's4-a.3', icon: 'tree', cue: 'Navrhněte výlet.', en: 'Suggest a trip to the woods', model: 'Tak pojeďme na výlet do lesa.', reply: 'Dobře. Proč na výlet?' },
          { id: 's4-a.4', cue: 'Řekněte proč.', en: 'Say why', model: 'Protože má být hezky a v lese je klid.', reply: 'Tak jo, v sobotu jedeme na výlet!' },
        ],
      },
    ],
    checklist: CHECKS[4],
  },
  {
    ...meta,
    id: 's4-b',
    task: 4,
    title: 'A present for Eva',
    instructionCs: 'Domluvte se s kamarádkou, jaký dárek koupíte Evě k narozeninám. Nabídněte všechny tři možnosti a jednu vyberte.',
    instruction: 'Agree with a friend on a birthday present for Eva. Offer each picture, choose one and say why. Use ty.',
    register: 'ty',
    objectives: ['g:formal-informal', 'g:pronouns', 't:shopping:gifts', 't:social:friends'],
    parts: [
      {
        opening: 'Ahoj, Eva má v pátek narozeniny. Co jí koupíme?',
        prompts: [
          { id: 's4-b.1', icon: 'book', cue: 'Navrhněte knihu.', en: 'Suggest a book', model: 'Můžeme jí koupit knihu.', reply: 'Knihu? Eva moc nečte.' },
          { id: 's4-b.2', icon: 'flower', cue: 'Navrhněte květiny.', en: 'Suggest flowers', model: 'Nebo jí můžeme koupit květiny.', reply: 'Květiny jsou hezké, ale brzy uvadnou.' },
          { id: 's4-b.3', icon: 'cup', cue: 'Navrhněte hrnek.', en: 'Suggest a mug', model: 'Tak jí kupme hezký hrnek.', reply: 'Hrnek? Proč hrnek?' },
          { id: 's4-b.4', cue: 'Řekněte proč.', en: 'Say why', model: 'Protože Eva ráda pije čaj a hrnek bude mít každý den.', reply: 'Dobře, koupíme hrnek.' },
        ],
      },
    ],
    checklist: CHECKS[4],
  },
  {
    ...meta,
    id: 's1-c',
    task: 1,
    title: 'Family and the weather',
    instructionCs: 'Odpovězte na otázky celou větou.',
    instruction: 'Answer each question straight away, in a full sentence, in the tense of the question.',
    objectives: ['t:personal:family', 't:weather:today', 'g:present', 'g:past', 'g:future'],
    parts: [
      {
        title: 'Rodina · Family',
        prompts: [
          { id: 's1-c.1', ask: 'Máte sourozence?', en: 'Do you have brothers or sisters?', model: 'Ano, mám jednoho bratra a dvě sestry.' },
          { id: 's1-c.2', ask: 'Kde bydlí vaše rodina?', en: 'Where does your family live?', model: 'Moje rodina bydlí na Ukrajině ve Lvově.', tip: 'About them: bydlí, not bydlím.' },
          { id: 's1-c.3', ask: 'Co jste dělal/a s rodinou naposledy?', en: 'What did you last do with your family?', model: 'Naposledy jsme byli spolu na večeři v restauraci.', tip: 'Past: jsme byli (we were).' },
          { id: 's1-c.4', ask: 'Kdy uvidíte rodinu?', en: 'When will you see your family?', model: 'Rodinu uvidím v létě, pojedu domů na dovolenou.', tip: 'Future: uvidím, pojedu.' },
        ],
      },
      {
        title: 'Počasí · Weather',
        prompts: [
          { id: 's1-c.5', ask: 'Jaké je dnes počasí?', en: 'What’s the weather like today?', model: 'Dnes je hezky a svítí slunce.' },
          { id: 's1-c.6', ask: 'Které roční období máte nejradši?', en: 'Which season do you like best?', model: 'Nejradši mám jaro, protože je teplo a všechno kvete.' },
          { id: 's1-c.7', ask: 'Jaké počasí bylo včera?', en: 'What was the weather like yesterday?', model: 'Včera bylo chladno a celý den pršelo.', tip: 'Past: bylo, pršelo.' },
          { id: 's1-c.8', ask: 'Co budete dělat, když bude pršet?', en: 'What will you do if it rains?', model: 'Když bude pršet, zůstanu doma a budu číst.', tip: 'Future: zůstanu, budu číst.' },
        ],
      },
    ],
    checklist: CHECKS[1],
  },
  {
    ...meta,
    id: 's2-c',
    task: 2,
    title: 'A gym and a flat to rent',
    instructionCs: 'Zeptejte se na informace z kartičky a položte jednu vlastní otázku.',
    instruction: 'Ask the questions on the card, then one of your own. You are talking to a stranger, so use vy.',
    register: 'vy',
    objectives: ['g:question-words', 'g:formal-informal', 't:free-time:sport', 't:housing:rent'],
    parts: [
      {
        title: 'At a gym',
        situation: 'Jste ve fitness centru. Chcete tam chodit cvičit.',
        opening: 'Dobrý den, co pro vás můžu udělat?',
        prompts: [
          { id: 's2-c.1', cue: 'otevírací doba?', en: 'When is it open?', model: 'Kdy máte otevřeno?', reply: 'Máme otevřeno každý den od šesti do deseti večer.' },
          { id: 's2-c.2', cue: 'cena za měsíc?', en: 'How much is a month?', model: 'Kolik stojí permanentka na měsíc?', reply: 'Měsíční permanentka stojí devět set korun.' },
          { id: 's2-c.3', cue: 'sprchy?', en: 'Are there showers?', model: 'Jsou tady sprchy?', reply: 'Ano, sprchy a šatny jsou dole.' },
          { id: 's2-c.4', cue: 'vaše otázka', en: 'A question of your own about the gym', model: 'Máte taky skupinové lekce?' },
        ],
      },
      {
        title: 'A flat to rent',
        situation: 'Voláte majiteli bytu z inzerátu. Chcete si byt pronajmout.',
        opening: 'Prosím, Dvořák.',
        prompts: [
          { id: 's2-c.5', cue: 'nájem?', en: 'How much is the rent?', model: 'Kolik je nájem?', reply: 'Nájem je osmnáct tisíc korun měsíčně.' },
          { id: 's2-c.6', cue: 'energie?', en: 'How much are the bills?', model: 'Kolik se platí za energie?', reply: 'Energie jsou asi tři tisíce měsíčně.' },
          { id: 's2-c.7', cue: 'prohlídka?', en: 'When can you see the flat?', model: 'Kdy si můžu byt prohlédnout?', reply: 'Můžete přijít zítra v pět.' },
          { id: 's2-c.8', cue: 'vaše otázka', en: 'A question of your own about the flat', model: 'Můžu mít v bytě psa?' },
        ],
      },
    ],
    checklist: CHECKS[2],
  },
  {
    ...meta,
    id: 's3-c',
    task: 3,
    title: 'Lucie’s Sunday',
    instructionCs: 'Co dělala Lucie v neděli? Vyprávějte podle obrázků. Ke každému obrázku řekněte alespoň jednu větu.',
    instruction: 'Tell what Lucie did on Sunday, from the pictures, in the past tense. At least one sentence per picture.',
    objectives: ['g:past', 't:free-time:weekend'],
    parts: [
      {
        prompts: [
          { id: 's3-c.1', icon: 'bike', cue: 'Obrázek 1', en: 'Cycled to the river in the morning', model: 'Ráno Lucie jela na kole k řece.', tip: 'About Lucie: jela, with -la for a woman.' },
          { id: 's3-c.2', icon: 'food', cue: 'Obrázek 2', en: 'Had lunch at her parents’', model: 'V poledne obědvala u rodičů.' },
          { id: 's3-c.3', icon: 'book', cue: 'Obrázek 3', en: 'Read a book in the afternoon', model: 'Odpoledne četla knihu na balkoně.' },
          { id: 's3-c.4', icon: 'phone', cue: 'Obrázek 4', en: 'Called a friend in the evening', model: 'Večer volala kamarádce a potom šla spát.' },
        ],
      },
    ],
    checklist: CHECKS[3],
  },
  {
    ...meta,
    id: 's4-c',
    task: 4,
    title: 'Lunch with a colleague',
    instructionCs: 'Domluvte se s kolegou, kam půjdete na oběd. Nabídněte všechny tři možnosti a jednu vyberte.',
    instruction: 'Agree with a colleague where to go for lunch. Offer each picture, choose one and say why. Use ty.',
    register: 'ty',
    objectives: ['g:formal-informal', 'g:modals', 't:food:restaurant', 't:work:colleagues'],
    parts: [
      {
        opening: 'Ahoj, půjdeme spolu na oběd?',
        prompts: [
          { id: 's4-c.1', icon: 'food', cue: 'Navrhněte restauraci.', en: 'Suggest the restaurant', model: 'Můžeme jít do restaurace naproti.', reply: 'Tam vaří dobře, ale vždycky dlouho čekáme.' },
          { id: 's4-c.2', icon: 'cup', cue: 'Navrhněte kavárnu.', en: 'Suggest the café', model: 'Nebo můžeme jít do kavárny na bagetu.', reply: 'Bagetu jsem měl už včera.' },
          { id: 's4-c.3', icon: 'tree', cue: 'Navrhněte park.', en: 'Suggest eating in the park', model: 'Tak si kupme jídlo a pojďme do parku.', reply: 'Do parku? Proč?' },
          { id: 's4-c.4', cue: 'Řekněte proč.', en: 'Say why', model: 'Protože je hezky a celý den sedíme v kanceláři.', reply: 'Máš pravdu, jdeme do parku!' },
        ],
      },
    ],
    checklist: CHECKS[4],
  },
];

export const speakingTaskById = (id: string | undefined) => speakingTasks.find((t) => t.id === id);

export const speakingPrompts = (task: SpeakingTask) => task.parts.flatMap((p) => p.prompts);

/**
 * What the device voice reads. Questions and models are written for both genders ("bydlel/a",
 * "rád/a"); the voice reads the first form.
 */
export const spoken = (text: string) => text.replace(/\/a\b/g, '');
