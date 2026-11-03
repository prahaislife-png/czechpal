import type { IconName } from '@/components/ui/icon';

/**
 * Situations: the moments expats actually face in Prague, each with the phrases that get them
 * through it. Learn picks the one coming up next (a permit expiring, a bill due, a doctor's
 * letter) and gets the learner ready for it.
 *
 * DRAFT: written for CzechPal and checked by AI on 2026-11-03; a native-speaking Czech teacher
 * still needs to review them, as with the stories. Phrases avoid the past tense and adjectives
 * about the speaker, so they work whoever says them.
 */

export type SituationId = 'permit' | 'doctor' | 'flat' | 'bills' | 'office' | 'work' | 'post';

export type Phrase = { cs: string; en: string };

export type Situation = {
  id: SituationId;
  title: string;
  cs: string;
  icon: IconName;
  /** One line on what the phrases get you through. */
  why: string;
  phrases: Phrase[];
  /** A text in the library that plays the scene out. */
  practiceText?: string;
};

export const SITUATIONS_REVIEWED = false;

export const situations: Situation[] = [
  {
    id: 'permit',
    title: 'Renew your residence permit',
    cs: 'Prodloužení pobytu',
    icon: 'government',
    why: 'Your appointment at the Ministry of the Interior office: arriving, documents, fees, the new card.',
    practiceText: 'zmena-terminu',
    phrases: [
      { cs: 'Dobrý den, mám objednaný termín na deset hodin.', en: 'Hello, I have an appointment at ten.' },
      { cs: 'Jsem tady kvůli prodloužení pobytu.', en: 'I’m here to extend my residence permit.' },
      { cs: 'Tady je můj pas a průkaz o povolení k pobytu.', en: 'Here is my passport and my residence permit card.' },
      { cs: 'Mám s sebou doklad o zajištění ubytování.', en: 'I have my proof of accommodation with me.' },
      { cs: 'Které dokumenty ještě potřebujete?', en: 'Which documents do you still need?' },
      { cs: 'Můžu chybějící dokument donést později?', en: 'Can I bring the missing document later?' },
      { cs: 'Kde zaplatím správní poplatek?', en: 'Where do I pay the administrative fee?' },
      { cs: 'Budete mi dnes snímat otisky prstů?', en: 'Will you take my fingerprints today?' },
      { cs: 'Potřebuji potvrzení o podání žádosti.', en: 'I need a confirmation that my application was filed.' },
      { cs: 'Kdy si můžu vyzvednout novou kartu?', en: 'When can I collect the new card?' },
      { cs: 'Můžete to prosím zopakovat pomaleji?', en: 'Could you say that again more slowly, please?' },
      { cs: 'Nerozumím. Můžete mi to vysvětlit jednodušeji?', en: 'I don’t understand. Could you explain it more simply?' },
    ],
  },
  {
    id: 'doctor',
    title: 'See a doctor',
    cs: 'U lékaře',
    icon: 'doctor',
    why: 'Booking, saying what’s wrong, medicines, a sick note and a prescription.',
    practiceText: 'u-lekare',
    phrases: [
      { cs: 'Potřebuji se objednat k lékaři.', en: 'I need to make an appointment with the doctor.' },
      { cs: 'Dobrý den, mám objednaný termín.', en: 'Hello, I have an appointment.' },
      { cs: 'Bolí mě v krku.', en: 'I have a sore throat.' },
      { cs: 'Od včera mám horečku.', en: 'I’ve had a temperature since yesterday.' },
      { cs: 'Bolí mě tady.', en: 'It hurts here.' },
      { cs: 'Beru tyto léky.', en: 'I take these medicines.' },
      { cs: 'Mám alergii na penicilin.', en: 'I’m allergic to penicillin.' },
      { cs: 'Moje pojišťovna je VZP.', en: 'My health insurer is VZP.' },
      { cs: 'Potřebuji neschopenku pro zaměstnavatele.', en: 'I need a sick note for my employer.' },
      { cs: 'Můžete mi napsat recept?', en: 'Could you write me a prescription?' },
      { cs: 'Jak často to mám brát?', en: 'How often should I take it?' },
      { cs: 'Kdy mám přijít na kontrolu?', en: 'When should I come back for a check-up?' },
    ],
  },
  {
    id: 'flat',
    title: 'Your flat and landlord',
    cs: 'Byt a pronajímatel',
    icon: 'housing',
    why: 'Viewing a flat, rent and deposit, the lease, repairs and moving out.',
    practiceText: 'novy-byt',
    phrases: [
      { cs: 'Dobrý den, volám kvůli inzerátu na byt.', en: 'Hello, I’m calling about the flat in your advert.' },
      { cs: 'Je byt ještě volný?', en: 'Is the flat still available?' },
      { cs: 'Kdy se můžu přijít podívat?', en: 'When can I come and see it?' },
      { cs: 'Kolik je nájem včetně záloh na energie?', en: 'How much is the rent including the advance for utilities?' },
      { cs: 'Jak vysoká je kauce?', en: 'How much is the deposit?' },
      { cs: 'Od kdy se dá nastěhovat?', en: 'From when can I move in?' },
      { cs: 'Na jak dlouho je nájemní smlouva?', en: 'How long is the lease?' },
      { cs: 'Potřebuji doklad o zajištění ubytování pro cizineckou policii.', en: 'I need a proof of accommodation for the foreign police.' },
      { cs: 'Nefunguje topení.', en: 'The heating isn’t working.' },
      { cs: 'Kape kohoutek.', en: 'The tap is dripping.' },
      { cs: 'Kdy může přijít opravář?', en: 'When can the repair person come?' },
      { cs: 'Chci dát výpověď z nájmu.', en: 'I want to give notice on the lease.' },
    ],
  },
  {
    id: 'bills',
    title: 'Bills and payments',
    cs: 'Účty a platby',
    icon: 'money',
    why: 'Paying on time, checking a bill, advance payments and meter readings.',
    phrases: [
      { cs: 'Do kdy mám zaplatit?', en: 'By when do I have to pay?' },
      { cs: 'Jaký je variabilní symbol?', en: 'What is the variable symbol?' },
      { cs: 'Na jaké číslo účtu mám platit?', en: 'Which account number should I pay to?' },
      { cs: 'Platba už odešla.', en: 'The payment has already been sent.' },
      { cs: 'Myslím, že vyúčtování není správné.', en: 'I think the statement isn’t right.' },
      { cs: 'Proč je nedoplatek tak vysoký?', en: 'Why is the amount still owed so high?' },
      { cs: 'Kdy mi vrátíte přeplatek?', en: 'When will you pay back the overpayment?' },
      { cs: 'Můžu to zaplatit ve splátkách?', en: 'Can I pay it in instalments?' },
      { cs: 'Chci snížit měsíční zálohy.', en: 'I want to lower my monthly advance payments.' },
      { cs: 'Kdy přijdete odečíst elektroměr?', en: 'When are you coming to read the electricity meter?' },
    ],
  },
  {
    id: 'office',
    title: 'At an office',
    cs: 'Na úřadě',
    icon: 'legal',
    why: 'Town hall, CzechPOINT and other offices: queues, forms, certificates and fees.',
    phrases: [
      { cs: 'Kde si vezmu pořadové číslo?', en: 'Where do I take a queue number?' },
      { cs: 'Je tady CzechPOINT?', en: 'Is there a CzechPOINT here?' },
      { cs: 'Který formulář mám vyplnit?', en: 'Which form should I fill in?' },
      { cs: 'Potřebuji výpis z rejstříku trestů.', en: 'I need an extract from the criminal record.' },
      { cs: 'Potřebuji úředně ověřit podpis.', en: 'I need a signature certified.' },
      { cs: 'Musím přijít osobně?', en: 'Do I have to come in person?' },
      { cs: 'Můžu zaplatit kartou?', en: 'Can I pay by card?' },
      { cs: 'Do kdy to bude vyřízené?', en: 'By when will it be done?' },
      { cs: 'Můžete mi to poslat do datové schránky?', en: 'Could you send it to my data box?' },
      { cs: 'Mluví tady někdo anglicky?', en: 'Does anyone here speak English?' },
    ],
  },
  {
    id: 'work',
    title: 'At work',
    cs: 'V práci',
    icon: 'work',
    why: 'Pay, leave, calling in sick and the papers your permit needs from your employer.',
    practiceText: 'prvni-den-v-praci',
    phrases: [
      { cs: 'Potřebuji potvrzení o zaměstnání.', en: 'I need a confirmation of employment.' },
      { cs: 'Mám dotaz k pracovní smlouvě.', en: 'I have a question about my employment contract.' },
      { cs: 'Kdy je výplata?', en: 'When is payday?' },
      { cs: 'Kdy dostanu výplatní pásku?', en: 'When will I get my payslip?' },
      { cs: 'Dnes nemůžu přijít, je mi špatně.', en: 'I can’t come in today, I feel unwell.' },
      { cs: 'Můžu si vzít dovolenou od pondělí?', en: 'Can I take leave from Monday?' },
      { cs: 'Kolik mám ještě dní dovolené?', en: 'How many days of leave do I have left?' },
      { cs: 'Na koho se mám obrátit?', en: 'Who should I ask about this?' },
      { cs: 'Můžeme si domluvit schůzku?', en: 'Can we arrange a meeting?' },
      { cs: 'Můžete mi to poslat e-mailem?', en: 'Could you send it to me by email?' },
    ],
  },
  {
    id: 'post',
    title: 'At the post office',
    cs: 'Na poště',
    icon: 'mail',
    why: 'Collecting a parcel or registered letter, and sending one.',
    practiceText: 'na-poste',
    phrases: [
      { cs: 'Dobrý den, mám tady k vyzvednutí zásilku.', en: 'Hello, I have a parcel to collect here.' },
      { cs: 'Tady je oznámení o uložení zásilky.', en: 'Here is the notice that a parcel is waiting.' },
      { cs: 'Může zásilku vyzvednout někdo jiný?', en: 'Can someone else collect the parcel?' },
      { cs: 'Potřebuji poslat doporučený dopis.', en: 'I need to send a registered letter.' },
      { cs: 'Kolik stojí poslat to do zahraničí?', en: 'How much does it cost to send this abroad?' },
      { cs: 'Kdy to dojde?', en: 'When will it arrive?' },
      { cs: 'Potřebuji obálku.', en: 'I need an envelope.' },
      { cs: 'Můžu tady zaplatit kartou?', en: 'Can I pay by card here?' },
    ],
  },
];

export const situationById = (id: string | undefined) => situations.find((s) => s.id === id);

/** A phrase's stable id, for remembering how it went: 'doctor:3'. */
export const phraseId = (s: SituationId, index: number) => `${s}:${index}`;
