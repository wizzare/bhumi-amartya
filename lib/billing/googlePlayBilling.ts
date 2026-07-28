import { Capacitor, registerPlugin } from "@capacitor/core";
import { httpsCallable } from "firebase/functions";
import { auth, getClientFunctions } from "@/lib/firebase/firebase";

export const GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly";
export const GOOGLE_PLAY_BASE_PLAN_ID = "monthly";
export const GOOGLE_PLAY_PACKAGE_NAME = "com.bhumiamartya.app";
export const GOOGLE_PLAY_BILLING_ENABLED = true;
export const RESTORE_TIMEOUT_MS = 15000;

export type RestoreTerminalState =
  | "RESTORED" | "NO_ACTIVE_PURCHASE" | "PENDING" | "EXPIRED" | "CANCELLED"
  | "GRACE_PERIOD" | "ACCOUNT_HOLD" | "ACCOUNT_MISMATCH" | "VERIFICATION_FAILED"
  | "NETWORK_ERROR" | "TIMEOUT";

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
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
};

const BhumiBilling = registerPlugin<BillingPlugin>("BhumiBilling");
const AppPlugin = registerPlugin<any>("App");

export function isGooglePlayBillingAvailable() {
  return Capacitor.getPlatform() === "android" && Capacitor.isNativePlatform();
}

let isAutoRecoveryInitialized = false;

function isRetryableCallableTransportError(error: unknown) {
  const code = String((error as { code?: unknown } | null)?.code || "").toLowerCase();
  return [
    "functions/unavailable",
    "functions/deadline-exceeded",
    "functions/internal",
    "functions/unknown",
    "functions/resource-exhausted",
    "functions/network-request-failed",
  ].includes(code);
}

export async function initializeGooglePlayBilling() {
  assertAndroidBilling();
  const initResult = await BhumiBilling.initialize();

  // AUTOMATED RECOVERY TRIGGER 1 & 2: BillingClient Connected & App Launch
  if (!isAutoRecoveryInitialized) {
    isAutoRecoveryInitialized = true;
    setupAutoRecoveryListeners();
    // Fire background non-blocking recovery query on connect
    autoRecoverActiveSubscriptions().catch(err => {
      console.warn("[BILLING AUTO-RECOVERY] Background query on connect failed:", err?.message);
    });
  }

  return initResult;
}

function setupAutoRecoveryListeners() {
  if (!isGooglePlayBillingAvailable()) return;

  // AUTOMATED RECOVERY TRIGGER 3: App Return to Foreground
  try {
    AppPlugin.addListener("appStateChange", (state: any) => {
      if (state?.isActive) {
        autoRecoverActiveSubscriptions().catch(() => null);
      }
    });
  } catch (err) {
    console.warn("[BILLING AUTO-RECOVERY] Could not attach appStateChange listener:", err);
  }

  // Global Native Listener for purchaseUpdated
  try {
    BhumiBilling.addListener("purchaseUpdated", async (data: any) => {
      const purchases: GooglePlayPurchase[] = data?.purchases || [];
      for (const p of purchases) {
        if (p.purchaseToken) {
          await processAndVerifyPurchaseToken(p).catch(err => {
            console.error("[BILLING EVENT RECOVERY FAILED]:", err?.message);
          });
        }
      }
    });
  } catch (err) {
    console.warn("[BILLING AUTO-RECOVERY] Could not attach purchaseUpdated listener:", err);
  }
}

export async function queryPremiumSubscription() {
  assertAndroidBilling();
  return BhumiBilling.queryPremiumSubscription();
}

export async function purchasePremiumSubscription() {
  assertAndroidBilling();
  return BhumiBilling.purchasePremium();
}

/**
 * Single Unified Verification Engine used by Purchase, Restore, and Auto-Recovery.
 */
