import { FunctionsHttpError } from '@supabase/supabase-js';

import { ensureSession, supabase } from '@/lib/supabase';

import type { OfficeId } from './offices';

/** Waiting times reported today by people at the offices (Prague time). */

export type Wait = 'under30' | '30to60' | '1to2h' | 'over2h';

export const waitLabel: Record<Wait, string> = {
  under30: 'Under 30 minutes',
  '30to60': '30 minutes to 1 hour',
  '1to2h': '1 to 2 hours',
  over2h: 'More than 2 hours',
};

export type OfficeWait = {
  office_id: OfficeId;
  reports: number;
  walk_in_wait: Wait | null;
  walk_in_at: string | null;
  booked_wait: Wait | null;
  booked_at: string | null;
  tickets_gone_at: string | null;
};

export class WaitsError extends Error {}

export async function getWaitsToday(): Promise<Partial<Record<OfficeId, OfficeWait>>> {
  if (!supabase) throw new WaitsError('Waiting times need the live connection, which isn’t set up in this build.');
  const { data, error } = await supabase.rpc('office_waits_today');
  if (error) throw new WaitsError('Couldn’t load today’s waiting times.');
  return Object.fromEntries(((data ?? []) as OfficeWait[]).map((w) => [w.office_id, w]));
}

export type OfficeReport = { booked: boolean; wait?: Wait; ticketsGone?: boolean };

export async function reportOffice(officeId: OfficeId, report: OfficeReport): Promise<OfficeWait | null> {
  if (!supabase) throw new WaitsError('Reports need the live connection, which isn’t set up in this build.');
  try {
    await ensureSession();
  } catch {
    throw new WaitsError('Couldn’t connect. Check your internet and try again.');
  }
  const { data, error } = await supabase.functions.invoke<{ status: OfficeWait | null }>('report-office', {
    body: { officeId, ...report },
    timeout: 20_000,
  });
  if (!error && data) return data.status;
  if (error instanceof FunctionsHttpError) {
    const payload = (await error.context.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new WaitsError(payload.error?.message ?? 'Your report couldn’t be saved. Please try again.');
  }
  throw new WaitsError('Couldn’t connect. Check your internet and try again.');
}

/** "10:42" in Prague time (the phone's own time if time zones aren't supported). */
export function clock(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' });
  } catch {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}
