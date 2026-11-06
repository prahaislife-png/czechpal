import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addAttempts, makeAttempt, type Attempt, type AttemptSource } from '@/lib/academy/evidence';
import type { LessonLog, LessonRun } from '@/lib/academy/roadmap';
import type { ContentMeta } from '@/lib/academy/types';

/**
 * A2 Academy's private progress: every answer as evidence, finished lessons and the starting
 * check. Kept on this phone in its own storage key, never sent anywhere, and wiped by
 * Settings → Delete everything. The plan answers (level, minutes, exam date) live in Learn's plan.
 */

export type DiagnosticResult = { at: string; right: number; total: number };
/** A finished exam-task set. */
export type TaskRun = { at: string; right: number; total: number; mode: 'learn' | 'exam' };
/** A saved piece of writing: the answers (form) or the e-mail, as written. */
export type WritingAttempt = { at: string; texts: string[] };
/** A finished speaking task: how many of its answers were recorded. Not a score. */
export type SpeakingRun = { at: string; recorded: number; prompts: number };

type State = {
  /** When the A2 setup was finished. */
  setupAt?: string;
  diagnostic?: DiagnosticResult;
  attempts: Attempt[];
  lessons: LessonLog;
  /** The lesson last opened and not finished, for Continue. */
  current?: string;
  /** Grammar items opened, by id, with the date. */
  grammarSeen: Record<string, string>;
  tasks: Record<string, TaskRun[]>;
  writing: Record<string, WritingAttempt[]>;
  speaking: Record<string, SpeakingRun[]>;
};

type Item = Pick<ContentMeta, 'id' | 'version' | 'skill' | 'objectives' | 'topic'>;

type Actions = {
  finishSetup: () => void;
  /** One answered item. */
  record: (item: Item, correct: boolean | null, source: AttemptSource) => void;
  finishDiagnostic: (right: number, total: number) => void;
  startLesson: (id: string) => void;
  /** A lesson's check is finished: its marked items, right of total. */
  finishLesson: (id: string, right: number, total: number) => void;
  seeGrammar: (id: string) => void;
  finishTask: (id: string, right: number, total: number, mode: TaskRun['mode']) => void;
  saveWriting: (id: string, texts: string[]) => void;
  finishSpeaking: (id: string, run: Omit<SpeakingRun, 'at'>) => void;
  /** Settings → Delete everything. */
  clear: () => void;
};

const initial: State = { setupAt: undefined, diagnostic: undefined, attempts: [], lessons: {}, current: undefined, grammarSeen: {}, tasks: {}, writing: {}, speaking: {} };

export const useAcademy = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,
      finishSetup: () => set((s) => ({ setupAt: s.setupAt ?? new Date().toISOString() })),
      record: (item, correct, source) => set((s) => ({ attempts: addAttempts(s.attempts, [makeAttempt(item, correct, source, s.attempts)]) })),
      finishDiagnostic: (right, total) => set({ diagnostic: { at: new Date().toISOString(), right, total } }),
      startLesson: (id) => set({ current: id }),
      finishLesson: (id, right, total) =>
        set((s) => {
          const run: LessonRun = { at: new Date().toISOString(), right, total };
          return { lessons: { ...s.lessons, [id]: [...(s.lessons[id] ?? []), run].slice(-20) }, current: s.current === id ? undefined : s.current };
        }),
      seeGrammar: (id) => set((s) => ({ grammarSeen: { ...s.grammarSeen, [id]: new Date().toISOString() } })),
      finishTask: (id, right, total, mode) =>
        set((s) => ({ tasks: { ...s.tasks, [id]: [...(s.tasks[id] ?? []), { at: new Date().toISOString(), right, total, mode }].slice(-20) } })),
      saveWriting: (id, texts) =>
        set((s) => ({ writing: { ...s.writing, [id]: [...(s.writing[id] ?? []), { at: new Date().toISOString(), texts }].slice(-10) } })),
      finishSpeaking: (id, run) =>
        set((s) => ({ speaking: { ...s.speaking, [id]: [...(s.speaking[id] ?? []), { at: new Date().toISOString(), ...run }].slice(-20) } })),
      clear: () => set({ ...initial }),
    }),
    {
      name: 'czechpal-academy',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Version 1 is the first; later versions add their steps here so no one's progress is lost.
      // Fields added within version 1 (tasks, writing, speaking) are optional on load and default to empty.
      migrate: (persisted) => persisted as State,
      partialize: ({ setupAt, diagnostic, attempts, lessons, current, grammarSeen, tasks, writing, speaking }) => ({
        setupAt,
        diagnostic,
        attempts,
        lessons,
        current,
        grammarSeen,
        tasks,
        writing,
        speaking,
      }),
    },
  ),
);
