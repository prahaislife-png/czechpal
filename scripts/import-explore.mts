/**
 * Imports every public outdoor place in Prague from OpenStreetMap into `explore_places`:
 * parks, public gardens, playgrounds, outdoor gyms, sports pitches, running tracks, viewpoints,
 * nature reserves, named woods, dog parks and swimming spots.
 *
 *   npm run import:explore -- --dry-run [--out file.json]   download, check and print a summary
 *   npm run import:explore                                   also write to the linked Supabase project
 *   npm run import:explore -- --from file.json               write a list saved earlier with --out
 *                                                            (for when Overpass is down)
 *
 * Source: OpenStreetMap via the Overpass API. © OpenStreetMap contributors, ODbL 1.0; the app
 * credits OpenStreetMap wherever these places show.
 * Left out: anything tagged private or customers-only, playgrounds and pitches on school or
 * kindergarten grounds, unnamed gardens (almost always someone's yard), and sports that aren't
 * open to passers-by. Places CzechLocal wrote up by hand (src/lib/explore/curated.ts) replace the
 * generated description of the OSM place they match.
 * Politeness: four Overpass queries, one at a time, with a pause between them.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import * as curatedModule from '../src/lib/explore/curated.ts';
import * as osmModule from '../src/lib/explore/osm.ts';
import type { Inside, Kind, Point, Shape, Tags } from '../src/lib/explore/osm.ts';
import type { ActivityId, ExplorePlace } from '../src/lib/explore/types.ts';

// The app's modules load as CommonJS under tsx, so their exports arrive on `default`.
const unwrap = <T,>(m: T): T => ((m as { default?: T }).default ?? m);
const { curatedPlaces } = unwrap(curatedModule);
const { areaHa, classify, describe, inShape, joinRings, pinPoint, sportsOf } = unwrap(osmModule);

const PRAGUE_AREA = 3600435514; // relation 435514, Hlavní město Praha
const SERVERS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const UA = { 'User-Agent': 'CzechLocal Explore importer (contact: see app support page)' };

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const outFile = args.includes('--out') ? args[args.indexOf('--out') + 1] : null;
const today = new Date().toISOString().slice(0, 10);
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const fromFile = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;
if (fromFile) {
  const saved = JSON.parse(readFileSync(fromFile, 'utf-8')) as ExplorePlace[];
  write(saved, saved[0]?.checkedOn ?? today);
  process.exit(0);
}

type Member = { type: string; role: string; geometry?: { lat: number; lon: number }[] };
type Element = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  tags?: Tags;
  geometry?: { lat: number; lon: number }[];
  members?: Member[];
};

/** `min`: fewer elements than this means a mirror answered without its Prague index; try again. */
async function overpass(query: string, min = 1): Promise<Element[]> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const url = SERVERS[attempt % SERVERS.length];
    try {
      const res = await fetch(url, { method: 'POST', headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' }, body: `data=${encodeURIComponent(query)}` });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { elements } = (await res.json()) as { elements: Element[] };
      if (elements.length < min) throw new Error(`only ${elements.length} elements`);
      return elements;
    } catch (e) {
      console.warn(`Overpass ${url}: ${(e as Error).message}; retrying`);
      await pause(8000 * (attempt + 1));
    }
  }
  throw new Error('Overpass kept failing; try again later.');
}

const pts = (g: { lat: number; lon: number }[]) => g.map((p) => [p.lat, p.lon] as Point);

/** A feature's outline, or null for a point or an open line. */
function shapeOf(el: Element): Shape | null {
  if (el.type === 'way' && el.geometry?.length) {
    const ring = pts(el.geometry);
    const closed = ring.length >= 4 && ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    return closed ? { outer: [ring], inner: [] } : null;
  }
  if (el.type === 'relation' && el.members) {
    const part = (role: string) => joinRings(el.members!.filter((m) => m.type === 'way' && m.geometry && (m.role || 'outer') === role).map((m) => pts(m.geometry!)));
    const outer = part('outer');
    return outer.length ? { outer, inner: part('inner') } : null;
  }
  return null;
}

/** A single point for any feature: its pin. */
function pointOf(el: Element, shape: Shape | null): Point | null {
  if (el.type === 'node' && el.lat !== undefined && el.lon !== undefined) return [el.lat, el.lon];
  if (shape) return pinPoint(shape);
  const g = el.geometry ?? el.members?.flatMap((m) => m.geometry ?? []) ?? [];
  if (!g.length) return null;
  return [g.reduce((s, p) => s + p.lat, 0) / g.length, g.reduce((s, p) => s + p.lon, 0) / g.length];
}

