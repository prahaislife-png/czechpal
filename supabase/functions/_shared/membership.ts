import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

/**
 * CzechLocal Plus on the server. `hasPlus` is what the explanation functions ask; `checkWithStore`
 * asks RevenueCat (which talks to the App Store) and writes the answer down. The app's own claim
 * to have Plus is never trusted.
 *
 * Secrets: REVENUECAT_SECRET_KEY (a secret API key of the RevenueCat project). Without it, nobody
 * has Plus and everything else works as before. PLUS_ENTITLEMENT overrides the entitlement's id.
 */

const SECRET = Deno.env.get('REVENUECAT_SECRET_KEY');
/** The entitlement's identifier in the RevenueCat dashboard; must match PLUS_ENTITLEMENT in src/lib/plus/access.ts. */
const ENTITLEMENT = Deno.env.get('PLUS_ENTITLEMENT') ?? 'czechlocal_pro';
/** A purchase with no end date (a granted or lifetime entitlement). */
const NO_END = '9999-12-31T00:00:00Z';

export async function hasPlus(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await admin.rpc('has_plus', { p_user: userId });
  // Before the migration is applied the function doesn't exist: then nobody has Plus.
  if (error) return false;
  return data === true;
}

export type Membership = { plus: boolean; until: string | null };

type Entitlement = { expires_date?: string | null; grace_period_expires_date?: string | null; product_identifier?: string };

/** The later of the period's end and its grace period's end; NO_END when there is none. */
export function entitlementEnd(e: Entitlement): string {
  const dates = [e.expires_date, e.grace_period_expires_date].filter((d): d is string => typeof d === 'string' && !Number.isNaN(Date.parse(d)));
  if (!dates.length) return NO_END;
  return dates.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

/** Asks the store whether this account has Plus, and until when. Throws when the store can't be reached. */
export async function checkWithStore(admin: SupabaseClient, userId: string): Promise<Membership> {
  if (!SECRET) return { plus: false, until: null };

  // Asked a moment ago (the app asks on every launch and after a purchase): answer from the table.
  const { data: row } = await admin.from('memberships').select('plus_until, checked_at').eq('user_id', userId).maybeSingle();
  if (row && Date.now() - Date.parse(row.checked_at) < 15_000) {
    const active = !!row.plus_until && Date.parse(row.plus_until) > Date.now();
    return { plus: active, until: active ? row.plus_until : null };
  }

  const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { authorization: `Bearer ${SECRET}`, accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`store answered ${res.status}`);
  const body = (await res.json()) as { subscriber?: { entitlements?: Record<string, Entitlement> } };
  const entitlement = body.subscriber?.entitlements?.[ENTITLEMENT];
  const until = entitlement ? entitlementEnd(entitlement) : null;
  const plus = !!until && Date.parse(until) > Date.now();

  const { error } = await admin
    .from('memberships')
    .upsert({ user_id: userId, plus_until: until, product: entitlement?.product_identifier ?? null, checked_at: new Date().toISOString() });
  if (error) throw new Error(`memberships write failed: ${error.message}`);
  return { plus, until: plus ? until : null };
}
