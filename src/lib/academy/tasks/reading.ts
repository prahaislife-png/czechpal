import { CONTENT_CHECKED_ON } from '../make';
import type { TaskSet } from '../types';

/**
 * Reading practice shaped like the exam's five reading tasks. Every text is written for
 * CzechLocal; the formats follow the organiser's description, the content isn't taken from any test.
 */

const meta = { version: 1, review: 'ai-checked', author: 'CzechLocal', licence: 'original', checkedOn: CONTENT_CHECKED_ON } as const;

export const readingSets: TaskSet[] = [
  {
    ...meta,
    id: 'r1-a',
    part: 'reading',
    task: 1,
    title: 'Messages and replies',
    instruction: 'Read the five messages. For each one choose the reply that fits, A–G. Two replies are extra.',
    level: 'A2',
    topic: 'social',
    objectives: ['t:social:contact', 'g:question-words'],
    choices: [
      { text: 'Samozřejmě, pošlu ji ještě dnes odpoledne.' },
      { text: 'Vlak jede z druhého nástupiště.' },
      { text: 'Ráda, ale v sobotu pracuju. Co třeba v neděli?' },
      { text: 'Jednosměrná jízdenka stojí 250 korun.' },
      { text: 'Děkuju, polévka byla výborná.' },
      { text: 'To nevadí, uzdrav se! Uvidíme se příští týden.' },
      { text: 'Bohužel ne, byt už je pronajatý.' },
    ],
    items: [
      { id: 'r1-a.1', prompt: 'Which reply fits?', text: 'Ahoj, nechceš jít v sobotu do kina? Hrají novou komedii.', answer: 2, explain: 'An invitation for Saturday: the reply says she works on Saturday and suggests Sunday.' },
      { id: 'r1-a.2', prompt: 'Which reply fits?', text: 'Dobrý den, je ten byt na Smíchově ještě volný?', answer: 6, explain: 'A question about the flat: “byt už je pronajatý” – it’s already rented.' },
      { id: 'r1-a.3', prompt: 'Which reply fits?', text: 'Promiň, dnes nepřijdu, jsem nemocná.', answer: 5, explain: 'She is ill (nemocná): “uzdrav se” means get well.' },
      { id: 'r1-a.4', prompt: 'Which reply fits?', text: 'Kolik stojí jízdenka do Brna?', answer: 3, explain: 'Kolik stojí = how much: the reply gives a price. The platform reply is about trains too, but doesn’t answer “how much”.' },
      { id: 'r1-a.5', prompt: 'Which reply fits?', text: 'Můžete mi poslat fakturu e-mailem?', answer: 0, explain: 'A request to send an invoice (fakturu): “pošlu ji” – I’ll send it.' },
    ],
  },
  {
    ...meta,
    id: 'r2-a',
    part: 'reading',
    task: 2,
    title: 'A new library',
    instruction: 'Read the text. For each question choose one answer, A–D.',
    level: 'A2',
    topic: 'education',
    objectives: ['g:time', 'g:numbers'],
    passage:
      'Městská knihovna otevírá v pondělí 2. března novou pobočku v Praze 9, v ulici Sokolovská 100. Knihovna bude otevřená od pondělí do pátku od 10 do 19 hodin, v sobotu od 9 do 13 hodin. V neděli je zavřeno. Čtenářský průkaz stojí pro dospělé 100 korun na rok, děti do 15 let ho mají zdarma. V knihovně jsou knihy v češtině, angličtině a ukrajinštině. Každé úterý v 17 hodin je kurz češtiny pro cizince. Kurz je zdarma, ale musíte se přihlásit na webu knihovny.',
    items: [
      { id: 'r2-a.6', prompt: 'Kdy se nová knihovna otevře?', options: ['v sobotu 2. března', 'v neděli', 'v pondělí 2. března', 'v úterý v 17 hodin'], answer: 2, explain: '“Otevírá v pondělí 2. března” – it opens on Monday 2 March.' },
      { id: 'r2-a.7', prompt: 'V kolik hodin knihovna v sobotu zavírá?', options: ['ve 13 hodin', 'v 19 hodin', 'v 10 hodin', 'v 9 hodin'], answer: 0, explain: 'On Saturday it’s open from 9 to 13.' },
      { id: 'r2-a.8', prompt: 'Kolik zaplatí za průkaz dítě, kterému je deset let?', options: ['100 korun', '50 korun', 'nic', '200 korun'], answer: 2, explain: 'Children under 15 get it free (zdarma).' },
      { id: 'r2-a.9', prompt: 'Jaké knihy v knihovně nejsou?', options: ['české', 'německé', 'anglické', 'ukrajinské'], answer: 1, explain: 'Czech, English and Ukrainian books – no German ones.' },
      { id: 'r2-a.10', prompt: 'Co musíte udělat, když chcete chodit na kurz češtiny?', options: ['zaplatit 100 korun', 'přijít v sobotu', 'koupit si knihu', 'přihlásit se na webu'], answer: 3, explain: '“Musíte se přihlásit na webu knihovny” – sign up on the library’s website.' },
    ],
  },
  {
    ...meta,
    id: 'r3-a',
    part: 'reading',
    task: 3,
    title: 'Offers and people',
    instruction: 'Read the four texts and what you know about five people. For each text choose the person it suits, A–E. One person is extra.',
    level: 'A2',
    topic: 'free-time',
    objectives: ['t:free-time:hobbies', 't:work:jobs'],
    choices: [
      { text: 'Marta hledá práci na odpoledne. Ráno vodí děti do školy.' },
      { text: 'Pavel chce v létě jezdit na kole, ale kolo nemá.' },
      { text: 'Olena se chce naučit vařit česká jídla.' },
      { text: 'Jan potřebuje opravit pračku.' },
      { text: 'Lucie hledá levný byt blízko centra.' },
    ],
    items: [
      { id: 'r3-a.11', prompt: 'Who is this for?', text: 'Půjčovna kol Vltava: kola na den, na víkend i na celý měsíc. Otevřeno od dubna do října.', answer: 1, explain: 'A bike hire (půjčovna kol) open in summer: Pavel has no bike.' },
      { id: 'r3-a.12', prompt: 'Who is this for?', text: 'Kavárna U Mostu hledá pomocnou sílu. Pracovní doba od 14 do 20 hodin, možný i zkrácený úvazek.', answer: 0, explain: 'Work from 14:00: Marta can work in the afternoon.' },
      { id: 'r3-a.13', prompt: 'Who is this for?', text: 'Kurz domácí kuchyně: guláš, svíčková, knedlíky. Každou středu večer, čtyři lekce.', answer: 2, explain: 'A course in Czech home cooking: Olena.' },
      { id: 'r3-a.14', prompt: 'Who is this for?', text: 'Servis spotřebičů: opravíme lednice, pračky a myčky do 48 hodin. Přijedeme k vám domů.', answer: 3, explain: 'Repairs of washing machines (pračky): Jan. Lucie is the extra person.' },
    ],
  },
  {
    ...meta,
    id: 'r4-a',
    part: 'reading',
    task: 4,
    title: 'The right word',
    instruction: 'Read each short text and choose the word that fits the gap, A–D.',
    level: 'A2',
    objectives: ['g:cases', 'g:past', 'g:present', 'g:prepositions'],
    items: [
      { id: 'r4-a.15', prompt: 'Choose the word for the gap.', text: 'Dobrý den, chtěla bych se ___ k zubaři na pátek.', options: ['objednám', 'objednat', 'objednávka', 'objednaná'], answer: 1, explain: 'After chtěla bych comes an infinitive: objednat se.' },
      { id: 'r4-a.16', prompt: 'Choose the word for the gap.', text: 'Včera jsme ___ v restauraci U Zlatého lva.', options: ['večeříme', 'večeřet', 'budeme večeřet', 'večeřeli'], answer: 3, explain: 'Včera (yesterday) + jsme: the past tense, večeřeli.' },
      { id: 'r4-a.17', prompt: 'Choose the word for the gap.', text: 'V kuchyni máme stůl a čtyři ___.', options: ['židle', 'židlí', 'židli', 'židlemi'], answer: 0, explain: 'After čtyři: židle (the same form as one chair, plural).' },
      { id: 'r4-a.18', prompt: 'Choose the word for the gap.', text: 'Bydlím ___ Brně už pět let.', options: ['na', 'v', 'do', 'z'], answer: 1, explain: 'Where you live in a city: v Brně.' },
      { id: 'r4-a.19', prompt: 'Choose the word for the gap.', text: 'Prosím vás, kde je tady nejbližší ___?', options: ['lékárně', 'lékárnou', 'lékárna', 'lékárnu'], answer: 2, explain: 'Kde je…? asks for the basic form: lékárna.' },
      { id: 'r4-a.20', prompt: 'Choose the word for the gap.', text: 'Moje sestra ___ v nemocnici jako zdravotní sestra.', options: ['pracuju', 'pracuje', 'pracovat', 'pracujou'], answer: 1, explain: 'Moje sestra is she: pracuje.' },
    ],
  },
  {
    ...meta,
    id: 'r5-a',
    part: 'reading',
    task: 5,
    title: 'A note from school',
    instruction: 'Read the text. Write one piece of information for each item.',
    level: 'A2',
    topic: 'education',
    objectives: ['g:time', 'g:numbers'],
    passage:
      'Vážení rodiče, třídní schůzky budou ve čtvrtek 14. listopadu od 17 hodin ve třídě číslo 12 ve druhém patře. Paní učitelka bude mluvit o školním výletě do Kutné Hory. Výlet stojí 450 korun. Peníze prosím pošlete do konce listopadu. S pozdravem Petra Nováková, třídní učitelka',
    items: [
      { id: 'r5-a.21', prompt: 'Den třídních schůzek:', accept: ['ve čtvrtek', 'čtvrtek', 've čtvrtek 14. listopadu', 'čtvrtek 14. listopadu', '14. listopadu', '14. 11.'], explain: '“Ve čtvrtek 14. listopadu.”' },
      { id: 'r5-a.22', prompt: 'Začátek (v kolik hodin):', accept: ['v 17 hodin', '17 hodin', '17', 'v 17', '17:00', 'v 17:00', 'od 17 hodin', 'v sedmnáct hodin'], explain: '“Od 17 hodin.”' },
      { id: 'r5-a.23', prompt: 'Číslo třídy:', accept: ['12', 'dvanáct', 'číslo 12', 'třída 12', 'třída číslo 12', 've třídě 12', 've třídě číslo 12'], explain: '“Ve třídě číslo 12.”' },
      { id: 'r5-a.24', prompt: 'Kam pojede třída na výlet?', accept: ['do Kutné Hory', 'Kutná Hora', 'Kutné Hory'], explain: '“Výlet do Kutné Hory.”' },
      { id: 'r5-a.25', prompt: 'Cena výletu:', accept: ['450 korun', '450 Kč', '450', 'čtyři sta padesát korun'], explain: '“Výlet stojí 450 korun.”' },
    ],
  },
];