type Boxed = { shape: Shape; box: [number, number, number, number] };
const boxed = (shape: Shape): Boxed => {
  const all = shape.outer.flat();
  return { shape, box: [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[1]))] };
};
const inBoxed = (p: Point, b: Boxed) => p[0] >= b.box[0] && p[0] <= b.box[1] && p[1] >= b.box[2] && p[1] <= b.box[3] && inShape(p, b.shape);

/** A coarse grid of points, to find what lies inside a shape without checking everything. */
class Grid<T> {
  private cells = new Map<string, { p: Point; v: T }[]>();
  constructor(private size = 0.004) {}
  private key = (lat: number, lon: number) => `${Math.floor(lat / this.size)}:${Math.floor(lon / this.size)}`;
  add(p: Point, v: T) {
    const k = this.key(p[0], p[1]);
    const list = this.cells.get(k) ?? [];
    list.push({ p, v });
    this.cells.set(k, list);
  }
  within(b: Boxed): T[] {
    const out: T[] = [];
    for (let a = Math.floor(b.box[0] / this.size); a <= Math.floor(b.box[1] / this.size); a++)
      for (let o = Math.floor(b.box[2] / this.size); o <= Math.floor(b.box[3] / this.size); o++)
        for (const { p, v } of this.cells.get(`${a}:${o}`) ?? []) if (inBoxed(p, b)) out.push(v);
    return out;
  }
  near(p: Point, radius: number): { p: Point; v: T }[] {
    const r = Math.ceil(radius / this.size);
    const a0 = Math.floor(p[0] / this.size);
    const o0 = Math.floor(p[1] / this.size);
    const out: { p: Point; v: T }[] = [];
    for (let a = a0 - r; a <= a0 + r; a++) for (let o = o0 - r; o <= o0 + r; o++) out.push(...(this.cells.get(`${a}:${o}`) ?? []));
    return out;
  }
}

const metres = (a: Point, b: Point) => Math.hypot((a[0] - b[0]) * 111_320, (a[1] - b[1]) * 111_320 * Math.cos((a[0] * Math.PI) / 180));

/* ───────────── Download ───────────── */

const area = `area(${PRAGUE_AREA})->.p;`;
console.log('Downloading places…');
const features = await overpass(`[out:json][timeout:400];${area}
(
  nwr["leisure"~"^(park|garden|playground|fitness_station|pitch|track|dog_park|nature_reserve|bathing_place|swimming_area)$"](area.p);
  nwr["tourism"="viewpoint"](area.p);
  nwr["natural"="wood"]["name"](area.p);
  nwr["landuse"="forest"]["name"](area.p);
);
out geom;`, 5000);
await pause(5000);
console.log('Downloading districts and neighbourhoods…');
// Districts: the 57 municipal districts (Praha 7, Praha-Troja). Neighbourhoods: the 112
// cadastral areas (Holešovice, Vinohrady), the names people use and street signs show.
const admin = await overpass(`[out:json][timeout:300];${area}
rel["boundary"="administrative"]["admin_level"="9"](area.p);
out geom;
rel["boundary"="cadastral"](area.p);
out geom;`, 150);
await pause(5000);
console.log('Downloading school grounds…');
const schools = await overpass(`[out:json][timeout:300];${area}
nwr["amenity"~"^(school|kindergarten|college|university)$"](area.p);
out geom;`, 300);
await pause(5000);
console.log('Downloading cycle paths…');
const cycleways = await overpass(`[out:json][timeout:300];${area}
(
  way["highway"="cycleway"](area.p);
  way["highway"~"^(path|track|footway)$"]["bicycle"="designated"](area.p);
);
out geom;`, 500);

/* ───────────── Context ───────────── */

const areasOf = (boundary: string) =>
  admin
    .filter((e) => e.tags?.boundary === boundary && e.tags.name)
    .map((e) => ({ name: e.tags!.name, b: shapeOf(e) }))
    .filter((d): d is { name: string; b: Shape } => !!d.b)
    .map((d) => ({ name: d.name, b: boxed(d.b) }));
const districts = areasOf('administrative');
const quarters = areasOf('cadastral');
const schoolShapes = schools.map(shapeOf).filter((s): s is Shape => !!s).map(boxed);
const cyclePoints = new Grid<true>();
for (const w of cycleways) for (const p of w.geometry ?? []) cyclePoints.add([p.lat, p.lon], true);
console.log(`${features.length} features, ${districts.length} districts, ${quarters.length} neighbourhoods, ${schoolShapes.length} school grounds, ${cycleways.length} cycle paths`);

const districtOf = (p: Point) => districts.find((d) => inBoxed(p, d.b))?.name ?? null;
const quarterOf = (p: Point) => quarters.find((d) => inBoxed(p, d.b))?.name;

/* ───────────── Features ───────────── */

