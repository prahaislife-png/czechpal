#!/usr/bin/env node
/**
 * Imports official Prague contacts for the Find tab into the `places` table:
 * - Prague district town halls and notaries, from the list of public authorities
 *   (Seznam orgánů veřejné moci, czechpoint.cz open data, updated daily);
 * - embassies and consulates, from the Ministry of Foreign Affairs directory of foreign missions
 *   (mzv.gov.cz, English pages).
 *
 *   node scripts/import-places.mjs --dry-run   download, check and print a summary
 *   node scripts/import-places.mjs             also write to the linked Supabase project
 *
 * Privacy: only office details are kept. Named people (an embassy's head of mission, a town
 * hall's mayor, statutory representatives) are skipped. Notaries are public officials listed by
 * name in the official register, so a notary's office carries their name.
 * Politeness: detail pages are fetched one at a time with a short pause.
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const OVM_INDEX = 'https://www.czechpoint.gov.cz/spravadat/ovm/datafile.do?format=xml&service=seznamovm';
const OVM_DETAIL = (id) => `https://www.czechpoint.cz/spravadat/p/ovm/datafile?format=xml&service=seznamovm&id=${encodeURIComponent(id)}`;
const MZV = 'https://mzv.gov.cz';
const MZV_INDEX = `${MZV}/jnp/en/diplomatic_missions/foreign_missions_to_the_czech_republic/index.html`;
const MZV_RANGES = ['A-C', 'D-F', 'G-I', 'J-L', 'M-O', 'P-R', 'S-U', 'V-Z'];
const PRAGUE = 'Hlavní město Praha';
const UA = { 'User-Agent': 'CzechPal directory importer (contact: see app support page)' };

const dryRun = process.argv.includes('--dry-run');
const today = new Date().toISOString().slice(0, 10);
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
/** Lowercase without diacritics, for search. */
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

async function get(url, { binary = false } = {}) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (attempt >= 3) throw new Error(`${url}: ${e.message}`);
      await pause(1500 * attempt);
    }
  }
}

/* ───────────── Public authorities (OVM) ───────────── */

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1].trim()) : '';
};
const tags = (xml, name) => [...xml.matchAll(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'g'))].map((m) => m[1]);

function addressLine(a) {
  const number = [tag(a, 'CisloDomovni'), tag(a, 'CisloOrientacni')].filter(Boolean).join('/');
  const street = tag(a, 'UliceNazev') || tag(a, 'CastObceNeboKatastralniUzemi');
  const psc = tag(a, 'PSC');
  return `${[street, number].filter(Boolean).join(' ')}, ${psc ? `${psc.slice(0, 3)} ${psc.slice(3)} ` : ''}${tag(a, 'ObecNazev')}`;
}

const DAYS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
/** Office hours as display lines, one per day, several ranges joined ("08:00–12:00, 13:00–17:00"). */
function hoursLines(xml) {
  const byDay = new Map();
  for (const item of tags(xml, 'Polozka')) {
    const day = tag(item, 'Den');
    if (!DAYS[day]) continue;
    const range = `${tag(item, 'Od')}–${tag(item, 'Do')}`;
    byDay.set(day, [...(byDay.get(day) ?? []), range]);
  }
  return [...byDay.entries()].sort(([a], [b]) => a - b).map(([d, rs]) => `${DAYS[d]} ${rs.join(', ')}`);
}

