import { z } from 'npm:zod@3.25.76';

/**
 * The exact shape Claude must return (structured outputs), mirrored as a zod schema that
 * re-validates it on the server. Must stay in step with `Analysis` in src/lib/ai/types.ts.
 *
 * Structured-output rules: every object has additionalProperties: false and lists all keys
 * as required; optional values are expressed as "or null" and normalised away afterwards.
 * The API allows at most 16 nullable (union) parameters per schema, so the payment fields
 * use "" and 0 for "not stated" instead of null.
 */

export const CATEGORIES = [
  'housing', 'utilities', 'school', 'government', 'work', 'finance',
  'health', 'food', 'transport', 'personal', 'other',
] as const;

/** Icons the app can draw for a key fact (a subset of the app's icon set). */
export const FACT_ICONS = [
  'calendar', 'clock', 'money', 'number', 'document', 'location', 'sender',
  'alert', 'finance', 'water', 'health', 'transport', 'utilities', 'person',
] as const;

/* ───────────── JSON schema sent to Claude ───────────── */

type Json = Record<string, unknown>;
const str: Json = { type: 'string' };
const num: Json = { type: 'number' };
const nullable = (s: Json): Json => ({ anyOf: [s, { type: 'null' }] });
const arr = (items: Json): Json => ({ type: 'array', items });
const oneOf = (values: readonly string[]): Json => ({ type: 'string', enum: [...values] });
const obj = (properties: Record<string, Json>): Json => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

/**
 * Property order is the order Claude writes them, and the app shows each part as it streams in,
 * so this follows the result screen top to bottom: the answer first, the long translation last.
 */
const analysisJson = obj({
  kind: oneOf(['text', 'message', 'document']),
  typeLabel: str,
  title: str,
  category: oneOf(CATEGORIES),
  inShort: str,
  verdict: nullable(obj({ urgency: oneOf(['none', 'action', 'urgent']), label: str, detail: nullable(str) })),
  sender: nullable(str),
  caution: nullable(oneOf(['official', 'medical'])),
  // "translated", not "en": a field named after a language pulls the model into English.
  lines: nullable(arr(obj({ cs: str, translated: str, note: nullable(str) }))),
  nextSteps: arr(obj({ id: str, title: str, detail: nullable(str), kind: oneOf(['required', 'optional']) })),
  payment: nullable(
    obj({
      account: str,
      amount: num,
      variableSymbol: str,
      specificSymbol: str,
      constantSymbol: str,
      dueDate: str,
      recipientName: str,
      message: str,
    }),
  ),
  keyFacts: arr(obj({ id: str, label: str, value: str, icon: oneOf(FACT_ICONS), evidence: nullable(str) })),
  meaning: arr(str),
  notStated: arr(str),
  replyIntents: arr(obj({ id: str, label: str, description: str })),
  translation: str,
});

export const analyzeOutputSchema: Json = obj({
  status: oneOf(['ok', 'unreadable', 'not_czech']),
  analysis: nullable(analysisJson),
  originalText: str,
});

// "translation", not "english": a field named after a language pulls the model into that language.
export const replyOutputSchema: Json = obj({ czech: str, translation: str });

/* ───────────── Server-side validation ───────────── */

const opt = <T extends z.ZodTypeAny>(s: T) => s.nullable().transform((v) => v ?? undefined);
const text = z.string().trim().min(1);
/** "" means not stated. A malformed value is dropped rather than failing the whole explanation. */
const blank = z.string().trim().transform((v) => v || undefined);
const matching = (pattern: RegExp) => z.string().transform((v) => {
  const s = v.replace(/\s/g, '');
  return pattern.test(s) ? s : undefined;
});

const Analysis = z.object({
  kind: z.enum(['text', 'message', 'document']),
  typeLabel: text,
  title: text,
  category: z.enum(CATEGORIES),
  sender: opt(text),
  verdict: opt(z.object({ urgency: z.enum(['none', 'action', 'urgent']), label: text, detail: opt(text) })),
  inShort: text,
  // The app's TranslatedLine calls the translation `en`.
  lines: opt(
    z.array(
      z.object({ cs: text, translated: text, note: opt(text) }).transform(({ cs, translated, note }) => ({ cs, en: translated, note })),
    ),
  ),
  meaning: z.array(text),
  keyFacts: z.array(z.object({ id: text, label: text, value: text, icon: z.enum(FACT_ICONS), evidence: opt(text) })),
  nextSteps: z.array(z.object({ id: text, title: text, detail: opt(text), kind: z.enum(['required', 'optional']) })),
  notStated: z.array(text),
  caution: opt(z.enum(['official', 'medical'])),
  translation: text,
  replyIntents: z.array(z.object({ id: text, label: text, description: text })),
  payment: opt(
    z.object({
      account: blank,
      amount: z.number().transform((v) => (v === 0 ? undefined : v)),
      variableSymbol: matching(/^\d{1,10}$/),
      specificSymbol: matching(/^\d{1,10}$/),
      constantSymbol: matching(/^\d{1,4}$/),
      dueDate: matching(/^\d{4}-\d{2}-\d{2}$/),
      recipientName: blank,
      message: blank,
    }),
  ),
});

const AnalyzeOutput = z.object({
  status: z.enum(['ok', 'unreadable', 'not_czech']),
  originalText: z.string(),
  analysis: Analysis.nullable(),
});

export type ValidAnalysis = z.output<typeof Analysis>;
export type ValidAnalyzeOutput = z.output<typeof AnalyzeOutput>;

/** Validates Claude's JSON and trims list lengths to what the screens are designed for. */
export function validateAnalyzeOutput(raw: unknown): ValidAnalyzeOutput {
  const out = AnalyzeOutput.parse(raw);
  const a = out.analysis;
  if (!a) return out;
  const unique = <T extends { id: string }>(items: T[]) => items.filter((x, i) => items.findIndex((y) => y.id === x.id) === i);
  return {
    ...out,
    analysis: {
      ...a,
      lines: a.lines?.length ? a.lines.slice(0, 20) : undefined,
      meaning: a.meaning.slice(0, 5),
      keyFacts: unique(a.keyFacts).slice(0, 8),
      nextSteps: unique(a.nextSteps).slice(0, 6),
      notStated: a.notStated.slice(0, 4),
      replyIntents: unique(a.replyIntents).slice(0, 3),
      payment: a.payment?.account && (a.payment.amount === undefined || a.payment.amount > 0) ? { ...a.payment, account: a.payment.account } : undefined,
    },
  };
}

const ReplyOutput = z.object({ czech: text, translation: text });
/** The app reads the translation as `english` (its name from before other languages existed). */
export const validateReplyOutput = (raw: unknown) => {
  const { czech, translation } = ReplyOutput.parse(raw);
  return { czech, english: translation };
};