type Raw = { el: Element; kind: Kind; tags: Tags; point: Point; shape: Shape | null; ha?: number };
const raws: Raw[] = [];
let schoolGrounds = 0;
for (const el of features) {
  const tags = el.tags ?? {};
  const kind = classify(tags);
  if (!kind) continue;
  const shape = shapeOf(el);
  const point = pointOf(el, shape);
  if (!point) continue;
  // Playgrounds, gyms and pitches on school grounds are for the school.
  if ((kind === 'playground' || kind === 'pitch' || kind === 'fitness' || kind === 'track') && !/^(yes|public|permissive)$/.test(tags.access ?? '') && schoolShapes.some((s) => inBoxed(point, s))) {
    schoolGrounds++;
    continue;
  }
  const big = kind === 'park' || kind === 'garden' || kind === 'reserve' || kind === 'wood';
  raws.push({ el, kind, tags, point, shape, ha: big && shape ? areaHa(shape) : undefined });
}

// The same thing drawn twice (a node and an outline): keep the one with a name or an outline.
const kept: Raw[] = [];
const seen = new Grid<Raw>(0.002);
for (const r of raws.sort((a, b) => Number(!!b.tags.name) - Number(!!a.tags.name) || Number(!!b.shape) - Number(!!a.shape))) {
  const twin = seen.near(r.point, 0.002).find(({ p, v }) => v.kind === r.kind && metres(p, r.point) < 20);
  if (twin) continue;
  seen.add(r.point, r);
  kept.push(r);
}

// What lies inside each park, garden, reserve and wood.
const smalls = new Grid<Raw>();
for (const r of kept) if (r.kind === 'playground' || r.kind === 'fitness' || r.kind === 'viewpoint' || r.kind === 'pitch') smalls.add(r.point, r);
const containers = kept.filter((r) => r.shape && r.ha !== undefined).map((r) => ({ r, b: boxed(r.shape!) }));
const inside = new Map<Raw, Inside>();
const parentOf = new Map<Raw, { name: string; ha: number }>();
for (const { r, b } of containers) {
  const within = smalls.within(b);
  const sports = [...new Set(within.filter((x) => x.kind === 'pitch').flatMap((x) => sportsOf(x.tags)))];
  inside.set(r, {
    playground: within.some((x) => x.kind === 'playground'),
    fitness: within.some((x) => x.kind === 'fitness'),
    viewpoint: within.some((x) => x.kind === 'viewpoint'),
    sports: within.some((x) => x.kind === 'pitch') ? (sports.length ? sports : ['multi']) : undefined,
    cycleway: cyclePoints.within(b).length > 0,
  });
  const name = r.tags['name:en'] ?? r.tags.name;
  if (!name || (r.kind !== 'park' && r.kind !== 'wood' && r.kind !== 'reserve')) continue;
  for (const x of within) {
    const current = parentOf.get(x);
    // The smallest named park it's in.
    if (!current || r.ha! < current.ha) parentOf.set(x, { name, ha: r.ha! });
  }
}

const osmUrl = (el: Element) => `https://www.openstreetmap.org/${el.type}/${el.id}`;
let outside = 0;
const places: ExplorePlace[] = [];
for (const r of kept) {
  const district = districtOf(r.point);
  if (!district) {
    outside++;
    continue;
  }
  const d = describe(r.kind, r.tags, { district, quarter: quarterOf(r.point), areaHa: r.ha, parent: parentOf.get(r)?.name, inside: inside.get(r) });
  places.push({
    id: `osm:${r.el.type[0]}${r.el.id}`,
    ...d,
    district,
    quarter: quarterOf(r.point),
    latitude: Number(r.point[0].toFixed(6)),
    longitude: Number(r.point[1].toFixed(6)),
    ...(r.ha !== undefined ? { areaHa: Number(r.ha.toFixed(2)) } : {}),
    source: 'osm',
    sourceUrl: osmUrl(r.el),
    checkedOn: today,
  });
}

/* ───────────── CzechLocal's own write-ups ───────────── */

