import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import {
  analyzerFor,
  AnalyzeError,
  DEFAULT_LANGUAGE,
  isDemoMode,
  type Analysis,
  type AnalyzeResult,
  type Category,
  type LanguageCode,
  type PartialAnalysis,
} from '@/lib/ai';

export type CaseSource = 'camera' | 'library' | 'pdf' | 'text' | 'example';

export type CaseItem = {
  id: string;
  createdAt: string;
  source: CaseSource;
  /** The photo, or the first page of a photographed document. */
  imageUri?: string;
  /** Further pages of the same document, in order. */
  morePages?: string[];
  /** Local copy of a picked or shared PDF. */
  fileUri?: string;
  fileName?: string;
  text?: string;
  sampleId?: string;
  hint?: Category;
  /** The language the explanation was written in. */
  language?: LanguageCode;
  status: 'draft' | 'analyzing' | 'ready' | 'error';
  error?: string;
  errorCode?: AnalyzeError['code'];
  result?: AnalyzeResult;
  replied?: boolean;
};

export const FREE_ANALYSES_PER_MONTH = 5;
/** Pages per photographed document. Must match MAX_PAGES in supabase/functions/_shared/analyze-input.ts. */
export const MAX_PAGES = 5;

/** All photographed pages of a case, first page first. */
export const pagesOf = (item: Pick<CaseItem, 'imageUri' | 'morePages'>) =>
  item.imageUri ? [item.imageUri, ...(item.morePages ?? [])] : [];

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
  /** The user agreed that their text may be sent to the AI service (asked once, before the first live explanation). */
  aiConsent: boolean;
  /** The language explanations are written in. */
  language: LanguageCode;
};

type Actions = {
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  createDraft: (input: Omit<CaseItem, 'id' | 'createdAt' | 'status'>) => string;
  setHint: (id: string, hint: Category | undefined) => void;
  /** Adds photographed pages to a draft, up to MAX_PAGES. */
  addPages: (id: string, uris: string[]) => void;
  /** Removes one page of a draft; the last page can't be removed. */
  removePage: (id: string, index: number) => void;
  discardDraft: (id: string) => void;
  analyze: (id: string) => Promise<void>;
  markReplied: (id: string) => void;
  remove: (id: string) => void;
  clearAll: () => void;
  resetUsage: () => void;
  setAiConsent: (value: boolean) => void;
  setLanguage: (language: LanguageCode) => void;
};

/**
 * Explanations still being written, by case id: shown on screen as they stream in, never saved.
 * Kept out of the persisted store so a stream of small updates doesn't rewrite storage each time.
 */
export const usePartials = create<{ byId: Record<string, PartialAnalysis | undefined> }>(() => ({ byId: {} }));
const setPartial = (id: string, partial: PartialAnalysis | undefined) =>
  usePartials.setState((s) => ({ byId: { ...s.byId, [id]: partial } }));

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
        aiConsent: false,
        language: DEFAULT_LANGUAGE,

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

        addPages: (id, uris) => {
          const item = get().cases.find((c) => c.id === id);
          if (!item || item.status !== 'draft') return;
          const pages = [...pagesOf(item), ...uris].slice(0, MAX_PAGES);
          patch(id, { imageUri: pages[0], morePages: pages.slice(1) });
        },

        removePage: (id, index) => {
          const item = get().cases.find((c) => c.id === id);
          if (!item || item.status !== 'draft') return;
          const pages = pagesOf(item);
          if (pages.length < 2) return;
          const kept = pages.filter((_, i) => i !== index);
          patch(id, { imageUri: kept[0], morePages: kept.slice(1) });
        },

        discardDraft: (id) =>
          set((s) => ({ cases: s.cases.filter((c) => !(c.id === id && c.status === 'draft')) })),

        analyze: async (id) => {
          const item = get().cases.find((c) => c.id === id);
          if (!item || item.status === 'analyzing') return;
          // Built-in samples are written in English. A retry keeps the language it was first
          // explained in; a new explanation uses the current setting.
          const language = item.source === 'example' || isDemoMode ? DEFAULT_LANGUAGE : (item.language ?? get().language);
          patch(id, { status: 'analyzing', error: undefined, errorCode: undefined, language });
          try {
            const result = await analyzerFor(item).analyzeDocument({
              kind: item.source === 'text' || item.source === 'example' ? 'text' : item.source === 'pdf' ? 'pdf' : 'image',
              text: item.text,
              uri: item.imageUri ?? item.fileUri,
              uris: item.imageUri ? pagesOf(item) : undefined,
              language,
              requestId: id,
              sampleId: item.source === 'example' ? item.sampleId : undefined,
              hint: item.hint,
              onPartial: (partial) => setPartial(id, partial),
            });
            // Examples are free. Otherwise only a successful explanation counts, and the
            // server's own count wins when it sends one.
            if (item.source !== 'example') {
              set((s) => {
                const month = thisMonth();
                const used =
                  result.remaining !== undefined
                    ? Math.max(0, FREE_ANALYSES_PER_MONTH - result.remaining)
                    : (s.usage.month === month ? s.usage.used : 0) + 1;
                return { usage: { month, used } };
              });
            }
            patch(id, { status: 'ready', result, sampleId: result.sampleId });
          } catch (e) {
            const message =
              e instanceof AnalyzeError ? e.message : 'Something went wrong while reading this message. Please try again.';
            patch(id, { status: 'error', error: message, errorCode: e instanceof AnalyzeError ? e.code : 'server' });
          } finally {
            setPartial(id, undefined);
          }
        },

        markReplied: (id) => patch(id, { replied: true }),
        remove: (id) => set((s) => ({ cases: s.cases.filter((c) => c.id !== id) })),
        clearAll: () => set({ cases: [] }),
        resetUsage: () => set({ usage: { month: thisMonth(), used: 0 } }),
        setAiConsent: (aiConsent) => set({ aiConsent }),
        setLanguage: (language) => set({ language }),
      };
    },
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: ({ onboarded, cases, usage, aiConsent, language }) => ({
        onboarded,
        aiConsent,
        language,
        // Interrupted analyses come back as errors the user can retry; drafts are not kept.
        cases: cases
          .filter((c) => c.status !== 'draft')
          .map((c) =>
            c.status === 'analyzing'
              ? { ...c, status: 'error' as const, error: 'The explanation was interrupted.', errorCode: 'network' as const }
              : c,
          ),
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

export const usePartial = (id: string | undefined) => usePartials((s) => (id ? s.byId[id] : undefined));

export function useRemainingAnalyses() {
  return useStore((s) =>
    Math.max(0, FREE_ANALYSES_PER_MONTH - (s.usage.month === thisMonth() ? s.usage.used : 0)),
  );
}
