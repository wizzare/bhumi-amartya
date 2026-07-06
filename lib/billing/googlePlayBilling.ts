import { Capacitor, registerPlugin } from "@capacitor/core";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase/firebase";

export const GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly";
export const GOOGLE_PLAY_BASE_PLAN_ID = "monthly";
export const GOOGLE_PLAY_PACKAGE_NAME = "com.bhumiamartya.app";
export const GOOGLE_PLAY_BILLING_ENABLED = true;

export type GooglePlayProduct = {
  productId: string;
  type?: string;
  title?: string;
  description?: string;
  basePlanId?: string;
  offers?: Array<{
    basePlanId?: string;
    offerId?: string | null;
    offerToken?: string;
    pricingPhases?: Array<{
      formattedPrice?: string;
      priceCurrencyCode?: string;
      billingPeriod?: string;
    }>;
  }>;
};

export type GooglePlayPurchase = {
  purchaseToken: string;
  orderId?: string | null;
  packageName?: string | null;
  purchaseTime?: number;
  purchaseState?: number;
  acknowledged?: boolean;
  products?: string[];
};

type BillingPlugin = {
  initialize(): Promise<{ connected: boolean; productId: string; basePlanId: string }>;
  queryPremiumSubscription(): Promise<GooglePlayProduct>;
  purchasePremium(): Promise<{ purchases: GooglePlayPurchase[] }>;
  restorePurchases(): Promise<{ purchases: GooglePlayPurchase[] }>;
};

const BhumiBilling = registerPlugin<BillingPlugin>("BhumiBilling");

export function isGooglePlayBillingAvailable() {
  return Capacitor.getPlatform() === "android" && Capacitor.isNativePlatform();
}

export async function initializeGooglePlayBilling() {
  assertAndroidBilling();
  return BhumiBilling.initialize();
}

export async function queryPremiumSubscription() {
  assertAndroidBilling();
  return BhumiBilling.queryPremiumSubscription();
}

export async function purchasePremiumSubscription() {
  assertAndroidBilling();
  return BhumiBilling.purchasePremium();
}

export async function restorePremiumPurchases() {
  assertAndroidBilling();
  return BhumiBilling.restorePurchases();
}

export async function verifyGooglePlayPurchase(purchase: GooglePlayPurchase) {
  if (!purchase.purchaseToken) {
    throw new Error("Purchase token tidak tersedia.");
  }

  const functions = getFunctions(app, "asia-southeast2");
  const verifyPurchase = httpsCallable(functions, "verifyGooglePlayPurchase");
  const result = await verifyPurchase({
    packageName: purchase.packageName || GOOGLE_PLAY_PACKAGE_NAME,
    productId: GOOGLE_PLAY_PRODUCT_ID,
    basePlanId: GOOGLE_PLAY_BASE_PLAN_ID,
    purchaseToken: purchase.purchaseToken,
  });

  return result.data as {
    ok: boolean;
    active: boolean;
    plan: "premium";
    productId: string;
    basePlanId: string;
    accessUntil: string;
    subscriptionState: string;
  };
}

export async function initiateGooglePlaySubscription(): Promise<boolean> {
  const purchaseResult = await purchasePremiumSubscription();
  const purchase = purchaseResult.purchases.find((item) => item.products?.includes(GOOGLE_PLAY_PRODUCT_ID))
    ?? purchaseResult.purchases[0];

  if (!purchase) return false;

  const verified = await verifyGooglePlayPurchase(purchase);
  return Boolean(verified.ok && verified.active);
}

function assertAndroidBilling() {
  if (!isGooglePlayBillingAvailable()) {
    throw new Error("Google Play Billing hanya tersedia di aplikasi Android.");
  }
}
