import type { IconName } from '@/components/ui/icon';

import type { LanguageCode } from './languages';
import type { PartialAnalysis } from './partial-analysis';

export type Category =
  | 'housing'
  | 'utilities'
  | 'school'
  | 'government'
  | 'work'
  | 'finance'
  | 'health'
  | 'food'
  | 'transport'
  | 'personal'
  | 'other';

export const categoryLabels: Record<Category, string> = {
  housing: 'Housing',
  utilities: 'Bills',
  school: 'School',
  government: 'Government',
  work: 'Work',
  finance: 'Finance',
  health: 'Health',
  food: 'Food',
  transport: 'Transport',
  personal: 'Personal',
  other: 'Other',
};

/**
 * What was scanned decides what the result shows:
 * text = sign, menu, label, notice (translate + explain) · message = chat, SMS, email (reply)
 * document = letter, bill, form (verdict, steps, deadlines, reply)
 */
export type TextKind = 'text' | 'message' | 'document';

/** One line of the source with its translation; signs, menus and labels read best this way. */
export type TranslatedLine = { cs: string; en: string; note?: string };

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
  kind: TextKind;
  /** Plain description of what was scanned: "Parking sign", "Lunch menu", "Message from a neighbour". */
  typeLabel: string;
  title: string;
  category: Category;
  /** Who it is from, when that is knowable (letters, messages). */
  sender?: string;
  /** The one-line answer to "what does this mean for me?". Omitted when nothing applies (a menu). */
  verdict?: { urgency: Urgency; label: string; detail?: string };
  inShort: string;
  /** Line-by-line translation for short texts (signs, menus, labels). */
  lines?: TranslatedLine[];
  meaning: string[];
  keyFacts: KeyFact[];
  nextSteps: NextStep[];
  /** Things the user might expect the text to say but it doesn't. */
  notStated: string[];
  /** Matters that need confirmation from an office or a professional. */
  caution?: 'official' | 'medical';
  translation: string;
  /** Empty when replying makes no sense (signs, menus, labels). */
  replyIntents: ReplyIntent[];
  /** Payment details read from a bill, for QR Platba. Every field is copied from the document, never guessed. */
  payment?: PaymentInfo;
};

export type PaymentInfo = {
  /** As printed: "2701453802/0300", "19-2000145399/0800" or an IBAN. */
  account: string;
  amount?: number;
  variableSymbol?: string;
  specificSymbol?: string;
  constantSymbol?: string;
  /** ISO date YYYY-MM-DD. */
  dueDate?: string;
  recipientName?: string;
  message?: string;
};

export type ReplyDraft = { intentId: string; czech: string; english: string };

export type AnalyzeInput = {
  kind: 'text' | 'image' | 'pdf';
  text?: string;
  /** The PDF, or the photo for a one-page image. */
  uri?: string;
  /** Every page of a photographed document, in order (first page first). */
  uris?: string[];
  /** Language the explanation is written in. */
  language?: LanguageCode;
  /** Stable per case: a retry of an explanation that never arrived isn't charged twice. */
  requestId?: string;
  /** Present when the user picked a built-in example. */
  sampleId?: string;
  hint?: Category;
  /** Called as the explanation is written, so the screen can show it before it is finished. */
  onPartial?: (partial: PartialAnalysis) => void;
};

export type AnalyzeResult = {
  analysis: Analysis;
  /** Czech source text as read from the document. */
  originalText: string;
  /** Demo mode: the result is a sample, not a reading of the user's document. */
  demo: null | 'matched' | 'sample';
  sampleId?: string;
  /** Free explanations left this month, as counted by the server. */
  remaining?: number;
  /** The server's free explanations per month. */
  limit?: number;
};

/** The user's free explanations this month, as the server counts them. */
export type Allowance = { limit: number; remaining: number };

export type ReplyInput = {
  analysis: Analysis;
  originalText: string;
  sampleId?: string;
  intentId: string;
  /** What to reply in the reader's own words, any language; replaces the suggested intent. */
  ownWords?: string;
  /** Language of the translation shown under the Czech reply. */
  language?: LanguageCode;
};

/** A new message, not a reply: what the reader wants to say, in their own words. */
export type ComposeInput = {
  request: string;
  /** The practice or person it's for, when the composer was opened from one. */
  to?: string;
  about?: string;
  details: { name?: string; address?: string; insurer?: string };
  language?: LanguageCode;
};

export type SpokenLine = { cs: string; en: string };

export type ComposeResult = {
  czech: string;
  /** In the reader's language, despite the name (kept the same as replies). */
  english: string;
  call: { say: SpokenLine[]; hear: SpokenLine[] };
};

export class AnalyzeError extends Error {
  constructor(
    public code: 'too_short' | 'unreadable' | 'too_large' | 'limit' | 'rate' | 'network' | 'server',
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
  composeMessage(input: ComposeInput): Promise<ComposeResult>;
  /** Live only: the server decides the free allowance. */
  getAllowance?(): Promise<Allowance>;
}
