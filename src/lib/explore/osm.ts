import type { ActivityId, PlaceCategory } from './types';

/**
 * Turning OpenStreetMap features into Explore places. Pure functions, used by
 * scripts/import-explore.ts and covered by tests. Everything said about a place comes from its
 * OSM tags or from what lies inside it on the map; nothing is guessed or invented.
 */

export type Tags = Record<string, string>;
export type Point = [lat: number, lon: number];

export type Kind = 'park' | 'garden' | 'playground' | 'fitness' | 'pitch' | 'viewpoint' | 'reserve' | 'wood' | 'dog' | 'bathing' | 'track';

const kinds: Record<Kind, { category: PlaceCategory; label: string; activities: ActivityId[] }> = {
  park: { category: 'park', label: 'Park', activities: ['walk'] },
  garden: { category: 'garden', label: 'Garden', activities: ['garden', 'walk'] },
  playground: { category: 'playground', label: 'Playground', activities: ['kids'] },
  fitness: { category: 'sports', label: 'Outdoor gym', activities: ['workout'] },
  pitch: { category: 'sports', label: 'Sports pitch', activities: ['sport'] },
  viewpoint: { category: 'viewpoint', label: 'Viewpoint', activities: ['viewpoint'] },
  reserve: { category: 'nature', label: 'Nature reserve', activities: ['nature', 'walk'] },
  wood: { category: 'nature', label: 'Woodland', activities: ['nature', 'walk'] },
  dog: { category: 'leisure', label: 'Dog park', activities: ['walk'] },
  bathing: { category: 'leisure', label: 'Swimming spot', activities: ['nature'] },
  track: { category: 'sports', label: 'Running track', activities: ['workout'] },
};

export const kindMeta = (k: Kind) => kinds[k];

/** Sports that aren't open to passers-by, or aren't outdoor leisure. */
const excludedSports = new Set(['equestrian', 'shooting', 'motor', 'karting', 'motocross', 'golf', 'horse_racing', 'archery']);

const sportNames: Record<string, [court: string, sport: string]> = {
  soccer: ['Football pitch', 'Football'],
  basketball: ['Basketball court', 'Basketball'],
  tennis: ['Tennis court', 'Tennis'],
  volleyball: ['Volleyball court', 'Volleyball'],
  beachvolleyball: ['Beach volleyball court', 'Beach volleyball'],
  table_tennis: ['Table tennis table', 'Table tennis'],
  multi: ['Multi-sport court', 'Multi-sport'],
  handball: ['Handball court', 'Handball'],
  skateboard: ['Skatepark', 'Skateboarding'],
  badminton: ['Badminton court', 'Badminton'],
  boules: ['Pétanque court', 'Pétanque'],
  petanque: ['Pétanque court', 'Pétanque'],
  floorball: ['Floorball court', 'Floorball'],
  running: ['Running track', 'Running'],
  athletics: ['Athletics track', 'Athletics'],
  climbing: ['Climbing spot', 'Climbing'],
  bmx: ['BMX track', 'BMX'],
  baseball: ['Baseball field', 'Baseball'],
  american_football: ['American football field', 'American football'],
  rugby_union: ['Rugby pitch', 'Rugby'],
  cricket: ['Cricket pitch', 'Cricket'],
  ice_hockey: ['Hockey rink', 'Ice hockey'],
};

export const sportsOf = (tags: Tags) =>
  (tags.sport ?? '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

const closed = (tags: Tags) => /^(private|no|customers|delivery|military)$/.test(tags.access ?? '');
const open = (tags: Tags) => /^(yes|public|permissive|destination)$/.test(tags.access ?? '');

/** Which kind of Explore place a feature is, or null to leave it out. */
export function classify(tags: Tags): Kind | null {
  if (closed(tags) || tags.disused === 'yes' || tags['abandoned'] === 'yes') return null;
  if (tags.leisure === 'nature_reserve') return tags.name ? 'reserve' : null;
  if (tags.leisure === 'park') return 'park';
  if (tags.leisure === 'garden') {
    const type = tags['garden:type'] ?? '';
    if (/^(residential|private|roof_garden)$/.test(type)) return null;
    // An unnamed garden is almost always someone's yard; keep it only if it says it's open.
    return tags.name || open(tags) || /^(botanical|community|public)$/.test(type) ? 'garden' : null;
  }
  if (tags.leisure === 'playground') return 'playground';
  if (tags.leisure === 'fitness_station') return 'fitness';
  if (tags.leisure === 'pitch') return sportsOf(tags).some((s) => excludedSports.has(s)) ? null : 'pitch';
  if (tags.leisure === 'track') return sportsOf(tags).every((s) => s === 'running' || s === 'athletics') ? 'track' : null;
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.leisure === 'dog_park') return 'dog';
  if (tags.leisure === 'bathing_place' || tags.leisure === 'swimming_area') return 'bathing';
  if ((tags.natural === 'wood' || tags.landuse === 'forest') && tags.name) return 'wood';
  return null;
}

/** What lies inside a place on the map, found by the importer. */
export type Inside = { playground?: boolean; fitness?: boolean; viewpoint?: boolean; sports?: string[]; cycleway?: boolean };

