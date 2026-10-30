import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { ai, AnalyzeError, type Analysis, type AnalyzeResult, type Category } from '@/lib/ai';

export type CaseSource = 'camera' | 'library' | 'pdf' | 'text' | 'example';

export type CaseItem = {
  id: string;
  createdAt: string;
  source: CaseSource;
  imageUri?: string;
  fileName?: string;
  text?: string;
  sampleId?: string;
  hint?: Category;
  status: 'draft' | 'analyzing' | 'ready' | 'error';
  error?: string;
  result?: AnalyzeResult;
  replied?: boolean;
};

export const FREE_ANALYSES_PER_MONTH = 5;

const STORAGE_KEY = 'czechpal';
/** The app was called CzechReply; saved data from before the rename is read once, then moved. */
const LEGACY_STORAGE_KEY = 'czechreply';

const storage: StateStorage = {
  getItem: async (name) => (await AsyncStorage.getItem(name)) ?? (await AsyncStorage.getItem(LEGACY_STORAGE_KEY)),
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
    await AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
  },
  removeItem: (name) => AsyncStorage.removeItem(name),
};

type State = {
  hydrated: boolean;
  onboarded: boolean;
  cases: CaseItem[];
  usage: { month: string; used: number };
};

type Actions = {
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  createDraft: (input: Omit<CaseItem, 'id' | 'createdAt' | 'status'>) => string;
  setHint: (id: string, hint: Category | undefined) => void;
  discardDraft: (id: string) => void;
  analyze: (id: string) => Promise<void>;
  markReplied: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  resetUsage: () => void;
};

const thisMonth = () => new Date().toISOString().slice(0, 7);
const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => {
      const patch = (id: string, change: Partial<CaseItem>) =>
        set((s) => ({ cases: s.cases.map((c) => (c.id === id ? { ...c, ...change } : c)) }));

      return {
        hydrated: false,
        onboarded: false,
        cases: [],
        usage: { month: thisMonth(), used: 0 },

        completeOnboarding: () => set({ onboarded: true }),
        resetOnboarding: () => set({ onboarded: false }),

        createDraft: (input) => {
          const id = newId();
          set((s) => ({
            cases: [{ ...input, id, createdAt: new Date().toISOString(), status: 'draft' }, ...s.cases],
          }));
          return id;
        },

        setHint: (id, hint) => patch(id, { hint }),

        discardDraft: (id) =>
          set((s) => ({ cases: s.cases.filter((c) => !(c.id === id && c.status === 'draft')) })),

        analyze: async (id) => {
          const item = get().cases.find((c) => c.id === id);
          if (!item || item.status === 'analyzing') return;
          patch(id, { status: 'analyzing', error: undefined });
          try {
            const result = await ai.analyzeDocument({
              kind: item.source === 'text' || item.source === 'example' ? 'text' : item.source === 'pdf' ? 'pdf' : 'image',
              text: item.text,
              uri: item.imageUri,
              sampleId: item.source === 'example' ? item.sampleId : undefined,
              hint: item.hint,
            });
            // Allowance is consumed only by a successful analysis.
            set((s) => {
              const month = thisMonth();
              const used = s.usage.month === month ? s.usage.used + 1 : 1;
              return { usage: { month, used } };
            });
            patch(id, { status: 'ready', result, sampleId: result.sampleId });
          } catch (e) {
            const message =
              e instanceof AnalyzeError ? e.message : 'Something went wrong while reading this message. Please try again.';
            patch(id, { status: 'error', error: message });
          }
        },

        markReplied: (id) => patch(id, { replied: true }),
        remove: (id) => set((s) => ({ cases: s.cases.filter((c) => c.id !== id) })),
        clearAll: () => set({ cases: [] }),
        resetUsage: () => set({ usage: { month: thisMonth(), used: 0 } }),
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: ({ onboarded, cases, usage }) => ({
        onboarded,
        // Interrupted analyses come back as errors the user can retry; drafts are not kept.
        cases: cases
          .filter((c) => c.status !== 'draft')
          .map((c) => (c.status === 'analyzing' ? { ...c, status: 'error' as const, error: 'The analysis was interrupted.' } : c)),
        usage,
      }),
      // v1: analyses gained `kind`, `typeLabel` and `caution` (replacing `officialMatter`).
      version: 1,
      migrate: (persisted, from) => {
        const state = persisted as { cases?: CaseItem[] };
        if (from < 1 && state.cases) {
          state.cases = state.cases.map((c) => {
            const a = c.result?.analysis as (Analysis & { officialMatter?: boolean }) | undefined;
            if (!c.result || !a) return c;
            const { officialMatter, ...rest } = a;
            return {
              ...c,
              result: {
                ...c.result,
                analysis: {
                  ...rest,
                  kind: a.kind ?? 'document',
                  typeLabel: a.typeLabel ?? 'Letter',
                  caution: a.caution ?? (officialMatter ? 'official' : undefined),
                },
              },
            };
          });
        }
        return state as State & Actions;
      },
      onRehydrateStorage: () => () => useStore.setState({ hydrated: true }),
    },
  ),
);

export const useCase = (id: string | undefined) => useStore((s) => s.cases.find((c) => c.id === id));

export function useRemainingAnalyses() {
  return useStore((s) =>
    Math.max(0, FREE_ANALYSES_PER_MONTH - (s.usage.month === thisMonth() ? s.usage.used : 0)),
  );
}
