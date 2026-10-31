import { parsePartialJson } from './partial-json';
import type { Analysis, Category, KeyFact, NextStep, TextKind, TranslatedLine, Urgency } from './types';

/** What can be shown while the explanation is still being written. Payment and replies wait for the checked result. */
export type PartialAnalysis = Partial<Omit<Analysis, 'payment' | 'replyIntents'>>;

const KINDS: TextKind[] = ['text', 'message', 'document'];
const URGENCIES: Urgency[] = ['none', 'action', 'urgent'];
const CATEGORIES: Category[] = [
  'housing', 'utilities', 'school', 'government', 'work', 'finance', 'health', 'food', 'transport', 'personal', 'other',
];

/** Prose that reads fine while it is still being written; everything else appears only once complete. */
const GROWS_IN_PLACE = new Set(['inShort', 'translation', 'verdict.label', 'verdict.detail', 'meaning.#', 'notStated.#']);

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const strings = (v: unknown) => (Array.isArray(v) ? v.filter(isStr) : undefined);

/** Builds the partial result from the raw JSON written so far. Returns null until there's anything to show. */
export function partialAnalysis(raw: string): PartialAnalysis | null {
  const { value, openPath } = parsePartialJson(raw);
  if (!isObj(value) || !isObj(value.analysis)) return null;
  const a = value.analysis;

  // Drop an unfinished value unless it is prose that can grow in place.
  if (openPath && openPath[0] === 'analysis' && openPath.length > 1) {
    const key = openPath
      .slice(1)
      .map((p) => (typeof p === 'number' ? '#' : p))
      .join('.');
    if (!GROWS_IN_PLACE.has(key)) {
      let parent: unknown = a;
      for (const p of openPath.slice(1, -1)) parent = (parent as Obj)?.[p as string];
      const last = openPath[openPath.length - 1];
      if (Array.isArray(parent)) parent.splice(last as number, 1);
      else if (isObj(parent)) delete parent[last as string];
    }
  }

  const out: PartialAnalysis = {};
  if (KINDS.includes(a.kind as TextKind)) out.kind = a.kind as TextKind;
  if (isStr(a.typeLabel)) out.typeLabel = a.typeLabel;
  if (isStr(a.title)) out.title = a.title;
  if (CATEGORIES.includes(a.category as Category)) out.category = a.category as Category;
  if (isStr(a.inShort)) out.inShort = a.inShort;
  if (isObj(a.verdict) && URGENCIES.includes(a.verdict.urgency as Urgency) && isStr(a.verdict.label)) {
    out.verdict = {
      urgency: a.verdict.urgency as Urgency,
      label: a.verdict.label,
      detail: isStr(a.verdict.detail) ? a.verdict.detail : undefined,
    };
  }
  if (isStr(a.sender)) out.sender = a.sender;
  if (a.caution === 'official' || a.caution === 'medical') out.caution = a.caution;
  if (Array.isArray(a.lines)) {
    out.lines = a.lines
      .filter((l): l is Obj => isObj(l) && isStr(l.cs) && isStr(l.en))
      .map((l): TranslatedLine => ({ cs: l.cs as string, en: l.en as string, note: isStr(l.note) ? l.note : undefined }));
  }
  if (Array.isArray(a.nextSteps)) {
    out.nextSteps = a.nextSteps
      .filter((s): s is Obj => isObj(s) && isStr(s.id) && isStr(s.title) && (s.kind === 'required' || s.kind === 'optional'))
      .map((s): NextStep => ({
        id: s.id as string,
        title: s.title as string,
        detail: isStr(s.detail) ? s.detail : undefined,
        kind: s.kind as NextStep['kind'],
      }));
  }
  if (Array.isArray(a.keyFacts)) {
    out.keyFacts = a.keyFacts
      .filter((f): f is Obj => isObj(f) && isStr(f.id) && isStr(f.label) && isStr(f.value) && isStr(f.icon))
      .map((f): KeyFact => ({
        id: f.id as string,
        label: f.label as string,
        value: f.value as string,
        icon: f.icon as KeyFact['icon'],
        evidence: isStr(f.evidence) ? f.evidence : undefined,
      }));
  }
  out.meaning = strings(a.meaning);
  out.notStated = strings(a.notStated);
  if (isStr(a.translation)) out.translation = a.translation;

  return out.inShort || out.typeLabel ? out : null;
}