export type Context = {
  district: string;
  quarter?: string;
  areaHa?: number;
  /** The named park or wood this feature sits in. */
  parent?: string;
  inside?: Inside;
};

const listOf = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const article = (phrase: string) => (/^[aeiou]/i.test(phrase) ? `An ${phrase}` : `A ${phrase}`);
const hectares = (ha: number) => (ha >= 10 ? `${Math.round(ha)}` : ha.toFixed(1).replace(/\.0$/, ''));

export type Described = {
  category: PlaceCategory;
  name: string;
  nameCs?: string;
  named: boolean;
  activities: ActivityId[];
  attributes: string[];
  description: string;
};

/** Name, activities, attributes and a plain description, all from tags and the map. */
export function describe(kind: Kind, tags: Tags, ctx: Context): Described {
  const meta = kinds[kind];
  // "Žižkov (Praha 3)", but just "Praha-Kunratice" where the neighbourhood names the district.
  const fold = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const quarter = ctx.quarter && !fold(ctx.district).includes(fold(ctx.quarter)) ? ctx.quarter : undefined;
  const where = quarter ? `${quarter} (${ctx.district})` : ctx.district;
  const sports = sportsOf(tags).filter((s) => sportNames[s]);
  const label = kind === 'pitch' && sports.length === 1 ? sportNames[sports[0]][0] : meta.label;

  const realName = tags['name:en'] ?? tags.name;
  const named = !!realName;
  const name = realName ?? `${label} in ${quarter ?? ctx.quarter ?? ctx.district}`;
  const nameCs = tags['name:en'] && tags.name && tags.name !== tags['name:en'] ? tags.name : undefined;

  const activities = new Set<ActivityId>(meta.activities);
  const attributes: string[] = [];
  const sentences: string[] = [];
  const ha = ctx.areaHa;
  const big = ha !== undefined && ha >= 5;

  switch (kind) {
    case 'park':
      sentences.push(ha !== undefined && ha >= 1 ? `A ${hectares(ha)}-hectare park in ${where}.` : ha !== undefined && ha < 0.3 ? `A small park in ${where}.` : `A park in ${where}.`);
      break;
    case 'garden':
      sentences.push(
        tags['garden:type'] === 'botanical'
          ? `A botanical garden in ${where}.`
          : tags['garden:type'] === 'community'
            ? `A community garden in ${where}.`
            : `A garden in ${where}.`,
      );
      break;
    case 'playground': {
      sentences.push(`A playground in ${where}.`);
      const min = Number(tags.min_age);
      const max = Number(tags.max_age);
      if (min >= 0 && max > 0 && tags.min_age && tags.max_age) {
        sentences.push(`For children aged ${min} to ${max}.`);
        attributes.push(`Ages ${min}–${max}`);
      }
      break;
    }
    case 'fitness':
      sentences.push(`An outdoor gym in ${where}.`);
      break;
    case 'pitch':
      // "A basketball court", but "A BMX track".
      sentences.push(`${article(/^[A-Z]{2}/.test(label) ? label : label.toLowerCase())} in ${where}.`);
      for (const s of sports) attributes.push(sportNames[s][1]);
      break;
    case 'viewpoint':
      sentences.push(`A viewpoint in ${where}.`);
      if (Number(tags.ele) > 0) sentences.push(`About ${Math.round(Number(tags.ele))} m above sea level.`);
      break;
    case 'reserve':
      sentences.push(ha !== undefined && ha >= 1 ? `A protected nature reserve of ${hectares(ha)} hectares in ${where}.` : `A protected nature reserve in ${where}.`);
      attributes.push('Protected');
      break;
    case 'wood':
      sentences.push(ha !== undefined && ha >= 1 ? `${hectares(ha)} hectares of woodland in ${where}.` : `Woodland in ${where}.`);
      break;
    case 'dog':
      sentences.push(`An area for dogs in ${where}.`);
      break;
    case 'bathing':
      sentences.push(`A place to swim in ${where}. Check the water quality before you go in.`);
      break;
    case 'track':
      sentences.push(`A running track in ${where}.`);
      break;
  }

  if (ctx.parent) sentences.push(`It’s in ${ctx.parent}.`);

  // What's inside a park or wood, from the map.
  const inside = ctx.inside ?? {};
  const has: string[] = [];
  if (inside.playground) {
    has.push('a playground');
    activities.add('kids');
    attributes.push('Playground');
  }
  if (inside.fitness) {
    has.push('an outdoor gym');
    activities.add('workout');
    attributes.push('Outdoor gym');
  }
  if (inside.sports?.length) {
    has.push(inside.sports.length === 1 ? `a ${sportNames[inside.sports[0]]?.[1].toLowerCase() ?? 'sports'} pitch` : 'sports pitches');
    activities.add('sport');
    attributes.push('Sports pitches');
  }
  if (inside.viewpoint) {
    has.push('a viewpoint');
    activities.add('viewpoint');
    attributes.push('Viewpoint');
  }
  if (has.length) sentences.push(`It has ${listOf(has)}.`);
  if (inside.cycleway && big) {
    sentences.push('Cycle paths run through it.');
    activities.add('cycling');
    attributes.push('Cycle paths');
  }
  if (big && (kind === 'park' || kind === 'garden')) activities.add('nature');

  if (ha !== undefined && ha >= 1 && kind !== 'pitch') attributes.unshift(`${hectares(ha)} ha`);
  if (tags.lit === 'yes') attributes.push('Lit at night');
  if (tags.wheelchair === 'yes') attributes.push('Step-free');
  if (tags.covered === 'yes') attributes.push('Covered');
  if (tags.fee === 'yes') attributes.push('Entry fee');
  if (tags.dog === 'no') attributes.push('No dogs');
  if (tags.dog === 'leashed') attributes.push('Dogs on a lead');
  if (tags.seasonal === 'yes') attributes.push('Seasonal');
  const surface = surfaces[tags.surface ?? ''];
  if (surface && (kind === 'pitch' || kind === 'playground' || kind === 'track')) attributes.push(surface);
  // Courts without an access tag are often a school's or a club's.
  if ((kind === 'pitch' || kind === 'fitness' || kind === 'track') && !open(tags)) {
    attributes.push('Access not confirmed');
    sentences.push('It may belong to a school or club: check that it’s open to the public.');
  }

  return {
    category: meta.category,
    name,
    ...(nameCs ? { nameCs } : {}),
    named,
    activities: [...activities],
    attributes: [...new Set(attributes)],
    description: sentences.join(' '),
  };
}

