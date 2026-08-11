import { Capacitor, registerPlugin } from "@capacitor/core";
import { auth } from "@/lib/firebase/firebase";
import { Preferences } from "@capacitor/preferences";
import {
  orchestratePremiumCheckout,
  orchestratePremiumRestore,
  recoverAndRefreshPremiumPurchases,
  type PremiumRecoveryResult,
} from "./premiumRecovery";

export const GOOGLE_PLAY_PRODUCT_ID = "bhumi_premium_monthly";
export const GOOGLE_PLAY_BASE_PLAN_ID = "monthly";
export const GOOGLE_PLAY_PACKAGE_NAME = "com.bhumiamartya.app";
export const GOOGLE_PLAY_BILLING_ENABLED = true;
export const RESTORE_TIMEOUT_MS = 15000;
const BILLING_VERIFIER_PATH = "/api/billing/google-play/verify";

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

export type PremiumPurchaseResult = {
  alreadyOwned?: boolean;
  purchases: GooglePlayPurchase[];
};

type BillingPlugin = {
  initialize(): Promise<{ connected: boolean; productId: string; basePlanId: string }>;
  queryPremiumSubscription(): Promise<GooglePlayProduct>;
  purchasePremium(): Promise<{ alreadyOwned?: boolean; purchases: GooglePlayPurchase[] }>;
  restorePurchases(): Promise<PremiumPurchaseResult>;
  addListener(eventName: string, listenerFunc: (data: any) => void): Promise<{ remove: () => void }>;
};

interface SecureStorage {
  set(options: { key: string; value: string }): Promise<{ value: boolean }>;
  get(options: { key: string }): Promise<{ value: string }>;
  remove(options: { key: string }): Promise<{ value: boolean }>;
}

const BhumiBilling = registerPlugin<BillingPlugin>("BhumiBilling");
const AppPlugin = registerPlugin<any>("App");
const SecureStoragePlugin = registerPlugin<SecureStorage>("SecureStorage");

// Test-only platform override. Guarded by NODE_ENV and never reachable in a
// real web/browser runtime (web still fails closed below). Lets unit tests run
// the client verification path under Node without a native Capacitor runtime.
function currentPlatform(): string {
  if (process.env.NODE_ENV === "test" && process.env.BHUMI_TEST_PLATFORM === "android") {
    return "android";
  }
  return Capacitor.getPlatform();
}

export function isGooglePlayBillingAvailable() {
  return currentPlatform() === "android" && Capacitor.isNativePlatform();
}

let isAutoRecoveryInitialized = false;
let onPostVerification: (() => Promise<void>) | null = null;

export function setOnPostVerification(cb: () => Promise<void>) {
  onPostVerification = cb;
}

export function clearOnPostVerification() {
  onPostVerification = null;
}

function billingVerifierUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_BILLING_VERIFIER_URL?.trim().replace(/\/+$/, "");
  if (!baseUrl) throw Object.assign(new Error("Billing verifier URL belum dikonfigurasi."), { code: "BILLING_VERIFIER_URL_MISSING" });
  return `${baseUrl}${BILLING_VERIFIER_PATH}`;
}

function isRetryableVerifierTransportError(error: unknown) {
  const code = String((error as { code?: unknown } | null)?.code || "").toLowerCase();
  const status = Number((error as { status?: unknown } | null)?.status || 0);
  return [
    "billing_verifier_unavailable",
    "google_api_failure",
    "acknowledgment_failure",
  ].includes(code) || status === 429 || status >= 500 || error instanceof TypeError;
}

export async function initializeGooglePlayBilling() {
  assertAndroidBilling();
  const initResult = await BhumiBilling.initialize();

  if (!isAutoRecoveryInitialized) {
    isAutoRecoveryInitialized = true;
    setupAutoRecoveryListeners();
    autoRecoverActiveSubscriptions().catch(err => {
      console.warn("[BILLING AUTO-RECOVERY] Background query on connect failed:", err?.message);
    });
  }

  return initResult;
}