async function loadOvm() {
  const raw = await get(OVM_INDEX, { binary: true });
  const xml = (raw[0] === 0x1f && raw[1] === 0x8b ? gunzipSync(raw) : raw).toString('utf-8');
  const subjects = tags(xml, 'Subjekt');
  const pick = subjects.filter((s) => {
    const name = tag(s, 'Nazev');
    const inPrague = tag(tag(s, 'AdresaUradu'), 'KrajNazev') === PRAGUE;
    return tag(s, 'StavSubjektu') === '1' && inPrague && (name.startsWith('Městská část Praha') || / - notář(ka)?$/.test(name));
  });
  const places = [];
  for (const s of pick) {
    const id = tag(s, 'Zkratka');
    const name = tag(s, 'Nazev').replace(/^"|"$/g, '');
    const detail = await get(OVM_DETAIL(id));
    await pause(200);
    // The first office in <Uradovny>. Its <UredniHodiny> nests further <Polozka> elements, so the
    // fields are read from the section directly rather than by splitting it into items.
    const office = tag(detail, 'Uradovny');
    const address = tag(office, 'Adresa') || tag(detail, 'AdresaUradu');
    const gpsText = tag(office, 'SouradniceGPS');
    const gps = gpsText.includes(',') ? gpsText.split(',').map(Number) : [NaN, NaN];
    const links = tags(tag(detail, 'WWW'), 'Polozka').map((p) => ({ type: tag(p, 'Typ'), url: tag(p, 'Url') }));
    const isNotary = !name.startsWith('Městská část');
    const district = tag(address, 'ObecNazev');
    places.push({
      id: `ovm:${id}`,
      kind: isNotary ? 'notary' : 'town_hall',
      // Town halls are named after the district they serve; notaries after the notary, as registered.
      name: isNotary ? name.replace(/ - notář(ka)?$/, '') : name.replace('Městská část ', ''),
      country: null,
      address: addressLine(address),
      district: district.startsWith('Praha') ? district : `Praha (${district})`,
      lat: Number.isFinite(gps[0]) && gps[0] !== 0 ? gps[0] : null,
      lng: Number.isFinite(gps[1]) && gps[1] !== 0 ? gps[1] : null,
      phone: null, // not published in this source
      email: links.find((l) => l.type === '5' && l.url.includes('@'))?.url ?? null,
      website: links.find((l) => l.type === '1')?.url ?? null,
      data_box: tag(detail, 'IdDS') || tag(s, 'IdDS') || null,
      hours: hoursLines(tag(office, 'UredniHodiny')),
      extra: {},
      source: 'ovm',
      source_url: OVM_DETAIL(id),
    });
  }
  return places;
}

/* ───────────── Foreign missions (MZV) ───────────── */

function pageLines(html) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '\n');
  return decode(text)
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l && l !== '-->');
}

const LABELS = ['Phone', 'Fax', 'E-mail', 'Web:', 'Head of the Mission', 'Function', 'Office Hours'];
const isLabel = (l) => LABELS.includes(l);
/** Section names that open a new block ("Consular Section", "Visa Department", "Commercial Office"). */
const SECTION = /\b(section|department|division|consulate|consular|office of|attach[eé])\b/i;
const looksLikeAddress = (l = '') => /\d{3} ?\d{2}/.test(l);

/** One mission page → the main office and its consular section (if any), named people left out. */
function parseMission(lines) {
  const start = lines.findIndex((l) => l.startsWith('source:'));
  if (start < 1) return null;
  const end = lines.indexOf('Skip to content', start);
  const body = lines.slice(start + 1, end < 0 ? undefined : end);
  const title = lines[start - 1]; // "Albania - Embassy of the Republic of Albania"
  const country = title.split(' - ')[0].trim();

  // Split into blocks: each starts with a heading line (the office or a section name), then its
  // address lines up to the first label, then label/value pairs.
  const blocks = [];
  let block = null;
  let field = null;
  for (let i = 0; i < body.length; i++) {
    const line = body[i];
    if (isLabel(line)) {
      field = line;
      continue;
    }
    // A heading: after a value, a line without digits, an e-mail or a web address that names a
    // section, or that is followed by an address line. Some sections have only hours, no address.
    const plainText = !/\d/.test(line) && !line.includes('@') && !/^(www\.|https?:)/i.test(line);
    const startsBlock =
      !block || (field && !isLabel(body[i - 1]) && plainText && (SECTION.test(line) || looksLikeAddress(body[i + 1])));
    if (startsBlock) {
      block = { heading: line, address: [], fields: {} };
      blocks.push(block);
      field = null;
      continue;
    }
    if (!field) block.address.push(line);
    else (block.fields[field] ??= []).push(line);
  }
  const main = blocks[0];
  if (!main) return null;
  const consular = blocks.find((b) => /consul/i.test(b.heading) && b !== main);
  const one = (b, f) => (b?.fields[f] ?? []).join(', ') || null;
  return {
    country,
    name: main.heading,
    address: main.address.join(', '),
    phone: one(main, 'Phone'),
    email: one(main, 'E-mail'),
    website: one(main, 'Web:'),
    hours: main.fields['Office Hours'] ?? [],
    consular: consular
      ? {
          name: consular.heading,
          address: consular.address.join(', ') || null,
          phone: one(consular, 'Phone'),
          email: one(consular, 'E-mail'),
          hours: consular.fields['Office Hours'] ?? [],
        }
      : null,
  };
}