const surfaces: Record<string, string> = {
  artificial_turf: 'Artificial turf',
  grass: 'Grass',
  asphalt: 'Asphalt',
  tartan: 'Tartan',
  sand: 'Sand',
  clay: 'Clay',
  rubber: 'Rubber surface',
  woodchips: 'Woodchips',
};

/* ───────────── Geometry ───────────── */

/** Joins way segments end to end into closed rings (multipolygon members come in pieces). */
export function joinRings(segments: Point[][]): Point[][] {
  const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];
  const pool = segments.filter((s) => s.length > 1).map((s) => [...s]);
  const rings: Point[][] = [];
  while (pool.length) {
    let ring = pool.shift()!;
    let grew = true;
    while (!same(ring[0], ring[ring.length - 1]) && grew) {
      grew = false;
      for (let i = 0; i < pool.length; i++) {
        const s = pool[i];
        const end = ring[ring.length - 1];
        if (same(end, s[0])) ring = [...ring, ...s.slice(1)];
        else if (same(end, s[s.length - 1])) ring = [...ring, ...[...s].reverse().slice(1)];
        else if (same(ring[0], s[s.length - 1])) ring = [...s, ...ring.slice(1)];
        else if (same(ring[0], s[0])) ring = [...[...s].reverse(), ...ring.slice(1)];
        else continue;
        pool.splice(i, 1);
        grew = true;
        break;
      }
    }
    if (ring.length >= 4 && same(ring[0], ring[ring.length - 1])) rings.push(ring);
  }
  return rings;
}

/** Ray casting. */
export function inRing([lat, lon]: Point, ring: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i];
    const [yj, xj] = ring[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Inside any outer ring and none of the holes. */
export const inShape = (p: Point, shape: Shape) => shape.outer.some((r) => inRing(p, r)) && !shape.inner.some((r) => inRing(p, r));

export type Shape = { outer: Point[][]; inner: Point[][] };

const M_PER_DEG_LAT = 111_320;

/** Area in hectares, on a flat projection (fine at city scale). */
export function areaHa(shape: Shape): number {
  const ringArea = (ring: Point[]) => {
    const k = Math.cos((ring[0][0] * Math.PI) / 180) * M_PER_DEG_LAT;
    let a = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      a += (ring[j][1] * k) * (ring[i][0] * M_PER_DEG_LAT) - (ring[i][1] * k) * (ring[j][0] * M_PER_DEG_LAT);
    }
    return Math.abs(a / 2);
  };
  const m2 = shape.outer.reduce((s, r) => s + ringArea(r), 0) - shape.inner.reduce((s, r) => s + ringArea(r), 0);
  return Math.max(0, m2) / 10_000;
}

/**
 * Where the pin goes: the centre of the largest ring if that lies inside the shape (it doesn't
 * for an L-shaped park), otherwise the inside point nearest to that centre.
 */
export function pinPoint(shape: Shape): Point {
  const ring = shape.outer.reduce((a, b) => (b.length > a.length ? b : a));
  const lats = ring.map((p) => p[0]);
  const lons = ring.map((p) => p[1]);
  const [s, n, w, e] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  const centre: Point = [(s + n) / 2, (w + e) / 2];
  if (inShape(centre, shape)) return centre;
  let best: Point | null = null;
  let bestD = Infinity;
  const steps = 24;
  for (let i = 1; i < steps; i++)
    for (let j = 1; j < steps; j++) {
      const p: Point = [s + ((n - s) * i) / steps, w + ((e - w) * j) / steps];
      if (!inShape(p, shape)) continue;
      const d = (p[0] - centre[0]) ** 2 + (p[1] - centre[1]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = p;
      }
    }
  return best ?? ring[0];
}
