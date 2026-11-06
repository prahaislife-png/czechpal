/**
 * The Czech A2 exam for permanent residence, as published by its organiser (NPI ČR on
 * cestina-pro-cizince.cz). Only facts checked in the official sources are written here; the
 * sources, page references and what wasn't verified are in docs/a2-academy/exam-spec-2026.md.
 * The writing and speaking format changed on 11 April 2026.
 */

export const EXAM_CHECKED_ON = '2026-11-06';

export const EXAM_SOURCES = {
  overview: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/',
  newFormatTest: 'https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/priprava-na-zkousku/modelovy-test-novy-format/',
  handbook: 'https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/03/Prirucka_pro_uchazece_2026.pdf',
  watchOut: 'https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/03/Na-co-si-dat-pozor_2026.pdf',
} as const;

/** The date the new format of writing and speaking applies from. */
export const NEW_FORMAT_FROM = '2026-04-11';

export type ExamSkill = 'reading' | 'writing' | 'listening' | 'speaking';

export type ExamPart = {
  id: ExamSkill;
  label: string;
  minutes: number;
  /** "about 40 minutes" for listening, which follows the recording; "at most" for speaking. */
  approx?: boolean;
  points: number;
};

/** The four parts, their times and maximum points. */
export const examParts: ExamPart[] = [
  { id: 'reading', label: 'Reading', minutes: 40, points: 25 },
  { id: 'writing', label: 'Writing', minutes: 25, points: 20 },
  { id: 'listening', label: 'Listening', minutes: 40, approx: true, points: 25 },
  { id: 'speaking', label: 'Speaking', minutes: 15, approx: true, points: 40 },
];

/** To pass: at least 42 of 70 in the written part (reading, writing, listening) and 24 of 40 in speaking, 60% of each. */
export const passMarks = { written: { need: 42, of: 70 }, speaking: { need: 24, of: 40 } } as const;

export type ExamTask = {
  part: ExamSkill;
  n: number;
  /** Czech name, as in the exam. */
  cs: string;
  title: string;
  points: number;
  /** Items in the task (reading and listening). */
  items?: number;
  what: string;
};

/** Every task of the 2026 format, with its points. Totals are checked by tests against examParts. */
export const examTasks: ExamTask[] = [
  { part: 'reading', n: 1, cs: 'Úloha 1', title: 'Match texts and answers', points: 5, items: 5, what: 'Connect each answer with the right text.' },
  { part: 'reading', n: 2, cs: 'Úloha 2', title: 'One text, multiple choice', points: 5, items: 5, what: 'Read one text and choose A–D for each question.' },
  { part: 'reading', n: 3, cs: 'Úloha 3', title: 'Texts and people', points: 4, items: 4, what: 'Choose a suitable person A–E for each text; one person is extra.' },
  { part: 'reading', n: 4, cs: 'Úloha 4', title: 'Choose the right word', points: 6, items: 6, what: 'Short texts; choose the right option A–D for each.' },
  { part: 'reading', n: 5, cs: 'Úloha 5', title: 'Write the information', points: 5, items: 5, what: 'Read a text and write one piece of information for each item.' },
  { part: 'writing', n: 1, cs: 'Formulář', title: 'Form', points: 8, what: 'Answer 3 questions in a form, in full sentences, at least 10 words each.' },
  { part: 'writing', n: 2, cs: 'E-mail', title: 'E-mail', points: 12, what: 'Write an e-mail from the instruction and pictures: at least 35 words, a sentence for each picture.' },
  { part: 'listening', n: 1, cs: 'Úloha 1', title: 'Five dialogues', points: 5, items: 5, what: 'Choose A–D for each dialogue.' },
  { part: 'listening', n: 2, cs: 'Úloha 2', title: 'Five texts', points: 5, items: 5, what: 'Choose A–D for each text.' },
  { part: 'listening', n: 3, cs: 'Úloha 3', title: 'Match the texts', points: 5, items: 5, what: 'Choose from A–G; two options are extra.' },
  { part: 'listening', n: 4, cs: 'Úloha 4', title: 'Choose the picture', points: 5, items: 5, what: 'Choose the right picture A–F; one picture is extra.' },
  { part: 'listening', n: 5, cs: 'Úloha 5', title: 'Voice message', points: 5, items: 5, what: 'Write one piece of information for each item.' },
  { part: 'speaking', n: 1, cs: 'Odpovědi na otázky', title: 'Answer questions', points: 8, what: '8 questions on 2 everyday topics. Answer in full sentences, straight away.' },
  { part: 'speaking', n: 2, cs: 'Dialogy', title: 'Ask questions', points: 12, what: '2 dialogues; ask 4 questions in each (3 from the card, 1 of your own). Formal “vy”.' },
  { part: 'speaking', n: 3, cs: 'Vyprávění podle obrázků', title: 'Picture story', points: 10, what: 'Tell what people did, from 4 pictures, in the past tense. A sentence for each picture.' },
  { part: 'speaking', n: 4, cs: 'Řešení situace', title: 'Agree on a choice', points: 7, what: 'With a friend (informal “ty”), choose 1 of 3 options from the pictures and say why.' },
];

