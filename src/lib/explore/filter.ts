import type { IconName } from '@/components/ui/icon';

import type { ActivityId, Area, ExplorePlace, LatLng, PlaceCategory } from './types';

/** Lowercase without diacritics, so "zizkov" finds Žižkov. */
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** The chips in "I want to …", in the order the picker lists them. */
export const activities: { id: ActivityId; phrase: string; icon: IconName }[] = [
  { id: 'walk', phrase: 'walk in a park', icon: 'tree' },
  { id: 'viewpoint', phrase: 'visit a viewpoint', icon: 'binoculars' },
  { id: 'workout', phrase: 'work out outdoors', icon: 'run' },
  { id: 'cycling', phrase: 'go cycling', icon: 'bike' },
  { id: 'sport', phrase: 'play a sport', icon: 'ball' },
  { id: 'kids', phrase: 'take kids to play', icon: 'playground' },
  { id: 'nature', phrase: 'relax in nature', icon: 'leaf' },
  { id: 'garden', phrase: 'visit a garden', icon: 'flower' },
  { id: 'hidden', phrase: 'explore hidden places', icon: 'map' },
];

export const activityPhrase = (id: ActivityId) => activities.find((a) => a.id === id)?.phrase ?? id;

/** The kind of place each activity is really about: "take kids to play" means playgrounds first. */
const homeOf: Record<ActivityId, PlaceCategory[]> = {
  walk: ['park'],
  viewpoint: ['viewpoint'],
  workout: ['sports'],
  cycling: ['nature', 'park'],
  sport: ['sports'],
  kids: ['playground'],
  nature: ['nature'],
  garden: ['garden'],
  hidden: ['hidden'],
};

/** The categories to put first for the chosen activities. */
export const preferredFor = (wanted: ActivityId[]): PlaceCategory[] => [...new Set(wanted.flatMap((a) => homeOf[a]))];

/** What a pin looks like. Tones are muted so the map stays calm; each passes 3:1 against white. */
export const categories: Record<PlaceCategory, { label: string; icon: IconName; tone: string }> = {
  park: { label: 'Park', icon: 'tree', tone: '#4E7A56' },
  viewpoint: { label: 'Viewpoint', icon: 'binoculars', tone: '#A2651A' },
  sports: { label: 'Outdoor sports', icon: 'run', tone: '#B5543F' },
  garden: { label: 'Garden', icon: 'flower', tone: '#A84F72' },
  playground: { label: 'Playground', icon: 'playground', tone: '#386F9C' },
  leisure: { label: 'Leisure', icon: 'sun', tone: '#2D7C78' },
  nature: { label: 'Nature', icon: 'leaf', tone: '#5E6E33' },
  hidden: { label: 'Hidden place', icon: 'map', tone: '#6A6152' },
};

/** Prague as a whole, then Praha 1–22 in number order, then the named districts A–Z. */
export function areasOf(places: ExplorePlace[]): Area[] {
  const districts = [...new Set(places.map((p) => p.district))];
  const n = (d: string) => (/^Praha \d+$/.test(d) ? Number(d.slice(6)) : 999);
  return ['prague', ...districts.sort((a, b) => n(a) - n(b) || a.localeCompare(b, 'cs'))];
}

/** The area that follows the person: places within walking distance of where they are. */
export const NEAR = 'near';
/** Near me widens from a short walk until it finds a handful of places. */
export const NEAR_RADII = [1500, 3000, 6000];

export const areaLabel = (area: Area) => (area === 'prague' ? 'Prague' : area === NEAR ? 'near me' : area);

/** Roughly inside Prague: where "near me" makes sense. */
export const inPrague = (p: LatLng) => p.latitude > 49.94 && p.latitude < 50.18 && p.longitude > 14.22 && p.longitude < 14.71;

export type Filters = {
  activities: ActivityId[];
  area: Area;
  query?: string;
  /** For `NEAR`: where the person is, and how far to look. */
  near?: LatLng | null;
  radius?: number;
};

/**
 * Places that fit: any of the chosen activities (none chosen means anything), in the chosen area,
 * whose name or neighbourhood matches the search. Map pins and cards both come from this list.
 */
export function filterPlaces(places: ExplorePlace[], { activities: wanted, area, query, near, radius = NEAR_RADII[0] }: Filters): ExplorePlace[] {
  const q = fold(query ?? '');
  const inArea = (p: ExplorePlace) =>
    area === 'prague' || (area === NEAR ? !near || distanceM(near, p) <= radius : p.district === area);
  return places.filter(
    (p) =>
      (wanted.length === 0 || p.activities.some((a) => wanted.includes(a))) &&
      inArea(p) &&
      (!q || [p.name, p.nameCs, p.quarter, p.district].some((s) => s && fold(s).includes(q))),
  );
}

