#!/usr/bin/env node
/**
 * Imports Prague GPs, dentists, children's doctors and gynaecologists from the official
 * National Register of Healthcare Providers (NRPZS, ÚZIS ČR, CC BY 4.0, updated monthly)
 * into the `providers` table. Community reports are never touched.
 *
 *   node scripts/import-providers.mjs --dry-run      download, check and print a summary
 *   node scripts/import-providers.mjs                also write to the linked Supabase project
 *   node scripts/import-providers.mjs --csv file.csv use a downloaded copy instead
 *
 * Privacy: only the address where care is provided is imported. The provider's registered
 * office is skipped (for a doctor practising in their own name it can be their home), and so is
 * the named professional representative.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SOURCE = 'https://datanzis.uzis.gov.cz/data/NR-01-NRPZS/NR-01-06/Otevrena-data-NR-01-06-nrpzs-mista-poskytovani-zdravotnich-sluzeb.csv';
const PRAGUE = 'Hlavní město Praha';

/** Register specialty → the directory's kinds (must match the check in the providers table). */
const KINDS = {
  'všeobecné praktické lékařství': 'gp',
  'zubní lékařství': 'dentist',
  'praktické lékařství pro děti a dorost': 'children',
  'gynekologie a porodnictví': 'gynecology',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvArg = args.includes('--csv') ? args[args.indexOf('--csv') + 1] : null;

/** RFC 4180 CSV: quoted fields, doubled quotes, separators and newlines inside quotes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Lowercase without diacritics, so "zubni" finds "zubní". The app normalises queries the same way. */
const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const cleanPhone = (raw) => {
  const digits = raw.replace(/[^\d+]/g, '');
  if (/^\+420\d{9}$/.test(digits)) return digits;
  if (/^\d{9}$/.test(digits)) return `+420${digits}`;
  return null;
};
const cleanWebsite = (raw) => {
  const s = raw.trim();
  if (!s || /\s/.test(s) || !/\.[a-z]{2,}/i.test(s)) return null;
  const url = /^https?:\/\//i.test(s) ? s : `https://${s}`;
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
};
const cleanEmail = (raw) => (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(raw.trim()) ? raw.trim().toLowerCase() : null);
const district = (obec, obvod) => [obec, obvod].map((s) => s.trim()).find((s) => /^Praha \d{1,2}$/.test(s)) ?? null;
const gps = (raw) => {
  const m = /^POINT\((-?[\d.]+) (-?[\d.]+)\)$/.exec(raw.trim());
  if (!m) return [null, null];
  const [lat, lng] = [Number(m[1]), Number(m[2])];
  // Prague is around 50.1 N, 14.4 E; anything far off is a data error.
  return lat > 49.9 && lat < 50.3 && lng > 14.1 && lng < 14.8 ? [lat, lng] : [null, null];
};

async function loadCsv() {
  if (csvArg) return readFileSync(csvArg, 'utf8');
  console.log('Downloading the register…');
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  return res.text();
}

const [header, ...rows] = parseCsv(await loadCsv());
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const required of ['ZZ_ID', 'ZZ_nazev', 'ZZ_kraj_nazev', 'ZZ_obor_pece', 'ZZ_forma_pece', 'ZZ_GPS', 'poskytovatel_nazev']) {
  if (!(required in col)) throw new Error(`The register's format changed: column ${required} is missing.`);
}
const get = (r, k) => (r[col[k]] ?? '').trim();

const providers = [];
const skipped = { notPrague: 0, otherSpecialty: 0, notOutpatient: 0, badRow: 0 };
for (const r of rows) {
  if (r.length !== header.length) {
    skipped.badRow++;
    continue;
  }
  if (get(r, 'ZZ_kraj_nazev') !== PRAGUE) {
    skipped.notPrague++;
    continue;
  }
  const specialties = get(r, 'ZZ_obor_pece').split(',').map((s) => s.trim()).filter(Boolean);
  const kinds = [...new Set(specialties.map((s) => KINDS[s]).filter(Boolean))];
  if (!kinds.length) {
    skipped.otherSpecialty++;
    continue;
  }
  // Practices people visit. Home nursing and similar have no place to go to.
  const forma = get(r, 'ZZ_forma_pece');
  if (forma && !/ambulantní/.test(forma)) {
    skipped.notOutpatient++;
    continue;
  }
  const [lat, lng] = gps(get(r, 'ZZ_GPS'));
  const name = get(r, 'ZZ_nazev') || get(r, 'poskytovatel_nazev');
  const street = get(r, 'ZZ_ulice') || null;
  providers.push({
    id: Number(get(r, 'ZZ_ID')),
    name,
    provider_name: get(r, 'poskytovatel_nazev'),
    kinds,
    specialties,
    district: district(get(r, 'ZZ_obec'), get(r, 'ZZ_spravni_obvod')),
    street,
    house_number: get(r, 'ZZ_cislo_domovni_orientacni') || null,
    postcode: get(r, 'ZZ_PSC') || null,
    lat,
    lng,
    phone: cleanPhone(get(r, 'poskytovatel_telefon')),
    email: cleanEmail(get(r, 'poskytovatel_email')),
    website: cleanWebsite(get(r, 'poskytovatel_web')),
    search: fold(`${name} ${get(r, 'poskytovatel_nazev')} ${street ?? ''}`),
  });
}

