import type { TopicId } from '@/lib/academy/types';

import type { SpeakSituation } from './types';

/**
 * Speak Czech conversations. The partner's side of each (role, objectives, pitch) is written on the
 * server in speak-policy.ts; this is what the learner sees. Ids must match SPEAK_SITUATIONS there.
 * Original CzechLocal content, AI-checked, not teacher-reviewed.
 */
export type SituationInfo = {
  id: SpeakSituation;
  title: string;
  titleCs: string;
  /** One line under the title. */
  subtitle: string;
  /** What this conversation practises, shown before it starts and as the topic chip during it. */
  objectives: string[];
  /** Useful phrases to glance at before starting. */
  phrases: { cs: string; en: string }[];
  /** The A2 Academy topic it belongs to, for "practise next". */
  topic: TopicId | null;
};

export const speakSituations: SituationInfo[] = [
  {
    id: 'free',
    title: 'Free talk',
    titleCs: 'Volná konverzace',
    subtitle: 'An easy chat about you and everyday life',
    objectives: ['Answer simple questions about yourself', 'Keep a short conversation going', 'Ask one question back'],
    phrases: [
      { cs: 'Jmenuju se…', en: 'My name is…' },
      { cs: 'Bydlím v Praze.', en: 'I live in Prague.' },
      { cs: 'Můžete to zopakovat?', en: 'Can you say that again?' },
      { cs: 'Nerozumím.', en: 'I don’t understand.' },
      { cs: 'A vy?', en: 'And you?' },
    ],
    topic: 'personal',
  },
  {
    id: 'doctor',
    title: 'At the doctor’s',
    titleCs: 'U lékaře',
    subtitle: 'Say what’s wrong, since when, and ask a question',
    objectives: ['Say what’s wrong', 'Say since when', 'Answer the doctor’s questions', 'Understand simple advice', 'Ask one question'],
    phrases: [
      { cs: 'Bolí mě hlava.', en: 'I have a headache.' },
      { cs: 'Mám horečku.', en: 'I have a temperature.' },
      { cs: 'Od včera.', en: 'Since yesterday.' },
      { cs: 'Jsem alergický / alergická na…', en: 'I’m allergic to…' },
      { cs: 'Kdy mám přijít znovu?', en: 'When should I come again?' },
    ],
    topic: 'health',
  },
];

export const situationById = (id: string | undefined) => speakSituations.find((s) => s.id === id);
