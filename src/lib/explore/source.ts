import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

import { curatedPlaces } from './curated';
import { COLUMNS, fromRow, type Row } from './rows';
import type { ExplorePlace } from './types';

// v2: the 3 November re-import fixed places matched to the wrong kind; older copies are dropped.
const KEY = 'czechlocal-explore-places-v2';
const OLD_KEYS = ['czechlocal-explore-places'];
/** Parks don't move: a week-old copy is fine, and Explore opens at once from it. */
const FRESH_MS = 7 * 24 * 3600 * 1000;
const PAGE = 1000;

export type PlacesState = {
  places: ExplorePlace[];
  /** 'offline': only the hand-picked places, because the full list couldn't load. */
  status: 'loading' | 'ready' | 'offline';
  error: string | null;
  retry: () => void;
};

let memory: ExplorePlace[] | null = null;

/** A place by id from the full list, or from the hand-picked ones. */
export const placeById = (id: string): ExplorePlace | null => (memory ?? curatedPlaces).find((p) => p.id === id) ?? null;

/** The date of the latest import on the server: newer than the phone's copy means download again. */
async function latestImport(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('explore_places').select('checked_on').order('checked_on', { ascending: false }).limit(1);
  return (data?.[0] as { checked_on: string } | undefined)?.checked_on ?? null;
}

async function download(): Promise<ExplorePlace[]> {
  if (!supabase) throw new Error('not configured');
  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('explore_places')
      .select(COLUMNS)
      .order('id')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as Row[]));
    if (!data || data.length < PAGE) break;
  }
  if (!rows.length) throw new Error('empty');
  return rows.map(fromRow);
}

/**
 * Every outdoor place in Prague: from memory, then from the phone's copy, then from the server
 * when that copy is missing or older than a week. Without either, the hand-picked places show,
 * and the screen says so.
 */
export function useExplorePlaces(): PlacesState {
  const [state, setState] = useState<Omit<PlacesState, 'retry'>>(() =>
    memory ? { places: memory, status: 'ready', error: null } : { places: curatedPlaces, status: 'loading', error: null },
  );
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let stored: { at: number; places: ExplorePlace[] } | null = null;
      AsyncStorage.multiRemove(OLD_KEYS).catch(() => {});
      try {
        const raw = await AsyncStorage.getItem(KEY);
        stored = raw ? JSON.parse(raw) : null;
      } catch {
        stored = null;
      }
      if (stored?.places?.length && !cancelled) {
        memory = stored.places;
        setState({ places: stored.places, status: 'ready', error: null });
        if (attempt === 0) {
          // A week-old copy is refreshed; a newer copy is checked with one tiny request.
          const newest = Date.now() - stored.at < FRESH_MS ? await latestImport().catch(() => null) : 'stale';
          const have = stored.places.reduce((m, p) => (p.checkedOn > m ? p.checkedOn : m), '');
          if (newest !== 'stale' && (!newest || newest <= have)) return;
        }
      }
      try {
        const places = await download();
        memory = places;
        if (!cancelled) setState({ places, status: 'ready', error: null });
        AsyncStorage.setItem(KEY, JSON.stringify({ at: Date.now(), places })).catch(() => {});
      } catch {
        if (cancelled || stored?.places?.length) return;
        setState({
          places: curatedPlaces,
          status: 'offline',
          error: 'Couldn’t load every place just now, so you’re seeing a short list of well-known ones.',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { ...state, retry };
}
