import type { IconName } from '@/components/ui/icon';

export type Category = 'housing' | 'utilities' | 'school' | 'government' | 'work' | 'finance' | 'other';

export const categoryLabels: Record<Category, string> = {
  housing: 'Housing',
  utilities: 'Bills',
  school: 'School',
  government: 'Government',
  work: 'Work',
  finance: 'Finance',
  other: 'Other',
};

/** none = information only · action = something to do by a date · urgent = legal / official deadline */
export type Urgency = 'none' | 'action' | 'urgent';

export type KeyFact = {
  id: string;
  label: string;
  value: string;
  icon: IconName;
  /** Verbatim quote from the source document that supports this fact. */
  evidence?: string;
};

export type NextStep = {
  id: string;
  title: string;
  detail?: string;
  kind: 'required' | 'optional';
};

export type ReplyIntent = { id: string; label: string; description: string };

/** The validated, structured result of analyzeDocument(). */
export type Analysis = {
  title: string;
  category: Category;
  sender: string;
  verdict: { urgency: Urgency; label: string; detail?: string };
  inShort: string;
  meaning: string[];
  keyFacts: KeyFact[];
  nextSteps: NextStep[];
  /** Things the user might expect the document to say but it doesn't. */
  notStated: string[];
  /** Immigration, legal or financial matters that need official confirmation. */
  officialMatter: boolean;
  translation: string;
  replyIntents: ReplyIntent[];
};

export type Tone = 'formal' | 'friendly' | 'short';

export type ReplyDraft = { intentId: string; tone: Tone; czech: string; english: string };

export type AnalyzeInput = {
  kind: 'text' | 'image' | 'pdf';
  text?: string;
  uri?: string;
  /** Present when the user picked a built-in example. */
  sampleId?: string;
  hint?: Category;
};

export type AnalyzeResult = {
  analysis: Analysis;
  /** Czech source text as read from the document. */
  originalText: string;
  /** Demo mode: the result is a sample, not a reading of the user's document. */
  demo: null | 'matched' | 'sample';
  sampleId?: string;
};

export type ReplyInput = {
  analysis: Analysis;
  originalText: string;
  sampleId?: string;
  intentId: string;
  tone: Tone;
};

export class AnalyzeError extends Error {
  constructor(
    public code: 'too_short' | 'unreadable' | 'network',
    message: string,
  ) {
    super(message);
  }
}

/**
 * The single AI boundary. The app never calls a model provider directly — the production
 * implementation calls a Supabase Edge Function that holds the provider key, checks the
 * user's allowance and validates the model's structured output before returning it.
 */
export interface AIClient {
  analyzeDocument(input: AnalyzeInput): Promise<AnalyzeResult>;
  generateReply(input: ReplyInput): Promise<ReplyDraft>;
}
