/**
 * Learn: the shape of shared curriculum content (stories, dialogues, serials) and its vocabulary.
 *
 * Content is data, not screens: the same reader shows every story, and the fields mirror the
 * tables a content workflow will fill later (learning_content, learning_chapters,
 * vocabulary_entries). Private progress lives elsewhere (src/store/learn.ts).
 */

export type Level = 'A1' | 'A2' | 'B1';

export type Topic = 'housing' | 'health' | 'shopping' | 'travel' | 'work' | 'appointments' | 'food' | 'relationships' | 'services';

export const topicLabels: Record<Topic, string> = {
  housing: 'Housing',
  health: 'Health',
  shopping: 'Shopping',
  travel: 'Travel',
  work: 'Work',
  appointments: 'Appointments',
  food: 'Food and drink',
  relationships: 'People',
  services: 'Services',
};

export type PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv' | 'pron' | 'prep' | 'conj' | 'num' | 'part' | 'interj' | 'name' | 'phrase';

/** ma: masculine animate, mi: masculine inanimate, f: feminine, n: neuter. */
export type Gender = 'ma' | 'mi' | 'f' | 'n';

/** impf: imperfective, pf: perfective. */
export type Aspect = 'impf' | 'pf';

/** One dictionary entry: a lemma with the forms that occur in the content. */
export type Lexeme = {
  /** Stable id, usually the lemma; with a suffix when two lemmas are spelt alike. */
  id: string;
  lemma: string;
  pos: PartOfSpeech;
  /** The usual meaning, short. */
  en: string;
  gender?: Gender;
  aspect?: Aspect;
  /** The aspect partner, e.g. kupovat / koupit. */
  partner?: string;
  /** Inflected forms as they appear in texts, lowercase. The lemma itself counts as a form. */
  forms: string[];
  /** Grammar notes for particular forms, e.g. { bolí: '3rd person: it hurts' }. */
  notes?: Record<string, string>;
};

export type Paragraph = {
  cs: string;
  en: string;
  /** Dialogues: who speaks. */
  speaker?: string;
};

export type Chapter = {
  id: string;
  title: string;
  titleEn: string;
  paragraphs: Paragraph[];
};

export type Question = {
  id: string;
  cs: string;
  en: string;
  options: string[];
  /** Index into options. */
  answer: number;
};

/** Original geometric cover art, drawn in code. */
export type Cover = { tone: 'sand' | 'sage' | 'sky' | 'rose' | 'stone' | 'butter'; shape: 'arch' | 'circle' | 'steps' | 'window' | 'wave' | 'stack' };

export type ContentStatus = 'draft' | 'published';

export type LearningContent = {
  id: string;
  kind: 'story' | 'dialogue' | 'serial';
  title: string;
  titleEn: string;
  level: Level;
  topics: Topic[];
  minutes: number;
  cover: Cover;
  chapters: Chapter[];
  questions: Question[];
  /** Lexeme ids worth learning from this text: suggested flashcards. */
  vocabulary: string[];
  /**
   * Context beats the dictionary: a form that is ambiguous in general, or that means something
   * particular here, points at its lexeme and, optionally, at its meaning in this text.
   */
  senses?: Record<string, { lexeme?: string; meaning?: string }>;
  version: number;
  status: ContentStatus;
  source: {
    author: string;
    license: 'original' | 'licensed';
    /** Only a native-speaking Czech teacher's review sets this, and only then can a text be published. */
    reviewedByNativeSpeaker: boolean;
    /** When that review was done (YYYY-MM-DD). */
    reviewedOn?: string;
    /** When an AI check of grammar, naturalness and translation was last done (YYYY-MM-DD). Not a substitute for the review above. */
    aiCheckedOn?: string;
    note?: string;
  };
};