/**
 * Near me: the shortest walk (1.5, 3 or 6 km) that finds at least `enough` places for these
 * choices, or everything within the longest one.
 */
export function nearbyPlaces(places: ExplorePlace[], filters: Omit<Filters, 'area' | 'near' | 'radius'>, here: LatLng, enough = 8) {
  let found = { radius: NEAR_RADII[0], list: [] as ExplorePlace[] };
  for (const radius of NEAR_RADII) {
    found = { radius, list: filterPlaces(places, { ...filters, area: NEAR, near: here, radius }) };
    if (found.list.length >= enough) break;
  }
  return found;
}

/** Adds or removes one activity, keeping the picker's order so the sentence reads the same way each time. */
export function toggleActivity(current: ActivityId[], id: ActivityId): ActivityId[] {
  const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
  return activities.map((a) => a.id).filter((a) => next.includes(a));
}

export const PRAGUE: LatLng = { latitude: 50.0835, longitude: 14.4255 };

export type Bounds = { south: number; north: number; west: number; east: number };

/** The smallest box around some places, with a margin, for fitting the map to them. */
export function boundsOf(points: LatLng[], margin = 0.15): Bounds | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  // A single place still gets a street-level box around it.
  const latPad = Math.max((maxLat - minLat) * margin, 0.004);
  const lngPad = Math.max((maxLng - minLng) * margin, 0.006);
  return { south: minLat - latPad, north: maxLat + latPad, west: minLng - lngPad, east: maxLng + lngPad };
}

export const inBounds = (p: LatLng, b: Bounds) => p.latitude >= b.south && p.latitude <= b.north && p.longitude >= b.west && p.longitude <= b.east;

export type Cluster =
  | { kind: 'place'; id: string; place: ExplorePlace; latitude: number; longitude: number }
  | { kind: 'cluster'; id: string; places: ExplorePlace[]; latitude: number; longitude: number };

/** Web Mercator, in pixels of a world `worldSize` pixels wide. */
function project(p: LatLng, worldSize: number) {
  const x = ((p.longitude + 180) / 360) * worldSize;
  const s = Math.sin((p.latitude * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * worldSize;
  return { x, y };
}

/**
 * Groups pins that would overlap at the current zoom, into a grid of `radius`-pixel cells: one
 * pass, so thousands of places stay quick. `worldSize` is how many pixels the whole world spans
 * at this zoom (screen width × 360 / longitude span). Only places inside `bounds` are drawn. The
 * selected place is never hidden inside a group. A group's id is its cell, so it stays the same
 * while the map pans.
 */
export function clusterPlaces(
  places: ExplorePlace[],
  worldSize: number,
  selectedId?: string | null,
  radius = 52,
  bounds?: Bounds | null,
): Cluster[] {
  const cells = new Map<string, ExplorePlace[]>();
  const out: Cluster[] = [];
  for (const place of places) {
    if (bounds && !inBounds(place, bounds)) continue;
    if (place.id === selectedId) {
      out.push(single(place));
      continue;
    }
    const { x, y } = project(place, worldSize);
    const key = `${Math.floor(x / radius)}:${Math.floor(y / radius)}`;
    const cell = cells.get(key);
    if (cell) cell.push(place);
    else cells.set(key, [place]);
  }
  // Groups from neighbouring cells can land on top of each other: merge any closer than a pin.
  type Group = { key: string; places: ExplorePlace[]; x: number; y: number };
  const groups: Group[] = [];
  for (const [key, members] of cells) {
    const c = centreOf(members);
    groups.push({ key, places: members, ...project(c, worldSize) });
  }
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i];
      const b = groups[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) >= radius * 0.8) continue;
      a.places = [...a.places, ...b.places];
      Object.assign(a, project(centreOf(a.places), worldSize));
      groups.splice(j, 1);
      j = i; // the merged group may now touch one already passed
    }
  }
  for (const g of groups) {
    if (g.places.length === 1) out.push(single(g.places[0]));
    else out.push({ kind: 'cluster', id: `cluster:${g.key}:${g.places.length}`, places: g.places, ...centreOf(g.places) });
  }
  return out;
}

const centreOf = (ps: LatLng[]): LatLng => ({
  latitude: ps.reduce((s, p) => s + p.latitude, 0) / ps.length,
  longitude: ps.reduce((s, p) => s + p.longitude, 0) / ps.length,
});

const single = (place: ExplorePlace): Cluster => ({
  kind: 'place',
  id: place.id,
  place,
  latitude: place.latitude,
  longitude: place.longitude,
});

/** How much a place is worth showing first: written-up, named, bigger, the green places people go to. */
export function importance(p: ExplorePlace, prefer: PlaceCategory[] = []) {
  const kind = { park: 3, nature: 3, garden: 3, viewpoint: 3, hidden: 3, leisure: 2, playground: 1, sports: 1 }[p.category];
  return (
    // The chosen activity's own kind of place always comes first.
    (prefer.includes(p.category) ? 20 : 0) +
    (p.source === 'curated' ? 6 : 0) +
    (p.named ? 3 : 0) +
    kind +
    Math.min(3, Math.log10(1 + (p.areaHa ?? 0)) * 2)
  );
}

