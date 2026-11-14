import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ai, AnalyzeError, isDemoMode, type FormGuide, type FormGuideInput, type LanguageCode } from '@/lib/ai';
import { SAMPLE_FORM_GUIDE } from '@/lib/ai/form-sample';

import { useStore } from './cases';

/**
 * Form guides, kept on this phone: the guide itself and which fields are ticked off. The photo or
 * PDF is not kept; once the guide exists it isn't needed. Wiped by Settings → Delete everything.
 */

export type FormSource = Pick<FormGuideInput, 'kind' | 'text' | 'uri' | 'uris'>;

export type FormDoc = {
  id: string;
  createdAt: string;
  status: 'working' | 'ready' | 'error';
  /** The built-in example: no AI call, nothing counted. */
  example?: boolean;
  guide?: FormGuide;
  /** Fields ticked off, by id. */
  done: Record<string, boolean>;
  error?: string;
  errorCode?: AnalyzeError['code'];
  language?: LanguageCode;
};

type State = { forms: FormDoc[] };

type Actions = {
  /** Starts a guide for a photographed, picked or pasted form and returns its id. */
  start: (source: FormSource) => string;
  /** Opens the built-in example and returns its id. */
  openExample: () => string;
  retry: (id: string) => void;
  toggle: (id: string, field: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const MAX_FORMS = 30;
const newId = () => `form-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** What is being read right now, by form id: for a retry, and the fields written so far. Never saved. */
const sources = new Map<string, FormSource>();
export const useFormProgress = create<{ byId: Record<string, number | undefined> }>(() => ({ byId: {} }));

export const useForms = create<State & Actions>()(
  persist(
    (set, get) => {
      const patch = (id: string, change: Partial<FormDoc>) => set((s) => ({ forms: s.forms.map((f) => (f.id === id ? { ...f, ...change } : f)) }));

      const run = async (id: string) => {
        const source = sources.get(id);
        if (!source) return patch(id, { status: 'error', errorCode: 'unreadable', error: 'The photo is no longer on this phone. Start again with a new photo of the form.' });
        patch(id, { status: 'working', error: undefined, errorCode: undefined });
        const { language, about } = useStore.getState();
        try {
          const result = await ai.formGuide({
            ...source,
            language,
            about: about.stay || about.expires || about.district ? { stay: about.stay, expires: about.expires, district: about.district } : undefined,
            onProgress: (fields) => useFormProgress.setState((s) => ({ byId: { ...s.byId, [id]: fields } })),
          });
          // Deleted while it was being written: nothing to save.
          if (!get().forms.some((f) => f.id === id)) return;
          patch(id, { status: 'ready', guide: result.guide, language, example: result.demo || undefined });
          sources.delete(id);
          if (!isDemoMode) void useStore.getState().syncAllowance();
        } catch (e) {
          const known = e instanceof AnalyzeError;
          patch(id, { status: 'error', errorCode: known ? e.code : 'server', error: known ? e.message : 'Something went wrong. Please try again.' });
        } finally {
          useFormProgress.setState((s) => ({ byId: { ...s.byId, [id]: undefined } }));
        }
      };

      return {
        forms: [],
        start: (source) => {
          const id = newId();
          sources.set(id, source);
          set((s) => ({ forms: [{ id, createdAt: new Date().toISOString(), status: 'working' as const, done: {} }, ...s.forms].slice(0, MAX_FORMS) }));
          void run(id);
          return id;
        },
        openExample: () => {
          const existing = get().forms.find((f) => f.example && f.status === 'ready');
          if (existing) return existing.id;
          const id = newId();
          set((s) => ({ forms: [...s.forms, { id, createdAt: new Date().toISOString(), status: 'ready' as const, example: true, guide: SAMPLE_FORM_GUIDE, done: {} }] }));
          return id;
        },
        retry: (id) => void run(id),
        toggle: (id, field) =>
          set((s) => ({ forms: s.forms.map((f) => (f.id === id ? { ...f, done: { ...f.done, [field]: !f.done[field] } } : f)) })),
        remove: (id) => {
          sources.delete(id);
          set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
        },
        clear: () => {
          sources.clear();
          set({ forms: [] });
        },
      };
    },
    {
      name: 'czechlocal-forms',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // A guide that was being written when the app closed can't be finished: its photo is gone.
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.forms = state.forms.map((f) =>
          f.status === 'working' ? { ...f, status: 'error' as const, errorCode: 'network' as const, error: 'The app closed before the guide was finished. Start again with a new photo of the form.' } : f,
        );
      },
    },
  ),
);
