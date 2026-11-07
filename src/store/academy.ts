import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { addAttempts, makeAttempt, type Attempt, type AttemptSource } from '@/lib/academy/evidence';
import type { WritingFeedback } from '@/lib/ai/types';
import type { MarkedSection, MockRun, WritingSection } from '@/lib/academy/mock';
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
export type WritingAttempt = { at: string; texts: string[]; feedback?: WritingFeedback };
/** A finished speaking task: how many of its answers were recorded. Not a score. */
export type SpeakingRun = { at: string; recorded: number; prompts: number };
/** What the learner said about the real exam, once its date has passed. */
export type ExamResult = { examDate: string; result: 'passed' | 'failed' | 'waiting'; at: string };

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
  mocks: MockRun[];
  examResult?: ExamResult;
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
  /** AI feedback on the latest attempt at a writing task. */
  setWritingFeedback: (id: string, feedback: WritingFeedback) => void;
  finishSpeaking: (id: string, run: Omit<SpeakingRun, 'at'>) => void;
  /** Starts a mock exam and returns its id. */
  startMock: (speakingTasks: string[], variant: number) => string;
  saveMockSection: (id: string, section: 'reading' | 'listening', result: MarkedSection) => void;
  saveMockWriting: (id: string, result: WritingSection) => void;
  saveMockSpeaking: (id: string, task: string, recorded: number, prompts: number) => void;
  discardMock: (id: string) => void;
  setExamResult: (examDate: string, result: ExamResult['result']) => void;
  /** Settings → Delete everything. */
  clear: () => void;
};

const initial: State = { setupAt: undefined, diagnostic: undefined, attempts: [], lessons: {}, current: undefined, grammarSeen: {}, tasks: {}, writing: {}, speaking: {}, mocks: [], examResult: undefined };

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
      setWritingFeedback: (id, feedback) =>
        set((s) => {
          const runs = s.writing[id];
          if (!runs?.length) return {};
          return { writing: { ...s.writing, [id]: [...runs.slice(0, -1), { ...runs[runs.length - 1], feedback }] } };
        }),
      finishSpeaking: (id, run) =>
        set((s) => ({ speaking: { ...s.speaking, [id]: [...(s.speaking[id] ?? []), { at: new Date().toISOString(), ...run }].slice(-20) } })),
      startMock: (speakingTasks, variant) => {
        const id = `mock-${Date.now().toString(36)}`;
        set((s) => ({ mocks: [...s.mocks, { id, startedAt: new Date().toISOString(), variant, speakingTasks }].slice(-10) }));
        return id;
      },
      saveMockSection: (id, section, result) => set((s) => ({ mocks: s.mocks.map((m) => (m.id === id ? { ...m, [section]: result } : m)) })),
      saveMockWriting: (id, result) => set((s) => ({ mocks: s.mocks.map((m) => (m.id === id ? { ...m, writing: result } : m)) })),
      saveMockSpeaking: (id, task, recorded, prompts) =>
        set((s) => ({
          mocks: s.mocks.map((m) =>
            m.id === id ? { ...m, speaking: { at: new Date().toISOString(), tasks: { ...(m.speaking?.tasks ?? {}), [task]: { recorded, prompts } } } } : m,
          ),
        })),
      discardMock: (id) => set((s) => ({ mocks: s.mocks.filter((m) => m.id !== id) })),
      setExamResult: (examDate, result) => set({ examResult: { examDate, result, at: new Date().toISOString() } }),
      clear: () => set({ ...initial }),
    }),
    {
      name: 'czechpal-academy',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // Version 1 is the first; later versions add their steps here so no one's progress is lost.
      // Fields added within version 1 (tasks, writing, speaking, mocks, examResult) are optional on load and default to empty.
      migrate: (persisted) => persisted as State,
      partialize: ({ setupAt, diagnostic, attempts, lessons, current, grammarSeen, tasks, writing, speaking, mocks, examResult }) => ({
        setupAt,
        diagnostic,
        attempts,
        lessons,
        current,
        grammarSeen,
        tasks,
        writing,
        speaking,
        mocks,
        examResult,
      }),
    },
  ),
);
