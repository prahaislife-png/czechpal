/**
 * The web has no store: CzechLocal Plus is sold in the app only. Same shape as purchases.ts, so
 * the rest of the app doesn't care where it runs.
 */

export const purchasesConfigured = false;

export type Plan = { id: string; period: 'year' | 'month' | 'lifetime' | 'other'; price: string; perMonth?: string };
export type Membership = { plus: boolean; until?: string; ending?: boolean };
export type BuyResult = { status: 'bought'; membership: Membership } | { status: 'cancelled' } | { status: 'failed'; message: string };

export async function startPurchases(_userId: string | undefined, _onChange: (m: Membership) => void): Promise<void> {}

export async function loadPlans(): Promise<Plan[]> {
  return [];
}

export async function buy(_planId: string): Promise<BuyResult> {
  return { status: 'failed', message: 'CzechLocal Plus is bought in the iPhone app.' };
}

export async function linkUser(_userId: string): Promise<void> {}

export async function restore(): Promise<Membership | null> {
  return null;
}