const shapeById = new Map(kept.filter((r) => r.shape).map((r) => [`osm:${r.el.type[0]}${r.el.id}`, boxed(r.shape!)]));
const unmatched: string[] = [];
const GREEN = new Set(['park', 'nature', 'garden', 'hidden', 'leisure']);
for (const c of curatedPlaces) {
  const names = [c.name, c.nameCs].filter(Boolean).map((n) => fold(n!));
  const p: Point = [c.latitude, c.longitude];
  const near = places.filter((x) => metres(p, [x.latitude, x.longitude]) < 1500);
  // "Ladronka" is "park Ladronka" on the map: one name inside the other counts, for real names.
  // Same kind of place, or both green spaces: a playground called "Nový Svět" isn't the lane.
  const fits = (x: ExplorePlace) => x.category === c.category || (GREEN.has(x.category) && GREEN.has(c.category));
  const contains = (x: ExplorePlace) =>
    x.named && [x.name, x.nameCs].filter(Boolean).some((n) => names.some((c) => c.length >= 5 && (fold(n!).includes(c) || c.includes(fold(n!)))));
  const match =
    near.find((x) => fits(x) && (names.includes(fold(x.name)) || (x.nameCs && names.includes(fold(x.nameCs))))) ??
    near.find((x) => fits(x) && metres(p, [x.latitude, x.longitude]) < 600 && contains(x)) ??
    near.find((x) => x.category === c.category && x.named && shapeById.get(x.id) && inBoxed(p, shapeById.get(x.id)!));
  if (match) {
    match.name = c.name;
    if (c.nameCs) match.nameCs = c.nameCs;
    match.description = c.description;
    match.activities = [...new Set<ActivityId>([...match.activities, ...c.activities])];
    match.attributes = [...new Set([...c.attributes, ...match.attributes.filter((a) => /ha$/.test(a))])];
    match.source = 'curated';
  } else {
    unmatched.push(c.id);
    places.push({ ...c, checkedOn: today });
  }
}

/* ───────────── Report ───────────── */

const by = (f: (p: ExplorePlace) => string) => places.reduce<Record<string, number>>((m, p) => ((m[f(p)] = (m[f(p)] ?? 0) + 1), m), {});
console.log(`\nKept ${places.length} places. Left out: ${schoolGrounds} on school grounds, ${raws.length - kept.length} duplicates, ${outside} outside Prague.`);
console.log('By category:', by((p) => p.category));
console.log('Named:', places.filter((p) => p.named).length, '· with a size:', places.filter((p) => p.areaHa).length);
console.log('Curated matched:', curatedPlaces.length - unmatched.length, '· added on their own:', unmatched.join(', ') || 'none');
for (const id of ['osm:', 'cz:']) {
  const sample = places.find((p) => p.id.startsWith(id) && p.source !== 'curated') ?? places.find((p) => p.id.startsWith(id));
  if (sample) console.log('\nSample:', JSON.stringify(sample));
}
if (outFile) writeFileSync(outFile, JSON.stringify(places, null, 1));

if (dryRun) process.exit(0);
write(places, today);

/* ───────────── Write ───────────── */

function write(places: ExplorePlace[], checkedOn: string) {
  if (places.length < 2000) throw new Error(`Only ${places.length} places; refusing to overwrite the table.`);
  const q = (v: unknown) => (v === null || v === undefined ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
  const arr = (xs: string[]) => `array[${xs.map(q).join(',')}]::text[]`;
  const row = (p: ExplorePlace) =>
    `(${[
      q(p.id),
      q(p.name),
      q(p.nameCs),
      q(p.named),
      q(p.category),
      q(p.district),
      q(p.quarter),
      q(p.latitude),
      q(p.longitude),
      q(p.areaHa),
      arr(p.activities),
      arr(p.attributes),
      q(p.description),
      q(p.source),
      q(p.sourceUrl),
      q(fold([p.name, p.nameCs, p.quarter, p.district].filter(Boolean).join(' '))),
      `${q(checkedOn)}::date`,
    ].join(',')})`;
  const chunks: string[] = [];
  for (let i = 0; i < places.length; i += 1000) {
    chunks.push(`insert into public.explore_places (id, name, name_cs, named, category, district, quarter, lat, lng, area_ha, activities, attributes, description, source, source_url, search, checked_on)
  values ${places.slice(i, i + 1000).map(row).join(',\n')}
  on conflict (id) do update set
    name = excluded.name, name_cs = excluded.name_cs, named = excluded.named, category = excluded.category,
    district = excluded.district, quarter = excluded.quarter, lat = excluded.lat, lng = excluded.lng,
    area_ha = excluded.area_ha, activities = excluded.activities, attributes = excluded.attributes,
    description = excluded.description, source = excluded.source, source_url = excluded.source_url,
    search = excluded.search, checked_on = excluded.checked_on, removed = false;`);
  }
  // Anything not in this list is gone from OpenStreetMap (or now left out): hidden, not deleted.
  const gone = `update public.explore_places set removed = true where not removed and not (id = any(${arr(places.map((p) => p.id))}));`;
  const sql = ['begin;', ...chunks, gone, 'commit;'].join('\n');
  const dir = mkdtempSync(join(tmpdir(), 'czechlocal-explore-'));
  const file = join(dir, 'explore.sql');
  writeFileSync(file, sql);
  // Writing to the hosted project needs an explicit yes when run by an agent; running this script is that yes.
  execSync(`npx supabase db query --linked --yes --file "${file}"`, { stdio: 'inherit' });
  console.log(`\nImported ${places.length} places.`);
}
