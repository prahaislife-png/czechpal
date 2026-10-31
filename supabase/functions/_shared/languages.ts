/**
 * Languages explanations can be written in, by code. Must match src/lib/ai/languages.ts.
 * Only these names ever reach the prompt; anything else the app sends falls back to English.
 */
const LANGUAGES: Record<string, string> = {
  en: 'English',
  uk: 'Ukrainian',
  ru: 'Russian',
  vi: 'Vietnamese',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
  pl: 'Polish',
};

export const languageName = (code: unknown) => (typeof code === 'string' && LANGUAGES[code]) || 'English';
