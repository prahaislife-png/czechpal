import type { Ref } from 'react';

import type { Bounds } from '@/lib/explore/filter';
import type { ExplorePlace, LatLng, PlaceCategory } from '@/lib/explore/types';

export type MapLayer = 'light' | 'detailed' | 'satellite';

export const layerLabels: Record<MapLayer, string> = { light: 'Calm', detailed: 'Detailed', satellite: 'Satellite' };

/** Satellite needs imagery we'd have to pay for on the web, so the web map offers two styles. */
export const mapLayers: MapLayer[] = process.env.EXPO_OS === 'web' ? ['light', 'detailed'] : ['light', 'detailed', 'satellite'];

export type ExploreMapHandle = {
  /**
   * Brings one place into the middle of the part of the map the sheet doesn't cover. `bottom`
   * overrides the covered height when the sheet is moving to a new stop at the same time.
   */
  focus: (p: LatLng, bottom?: number) => void;
  /** Fits several places into that part of the map. */
  fit: (points: LatLng[], bottom?: number) => void;
};

export type ExploreMapProps = {
  ref?: Ref<ExploreMapHandle>;
  places: ExplorePlace[];
  /** Kinds of place to give pins to first (playgrounds, when looking for somewhere for kids). */
  prefer: PlaceCategory[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** How much of the map the sheet and the floating bar cover, in points. */
  insets: { top: number; bottom: number };
  layer: MapLayer;
  userLocation: LatLng | null;
  reduceMotion: boolean;
  /** Once, when the map can be moved. */
  onReady: () => void;
  /** The area on screen, after each move: the list shows what's in it. */
  onBoundsChange: (bounds: Bounds) => void;
};

/**
 * The part of the map people can actually see: the screen's area without the strip under the
 * floating bar and the part the sheet covers. At city scale latitude is close enough to linear.
 */
export const visibleBounds = (b: Bounds, insets: { top: number; bottom: number }, height: number): Bounds => {
  const span = b.north - b.south;
  const top = Math.min(0.9, insets.top / height);
  const bottom = Math.min(0.9 - top, insets.bottom / height);
  return { ...b, north: b.north - span * top, south: b.south + span * bottom };
};

/** A box grown by `k` of its size on each side. */
export const grow = (b: Bounds, k: number): Bounds => {
  const dLat = (b.north - b.south) * k;
  const dLng = (b.east - b.west) * k;
  return { south: b.south - dLat, north: b.north + dLat, west: b.west - dLng, east: b.east + dLng };
};

/** The area on screen grown by half on each side, so pins just off screen are ready when it pans. */
export const withMargin = (b: Bounds): Bounds => {
  const dLat = (b.north - b.south) / 2;
  const dLng = (b.east - b.west) / 2;
  return { south: b.south - dLat, north: b.north + dLat, west: b.west - dLng, east: b.east + dLng };
};

/** A map moves to a new place in this long, or at once with Reduce Motion. */
export const flyMs = (reduceMotion: boolean) => (reduceMotion ? 0 : 520);
