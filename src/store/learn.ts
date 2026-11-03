import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { dayKey, logDay, type Days } from '@/lib/learn/activity';
import { contentById } from '@/lib/learn/content';
import { addOwnCard, answerCard, removeCard, saveWord, type Deck, type OwnCardError, type UserCard } from '@/lib/learn/deck';
import {
  answerQuestion,
  completeChapter,
  emptyProgress,
  openChapter,
  saveOffset,
  toggleBookmark,
  type ReadingProgress,
} from '@/lib/learn/progress';
import { makeProfile, type LearnProfile } from '@/lib/learn/profile';
import { rememberPhrase, type PhraseMemory } from '@/lib/learn/session';
import type { Situation } from '@/lib/learn/situations';
import type { Answer, ReviewEntry } from '@/lib/learn/srs';

/**
 * Learn's private progress: the learner's plan, reading places, quiz answers, saved words and
 * their review schedule, and what they did each day.
 * Kept on this phone, like the rest of CzechPal, in its own storage key so it never touches
 * explanations. Shared lessons are bundled content (src/lib/learn/content), never stored here.
 */

export type Direction = 'cs-en' | 'en-cs';

type State = {
  progress: Record<string, ReadingProgress>;
  /** The text opened last, for Continue on Learn's home. */
  lastContentId?: string;
  deck: Deck;
  /** The latest reviews, newest last; capped, for statistics later. */
  reviews: ReviewEntry[];
  direction: Direction;
  showTranslation: boolean;
  /** Speech rate for the device voice. */
  rate: number;
  /** Set once the learner makes a plan; until then Learn offers to make one. */
  profile?: LearnProfile;
  days: Days;
  /** Best listening score per mission, 0 to 1. */
  missionListening: Record<string, number>;
  /** How each situation phrase went in practice. */
  phrases: PhraseMemory;
};

type Actions = {
  open: (contentId: string, chapter: number) => void;
  saveOffset: (contentId: string, chapter: number, offset: number) => void;
  completeChapter: (contentId: string, chapter: number) => void;
  answer: (contentId: string, questionId: string, option: number) => void;
  toggleBookmark: (contentId: string) => void;
  saveWord: (lexemeId: string, example?: UserCard['example']) => void;
  addOwnCard: (cs: string, en: string) => OwnCardError | null;
  removeCard: (id: string) => void;
  /** Returns false when the card wasn't due (an answer sent twice). */
  answerCard: (id: string, answer: Answer) => boolean;
  setDirection: (direction: Direction) => void;
  setShowTranslation: (value: boolean) => void;
  setRate: (rate: number) => void;
  setProfile: (profile: Omit<LearnProfile, 'updatedAt'>) => void;
  /** A listening session finished: `right` of `total`, for a mission when it was one. */
  finishListening: (right: number, total: number, missionId?: string) => void;
  /** A situation phrase was practised: whether the learner knew it. */
  practisePhrase: (id: string, knew: boolean) => void;
  /** Adds a situation's phrases to Your words; returns how many were new. */
  savePhrases: (situation: Situation) => number;
  /** The daily session reached its end. */
  finishSession: () => void;
  /** Settings → Delete everything. */
  clear: () => void;
};

const MAX_REVIEWS = 2000;

const initial: State = {
  progress: {},
  deck: {},
  reviews: [],
  direction: 'cs-en',
  showTranslation: false,
  rate: 0.85,
  profile: undefined,
  days: {},
  missionListening: {},
  phrases: {},
};

export const useLearn = create<State & Actions>()(
  persist(
    (set, get) => {
      /** Applies a progress change to a known text; unknown ids change nothing. */
      const withProgress = (contentId: string, change: (p: ReadingProgress) => ReadingProgress, opened = false) => {
        if (!contentById(contentId)) return;
        set((s) => ({
          progress: { ...s.progress, [contentId]: change(s.progress[contentId] ?? emptyProgress(contentId)) },
          ...(opened ? { lastContentId: contentId } : {}),
        }));
      };

      return {
        ...initial,
        open: (contentId, chapter) => withProgress(contentId, (p) => openChapter(p, contentById(contentId)!, chapter), true),
        saveOffset: (contentId, chapter, offset) => withProgress(contentId, (p) => saveOffset(p, chapter, offset)),
        completeChapter: (contentId, chapter) => {
          const before = get().progress[contentId]?.completedChapters.length ?? 0;
          withProgress(contentId, (p) => completeChapter(p, contentById(contentId)!, chapter));
          // Only a chapter finished for the first time counts towards today.
          if ((get().progress[contentId]?.completedChapters.length ?? 0) > before) set((s) => ({ days: logDay(s.days, { chapters: 1 }) }));
        },
        answer: (contentId, questionId, option) => withProgress(contentId, (p) => answerQuestion(p, contentById(contentId)!, questionId, option)),
        toggleBookmark: (contentId) => withProgress(contentId, (p) => toggleBookmark(p)),
        saveWord: (lexemeId, example) => set((s) => ({ deck: saveWord(s.deck, lexemeId, example) })),
        addOwnCard: (cs, en) => {
          const next = addOwnCard(get().deck, cs, en);
          if (typeof next === 'string') return next;
          set({ deck: next });
          return null;
        },
        removeCard: (id) => set((s) => ({ deck: removeCard(s.deck, id) })),
        answerCard: (id, answer) => {
          const { deck, entry } = answerCard(get().deck, id, answer);
          if (!entry) return false;
          set((s) => ({ deck, reviews: [...s.reviews, entry].slice(-MAX_REVIEWS), days: logDay(s.days, { reviews: 1 }) }));
          return true;
        },
        setDirection: (direction) => set({ direction }),
        setShowTranslation: (showTranslation) => set({ showTranslation }),
        setRate: (rate) => set({ rate }),
        setProfile: (profile) => set({ profile: makeProfile(profile) }),
        finishListening: (right, total, missionId) => {
          if (total <= 0) return;
          set((s) => ({
            days: logDay(s.days, { listening: 1, heard: total, heardRight: right }),
            missionListening: missionId ? { ...s.missionListening, [missionId]: Math.max(s.missionListening[missionId] ?? 0, right / total) } : s.missionListening,
          }));
        },
        practisePhrase: (id, knew) =>
          set((s) => ({ phrases: rememberPhrase(s.phrases, id, knew, dayKey()), days: logDay(s.days, { phrases: 1 }) })),
        savePhrases: (situation) => {
          let deck = get().deck;
          let added = 0;
          const stamp = Date.now().toString(36);
          for (const [i, p] of situation.phrases.entries()) {
            // Own ids are made from the time; several in one go need telling apart.
            const next = addOwnCard(deck, p.cs, p.en, new Date(), `own:${stamp}-${i}`);
            if (typeof next === 'string') continue;
            deck = next;
            added++;
          }
          set({ deck });
          return added;
        },
        finishSession: () => set((s) => ({ days: logDay(s.days, { sessions: 1 }) })),
        clear: () => set({ ...initial }),
      };
    },
    {
      name: 'czechpal-learn',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: ({ progress, lastContentId, deck, reviews, direction, showTranslation, rate, profile, days, missionListening, phrases }) => ({
        progress,
        lastContentId,
        deck,
        reviews,
        direction,
        showTranslation,
        rate,
        profile,
        days,
        missionListening,
        phrases,
      }),
    },
  ),
);
