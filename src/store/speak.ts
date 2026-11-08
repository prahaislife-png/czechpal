import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { EvidenceEvent, SessionRecord } from '@/lib/speak/evidence';

/**
 * Speak Czech's private progress: one record per conversation and the evidence its review found.
 * No audio and no full transcript is kept, only the learner's own short quotes as evidence. Kept
 * on this phone in its own storage key, never sent anywhere, wiped by Settings → Delete everything.
 */

type State = {
  /** The learner agreed that their voice goes to OpenAI and the transcript to Anthropic. */
  consent: boolean;
  /** Show the partner's meaning under each line by default. */
  meaningOn: boolean;
  sessions: SessionRecord[];
  events: EvidenceEvent[];
  /** Words the learner hid from their list. */
  hidden: string[];
};

type Actions = {
  setConsent: (v: boolean) => void;
  setMeaningOn: (v: boolean) => void;
  saveSession: (record: SessionRecord, events: EvidenceEvent[]) => void;
  hideWord: (lemma: string) => void;
  clear: () => void;
};

const initial: State = { consent: false, meaningOn: false, sessions: [], events: [], hidden: [] };

/** Enough history for evidence and progress; the oldest fall away first. */
const MAX_SESSIONS = 200;
const MAX_EVENTS = 4000;

export const useSpeak = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,
      setConsent: (consent) => set({ consent }),
      setMeaningOn: (meaningOn) => set({ meaningOn }),
      saveSession: (record, events) =>
        set((s) => ({
          sessions: [...s.sessions.filter((r) => r.id !== record.id), record].slice(-MAX_SESSIONS),
          events: [...s.events.filter((e) => e.session !== record.id), ...events].slice(-MAX_EVENTS),
        })),
      hideWord: (lemma) => set((s) => ({ hidden: [...new Set([...s.hidden, lemma])] })),
      clear: () => set({ ...initial }),
    }),
    {
      name: 'czechpal-speak',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persisted) => persisted as State,
      partialize: ({ consent, meaningOn, sessions, events, hidden }) => ({ consent, meaningOn, sessions, events, hidden }),
    },
  ),
);
