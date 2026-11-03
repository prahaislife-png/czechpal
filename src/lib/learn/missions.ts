import { contentById } from './content';
import { hasWord, cardIdFor, type Deck } from './deck';
import { isFinished, quizScore, type ReadingProgress } from './progress';
import type { LearnProfile } from './profile';
import { readingLevel } from './profile';
import type { Level, Topic } from './types';

/**
 * Missions: a real thing to get done in Czech (post a registered letter, see a doctor), learnt in steps
 * that each come from a text in the library. A mission's progress is worked out from what the
 * learner did anywhere in Learn; nothing is ticked by hand.
 */

export type Mission = {
  id: string;
  /** The real-life task, in English. */
  title: string;
  /** The same in Czech, as a learner would say it. */
  cs: string;
  why: string;
  contentId: string;
  topic: Topic;
  level: Level;
  /** Lexeme ids to know for it. */
  words: string[];
};

export type StepId = 'read' | 'questions' | 'save' | 'practise' | 'listen';

export type MissionStep = { id: StepId; label: string; detail: string; done: boolean };

/** Listening score a mission needs, 0 to 1. */
export const LISTEN_PASS = 0.8;

export const missions: Mission[] = [
  {
    id: 'cafe',
    title: 'Order at a café',
    cs: 'Objednat si v kavárně',
    why: 'Ask for a coffee and something to eat, and pay.',
    contentId: 'v-kavarne',
    topic: 'food',
    level: 'A1',
    words: ['dát si', 'kafe', 'mléko', 'koláč', 'platit', 'karta'],
  },
  {
    id: 'flat',
    title: 'View a flat to rent',
    cs: 'Prohlédnout si byt',
    why: 'Talk about rooms, the rent and the contract with an owner.',
    contentId: 'novy-byt',
    topic: 'housing',
    level: 'A1',
    words: ['byt', 'pokoj', 'nájem', 'majitel', 'smlouva', 'podepsat'],
  },
  {
    id: 'doctor',
    title: 'See a doctor',
    cs: 'Jít k lékaři',
    why: 'Say what hurts, understand the nurse and pick up medicine.',
    contentId: 'u-lekare',
    topic: 'health',
    level: 'A1',
    words: ['bolet', 'hlava', 'horečka', 'ordinace', 'recept', 'lékárna'],
  },
  {
    id: 'shop',
    title: 'Buy groceries',
    cs: 'Nakoupit potraviny',
    why: 'Find things in a shop and pay at the till.',
    contentId: 'v-obchode',
    topic: 'shopping',
    level: 'A1',
    words: ['potřebovat', 'chleba', 'stát', 'levný', 'pokladna', 'platit'],
  },
  {
    id: 'letter',
    title: 'Send a registered letter',
    cs: 'Poslat doporučený dopis',
    why: 'Handle the post office counter, from the form to paying.',
    contentId: 'na-poste',
    topic: 'services',
    level: 'A2',
    words: ['poslat', 'dopis', 'doporučeně', 'vyplnit', 'formulář', 'adresa'],
  },
  {
    id: 'train',
    title: 'Take the train to Brno',
    cs: 'Jet vlakem do Brna',
    why: 'Buy a ticket, find the platform and follow announcements.',
    contentId: 'vlakem-do-brna',
    topic: 'travel',
    level: 'A2',
    words: ['vlak', 'lístek', 'nádraží', 'zpoždění', 'nástupiště', 'vrátit se'],
  },
  {
    id: 'job',
    title: 'Start a new job',
    cs: 'Začít v nové práci',
    why: 'Meet colleagues and understand your first day.',
    contentId: 'prvni-den-v-praci',
    topic: 'work',
    level: 'A2',
    words: ['firma', 'oddělení', 'kancelář', 'kolega', 'šéf', 'pauza'],
  },
  {
    id: 'appointment',
    title: 'Change an appointment',
    cs: 'Změnit termín',
    why: 'Call to move a booking and agree a new time.',
    contentId: 'zmena-terminu',
    topic: 'appointments',
    level: 'A2',
    words: ['objednaný', 'zavolat', 'termín', 'přesunout', 'volno', 'omlouvat se'],
  },
  {
    id: 'neighbour',
    title: 'Get to know a neighbour',
    cs: 'Seznámit se se sousedem',
    why: 'Small talk on the stairs, and asking for a favour.',
    contentId: 'soused',
    topic: 'relationships',
    level: 'A2',
    words: ['soused', 'patro', 'schody', 'zaklepat', 'správce', 'klíč'],
  },
];

export const missionWords = (m: Mission) => m.words;

export const missionById = (id: string | undefined) => missions.find((m) => m.id === id);

export type MissionState = {
  progress: Record<string, ReadingProgress>;
  deck: Deck;
  /** Best listening score per mission, 0 to 1. */
  listened: Record<string, number>;
};

export function missionSteps(m: Mission, s: MissionState): MissionStep[] {
  const content = contentById(m.contentId);
  const p = s.progress[m.contentId];
  const words = missionWords(m);
  const score = content ? quizScore(p, content) : { right: 0, answered: 0, total: 0 };
  const saved = words.filter((w) => hasWord(s.deck, w)).length;
  const practised = words.filter((w) => (s.deck[cardIdFor(w)]?.schedule.reps ?? 0) > 0).length;
  const best = s.listened[m.id] ?? 0;
  // All questions answered, with at most one wrong.
  const quizDone = score.total > 0 && score.answered === score.total && score.right >= score.total - 1;
  return [
    { id: 'read', label: `Read “${content?.title ?? ''}”`, detail: content ? `${content.kind === 'dialogue' ? 'Dialogue' : 'Story'} · ${content.minutes} min` : '', done: !!content && isFinished(p, content) },
    {
      id: 'questions',
      label: 'Answer the questions',
      detail: score.answered ? `${score.right} of ${score.total} right${quizDone ? '' : ' · try again'}` : `${score.total} questions at the end of the text`,
      done: quizDone,
    },
    { id: 'save', label: 'Save the key words', detail: `${saved} of ${words.length} saved`, done: saved === words.length },
    { id: 'practise', label: 'Practise them', detail: `${practised} of ${words.length} reviewed`, done: words.length > 0 && practised === words.length },
    {
      id: 'listen',
      label: 'Listen for them',
      detail: best ? `Best ${Math.round(best * 100)}% · ${Math.round(LISTEN_PASS * 100)}% to pass` : `Get ${Math.round(LISTEN_PASS * 100)}% right`,
      done: best >= LISTEN_PASS,
    },
  ];
}

export function missionProgress(m: Mission, s: MissionState) {
  const steps = missionSteps(m, s);
  const done = steps.filter((x) => x.done).length;
  return { done, total: steps.length, finished: done === steps.length, next: steps.find((x) => !x.done) };
}

/**
 * Missions to suggest, best first: started ones, then the learner's topics, then their level
 * (and easier). Finished missions go last.
 */
export function recommendMissions(profile: LearnProfile | undefined, s: MissionState): Mission[] {
  const level = profile ? readingLevel(profile.level) : 'A1';
  const rank = (m: Mission) => {
    const { done, finished } = missionProgress(m, s);
    if (finished) return 100;
    let r = 0;
    if (done === 0) r += 10;
    if (!profile?.topics.length || !profile.topics.includes(m.topic)) r += 5;
    if (m.level !== level) r += m.level > level ? 4 : 2;
    return r;
  };
  return missions
    .map((m, i) => ({ m, r: rank(m), i }))
    .sort((a, b) => a.r - b.r || a.i - b.i)
    .map((x) => x.m);
}