/**
 * The cards for what's on the map: the places in view, best first, then nearest the middle.
 * At most `limit`; the selected place always makes the list.
 */
export function placesInView(
  places: ExplorePlace[],
  bounds: Bounds | null,
  limit = 40,
  selectedId?: string | null,
  near?: LatLng | null,
  prefer: PlaceCategory[] = [],
) {
  const inView = bounds ? places.filter((p) => inBounds(p, bounds)) : places;
  // Knowing where someone is, nearest first is what they want.
  if (near) {
    const first = (p: ExplorePlace) => (prefer.length && !prefer.includes(p.category) ? 1 : 0);
    const ranked = [...inView].sort((a, b) => first(a) - first(b) || distanceM(near, a) - distanceM(near, b)).slice(0, limit);
    const selected = selectedId ? places.find((p) => p.id === selectedId) : undefined;
    if (selected && !ranked.includes(selected)) ranked.unshift(selected);
    return { list: ranked, total: inView.length };
  }
  const mid = bounds ? { latitude: (bounds.south + bounds.north) / 2, longitude: (bounds.west + bounds.east) / 2 } : PRAGUE;
  const span = bounds ? Math.max(bounds.north - bounds.south, 1e-6) : 1;
  const score = (p: ExplorePlace) => importance(p, prefer) - (Math.hypot(p.latitude - mid.latitude, (p.longitude - mid.longitude) * 0.64) / span) * 4;
  const ranked = [...inView].sort((a, b) => score(b) - score(a)).slice(0, limit);
  const selected = selectedId ? places.find((p) => p.id === selectedId) : undefined;
  if (selected && !ranked.includes(selected)) ranked.unshift(selected);
  return { list: ranked, total: inView.length };
}

/**
 * The pins worth drawing, the way map apps place labels: the most important places in view
 * first, and any pin that would touch one already placed is left out until the map zooms in.
 * So the city view shows the big parks and viewpoints, and closer in the playgrounds and courts
 * appear. At most `budget` pins; the selected place is always drawn.
 */
export function pinsInView(
  places: ExplorePlace[],
  bounds: Bounds | null,
  worldSize: number,
  selectedId?: string | null,
  budget = 45,
  /** Pixels between pin centres. */
  spacing = 34,
  prefer: PlaceCategory[] = [],
): Cluster[] {
  const inView = bounds ? places.filter((p) => inBounds(p, bounds) || p.id === selectedId) : places;
  const ranked = [...inView].sort(
    (a, b) => Number(b.id === selectedId) - Number(a.id === selectedId) || importance(b, prefer) - importance(a, prefer) || (a.id < b.id ? -1 : 1),
  );
  const placed: { place: ExplorePlace; x: number; y: number }[] = [];
  for (const place of ranked) {
    if (placed.length >= budget) break;
    const { x, y } = project(place, worldSize);
    if (place.id !== selectedId && placed.some((q) => Math.hypot(q.x - x, q.y - y) < spacing)) continue;
    placed.push({ place, x, y });
  }
  return placed.map(({ place }) => single(place));
}

/** Names show on pins once the map is close enough to read them (about street level). */
export const LABEL_WORLD_SIZE = 256 * 2 ** 13.6;

/** Straight-line distance in metres; fine within a city. */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = (b.latitude - a.latitude) * 111_320;
  const dLng = (b.longitude - a.longitude) * 111_320 * Math.cos((a.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** "350 m", "1.2 km", "12 km". */
export function formatDistance(m: number): string {
  if (m < 950) return `${Math.max(50, Math.round(m / 50) * 50)} m`;
  return m < 9500 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 1000)} km`;
}

/** Walking directions in the phone's own maps app: Apple Maps on iOS, Google Maps elsewhere. */
export function directionsUrl(place: LatLng, os: string | undefined): string {
  const to = `${place.latitude},${place.longitude}`;
  return os === 'ios'
    ? `https://maps.apple.com/?daddr=${to}&dirflg=w`
    : `https://www.google.com/maps/dir/?api=1&destination=${to}&travelmode=walking`;
}

/** Where a place is: "Holešovice, Praha 7", or just "Praha-Kunratice" when the names repeat. */
export const placeWhere = (p: ExplorePlace) =>
  p.quarter && !fold(p.district).includes(fold(p.quarter)) ? `${p.quarter}, ${p.district}` : p.district;

/** "Park · Holešovice, Praha 7". */
export const placeMeta = (p: ExplorePlace) => `${categories[p.category].label} · ${placeWhere(p)}`;
