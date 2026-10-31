/**
 * Finds first-person Czech forms that reveal the writer's gender, so a reply never makes a
 * woman sign as a man (or the other way round): "rád bych požádal", "jsem obdržela", "byl jsem".
 *
 * Czech past tense ends in -l (he) or -la (she) and pairs with "jsem" / "bych" in the first person;
 * a handful of short adjectives (rád/ráda, ochoten/ochotna…) mark gender on their own.
 * Third-person sentences ("technik by mohl", "Petr byl") are not flagged.
 */

const GENDERED_WORDS = new Set([
  'rád', 'ráda', 'sám', 'sama', 'ochoten', 'ochotna', 'schopen', 'schopna', 'nucen', 'nucena',
  'připraven', 'připravena', 'spokojen', 'spokojena', 'vděčen', 'vděčna', 'vděčný', 'vděčná',
  'povinen', 'povinna', 'zvědav', 'zvědava', 'vědom', 'vědoma', 'nemocný', 'nemocná',
]);

/** Common words ending in -l / -la that aren't past-tense verbs. */
const NOT_PARTICIPLES = new Set([
  'mail', 'email', 'e-mail', 'hotel', 'cíl', 'díl', 'úl', 'škola', 'síla', 'kola', 'vila', 'pila',
  'čísla', 'pravidla', 'vozidla', 'jídla', 'sídla', 'mýdla', 'zrcadla', 'tabla',
]);

const FIRST_PERSON = new Set(['jsem', 'bych']);
const WINDOW = 3;

export function genderedForms(czech: string): string[] {
  // Placeholders such as [Vaše jméno] are the reader's to fill in.
  const words = czech.replace(/\[[^\]]*\]/g, ' ').toLowerCase().split(/[^\p{L}-]+/u).filter(Boolean);
  const found = new Set<string>();
  words.forEach((w, i) => {
    if (GENDERED_WORDS.has(w)) found.add(w);
    if (!FIRST_PERSON.has(w)) return;
    for (let j = Math.max(0, i - WINDOW); j <= Math.min(words.length - 1, i + WINDOW); j++) {
      const v = words[j];
      if (j !== i && v.length > 2 && /l(a)?$/u.test(v) && !NOT_PARTICIPLES.has(v)) found.add(v);
    }
  });
  return [...found];
}
