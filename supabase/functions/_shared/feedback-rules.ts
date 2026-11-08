/**
 * The exam's hard rules for writing feedback, applied in code on top of the model's answer.
 * No imports, so the app's tests can run it too.
 */

export const FORM_POINTS = 8;
export const EMAIL_POINTS = 12;
export const EMAIL_MIN_WORDS = 35;

export const countWords = (s: string) => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

/**
 * The points within the task's range; 0 for an e-mail under 35 words, whatever the model said;
 * and one corrected text for each answer (the learner's own where the model gave none).
 */
export function applyRules(kind: 'form' | 'email', texts: string[], points: number, improved: string[]) {
  const of = kind === 'form' ? FORM_POINTS : EMAIL_POINTS;
  const zeroRule = kind === 'email' && countWords(texts.join(' ')) < EMAIL_MIN_WORDS;
  const safe = Number.isFinite(points) ? Math.round(points) : 0;
  return {
    estimate: { points: zeroRule ? 0 : Math.max(0, Math.min(of, safe)), of },
    zeroRule,
    improved: texts.map((t, i) => improved[i]?.trim() || t),
  };
}
