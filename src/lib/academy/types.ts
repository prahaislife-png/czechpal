import type { ExamSkill } from '@/lib/learn/exam';

/**
 * A2 Academy: the shapes of public curriculum content. Content is data, versioned, with its
 * provenance, never written inside screens. Private learner data lives in src/store/academy.ts.
 */

export type Skill = ExamSkill;

export type TopicId =
  | 'personal'
  | 'housing'
  | 'food'
  | 'routine'
  | 'free-time'
  | 'work'
  | 'health'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'offices'
  | 'safety'
  | 'weather'
  | 'social';

/**
 * Who has checked a piece of Czech. Only a native-speaking teacher's review makes it
 * 'teacher-reviewed'; the app never shows AI-checked content as teacher-approved.
 */
export type Review = 'teacher-reviewed' | 'ai-checked';

/** Provenance and versioning carried by every exercise and lesson. */
export type ContentMeta = {
  /** Stable: never reused for different content. */
  id: string;
  /** Bumped when the content changes; attempts record the version they were made against. */
  version: number;
  level: 'A1' | 'A2';
  topic?: TopicId;
  /** Grammar or topic objectives this practises, e.g. 'g:past-tense', 't:housing:rent'. */
  objectives: string[];
  skill: Skill;
  /** The exam task it is shaped like, when it is, e.g. 'reading-2', 'writing-1'. */
  taskType?: string;
  difficulty: 1 | 2 | 3;
  review: Review;
  author: 'CzechLocal';
  licence: 'original';
  checkedOn: string;
};

/** Pick one answer. Used for vocabulary, grammar, reading and listening. */
export type ChoiceExercise = ContentMeta & {
  kind: 'choice';
  prompt: string;
  /** A Czech text to read first, or to hear when `listen` is set. */
  text?: string;
  /** The text is spoken by the device voice instead of shown (listening). */
  listen?: boolean;
  options: string[];
  answer: number;
  /** Why the answer is right, shown after answering. */
  explain: string;
};

/** Type a word or short phrase; several spellings may be accepted. */
export type TypeExercise = ContentMeta & {
  kind: 'type';
  prompt: string;
  text?: string;
  accept: string[];
  explain: string;
};

/**
 * Write a short answer in Czech. Checked by rules the exam states (word count, capital, full
 * stop) and by the learner against a checklist; never given a score it can't justify.
 */
export type WriteExercise = ContentMeta & {
  kind: 'write';
  prompt: string;
  /** The question being answered, in Czech. */
  question: string;
  minWords: number;
  /** Things the learner ticks themselves: "I used a verb in the past tense". */
  selfCheck: string[];
  /** A model answer, shown after they submit. */
  sample: string;
};

export type Exercise = ChoiceExercise | TypeExercise | WriteExercise;

export type Phrase = { cs: string; en: string };

/**
 * A lesson, in the order the brief sets: goal → a little Czech → in context → recall →
 * feedback → an independent task.
 */
export type Lesson = Omit<ContentMeta, 'skill' | 'taskType'> & {
  topic: TopicId;
  title: string;
  /** The goal, in plain English. */
  goal: string;
  /** The small amount of new Czech. */
  introduce: Phrase[];
  /** A short scene using it. */
  context: (Phrase & { speaker?: string })[];
  /** Guided practice: hints allowed, retries allowed. */
  practise: Exercise[];
  /** The independent check: fresh items, no hints. Counts towards mastery. */
  check: Exercise[];
};

export type Topic = {
  id: TopicId;
  title: string;
  cs: string;
  /** What the learner can do at the end. */
  objectives: string[];
  /** Grammar this topic practises, by grammar item id. */
  grammar: string[];
  /** Existing teacher-reviewed library texts that fit. */
  texts: string[];
  /** Existing situations (phrase packs) that fit. */
  situations: string[];
  /** Lesson ids, in order. Empty until the lessons are written. */
  lessons: string[];
};

export type GrammarItem = {
  id: string;
  title: string;
  /** The short explanation: two or three sentences, no tables. */
  explain: string;
  examples: Phrase[];
  /** Mistakes learners often make, as "not this → this". */
  watchOut?: string;
  review: Review;
  checkedOn: string;
};