function setupAutoRecoveryListeners() {
  if (!isGooglePlayBillingAvailable()) return;

  try {
    AppPlugin.addListener("appStateChange", (state: any) => {
      if (state?.isActive) {
        autoRecoverActiveSubscriptions().catch(err => {
          console.warn("[BILLING AUTO-RECOVERY] Foreground recovery failed:", err?.message);
        });
      }
    });
  } catch (err) {
    console.warn("[BILLING AUTO-RECOVERY] Could not attach appStateChange listener:", err);
  }

  try {
    BhumiBilling.addListener("purchaseUpdated", async (data: any) => {
      const purchases: GooglePlayPurchase[] = data?.purchases || [];
      let verified = false;
      for (const p of purchases) {
        if (p.purchaseToken) {
          try {
            const result = await processAndVerifyPurchaseToken(p);
            if (result?.ok && result?.active) verified = true;
          } catch (err: any) {
            console.error("[BILLING EVENT RECOVERY FAILED]:", err?.message);
          }
        }
      }
      if (verified && onPostVerification) {
        try {
          await onPostVerification();
        } catch (refreshErr) {
          console.error("[BILLING EVENT] Gagal refresh profil setelah purchase event:", refreshErr);
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

export async function recoverAndRefreshGooglePlayPurchases(purchases: GooglePlayPurchase[], refresh?: () => Promise<void>): Promise<PremiumRecoveryResult> {
  return recoverAndRefreshPremiumPurchases(
    purchases,
    GOOGLE_PLAY_PRODUCT_ID,
    (purchase) => processAndVerifyPurchaseToken(purchase as GooglePlayPurchase),
    async () => {
      if (refresh) await refresh();
      else if (onPostVerification) await onPostVerification();
    },
  );
}

function recoveryDependencies(refresh: () => Promise<void>, existingAccessActive = false) {
  return {
    productId: GOOGLE_PLAY_PRODUCT_ID,
    verify: (purchase: { purchaseToken?: string; products?: string[] }) => processAndVerifyPurchaseToken(purchase as GooglePlayPurchase),
    refresh,
    existingAccessActive,
  };
}

export async function purchaseAndRecoverPremium(refresh: () => Promise<void>, existingAccessActive = false) {
  return orchestratePremiumCheckout(
    purchasePremiumSubscription,
    restorePremiumPurchases,
    recoveryDependencies(refresh, existingAccessActive),
  );
}

export async function restoreAndRecoverPremium(refresh: () => Promise<void>, existingAccessActive = false) {
  return orchestratePremiumRestore(
    restorePremiumPurchases,
    recoveryDependencies(refresh, existingAccessActive),
  );
}

export async function processAndVerifyPurchaseToken(purchase: GooglePlayPurchase) {
  if (!purchase.purchaseToken) {
    throw new Error("Purchase token tidak tersedia.");
  }
  if (purchase.purchaseState !== undefined && purchase.purchaseState !== 1) {
    return { ok: false, active: false, purchaseState: purchase.purchaseState, accessUntil: "" };
  }

  let currentUser = auth.currentUser;
  if (!currentUser && typeof (auth as any).authStateReady === "function") {
    await (auth as any).authStateReady().catch(() => {});
    currentUser = auth.currentUser;
  }
  if (!currentUser && typeof auth.onAuthStateChanged === "function") {
    await new Promise<void>((resolve) => {
      let unsubscribe: (() => void) | undefined;
      const timer = setTimeout(() => {
        if (unsubscribe) unsubscribe();
        resolve();
      }, 3000);
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          clearTimeout(timer);
          if (unsubscribe) unsubscribe();
          resolve();
        }
      });
    }).catch(() => {});
    currentUser = auth.currentUser;
  }
  if (!currentUser) throw new Error("AUTH_MISSING");

  try {
    const response = await fetch(billingVerifierUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await currentUser.getIdToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        purchaseToken: purchase.purchaseToken,
        productId: GOOGLE_PLAY_PRODUCT_ID,
      }),
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch {
      // transport status checked below
    }
    if (!response.ok || !data?.ok) {
      throw Object.assign(new Error(data?.error || "BILLING_VERIFIER_UNAVAILABLE"), {
        code: data?.error || "BILLING_VERIFIER_UNAVAILABLE",
        status: response.status,
      });
    }

    if (data?.signedEntitlement) {
      await SecureStoragePlugin.set({
        key: `signed_entitlement_${currentUser.uid}`,
        value: data.signedEntitlement,
      }).catch(err => console.warn("[SECURE_STORAGE] Write failed:", err));
      // Store non-sensitive metadata in Preferences
      await Preferences.set({ key: `last_entitlement_sync_${currentUser.uid}`, value: new Date().toISOString() });
    } else if (data && !data.active) {
      await SecureStoragePlugin.remove({ key: `signed_entitlement_${currentUser.uid}` }).catch(() => {});
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
      acknowledgementDeferred?: boolean;
      signedEntitlement?: string;
    };
  } catch (verificationError: any) {
    if (isRetryableVerifierTransportError(verificationError)) {
      Object.assign(verificationError, { retryable: true });
    }
    throw verificationError;
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

let activeRecoveryPromise: Promise<{ recoveredCount: number }> | null = null;
let lastRecoveryTime = 0;
const RECOVERY_COOLDOWN_MS = 5 * 60 * 1000;

export async function autoRecoverActiveSubscriptions(): Promise<{ recoveredCount: number }> {
  if (!isGooglePlayBillingAvailable()) return { recoveredCount: 0 };

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { recoveredCount: 0 };
  }

  const now = Date.now();
  if (now - lastRecoveryTime < RECOVERY_COOLDOWN_MS) {
    return { recoveredCount: 0 };
  }

  if (activeRecoveryPromise) {
    return activeRecoveryPromise;
  }

  activeRecoveryPromise = (async () => {
    let recoveredCount = 0;
    try {
      const result = await restorePremiumPurchases();
      const recovery = await recoverAndRefreshGooglePlayPurchases(result?.purchases || []);
      recoveredCount = recovery.verified;
      lastRecoveryTime = Date.now();
    } catch (err: any) {
      console.warn("[BILLING AUTO-RECOVERY] Purchase query failed:", err?.message);
    } finally {
      activeRecoveryPromise = null;
    }
    return { recoveredCount };
  })();

  return activeRecoveryPromise;
}

export async function initiateGooglePlaySubscription(): Promise<boolean> {
  const purchaseResult = await purchasePremiumSubscription();
  const recovery = await recoverAndRefreshGooglePlayPurchases(purchaseResult.purchases);
  return recovery.verifiedAny;
}

function assertAndroidBilling() {
  if (!isGooglePlayBillingAvailable()) {
    throw new Error("Google Play Billing hanya tersedia di aplikasi Android.");
  }
}

// ==================================================
// SECURE STORAGE AND SIGNED ENTITLEMENT HELPERS
// ==================================================

export async function getLocalSignedEntitlement(uid: string): Promise<string | null> {
  try {
    const { value } = await SecureStoragePlugin.get({ key: `signed_entitlement_${uid}` });
    return value;
  } catch {
    return null;
  }
}

export async function clearLocalSignedEntitlement(uid: string): Promise<void> {
  try {
    await SecureStoragePlugin.remove({ key: `signed_entitlement_${uid}` });
  } catch {}
}

/**
 * Handles user logout hook to securely wipe entitlement state.
 */
export async function handleUserLogout(uid: string): Promise<void> {
  await clearLocalSignedEntitlement(uid);
  try {
    await Preferences.remove({ key: `last_entitlement_sync_${uid}` });
  } catch {}
}

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function str2ab(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

export async function verifySignedEntitlementLocal(token: string, currentUid: string): Promise<boolean> {
  try {
    if (currentPlatform() === "web") {
      return false; // Fail closed on Web: no offline local verification permitted
    }

    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerBase64, payloadBase64, signatureBase64Url] = parts;

    // Decode header to extract kid
    let headerBase64Dec = headerBase64.replace(/-/g, "+").replace(/_/g, "/");
    while (headerBase64Dec.length % 4) headerBase64Dec += "=";
    const header = JSON.parse(atob(headerBase64Dec));

    if (!header.kid) return false;

    // Public Keyring supporting rotation
    const PUBLIC_KEYRING: Record<string, string | undefined> = {
      v1: process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY,
      v2: process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY_V2,
    };

    const publicKeyPem = PUBLIC_KEYRING[header.kid];
    if (!publicKeyPem) return false;

    // Extract raw base64 from PEM
    const b64Lines = publicKeyPem.split("\n").filter(line => !line.startsWith("-----") && line.trim().length > 0);
    const publicKeyBase64 = b64Lines.join("");
    const binaryDerString = atob(publicKeyBase64);
    const binaryDer = str2ab(binaryDerString);

    let base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    const payload = JSON.parse(atob(base64));

    // Validate claims
    if (payload.sub !== currentUid) {
      await clearLocalSignedEntitlement(currentUid); // Mismatch fail closed
      return false;
    }
    if (payload.iss !== "bhumi-auth-verifier") return false;
    if (payload.aud !== "bhumi-mobile-app") return false;
    if (payload.productId !== GOOGLE_PLAY_PRODUCT_ID) return false;
    if (payload.status !== "ACTIVE" && payload.status !== "ACTIVE_PENDING_SYNC" && payload.status !== "ACTIVE_SYNCED") return false;
    if (payload.tokenVersion !== "1.0") return false;

    const now = Math.floor(Date.now() / 1000);
    const clockSkew = 60;
    if (payload.iat > now + clockSkew) return false;

    if (payload.exp <= now - clockSkew) {
      // Bounded offline grace policy: allow up to 72 hours from iat if offline
      const offlineGraceLimit = payload.iat + 72 * 3600;
      if (now > offlineGraceLimit) {
        await clearLocalSignedEntitlement(currentUid); // past grace limit, wipe
        return false;
      }

      // If we are online, we should NOT use the offline grace fallback; force online refresh
      if (typeof navigator !== "undefined" && navigator.onLine) {
        return false;
      }
    }

    // Verify ECDSA signature
    const cryptoSubtle = typeof window !== "undefined" ? window.crypto?.subtle : globalThis.crypto?.subtle;
    if (!cryptoSubtle) {
      return false;
    }

    const key = await cryptoSubtle.importKey(
      "spki",
      binaryDer,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );

    const signatureBytes = base64UrlToUint8Array(signatureBase64Url);
    const dataBytes = new TextEncoder().encode(`${headerBase64}.${payloadBase64}`);

    const signatureBuffer = new Uint8Array(signatureBytes);

    return await cryptoSubtle.verify(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      key,
      signatureBuffer,
      dataBytes
    );
  } catch {
    return false;
  }
}
