import type { GrammarItem } from './types';

/**
 * Grammar foundations: short, practical explanations with examples, in the order learners need
 * them. Written for CzechLocal and checked by AI on 2026-11-06; not reviewed by a teacher.
 * Tips marked with the exam come from the organiser's guide "Na co si dát pozor" (2026).
 */
const meta = { review: 'ai-checked', checkedOn: '2026-11-06' } as const;

export const grammar: GrammarItem[] = [
  {
    id: 'pronunciation',
    title: 'Letters and sounds',
    explain:
      'Czech is read as it’s written. A háček changes the sound (č = ch, š = sh, ž = like the s in “measure”, ř = a rolled r with ž). A čárka or a ring makes a vowel long (á, é, í, ó, ú, ů, ý). The stress is always on the first syllable.',
    examples: [
      { cs: 'čaj', en: 'tea' },
      { cs: 'škola', en: 'school' },
      { cs: 'řeka', en: 'river' },
      { cs: 'dům', en: 'house' },
    ],
    ...meta,
  },
  {
    id: 'question-words',
    title: 'Question words',
    explain:
      'Most questions start with a question word. In the exam, your answer must fit it: kde asks where, kdy when, kam where to, odkud where from, proč why, kolik how much or how many.',
    examples: [
      { cs: 'Kde bydlíte?', en: 'Where do you live?' },
      { cs: 'Odkud jste?', en: 'Where are you from?' },
      { cs: 'Kam jedete?', en: 'Where are you going?' },
      { cs: 'V kolik hodin začíná kurz?', en: 'What time does the course start?' },
    ],
    watchOut: 'To ask the time, say “V kolik hodin…?”, not “V který čas…?” or “Kolik čas…?”.',
    ...meta,
  },
  {
    id: 'gender',
    title: 'Masculine, feminine, neuter',
    explain:
      'Every noun has a gender. As a rule of thumb: a consonant at the end is usually masculine (dům, stůl), -a is usually feminine (žena, káva), -o is neuter (okno, auto). The gender decides the form of adjectives and the past tense.',
    examples: [
      { cs: 'ten dům', en: 'that house (masculine)' },
      { cs: 'ta káva', en: 'that coffee (feminine)' },
      { cs: 'to okno', en: 'that window (neuter)' },
    ],
    ...meta,
  },
  {
    id: 'plural',
    title: 'One, two, five',
    explain:
      'After 2, 3 and 4 a noun takes one plural form; from 5 on it takes another. Learn the three forms together for words you use with numbers.',
    examples: [
      { cs: 'jeden rohlík – dva rohlíky – pět rohlíků', en: 'one roll – two rolls – five rolls' },
      { cs: 'jedna káva – dvě kávy – pět káv', en: 'one coffee – two coffees – five coffees' },
      { cs: 'jedna koruna – dvě koruny – pět korun', en: 'one crown – two crowns – five crowns' },
    ],
    ...meta,
  },
  {
    id: 'cases',
    title: 'Word endings in everyday phrases',
    explain:
      'Czech nouns change their ending with their role in the sentence. You don’t need tables to start: learn whole phrases. After “mám” or “chci” a feminine -a becomes -u; after “do” you use one ending, after “v” another.',
    examples: [
      { cs: 'Chci kávu.', en: 'I want a coffee. (káva → kávu)' },
      { cs: 'Jdu do obchodu.', en: 'I’m going to the shop. (obchod → do obchodu)' },
      { cs: 'Bydlím v Praze.', en: 'I live in Prague. (Praha → v Praze)' },
      { cs: 'Jedu s kamarádem.', en: 'I’m going with a friend. (kamarád → s kamarádem)' },
    ],
    ...meta,
  },
  {
    id: 'adjectives',
    title: 'Adjectives agree',
    explain: 'An adjective takes the gender of its noun: -ý for masculine, -á for feminine, -é for neuter.',
    examples: [
      { cs: 'velký byt', en: 'a big flat' },
      { cs: 'velká kuchyň', en: 'a big kitchen' },
      { cs: 'velké okno', en: 'a big window' },
    ],
    ...meta,
  },
  {
    id: 'pronouns',
    title: 'I, you, my, your',
    explain:
      'Já, ty, on, ona, ono, my, vy, oni. You often leave them out, because the verb already says who: “Bydlím v Praze” means “I live in Prague”. Possessives agree like adjectives: můj bratr, moje sestra.',
    examples: [
      { cs: 'To je můj bratr.', en: 'This is my brother.' },
      { cs: 'To je moje sestra.', en: 'This is my sister.' },
      { cs: 'Váš pas, prosím.', en: 'Your passport, please.' },
    ],
    ...meta,
  },
  {
    id: 'present',
    title: 'The present tense',
    explain:
      'Verbs change their ending for each person. Most follow one of three patterns: dělat → dělám, mluvit → mluvím, psát → píšu. The ending alone tells who does it.',
    examples: [
      { cs: 'Dělám, děláš, dělá, děláme, děláte, dělají.', en: 'I do, you do, he/she does, we do, you do, they do.' },
      { cs: 'Mluvím trochu česky.', en: 'I speak a little Czech.' },
      { cs: 'Píšu e-mail.', en: 'I’m writing an e-mail.' },
    ],
    ...meta,
  },
  {
    id: 'past',
    title: 'The past tense',
    explain:
      'Take the verb, change the ending to -l, -la or -li, and add jsem or jsi for “I” and “you”. The ending follows who did it: a man says “byl jsem”, a woman “byla jsem”. For he, she and they there is no jsem: “Petr byl doma.”',
    examples: [
      { cs: 'Včera jsem byl v kině.', en: 'Yesterday I was at the cinema. (a man)' },
      { cs: 'Včera jsem byla v kině.', en: 'Yesterday I was at the cinema. (a woman)' },
      { cs: 'Otec a syn koupili televizi.', en: 'The father and son bought a television.' },
    ],
    watchOut: 'In the exam, a question in the past needs an answer in the past: “Co jste dělal včera?” → “Včera jsem pracoval.”',
    ...meta,
  },
  {
    id: 'future',
    title: 'The future',
    explain:
      'Two ways: “budu” + an infinitive for something ongoing (budu pracovat), or a completing verb in the present form, which already means the future (zítra koupím chleba). For going somewhere: půjdu (on foot), pojedu (by transport).',
    examples: [
      { cs: 'Zítra budu pracovat.', en: 'Tomorrow I’ll be working.' },
      { cs: 'Zítra koupím chleba.', en: 'Tomorrow I’ll buy bread.' },
      { cs: 'V sobotu pojedu do Brna.', en: 'On Saturday I’ll go to Brno.' },
    ],
    ...meta,
  },
  {
    id: 'aspect',
    title: 'Two verbs for one action',
    explain:
      'Most actions have a pair of verbs: one for doing it (kupovat, psát) and one for getting it done (koupit, napsat). Use the first for habits and processes, the second for a single finished result.',
    examples: [
      { cs: 'Každý den kupuju chleba.', en: 'I buy bread every day.' },
      { cs: 'Včera jsem koupil chleba.', en: 'Yesterday I bought bread.' },
      { cs: 'Píšu dopis. – Napsal jsem dopis.', en: 'I’m writing a letter. – I’ve written the letter.' },
    ],
    ...meta,
  },
  {
    id: 'modals',
    title: 'Want, can, must',
    explain: 'Chtít (want), moct (can), muset (must) and mít (should) take a second verb in the infinitive.',
    examples: [
      { cs: 'Chci platit kartou.', en: 'I want to pay by card.' },
      { cs: 'Můžu jít domů?', en: 'Can I go home?' },
      { cs: 'Musím jít k lékaři.', en: 'I have to go to the doctor.' },
      { cs: 'Mám zavolat zítra?', en: 'Should I call tomorrow?' },
    ],
    ...meta,
  },
  {
    id: 'negation',
    title: 'Saying no',
    explain: 'Put ne- in front of the verb, written together: mám → nemám. With nikdo, nic or nikdy the verb is negative too.',
    examples: [
      { cs: 'Nemám čas.', en: 'I don’t have time.' },
      { cs: 'Nerozumím.', en: 'I don’t understand.' },
      { cs: 'Nikdo nepřišel.', en: 'Nobody came.' },
    ],
    ...meta,
  },
  {
    id: 'prepositions',
    title: 'In, at, to, from',
    explain:
      'Where you are: v (ve) or na. Where you’re going: do or na. Where from: z (ze). To a person: k. Each one is followed by its own ending, so learn them with the place.',
    examples: [
      { cs: 'Jsem v práci. – Jdu do práce.', en: 'I’m at work. – I’m going to work.' },
      { cs: 'Jsem na poště. – Jdu na poštu.', en: 'I’m at the post office. – I’m going to the post office.' },
      { cs: 'Jsem z Vietnamu.', en: 'I’m from Vietnam.' },
      { cs: 'Jdu k lékaři.', en: 'I’m going to the doctor.' },
    ],
    ...meta,
  },
  {
    id: 'numbers',
    title: 'Numbers and prices',
    explain:
      'Jedna/jeden, dva/dvě, tři, čtyři, pět… The word for crowns changes like any noun: jedna koruna, dvě koruny, pět korun.',
    examples: [
      { cs: 'Kolik to stojí?', en: 'How much is it?' },
      { cs: 'Stojí to sto dvacet korun.', en: 'It costs a hundred and twenty crowns.' },
      { cs: 'Dvě kávy, prosím.', en: 'Two coffees, please.' },
    ],
    ...meta,
  },
  {
    id: 'time',
    title: 'Times and days',
    explain: 'At a time: v + the hour (v osm hodin, ve tři hodiny). On a day: v pondělí, v úterý, ve středu, ve čtvrtek, v pátek, v sobotu, v neděli.',
    examples: [
      { cs: 'V kolik hodin? – V osm hodin.', en: 'At what time? – At eight.' },
      { cs: 'Přijdu ve středu ve tři hodiny.', en: 'I’ll come on Wednesday at three.' },
      { cs: 'Pracuju od pondělí do pátku.', en: 'I work from Monday to Friday.' },
    ],
    ...meta,
  },
  {
    id: 'word-order',
    title: 'Word order',
    explain:
      'Word order is free, but small words like jsem, se and si go second in the sentence: “Včera jsem byl v kině”, “Jmenuju se Ana”. Start a sentence with a capital letter and end it with a full stop: the exam checks this.',
    examples: [
      { cs: 'Včera jsem byl v kině.', en: 'Yesterday I was at the cinema.' },
      { cs: 'Jmenuju se Ana.', en: 'My name is Ana.' },
      { cs: 'V sobotu se učím česky.', en: 'On Saturdays I study Czech.' },
    ],
    ...meta,
  },
  {
    id: 'formal-informal',
    title: 'Ty and vy',
    explain:
      'Say vy to people you don’t know, at an office or in a shop (máte, jste); ty to friends, family and children (máš, jsi). In the exam, the dialogues in task 2 are formal (vy) and the choice in task 4 is with a friend (ty).',
    examples: [
      { cs: 'Máte čas? – Máš čas?', en: 'Do you have time? (formal – informal)' },
      { cs: 'Dobrý den. – Ahoj.', en: 'Hello. (formal – informal)' },
      { cs: 'Na shledanou. – Čau.', en: 'Goodbye. (formal – informal)' },
    ],
    ...meta,
  },
];

export const grammarById = (id: string | undefined) => grammar.find((g) => g.id === id);