// ── Exam-task practice ──────────────────────────────────────────────────────

/** A shared option in a matching task: a reply, a person, a place, or a picture (an icon with a caption). */
export type TaskChoice = { text: string; icon?: string };

/**
 * One item in a task set. It has its own options (A–D) or uses the set's shared choices, or it
 * asks for a written piece of information (accepted answers).
 */
export type TaskItem = {
  id: string;
  /** The question, in Czech as in the exam, or the gap sentence. */
  prompt: string;
  /** A short text that belongs to this item only (reading 1, 3, 4). */
  text?: string;
  /** A recording for this item only, spoken by the device voice (listening 1–4). */
  audio?: string;
  options?: string[];
  /** Index into `options`, or into the set's `choices` when the item has no options. */
  answer?: number;
  /** For items that ask you to write the information. */
  accept?: string[];
  explain: string;
};

/** An original practice set shaped like one exam task. Never copied from an official test. */
export type TaskSet = {
  id: string;
  version: number;
  part: 'reading' | 'listening';
  /** The exam task number, 1–5. */
  task: 1 | 2 | 3 | 4 | 5;
  title: string;
  /** What to do, in English. */
  instruction: string;
  topic?: TopicId;
  level: 'A1' | 'A2';
  objectives: string[];
  /** One text for the whole set (reading 2 and 5). */
  passage?: string;
  /** One recording for the whole set (listening 5). */
  audio?: string;
  /** Shared options (reading 1 and 3, listening 3 and 4), some of them extra. */
  choices?: TaskChoice[];
  items: TaskItem[];
  /** 'mock': kept for the mock exam, so it is unseen there; not listed in everyday practice. */
  pool?: 'mock';
  review: Review;
  author: 'CzechLocal';
  licence: 'original';
  checkedOn: string;
};

/** A writing task shaped like the exam's: the form (3 answers) or the e-mail (with pictures). */
export type WritingTask = {
  id: string;
  version: number;
  kind: 'form' | 'email';
  title: string;
  /** The instruction in Czech, as in the exam, and in English. */
  instructionCs: string;
  instruction: string;
  /** Form: the three questions. */
  questions?: string[];
  /** E-mail: the pictures, each with the question it must answer. */
  pictures?: { icon: string; caption: string; question: string }[];
  /** E-mail: ty (a friend) or vy (formal). */
  register?: 'ty' | 'vy';
  sample: string[];
  /** 'mock': kept for the mock exam; not listed in everyday practice. */
  pool?: 'mock';
  review: Review;
  author: 'CzechLocal';
  licence: 'original';
  checkedOn: string;
};

/**
 * One turn in speaking practice: the examiner's question (task 1), a cue from the card (tasks 2
 * and 4) or a picture (task 3). The learner answers aloud; nothing is marked automatically.
 */
export type SpeakingPrompt = {
  id: string;
  /** What the examiner asks, in Czech (task 1). Spoken by the device voice. */
  ask?: string;
  /** The cue on the card (task 2: "cena?") or what to do (tasks 3–4), shown to the learner. */
  cue?: string;
  /** What the prompt means, in English. */
  en: string;
  /** A picture for this turn (tasks 3–4). */
  icon?: string;
  /** One good answer. Others are possible. */
  model: string;
  /** What the examiner says after you (tasks 2 and 4). Spoken by the device voice. */
  reply?: string;
  /** A short tip, e.g. the tense the question needs. */
  tip?: string;
};

/** A speaking task shaped like the exam's. Written for CzechLocal; never copied from a real test. */
export type SpeakingTask = {
  id: string;
  version: number;
  task: 1 | 2 | 3 | 4;
  title: string;
  instructionCs: string;
  instruction: string;
  register?: 'ty' | 'vy';
  objectives: string[];
  /** Task 2 has two dialogues; the others have one part. */
  parts: { title?: string; situation?: string; opening?: string; prompts: SpeakingPrompt[] }[];
  /** What to listen for when you play yourself back. */
  checklist: string[];
  review: Review;
  author: 'CzechLocal';
  licence: 'original';
  checkedOn: string;
};
