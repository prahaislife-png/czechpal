import type { FormGuide } from './types';

/**
 * The example form guide: a patient registration sheet of the kind a GP's practice hands to a new
 * patient. Written for CzechLocal, not copied from a real practice's form. It shows what a guide
 * looks like before someone scans their own form, and it is what the demo returns.
 */
export const SAMPLE_FORM_GUIDE: FormGuide = {
  title: 'Patient registration form',
  titleCs: 'Registrační list pacienta',
  purpose: 'This registers you as a patient of a GP’s practice. You fill it in once, on your first visit, and the practice keeps it in your file.',
  howToFill: [
    'Fill it in in Czech, in block capitals.',
    'Write your name exactly as it is on your insurance card.',
    'Czech dates are day, month, year: 5. 3. 1990.',
    'The last box is for the doctor. Leave it empty.',
  ],
  sections: [
    {
      title: 'About the patient',
      titleCs: 'Údaje o pacientovi',
      fields: [
        { id: 'f1', label: 'Příjmení', meaning: 'Your surname (family name).', write: 'Write it exactly as on your insurance card or residence card, with no title.', example: 'NOVÁK', yours: 'surname', need: 'required' },
        { id: 'f2', label: 'Jméno', meaning: 'Your given name or names.', write: 'All given names, in the same order as in your passport.', example: 'JAN', yours: 'given_name', need: 'required' },
        { id: 'f3', label: 'Titul', meaning: 'An academic title, such as Ing. or Mgr.', write: 'Leave it empty if you don’t use one.', need: 'optional' },
        {
          id: 'f4',
          label: 'Rodné číslo / číslo pojištěnce',
          meaning: 'Your Czech birth number, or the insured person’s number from your insurance card.',
          write: 'Copy the number printed on your insurance card (“číslo pojištěnce”). If you have a Czech birth number, it is the same number.',
          example: '900305/1234',
          need: 'required',
          note: 'Never make this number up. If you have no card yet, leave it empty and tell the nurse.',
        },
        { id: 'f5', label: 'Datum narození', meaning: 'Your date of birth.', write: 'Day, month, year, with full stops.', example: '5. 3. 1990', need: 'required' },
        { id: 'f6', label: 'Státní občanství', meaning: 'Your citizenship: the country of your passport, not your ethnic origin.', write: 'The country’s name in Czech.', example: 'UKRAJINA', need: 'required' },
        {
          id: 'f7',
          label: 'Zdravotní pojišťovna (kód)',
          meaning: 'Your health insurance company and its three-digit code.',
          write: 'The insurer’s short name and the code. Both are printed on your insurance card.',
          example: 'VZP (111)',
          yours: 'insurer',
          need: 'required',
          note: 'With commercial insurance for foreigners, write the company’s name; it has no three-digit code.',
        },
      ],
    },
    {
      title: 'How to reach you',
      titleCs: 'Kontaktní údaje',
      fields: [
        {
          id: 'f8',
          label: 'Adresa bydliště (ulice, číslo, PSČ, obec)',
          meaning: 'The address where you live in Czechia: street, house number, postcode, town.',
          write: 'The street and number first, then the five-digit postcode and the town.',
          example: 'VINOHRADSKÁ 12, 120 00 PRAHA 2',
          yours: 'address',
          need: 'required',
        },
        { id: 'f9', label: 'Telefon', meaning: 'A phone number the practice can call.', write: 'Your mobile number. Add the country code if it isn’t a Czech number.', example: '+420 601 234 567', need: 'required' },
        { id: 'f10', label: 'E-mail', meaning: 'Your e-mail address.', write: 'Write it if you’d like appointment confirmations or results by e-mail.', example: 'jan.novak@email.cz', need: 'optional' },
      ],
    },
    {
      title: 'Your health',
      titleCs: 'Zdravotní údaje',
      fields: [
        {
          id: 'f11',
          label: 'Alergie (léky, potraviny, jiné)',
          meaning: 'Anything you are allergic to: medicines, food, other things.',
          write: 'Name each one. For medicines, the name on the box is enough. If you have none, write “žádné”.',
          example: 'PENICILIN, OŘECHY',
          need: 'required',
          note: 'Don’t leave it empty when you have none: an empty line reads as “not answered”.',
        },
        {
          id: 'f12',
          label: 'Trvale užívané léky',
          meaning: 'Medicines you take regularly.',
          write: 'The name, the strength and how often you take it. If you take none, write “žádné”.',
          example: 'METFORMIN 500 mg, 2× DENNĚ',
          need: 'required',
        },
        {
          id: 'f13',
          label: 'Předchozí praktický lékař (jméno, adresa)',
          meaning: 'The GP you were registered with before, so your records can be asked for.',
          write: 'The doctor’s name and the practice’s town. Only a GP in Czechia counts.',
          example: 'MUDr. EVA DVOŘÁKOVÁ, PRAHA 3',
          need: 'if_applies',
          note: 'If this is your first GP in Czechia, write “žádný”.',
        },
      ],
    },
    {
      title: 'Consent and signature',
      titleCs: 'Souhlas a podpis',
      fields: [
        {
          id: 'f14',
          label: 'Souhlasím s registrací u tohoto poskytovatele zdravotních služeb',
          meaning: 'You agree to be registered with this practice.',
          write: 'Mark the box with a cross.',
          need: 'required',
          note: 'Without this cross the practice can’t register you.',
        },
        {
          id: 'f15',
          label: 'Osoba, které lze podávat informace o mém zdravotním stavu',
          meaning: 'Someone the practice may tell about your health: a partner, a parent, a friend who interprets for you.',
          write: 'Their full name and phone number. Leave it empty if the practice should only talk to you.',
          example: 'PETRA NOVÁKOVÁ, +420 602 345 678',
          need: 'optional',
        },
        { id: 'f16', label: 'V … dne …', meaning: 'The place and date of signing.', write: 'The town after “V”, and today’s date after “dne”.', example: 'V Praze dne 5. 3. 2026', yours: 'today', need: 'required' },
        { id: 'f17', label: 'Podpis pacienta', meaning: 'Your signature.', write: 'Sign by hand, the way you sign your passport.', need: 'required' },
        { id: 'f18', label: 'Razítko a podpis lékaře', meaning: 'The doctor’s stamp and signature.', write: 'This is the practice’s box.', need: 'leave_empty' },
      ],
    },
  ],
  attach: [],
  handIn: undefined,
  watchOut: [
    'Two things need your own hand: the cross in the consent box and your signature. Without both, the form isn’t valid.',
    'Write “žádné” for allergies and medicines when you have none, instead of leaving the lines empty.',
  ],
  notStated: [
    'What to bring with it. The form doesn’t say; ask at the desk whether they need your insurance card and an ID.',
    'Whether the practice is taking new patients. A filled-in form isn’t a registration until the doctor signs it.',
  ],
};