export async function processAndVerifyPurchaseToken(purchase: GooglePlayPurchase) {
  if (!purchase.purchaseToken) {
    throw new Error("Purchase token tidak tersedia.");
  }

  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("AUTH_MISSING");

  try {
    const functionsInstance = getClientFunctions("asia-southeast2");
    const verifyCallable = httpsCallable(functionsInstance, "verifyGooglePlayPurchase");

    const response = await verifyCallable({
      packageName: GOOGLE_PLAY_PACKAGE_NAME,
      purchaseToken: purchase.purchaseToken,
    });

    const data = response.data as any;
    if (!data || !data.ok) {
      throw new Error(data?.error || "GOOGLE_API_FAILURE");
    }

    return {
      ...data,
      plan: "premium" as const,
      productId: GOOGLE_PLAY_PRODUCT_ID,
      basePlanId: GOOGLE_PLAY_BASE_PLAN_ID,
    } as {
      ok: boolean;
      active: boolean;
      plan: "premium";
      productId: string;
      basePlanId: string;
      accessUntil: string;
      subscriptionState: string;
      ackStatus?: string;
    };
  } catch (callableError: any) {
    if (isRetryableCallableTransportError(callableError)) {
      Object.assign(callableError, { retryable: true });
    }
    throw callableError;
  }
}

export async function verifyGooglePlayPurchase(purchase: GooglePlayPurchase) {
  return processAndVerifyPurchaseToken(purchase);
}

export async function restorePremiumPurchases() {
  assertAndroidBilling();
  try {
    return await Promise.race([
      BhumiBilling.restorePurchases(),
      new Promise<never>((_, reject) => setTimeout(() => reject(Object.assign(new Error("Restore timed out."), { code: "TIMEOUT" })), RESTORE_TIMEOUT_MS)),
    ]);
  } catch (error: any) {
    const code = String(error?.code || "").toUpperCase();
    const message = String(error?.message || "").toLowerCase();
    if (code === "USER_CANCELED" || message.includes("cancel")) throw Object.assign(new Error("Restore dibatalkan."), { code: "CANCELLED" });
    if (code === "TIMEOUT") throw error;
    if (code === "ITEM_NOT_FOUND" || code === "NO_ACTIVE_PURCHASE") throw Object.assign(new Error("Tidak ada pembelian aktif."), { code: "NO_ACTIVE_PURCHASE" });
    if (code === "NETWORK_ERROR" || message.includes("network")) throw Object.assign(new Error("Koneksi Google Play tidak tersedia."), { code: "NETWORK_ERROR" });
    throw error;
  }
}

/**
 * Auto-recovery routine executing queryPurchasesAsync across lifecycle triggers.
 */
export async function autoRecoverActiveSubscriptions(): Promise<{ recoveredCount: number }> {
  if (!isGooglePlayBillingAvailable()) return { recoveredCount: 0 };
  let recoveredCount = 0;
  try {
    const result = await restorePremiumPurchases();
    const purchases = result?.purchases || [];
    for (const p of purchases) {
      if (p.purchaseToken) {
        const verified = await processAndVerifyPurchaseToken(p).catch(() => null);
        if (verified?.ok && verified?.active) {
          recoveredCount++;
        }
      }
    }
  } catch (_err) {
    // Background recovery silent failsafe so app launch is never blocked
  }
  return { recoveredCount };
}

export async function initiateGooglePlaySubscription(): Promise<boolean> {
  const purchaseResult = await purchasePremiumSubscription();
  const purchase = purchaseResult.purchases.find((item) => item.products?.includes(GOOGLE_PLAY_PRODUCT_ID))
    ?? purchaseResult.purchases[0];

  if (!purchase) return false;

  const verified = await processAndVerifyPurchaseToken(purchase);
  return Boolean(verified.ok && verified.active);
}

function assertAndroidBilling() {
  if (!isGooglePlayBillingAvailable()) {
    throw new Error("Google Play Billing hanya tersedia di aplikasi Android.");
  }
}
