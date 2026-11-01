/**
 * Certified court translators and interpreters (soudní překladatelé a tlumočníci).
 *
 * The official register is the Ministry of Justice's "Seznamy znalců, tlumočníků a překladatelů"
 * (seznat.justice.cz). Translators are private individuals, so CzechPal doesn't copy their details:
 * it opens the official register already filtered by language and region. The register's own
 * page reads its filter from the `query` parameter (checked 1 Nov 2026); language IDs below are
 * the register's own.
 */

export const REGISTER_URL = 'https://seznat.justice.cz/';
export const CHECKED_ON = '2026-11-01';

/** The register's court regions; Praha is 3. */
export const PRAGUE_REGION = 3;

/** Languages in the register (id, English name), most asked-for first, then alphabetical. */
export const translatorLanguages: { id: number; name: string }[] = [
  { id: 2, name: 'English' },
  { id: 59, name: 'Ukrainian' },
  { id: 48, name: 'Russian' },
  { id: 63, name: 'Vietnamese' },
  { id: 38, name: 'German' },
  { id: 53, name: 'Spanish' },
  { id: 18, name: 'French' },
  { id: 3, name: 'Arabic' },
  { id: 12, name: 'Chinese' },
  { id: 58, name: 'Turkish' },
  { id: 1, name: 'Albanian' },
  { id: 4, name: 'Armenian' },
  { id: 5, name: 'Azerbaijani' },
  { id: 7, name: 'Belarusian' },
  { id: 8, name: 'Bengali' },
  { id: 9, name: 'Bosnian' },
  { id: 10, name: 'Bulgarian' },
  { id: 6, name: 'Burmese' },
  { id: 27, name: 'Catalan' },
  { id: 22, name: 'Croatian' },
  { id: 13, name: 'Danish' },
  { id: 14, name: 'Dari' },
  { id: 39, name: 'Dutch' },
  { id: 15, name: 'Esperanto' },
  { id: 16, name: 'Estonian' },
  { id: 17, name: 'Finnish' },
  { id: 19, name: 'Friulian' },
  { id: 20, name: 'Georgian' },
  { id: 49, name: 'Greek' },
  { id: 21, name: 'Hebrew' },
  { id: 33, name: 'Hungarian' },
  { id: 24, name: 'Icelandic' },
  { id: 23, name: 'Indonesian' },
  { id: 25, name: 'Italian' },
  { id: 26, name: 'Japanese' },
  { id: 28, name: 'Korean' },
  { id: 29, name: 'Kurdish' },
  { id: 30, name: 'Latin' },
  { id: 32, name: 'Latvian' },
  { id: 31, name: 'Lithuanian' },
  { id: 34, name: 'Macedonian' },
  { id: 35, name: 'Malagasy' },
  { id: 37, name: 'Mongolian' },
  { id: 11, name: 'Montenegrin' },
  { id: 40, name: 'Norwegian' },
  { id: 42, name: 'Pashto' },
  { id: 43, name: 'Persian' },
  { id: 44, name: 'Polish' },
  { id: 45, name: 'Portuguese' },
  { id: 41, name: 'Punjabi' },
  { id: 46, name: 'Romani' },
  { id: 47, name: 'Romanian' },
  { id: 54, name: 'Serbian' },
  { id: 64, name: 'Sign language' },
  { id: 50, name: 'Sinhalese' },
  { id: 51, name: 'Slovak' },
  { id: 52, name: 'Slovenian' },
  { id: 55, name: 'Swedish' },
  { id: 56, name: 'Tajik' },
  { id: 57, name: 'Thai' },
  { id: 60, name: 'Urdu' },
  { id: 61, name: 'Uzbek' },
  { id: 62, name: 'Valencian' },
];

export const POPULAR_COUNT = 10;

/** The official register, filtered to one language (and Prague unless `anywhere`). */
export function registerUrl(languageId: number, anywhere = false) {
  const query = {
    filter: {
      druhyOsoby: [],
      jazyk: [languageId],
      ...(anywhere ? {} : { soudniKraj: PRAGUE_REGION }),
      vcetnePozastavenych: false,
      vcetneZaniklych: false,
    },
    strankovani: { pocetNaStranku: 50 },
    razeni: { hodnota: 'jmeno', smer: 0 },
  };
  return `${REGISTER_URL}tlumocnik?query=${encodeURIComponent(JSON.stringify(query))}`;
}
