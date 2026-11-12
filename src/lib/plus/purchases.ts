import Purchases, { PACKAGE_TYPE, PURCHASES_ERROR_CODE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { PLUS_ENTITLEMENT } from './access';

/**
 * The App Store (and Google Play) side of CzechLocal Plus, through RevenueCat. The rest of the app
 * only sees plans, a purchase, a restore, and "has Plus or not". The web version of this file
 * (purchases.web.ts) sells nothing.
 *
 * The key is public by design (it only identifies the app to the store SDK). With no key in the
 * build, nothing is configured and nothing in the app is locked.
 */

const KEY = process.env.EXPO_OS === 'ios' ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

export const purchasesConfigured = !!KEY;

export type Plan = {
  id: string;
  period: 'year' | 'month' | 'other';
  /** The price as the store prints it for this person's country: "999 Kč". */
  price: string;
  /** For a yearly plan, the same price by the month: "83,25 Kč". */
  perMonth?: string;
};

export type Membership = { plus: boolean; until?: string; ending?: boolean };

const packages = new Map<string, PurchasesPackage>();

const membershipOf = (info: CustomerInfo): Membership => {
  const e = info.entitlements.active[PLUS_ENTITLEMENT];
  return e ? { plus: true, until: e.expirationDate ?? undefined, ending: !e.willRenew } : { plus: false };
};

let configured = false;

/**
 * Starts the store SDK for this person and reports their membership now and whenever it changes
 * (a purchase, a renewal, an expiry, a restore on another phone).
 */
export async function startPurchases(userId: string | undefined, onChange: (m: Membership) => void): Promise<void> {
  if (!KEY || configured) return;
  configured = true;
  Purchases.configure({ apiKey: KEY, appUserID: userId });
  Purchases.addCustomerInfoUpdateListener((info) => onChange(membershipOf(info)));
  onChange(membershipOf(await Purchases.getCustomerInfo()));
}

const periodOf = (p: PurchasesPackage): Plan['period'] => (p.packageType === PACKAGE_TYPE.ANNUAL ? 'year' : p.packageType === PACKAGE_TYPE.MONTHLY ? 'month' : 'other');

/** The plans on sale, yearly first. Empty when the store can't be reached or nothing is set up. */
export async function loadPlans(): Promise<Plan[]> {
  if (!configured) return [];
  const offerings = await Purchases.getOfferings();
  const available = offerings.current?.availablePackages ?? [];
  packages.clear();
  const rank = { year: 0, month: 1, other: 2 };
  return available
    .map((p) => {
      packages.set(p.identifier, p);
      const period = periodOf(p);
      return { id: p.identifier, period, price: p.product.priceString, perMonth: period === 'year' ? (p.product.pricePerMonthString ?? undefined) : undefined };
    })
    .sort((a, b) => rank[a.period] - rank[b.period]);
}

export type BuyResult = { status: 'bought'; membership: Membership } | { status: 'cancelled' } | { status: 'failed'; message: string };

export async function buy(planId: string): Promise<BuyResult> {
  const pkg = packages.get(planId);
  if (!pkg) return { status: 'failed', message: 'That plan isn’t available right now. Close this and try again.' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const membership = membershipOf(customerInfo);
    return membership.plus ? { status: 'bought', membership } : { status: 'failed', message: 'The purchase went through, but Plus isn’t active yet. Tap Restore purchases in a minute.' };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return { status: 'cancelled' };
    if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) return { status: 'failed', message: 'The payment is waiting for approval. Plus opens as soon as it’s approved.' };
    if (code === PURCHASES_ERROR_CODE.NETWORK_ERROR || code === PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR)
      return { status: 'failed', message: 'No connection to the store. Check your internet and try again.' };
    return { status: 'failed', message: 'The purchase didn’t go through. You haven’t been charged. Please try again.' };
  }
}

/** Finds a purchase made before (another phone, a reinstall). */
export async function restore(): Promise<Membership | null> {
  if (!configured) return null;
  try {
    return membershipOf(await Purchases.restorePurchases());
  } catch {
    return null;
  }
}
