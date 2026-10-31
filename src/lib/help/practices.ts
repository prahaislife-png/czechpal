import { FunctionsHttpError } from '@supabase/supabase-js';

import type { DoctorType, Insurer } from '@/lib/compose/templates';
import { ensureSession, supabase } from '@/lib/supabase';

/**
 * The live directory of Prague practices.
 *
 * The list is the official National Register of Healthcare Providers (NRPZS, ÚZIS ČR, CC BY 4.0),
 * imported by scripts/import-providers.mjs. The status (new patients, English, extra fees) is
 * what CzechPal users reported, each with a date, summarised on the server.
 */

export type PracticeKind = 'gp' | 'dentist' | 'children' | 'gynecology';

export const practiceKinds: { id: PracticeKind; title: string; one: string; doctorType: DoctorType }[] = [
  { id: 'gp', title: 'GPs', one: 'GP', doctorType: 'gp' },
  { id: 'dentist', title: 'Dentists', one: 'Dentist', doctorType: 'dentist' },
  { id: 'children', title: 'Children’s doctors', one: 'Children’s doctor', doctorType: 'paediatrician' },
  { id: 'gynecology', title: 'Gynaecologists', one: 'Gynaecologist', doctorType: 'gynaecologist' },
];

export const kindById = (id: string | undefined) => practiceKinds.find((k) => k.id === id);

export const PRAGUE_DISTRICTS = Array.from({ length: 22 }, (_, i) => `Praha ${i + 1}`);

export const SOURCE_NOTE = 'Practices from the National Register of Healthcare Providers (ÚZIS ČR, CC BY 4.0).';

export type Practice = {
  id: number;
  name: string;
  provider_name: string;
  kinds: PracticeKind[];
  specialties: string[];
  district: string | null;
  street: string | null;
  house_number: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  register_updated: string;
  new_patients: 'yes' | 'no' | null;
  new_patients_at: string | null;
  new_patients_yes: number;
  new_patients_no: number;
  english: 'good' | 'basic' | 'none' | null;
  english_at: string | null;
  extra_fee: 'yes' | 'no' | null;
  extra_fee_at: string | null;
  insurers: Insurer[];
  reports: number;
  last_report_at: string | null;
};

export class DirectoryError extends Error {}

const OFFLINE = 'Couldn’t load the directory. Check your connection and try again.';

/** Lowercase without diacritics, matching how the importer stores `search`. */
export const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export const PAGE_SIZE = 40;

export async function searchPractices(opts: {
  kind: PracticeKind;
  district?: string;
  query?: string;
  newPatients?: boolean;
  english?: boolean;
  offset?: number;
}): Promise<Practice[]> {
  if (!supabase) throw new DirectoryError('The directory needs the live connection, which isn’t set up in this build.');
  const query = opts.query ? fold(opts.query) : '';
  const { data, error } = await supabase.rpc('search_providers', {
    p_kind: opts.kind,
    p_district: opts.district ?? null,
    // Too short to mean anything: show everything rather than a random handful.
    p_query: query.length >= 2 ? query : null,
    p_new_patients: !!opts.newPatients,
    p_english: !!opts.english,
    p_limit: PAGE_SIZE,
    p_offset: opts.offset ?? 0,
  });
  if (error) throw new DirectoryError(OFFLINE);
  return (data ?? []) as Practice[];
}

export async function getPractice(id: number): Promise<Practice | null> {
  if (!supabase) throw new DirectoryError('The directory needs the live connection, which isn’t set up in this build.');
  const { data, error } = await supabase.from('providers').select('*').eq('id', id).maybeSingle();
  if (error) throw new DirectoryError(OFFLINE);
  return (data as Practice | null) ?? null;
}

export type Report = {
  newPatients?: 'yes' | 'no';
  english?: 'good' | 'basic' | 'none';
  extraFee?: 'yes' | 'no';
  insurer?: Exclude<Insurer, 'private'>;
};

/** Sends what the user found out; returns the practice's updated public status. */
export async function reportPractice(id: number, report: Report): Promise<Partial<Practice>> {
  if (!supabase) throw new DirectoryError('Reports need the live connection, which isn’t set up in this build.');
  try {
    await ensureSession();
  } catch {
    throw new DirectoryError('Couldn’t connect. Check your internet and try again.');
  }
  const { data, error } = await supabase.functions.invoke<{ status: Partial<Practice> }>('report-provider', {
    body: { providerId: id, ...report },
    timeout: 20_000,
  });
  if (!error && data) return data.status;
  if (error instanceof FunctionsHttpError) {
    const payload = (await error.context.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new DirectoryError(payload.error?.message ?? 'Your report couldn’t be saved. Please try again.');
  }
  throw new DirectoryError('Couldn’t connect. Check your internet and try again.');
}

/* ───────────── Display helpers ───────────── */

const DAY = 24 * 3600 * 1000;

/** "today", "yesterday", "5 days ago", "3 weeks ago", "4 months ago". */
export function ago(iso: string | null, now = Date.now()): string {
  if (!iso) return '';
  const days = Math.floor((now - new Date(iso).getTime()) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.round(days / 7)} weeks ago`;
  return `${Math.round(days / 30)} months ago`;
}

/** A new-patients answer older than this is shown as history, not as the current state. */
export const isFresh = (iso: string | null, days = 90, now = Date.now()) => !!iso && now - new Date(iso).getTime() < days * DAY;

export const addressLine = (p: Pick<Practice, 'street' | 'house_number' | 'district'>) =>
  [[p.street, p.house_number].filter(Boolean).join(' '), p.district ?? 'Prague'].filter(Boolean).join(', ');

/** "+420 220 510 406" */
export const formatPhone = (phone: string) => phone.replace(/^\+420(\d{3})(\d{3})(\d{3})$/, '+420 $1 $2 $3');

/** Opens the address in the phone's maps app (Apple Maps on iOS, Google Maps elsewhere). */
export function mapsUrl(p: Pick<Practice, 'name' | 'lat' | 'lng' | 'street' | 'house_number' | 'district'>) {
  const address = `${addressLine(p)}, Praha`;
  if (process.env.EXPO_OS === 'ios') {
    return p.lat && p.lng
      ? `https://maps.apple.com/?q=${encodeURIComponent(p.name)}&ll=${p.lat},${p.lng}`
      : `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.lat && p.lng ? `${p.lat},${p.lng}` : address)}`;
}

export const englishLabel = { good: 'Good English', basic: 'Some English', none: 'No English' } as const;