/** Pages sometimes list several sites ("www.a.cz, www.b.eu"); link the first. */
function firstUrl(text) {
  const first = text?.split(/[,\s]+/).find((t) => /\.[a-z]{2,}/i.test(t));
  return first ? (/^https?:\/\//.test(first) ? first : `https://${first}`) : null;
}

async function loadMissions() {
  const links = new Set();
  for (const range of MZV_RANGES) {
    const html = await get(`${MZV_INDEX}?zn=${range}`);
    for (const m of html.matchAll(/href="(\/jnp\/en\/diplomatic_missions\/foreign_missions_to_the_czech_republic\/[^"?#]+\.html)"/g)) {
      if (!m[1].endsWith('/index.html')) links.add(m[1]);
    }
    await pause(300);
  }
  const seen = new Set();
  const places = [];
  for (const path of [...links].sort()) {
    const mission = parseMission(pageLines(await get(`${MZV}${path}`)));
    await pause(300);
    // Missions accredited from abroad list an address in another country; keep those in Prague.
    if (!mission || !/\bPraha\b/.test(mission.address)) continue;
    // Some missions appear on two pages (an older copy ends in "_1"); keep the first per name.
    const key = fold(mission.name);
    if (seen.has(key)) continue;
    seen.add(key);
    const district = mission.address.match(/Praha \d+/)?.[0] ?? mission.address.split(',').pop().trim();
    places.push({
      id: `mzv:${path.split('/').pop().replace(/\.html$/, '')}`,
      // Consulates (including honorary ones) separately; embassies and other missions together.
      kind: /consul/i.test(mission.name) && !/embassy/i.test(mission.name) ? 'consulate' : 'embassy',
      name: mission.name,
      country: mission.country,
      address: mission.address,
      district,
      lat: null,
      lng: null,
      phone: mission.phone,
      email: mission.email,
      website: firstUrl(mission.website),
      data_box: null,
      hours: mission.hours,
      extra: mission.consular ? { consular: mission.consular } : {},
      source: 'mzv',
      source_url: `${MZV}${path}`,
    });
  }
  return places;
}

/* ───────────── Run ───────────── */

const ovm = await loadOvm();
const missions = await loadMissions();
const places = [...ovm, ...missions].map((p) => ({
  ...p,
  search: fold([p.name, p.country, p.address, p.district].filter(Boolean).join(' ')),
}));

const count = (k) => places.filter((p) => p.kind === k).length;
console.log(`Town halls ${count('town_hall')}, notaries ${count('notary')}, embassies ${count('embassy')}, consulates ${count('consulate')}`);
for (const k of ['town_hall', 'notary', 'embassy', 'consulate']) {
  const sample = places.find((p) => p.kind === k);
  if (sample) console.log(`\n${k}:`, JSON.stringify({ ...sample, search: undefined }));
}
const missing = places.filter((p) => !p.address);
if (missing.length) console.log(`\nWithout an address: ${missing.map((p) => p.id).join(', ')}`);

if (dryRun) process.exit(0);
if (places.length < 100) throw new Error(`Only ${places.length} places parsed; refusing to overwrite the table.`);

const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const arr = (xs) => `array[${xs.map(q).join(',')}]::text[]`;
const values = places.map(
  (p) =>
    `(${q(p.id)},${q(p.kind)},${q(p.name)},${q(p.country)},${q(p.address)},${q(p.district)},${q(p.lat)},${q(p.lng)},${q(p.phone)},${q(p.email)},${q(p.website)},${q(p.data_box)},${arr(p.hours)},${q(JSON.stringify(p.extra))}::jsonb,${q(p.search)},${q(p.source)},${q(p.source_url)},${q(today)}::date)`,
);
const sql = [
  'begin;',
  `insert into public.places (id, kind, name, country, address, district, lat, lng, phone, email, website, data_box, hours, extra, search, source, source_url, checked_on)
values ${values.join(',\n')}
on conflict (id) do update set
  kind = excluded.kind, name = excluded.name, country = excluded.country, address = excluded.address,
  district = excluded.district, lat = excluded.lat, lng = excluded.lng, phone = excluded.phone,
  email = excluded.email, website = excluded.website, data_box = excluded.data_box, hours = excluded.hours,
  extra = excluded.extra, search = excluded.search, source = excluded.source, source_url = excluded.source_url,
  checked_on = excluded.checked_on, removed = false;`,
  // Gone from the source: hidden.
  `update public.places set removed = true where checked_on < ${q(today)}::date and not removed;`,
  'commit;',
].join('\n');
const dir = mkdtempSync(join(tmpdir(), 'czechpal-places-'));
const file = join(dir, 'places.sql');
writeFileSync(file, sql);
execSync(`npx supabase db query --linked --file "${file}"`, { stdio: 'inherit' });
console.log(`\nImported ${places.length} places.`);
