import { exercise as ex, type ExerciseBase } from './make';
import type { Exercise, Skill } from './types';

/**
 * The starting check: about five minutes, original items from easy to harder, across reading,
 * listening and writing. Speaking isn't checked until the app can record. Its result only
 * suggests where to start; it never claims a level or an exam score.
 */

const a1: ExerciseBase = { level: 'A1', difficulty: 1 };
const a1b: ExerciseBase = { level: 'A1', difficulty: 2 };
const a2: ExerciseBase = { level: 'A2', difficulty: 2 };
const a2b: ExerciseBase = { level: 'A2', difficulty: 3 };

export const diagnostic: Exercise[] = [
  ex('diag.1', { ...a1, topic: 'personal' }, 'reading', ['g:question-words'], {
    kind: 'choice',
    prompt: 'Someone asks “Jak se jmenujete?”. What do they want to know?',
    options: ['Your name', 'Where you live', 'How you are'],
    answer: 0,
    explain: 'Jak se jmenujete? = What’s your name?',
  }),
  ex('diag.2', { ...a1, topic: 'shopping' }, 'reading', ['g:numbers'], {
    kind: 'choice',
    prompt: 'Which word means “Tuesday”?',
    options: ['úterý', 'čtvrtek', 'sobota'],
    answer: 0,
    explain: 'pondělí, úterý, středa, čtvrtek, pátek, sobota, neděle.',
  }),
  ex('diag.3', { ...a1, topic: 'personal' }, 'reading', ['g:present'], {
    kind: 'choice',
    prompt: 'Complete: Já ___ v Praze.',
    options: ['bydlím', 'bydlí', 'bydlíte'],
    answer: 0,
    explain: 'With já (I) the verb ends in -ím: bydlím.',
  }),
  ex('diag.4', { ...a1b, topic: 'food' }, 'reading', ['g:cases'], {
    kind: 'choice',
    prompt: 'In a café you say: “Dám si ___, prosím.”',
    options: ['čaj', 'čaje', 'čajem'],
    answer: 0,
    explain: 'Čaj doesn’t change here: Dám si čaj.',
  }),
  ex('diag.5', { ...a1b, topic: 'travel' }, 'listening', ['g:time'], {
    kind: 'choice',
    prompt: 'Listen. When does the train leave?',
    text: 'Vlak do Brna odjíždí v devět hodin.',
    listen: true,
    options: ['At nine', 'At five', 'At two'],
    answer: 0,
    explain: '“V devět hodin” – at nine o’clock.',
  }),
  ex('diag.6', { ...a1b, topic: 'routine' }, 'reading', ['g:past'], {
    kind: 'choice',
    prompt: 'Which sentence is about yesterday?',
    options: ['Včera jsem byl doma.', 'Zítra budu doma.', 'Teď jsem doma.'],
    answer: 0,
    explain: 'Byl jsem is the past tense; budu is the future.',
  }),
  ex('diag.7', { ...a2, topic: 'housing' }, 'reading', ['t:housing:viewing'], {
    kind: 'choice',
    taskType: 'reading-2',
    prompt: 'What must you bring to the viewing?',
    text: 'Prohlídka bytu bude v sobotu v 10 hodin. Vezměte si s sebou občanský průkaz nebo pas. Parkovat můžete před domem.',
    options: ['An ID card or passport', 'The deposit', 'A parking ticket'],
    answer: 0,
    explain: '“Vezměte si s sebou občanský průkaz nebo pas” – bring your ID card or passport.',
  }),
  ex('diag.8', { ...a2, topic: 'health' }, 'listening', ['t:health:symptoms'], {
    kind: 'choice',
    prompt: 'Listen. What is wrong?',
    text: 'Dobrý den, od rána mě bolí hlava a mám horečku.',
    listen: true,
    options: ['A headache and a fever', 'A sore leg', 'A cough'],
    answer: 0,
    explain: '“Bolí mě hlava a mám horečku” – my head hurts and I have a fever.',
  }),
  ex('diag.9', { ...a2, topic: 'free-time' }, 'reading', ['g:past', 'g:gender'], {
    kind: 'choice',
    prompt: 'Jana (a woman) says: “Včera jsem ___ v kině.”',
    options: ['byla', 'byl', 'byli'],
    answer: 0,
    explain: 'A woman says byla jsem; a man byl jsem.',
  }),
  ex('diag.10', { ...a2, topic: 'offices' }, 'writing', ['g:question-words', 'g:time'], {
    kind: 'type',
    prompt: 'Ask in Czech: What time does it start? (začíná)',
    accept: ['V kolik hodin to začíná?', 'v kolik to začíná', 'v kolik hodin začíná'],
    explain: 'To ask the time: “V kolik hodin…?”',
  }),
  ex('diag.11', { ...a2b, topic: 'travel' }, 'listening', ['g:future', 'g:prepositions'], {
    kind: 'choice',
    prompt: 'Listen. Where will Petr go on Saturday?',
    text: 'V sobotu pojedu k babičce do Plzně a v neděli se vrátím.',
    listen: true,
    options: ['To his grandmother’s in Plzeň', 'To Prague', 'To work'],
    answer: 0,
    explain: '“Pojedu k babičce do Plzně” – I’ll go to my grandmother’s in Plzeň.',
  }),
  ex('diag.12', { ...a2b, topic: 'routine' }, 'writing', ['g:past', 't:routine:yesterday'], {
    kind: 'write',
    taskType: 'writing-1',
    prompt: 'Answer as in a form: a full sentence, at least 10 words.',
    question: 'Co jste dělal/a minulý víkend?',
    minWords: 10,
    selfCheck: ['I answered in the past tense', 'Each sentence has a verb', 'Capital letter at the start, full stop at the end'],
    sample: 'Minulý víkend jsem byl s rodinou na výletě a večer jsme vařili doma.',
  }),
];

/** Skills the check covers, in order. Speaking isn't, yet. */
export const diagnosticSkills: Skill[] = ['reading', 'listening', 'writing'];

/** Items to leave out when the phone has no Czech voice. */
export const diagnosticFor = (canListen: boolean) => diagnostic.filter((e) => canListen || !(e.kind === 'choice' && e.listen));
