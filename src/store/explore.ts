import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ExplorePlace } from '@/lib/explore/types';

type Saved = { place: ExplorePlace; savedAt: number };

type ExploreState = {
  /** Bookmarked places, with a copy of each so the list survives a change in the data source. */
  saved: Record<string, Saved>;
  toggleSaved: (place: ExplorePlace) => void;
  /** A place another screen asked the map to show (Details › Show on map). Not persisted. */
  focusRequest: string | null;
  requestFocus: (id: string | null) => void;
};

/** Saved places stay on the phone, like Learn: nothing to sync until there is a real sign-in. */
export const useExplore = create<ExploreState>()(
  persist(
    (set) => ({
      saved: {},
      toggleSaved: (place) =>
        set((s) => {
          const saved = { ...s.saved };
          if (saved[place.id]) delete saved[place.id];
          else saved[place.id] = { place, savedAt: Date.now() };
          return { saved };
        }),
      focusRequest: null,
      requestFocus: (focusRequest) => set({ focusRequest }),
    }),
    {
      name: 'czechlocal-explore',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: ({ saved }) => ({ saved }),
    },
  ),
);

export const useIsSaved = (id: string) => useExplore((s) => !!s.saved[id]);
