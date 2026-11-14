import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Access } from '@/lib/plus/access';
import { purchasesConfigured } from '@/lib/plus/purchases';

/**
 * Whether this person has CzechLocal Plus, as the store last said. Kept on the phone so the
 * course opens offline; the store's answer replaces it whenever the app can reach it.
 *
 * `preview` exists only in development: it turns the paywall on, or pretends Plus is bought, so
 * the locked and unlocked states can be seen without the App Store.
 */

type State = {
  plus: boolean;
  /** When the current period ends, ISO; undefined when unknown or not subscribed. */
  until?: string;
  /** The subscription won't renew: it ends at `until`. */
  ending?: boolean;
  preview?: { live: boolean; plus: boolean };
};

type Actions = {
  setPlus: (next: Pick<State, 'plus' | 'until' | 'ending'>) => void;
  setPreview: (preview: State['preview']) => void;
  clear: () => void;
};

export const usePlusStore = create<State & Actions>()(
  persist(
    (set) => ({
      plus: false,
      until: undefined,
      ending: undefined,
      preview: undefined,
      setPlus: (next) => set(next),
      setPreview: (preview) => set({ preview }),
      clear: () => set({ plus: false, until: undefined, ending: undefined, preview: undefined }),
    }),
    { name: 'czechlocal-plus', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

const access = (s: State): Access => {
  const preview = __DEV__ ? s.preview : undefined;
  return { live: purchasesConfigured || !!preview?.live, plus: preview?.live ? preview.plus : s.plus };
};

/** Whether Plus is sold in this build, and whether this person has it. */
export function useAccess(): Access {
  const live = usePlusStore((s) => access(s).live);
  const plus = usePlusStore((s) => access(s).plus);
  return { live, plus };
}

export const getAccess = () => access(usePlusStore.getState());
