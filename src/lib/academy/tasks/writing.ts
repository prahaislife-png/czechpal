import { CONTENT_CHECKED_ON } from '../make';
import type { WritingTask } from '../types';

/** Writing practice shaped like the exam's form and e-mail. Written for CzechLocal. */

const meta = { version: 1, review: 'ai-checked', author: 'CzechLocal', licence: 'original', checkedOn: CONTENT_CHECKED_ON } as const;

export const writingTasks: WritingTask[] = [
  {
    ...meta,
    id: 'w1-a',
    kind: 'form',
    title: 'Form: a Czech course',
    instructionCs: 'Vyplňte formulář. Odpovídejte celými větami. Každá odpověď musí mít alespoň 10 slov.',
    instruction: 'Fill in the form. Answer in full sentences, at least 10 words each.',
    questions: ['Proč se chcete učit česky?', 'Kde a jak dlouho bydlíte v České republice?', 'Kdy máte čas na kurz a proč?'],
    sample: [
      'Chci se učit česky, protože tady pracuju a chci mluvit s kolegy.',
      'Bydlím v Praze na Smíchově už tři roky s manželem a dcerou.',
      'Mám čas v úterý a ve čtvrtek večer, protože ráno chodím do práce.',
    ],
  },
  {
    ...meta,
    id: 'w1-b',
    kind: 'form',
    title: 'Form: a sports club',
    instructionCs: 'Vyplňte formulář. Odpovídejte celými větami. Každá odpověď musí mít alespoň 10 slov.',
    instruction: 'Fill in the form. Answer in full sentences, at least 10 words each.',
    questions: ['Jaký sport děláte rád/a a proč?', 'Kdy jste naposledy sportoval/a a co jste dělal/a?', 'Co chcete v našem klubu dělat?'],
    sample: [
      'Rád plavu a jezdím na kole, protože je to zdravé a baví mě to.',
      'Naposledy jsem sportoval minulou sobotu, jel jsem s kamarádem na kole do Berouna.',
      'Chci chodit do posilovny dvakrát týdně a v zimě chci plavat v bazénu.',
    ],
  },
  {
    ...meta,
    id: 'w2-a',
    kind: 'email',
    title: 'E-mail: a birthday invitation',
    instructionCs: 'Napište e-mail kamarádce Petře. Zvete ji na oslavu svých narozenin. Napište alespoň 35 slov.',
    instruction: 'Write an e-mail to your friend Petra inviting her to your birthday party. At least 35 words; a sentence for each picture.',
    register: 'ty',
    pictures: [
      { icon: 'calendar', caption: 'kdy', question: 'Kdy je oslava?' },
      { icon: 'home', caption: 'kde', question: 'Kde bude oslava?' },
      { icon: 'food', caption: 'jídlo', question: 'Co bude k jídlu?' },
      { icon: 'people', caption: 'hosté', question: 'Kdo přijde?' },
    ],
    sample: [
      'Ahoj Petro,',
      'v sobotu mám narozeniny a chci tě pozvat na oslavu. Oslava bude u nás doma v sedm hodin večer. Uvařím guláš a upeču dort. Přijdou také Tomáš, Lucie a moji kolegové z práce. Těším se na tebe!',
      'Měj se,',
      'Ana',
    ],
  },
  {
    ...meta,
    id: 'w2-b',
    kind: 'email',
    title: 'E-mail: excusing your son',
    instructionCs: 'Napište e-mail paní učitelce. Omlouváte se, že váš syn zítra nepřijde do školy. Napište alespoň 35 slov.',
    instruction: 'Write an e-mail to your son’s teacher apologising that he won’t come to school tomorrow. At least 35 words; a sentence for each picture.',
    register: 'vy',
    pictures: [
      { icon: 'health', caption: 'proč', question: 'Proč syn nepřijde?' },
      { icon: 'calendar', caption: 'jak dlouho', question: 'Jak dlouho bude doma?' },
      { icon: 'school', caption: 'úkoly', question: 'Co potřebujete od učitelky?' },
      { icon: 'phone', caption: 'kontakt', question: 'Jak vás může učitelka kontaktovat?' },
    ],
    sample: [
      'Dobrý den, paní učitelko,',
      'omlouvám se, ale můj syn Adam zítra nepřijde do školy. Je nemocný, má horečku a bolí ho v krku. Doma bude asi do pátku. Můžete mi prosím poslat úkoly e-mailem? Kdybyste něco potřebovala, zavolejte mi na telefon.',
      'S pozdravem',
      'Lin Wangová',
    ],
  },
];

export const writingTaskById = (id: string | undefined) => writingTasks.find((w) => w.id === id);