/** Pronunciation, assessed across the whole oral part. */
export const PRONUNCIATION_POINTS = 3;

/** Every recording in the listening part is heard twice. */
export const LISTENING_PLAYS = 2;

/** Writing: at least 10 words in each answer of the form; a shorter answer loses points. */
export const FORM_MIN_WORDS = 10;
/** Writing: at least 35 words in the e-mail, or the task scores 0. */
export const EMAIL_MIN_WORDS = 35;

/**
 * Words as the exam counts them: anything between spaces that has a letter or a digit.
 * "e-mail" is one word; a stray dash or full stop isn't one.
 */
export function countWords(text: string): number {
  return text
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** The checks the exam states for one form answer (S4): enough words, a capital, a full stop. */
export function checkFormAnswer(text: string) {
  const t = text.trim();
  const words = countWords(t);
  return {
    words,
    enoughWords: words >= FORM_MIN_WORDS,
    capital: /^\p{Lu}/u.test(t),
    endsWithStop: /[.?!]$/.test(t),
  };
}

/** The e-mail's hard rule: under 35 words, the task scores 0, whatever else is right. */
export function emailScoreCap(text: string): { words: number; zero: boolean } {
  const words = countWords(text);
  return { words, zero: words < EMAIL_MIN_WORDS };
}

export type ExamScores = Partial<Record<ExamSkill, number | null>>;

export type ExamOutcome = {
  written: { score: number | null; of: number; need: number; passed: boolean | null };
  speaking: { score: number | null; of: number; need: number; passed: boolean | null };
  /** True or false only when both parts are scored; null while a part is missing. */
  passed: boolean | null;
};

/**
 * The result of a practice exam by the official rules: the written group (reading + writing +
 * listening) and speaking pass separately, and both must pass. A missing part leaves the result
 * open instead of passing it.
 */
export function examOutcome(scores: ExamScores): ExamOutcome {
  const part = (id: ExamSkill) => {
    const max = examParts.find((p) => p.id === id)!.points;
    const v = scores[id];
    return v === undefined || v === null ? null : Math.max(0, Math.min(max, v));
  };
  const r = part('reading');
  const w = part('writing');
  const l = part('listening');
  const s = part('speaking');
  const writtenScore = r === null || w === null || l === null ? null : r + w + l;
  const written = { score: writtenScore, of: passMarks.written.of, need: passMarks.written.need, passed: writtenScore === null ? null : writtenScore >= passMarks.written.need };
  const speaking = { score: s, of: passMarks.speaking.of, need: passMarks.speaking.need, passed: s === null ? null : s >= passMarks.speaking.need };
  const passed = written.passed === null || speaking.passed === null ? null : written.passed && speaking.passed;
  return { written, speaking, passed };
}

/** Whole days from today until the exam date (YYYY-MM-DD), by the local calendar. */
export function daysToExam(date: string, now = new Date()) {
  const [y, m, d] = date.split('-').map(Number);
  const exam = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exam.getTime() - today.getTime()) / 86_400_000);
}
