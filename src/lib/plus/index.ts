import { ensureSession, isBackendConfigured, supabase } from '@/lib/supabase';
import { useStore } from '@/store/cases';
import { usePlusStore } from '@/store/plus';

import { buy, linkUser, purchasesConfigured, restore, startPurchases, type BuyResult, type Membership } from './purchases';

export * from './access';
export { loadPlans, purchasesConfigured, type Plan } from './purchases';

/**
 * CzechLocal Plus, for the app: start the store once, keep "has Plus" up to date, and tell the
 * server, which is what lifts the monthly count on explanations. The server never takes the
 * app's word for it: it asks the store itself (the `membership` function).
 */

let lastSynced = '';

/** Has the server check this person's membership with the store. Quietly does nothing offline. */
async function tellServer(m: Membership) {
  const stamp = `${m.plus}:${m.until ?? ''}`;
  if (!isBackendConfigured || !supabase || stamp === lastSynced) return;
  try {
    const session = await ensureSession();
    // The server asks the store about this account id, so the store must know the purchase by it.
    await linkUser(session.user.id);
    const { error } = await supabase.functions.invoke('membership', { body: {} });
    if (error) return;
    lastSynced = stamp;
    // The explanations left may have changed with it.
    useStore.getState().syncAllowance();
  } catch {
    // Offline: the next launch tries again.
  }
}

function apply(m: Membership) {
  const before = usePlusStore.getState();
  usePlusStore.getState().setPlus({ plus: m.plus, until: m.until, ending: m.ending });
  // Tell the server about Plus starting, renewing or ending; not about "still nothing".
  if (m.plus || before.plus) void tellServer(m);
}

let started = false;

/** Once per launch, after the app is ready. The store id is the app's own account id, so a purchase follows the account. */
export async function initPlus() {
  if (started || !purchasesConfigured) return;
  started = true;
  let userId: string | undefined;
  try {
    userId = isBackendConfigured ? (await ensureSession()).user.id : undefined;
  } catch {
    // Offline at launch: the store SDK starts with its own id and is linked on a later launch.
  }
  try {
    await startPurchases(userId, apply);
  } catch {
    started = false;
  }
}

export async function buyPlan(planId: string): Promise<BuyResult> {
  const result = await buy(planId);
  if (result.status === 'bought') apply(result.membership);
  return result;
}

/** True when a purchase was found. */
export async function restorePlus(): Promise<boolean> {
  const m = await restore();
  if (m) apply(m);
  return !!m?.plus;
}
