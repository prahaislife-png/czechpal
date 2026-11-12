import type { FormField, FormGuide, YoursKey } from '@/lib/ai/types';
import { insurers, type Insurer } from '@/lib/compose/templates';

/**
 * Form filling, the parts with no screen: what of the reader's own details belongs in a field
 * (read from the phone, never sent anywhere), how far through the form they are, and whether a
 * scanned document looks like a form. No React Native imports, so the tests can run it.
 */

export type OwnDetails = { name?: string; address?: string; insurer?: Insurer };

/** "12. 11. 2026": a date the way Czech forms write it. */
export const czechDate = (d: Date) => `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;

/**
 * The reader's own value for a field, when the phone has it. A name is split at its last space:
 * everything before is the given name, the last word the surname. One word is a given name only.
 */
export function yoursValue(key: YoursKey | undefined, details: OwnDetails, now = new Date()): string | undefined {
  if (!key) return undefined;
  const name = (details.name ?? '').trim().replace(/\s+/g, ' ');
  const words = name ? name.split(' ') : [];
  switch (key) {
    case 'full_name':
      return name || undefined;
    case 'given_name':
      return words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
    case 'surname':
      return words.length > 1 ? words[words.length - 1] : undefined;
    case 'address':
      return details.address?.trim() || undefined;
    case 'insurer':
      // Commercial insurance has no public code to write; the reader knows its name, the app doesn't.
      return details.insurer && details.insurer !== 'private' ? insurers.find((i) => i.id === details.insurer)?.label : undefined;
    case 'today':
      return czechDate(now);
  }
}

export const allFields = (guide: FormGuide): FormField[] => guide.sections.flatMap((s) => s.fields);

/** The fields that are the reader's to fill in: everything but the office's own boxes. */
export const fieldsToFill = (guide: FormGuide) => allFields(guide).filter((f) => f.need !== 'leave_empty');

export function formProgress(guide: FormGuide, done: Record<string, boolean>) {
  const mine = fieldsToFill(guide);
  return { done: mine.filter((f) => done[f.id]).length, total: mine.length };
}

export const needLabel: Record<FormField['need'], string> = {
  required: 'Required',
  if_applies: 'Only if it applies',
  optional: 'Optional',
  leave_empty: 'Leave empty',
};

const FORM_WORDS =
  /formulář|tiskopis|žádost|přihlášk|přihlášení|prohlášení|dotazník|registrační|vyplňte|vyplní|hůlkovým písmem|nehodící se|podpis žadatele|podpis pacienta|\bform\b|application|questionnaire|registration|declaration/i;

/** Whether an explained document looks like something to fill in, from its type, title and text. */
export function looksLikeForm(analysis: { typeLabel: string; title: string; kind: string }, originalText: string): boolean {
  if (analysis.kind === 'message') return false;
  return FORM_WORDS.test(`${analysis.typeLabel} ${analysis.title}`) || /vyplňte|vyplní|hůlkovým písmem|nehodící se škrtněte|podpis žadatele|rodné číslo/i.test(originalText);
}