const bad = providers.filter((p) => !Number.isSafeInteger(p.id) || p.id <= 0 || !p.name);
if (bad.length) throw new Error(`${bad.length} rows have no id or name, e.g. ${JSON.stringify(bad[0])}`);
if (new Set(providers.map((p) => p.id)).size !== providers.length) throw new Error('Duplicate register ids.');
if (providers.length < 1000) throw new Error(`Only ${providers.length} providers found: the register looks incomplete, so nothing was written.`);

const by = (k) => Object.entries(providers.flatMap((p) => p.kinds).reduce((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {}));
const share = (pred) => `${Math.round((providers.filter(pred).length / providers.length) * 100)}%`;
console.log(`Prague providers: ${providers.length}  by kind: ${by().map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`With district ${share((p) => p.district)}, GPS ${share((p) => p.lat)}, phone ${share((p) => p.phone)}, website ${share((p) => p.website)}, email ${share((p) => p.email)}`);
console.log('Skipped:', JSON.stringify(skipped));

if (dryRun) {
  const sample = (kind) => providers.filter((p) => p.kinds.includes(kind)).slice(0, 3);
  for (const k of Object.values(KINDS)) console.log(`\nSample ${k}:`, JSON.stringify(sample(k).map(({ search, specialties, ...p }) => p), null, 1));
  const noDistrict = providers.filter((p) => !p.district).slice(0, 5).map((p) => [p.name, p.street]);
  console.log('\nNo district, e.g.:', JSON.stringify(noDistrict));
  process.exit(0);
}

/* ───────────── Write to Supabase ───────────── */

const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const arr = (xs) => `array[${xs.map(q).join(',')}]::text[]`;
const today = new Date().toISOString().slice(0, 10);

const values = providers.map(
  (p) =>
    `(${q(p.id)},${q(p.name)},${q(p.provider_name)},${arr(p.kinds)},${arr(p.specialties)},${q(p.district)},${q(p.street)},${q(p.house_number)},${q(p.postcode)},${q(p.lat)},${q(p.lng)},${q(p.phone)},${q(p.email)},${q(p.website)},${q(p.search)},${q(today)}::date)`,
);
const chunks = [];
for (let i = 0; i < values.length; i += 500) chunks.push(values.slice(i, i + 500));

const sql = [
  'begin;',
  ...chunks.map(
    (c) => `insert into public.providers (id, name, provider_name, kinds, specialties, district, street, house_number, postcode, lat, lng, phone, email, website, search, register_updated)
values ${c.join(',\n')}
on conflict (id) do update set
  name = excluded.name, provider_name = excluded.provider_name, kinds = excluded.kinds, specialties = excluded.specialties,
  district = excluded.district, street = excluded.street, house_number = excluded.house_number, postcode = excluded.postcode,
  lat = excluded.lat, lng = excluded.lng, phone = excluded.phone, email = excluded.email, website = excluded.website,
  search = excluded.search, register_updated = excluded.register_updated, removed = false;`,
  ),
  // Gone from the register: hidden, but their community reports are kept in case they return.
  `update public.providers set removed = true where register_updated < ${q(today)}::date and not removed;`,
  'commit;',
].join('\n');

const file = join(mkdtempSync(join(tmpdir(), 'czechpal-')), 'providers.sql');
writeFileSync(file, sql);
console.log(`Writing ${providers.length} providers to Supabase…`);
// One quoted command string: works through the Windows shell (needed for npx.cmd) and with spaces in the path.
execSync(`npx supabase db query --linked --file "${file}"`, { stdio: 'inherit' });
console.log('Done.');
