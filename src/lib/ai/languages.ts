/**
 * Languages CzechPal can explain in. The app's own buttons stay in English; this sets the
 * language of explanations and of the translation shown under a Czech reply.
 * The server keeps the same list (supabase/functions/_shared/languages.ts) and ignores anything else.
 */
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'pl', name: 'Polish', native: 'Polski' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export const languageByCode = (code: LanguageCode | undefined) =>
  LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
