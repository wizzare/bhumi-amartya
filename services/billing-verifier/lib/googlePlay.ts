import { GoogleAuth } from "google-auth-library";
import { BASE_PLAN_ID, PACKAGE_NAME, PRODUCT_ID } from "./security";
import {
  ACKNOWLEDGE_TIMEOUT_MS,
  FETCH_ATTEMPT_TIMEOUT_MS,
  FETCH_RETRY_DELAY_MS,
  FETCH_SUBSCRIPTION_MAX_MS,
  GOOGLE_AUTH_TIMEOUT_MS,
  VOIDED_CHECK_TIMEOUT_MS,
  logStage,
  sleep,
  StageTimeoutError,
  type StageLogContext,
  withTimeout,
} from "./timeout";

type LineItem = { productId?: string; expiryTime?: string; autoRenewingPlan?: { basePlanId?: string }; offerDetails?: { basePlanId?: string; offerId?: string | null } };
type Subscription = { subscriptionState?: string; acknowledgementState?: string; lineItems?: LineItem[] };
type VoidedPurchase = { purchaseToken?: string };
type VoidedPurchasesResponse = { voidedPurchases?: VoidedPurchase[] };
export type GooglePlayRequestContext = StageLogContext & { accessTokenPromise?: Promise<string> };
type FetchStage = "FETCH_SUBSCRIPTION" | "VOIDED_CHECK" | "ACKNOWLEDGE";

const VOIDED_PURCHASE_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;
const RETRYABLE_PROVIDER_STATUSES = new Set([429, 500, 502, 503, 504]);

export function createGooglePlayRequestContext(context: StageLogContext): GooglePlayRequestContext { return { ...context }; }

async function accessToken(context: GooglePlayRequestContext) {
  if (!context.accessTokenPromise) {
    const stageStartedAt = Date.now();
    context.accessTokenPromise = withTimeout("GOOGLE_AUTH", GOOGLE_AUTH_TIMEOUT_MS, (async () => {
      const rawKey = process.env.GOOGLE_PLAY_PRIVATE_KEY || "";
      const privateKey = rawKey.trim().startsWith("-----BEGIN") ? rawKey.replace(/\\n/g, "\n") : Buffer.from(rawKey.trim(), "base64").toString("utf-8");
      if (!process.env.GOOGLE_PLAY_CLIENT_EMAIL || !privateKey) throw new Error("GOOGLE_PLAY_CREDENTIALS_MISSING");
      const auth = new GoogleAuth({ credentials: { client_email: process.env.GOOGLE_PLAY_CLIENT_EMAIL, private_key: privateKey }, scopes: ["https://www.googleapis.com/auth/androidpublisher"] });
      const client = await auth.getClient();
      const token = await client.getAccessToken();
      if (!token.token) throw new Error("GOOGLE_PLAY_ACCESS_TOKEN_MISSING");
      return token.token;
    })());
    context.accessTokenPromise.then(
      () => logStage(context, "GOOGLE_AUTH", stageStartedAt),
      (error) => logStage(context, "GOOGLE_AUTH", stageStartedAt, 0, error),
    );
  }
  return context.accessTokenPromise;
}

export async function googleFetchWithRetry(
  context: StageLogContext,
  stage: FetchStage,
  url: string | URL,
  init: RequestInit = {},
  options: { maxRetries?: number; timeoutMs?: number; fetchImpl?: typeof fetch } = {},
) {
  const maxRetries = options.maxRetries ?? (stage === "FETCH_SUBSCRIPTION" ? 1 : 0);
  const timeoutMs = options.timeoutMs ?? (stage === "FETCH_SUBSCRIPTION" ? FETCH_ATTEMPT_TIMEOUT_MS : stage === "VOIDED_CHECK" ? VOIDED_CHECK_TIMEOUT_MS : ACKNOWLEDGE_TIMEOUT_MS);
  const fetchImpl = options.fetchImpl ?? fetch;
  const stageStartedAt = Date.now();
  let retries = 0;
  let lastError: unknown;
  try {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      try {
        const response = await withTimeout(stage, timeoutMs, fetchImpl(url, { ...init, signal: controller.signal }));
        if (RETRYABLE_PROVIDER_STATUSES.has(response.status) && attempt < maxRetries) {
          retries++;
          await sleep(FETCH_RETRY_DELAY_MS);
          continue;
        }
        logStage(context, stage, stageStartedAt, retries);
        return response;
      } catch (error) {
        controller.abort();
        lastError = error;
        if (attempt < maxRetries && (error instanceof StageTimeoutError || error instanceof TypeError)) {
          retries++;
          await sleep(FETCH_RETRY_DELAY_MS);
          continue;
        }
        throw error instanceof StageTimeoutError ? error : new Error("GOOGLE_API_FAILURE");
      }
    }
    throw lastError || new Error("GOOGLE_API_FAILURE");
  } catch (error) {
    logStage(context, stage, stageStartedAt, retries, error);
    throw error;
  }
}

export async function fetchSubscription(purchaseToken: string, context: GooglePlayRequestContext): Promise<Subscription> {
  return withTimeout("FETCH_SUBSCRIPTION", FETCH_SUBSCRIPTION_MAX_MS, (async () => {
    const response = await googleFetchWithRetry(context, "FETCH_SUBSCRIPTION", `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, { headers: { Authorization: `Bearer ${await accessToken(context)}` } });
    if (!response.ok) throw new Error(response.status === 404 ? "TOKEN_INVALID" : "GOOGLE_API_FAILURE");
    return response.json() as Promise<Subscription>;
  })());
}

export async function acknowledgeSubscription(purchaseToken: string, context: GooglePlayRequestContext) {
  const response = await googleFetchWithRetry(context, "ACKNOWLEDGE", `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${encodeURIComponent(PRODUCT_ID)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, { method: "POST", headers: { Authorization: `Bearer ${await accessToken(context)}`, "Content-Type": "application/json" }, body: JSON.stringify({ developerPayload: "bhumi_vercel_verified" }) });
  if (!response.ok && response.status !== 409) throw new Error("ACKNOWLEDGMENT_FAILURE");
}

export async function checkVoidedPurchase(purchaseToken: string, context: GooglePlayRequestContext) {
  try {
    return await withTimeout("VOIDED_CHECK", VOIDED_CHECK_TIMEOUT_MS, (async () => {
      const endpoint = new URL(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/voidedpurchases`);
      endpoint.searchParams.set("startTime", String(Date.now() - VOIDED_PURCHASE_LOOKBACK_MS));
      endpoint.searchParams.set("maxResults", "1000");
      const response = await googleFetchWithRetry(context, "VOIDED_CHECK", endpoint, { headers: { Authorization: `Bearer ${await accessToken(context)}` } });
      if (!response.ok) return { checked: false, voided: false, reason: "voided_purchase_check_unavailable" as const };
      const body = await response.json() as VoidedPurchasesResponse;
      const voided = Array.isArray(body.voidedPurchases) && body.voidedPurchases.some((item) => item?.purchaseToken === purchaseToken);
      return { checked: true, voided, reason: voided ? "token_found_in_voided_purchases" as const : "token_not_found_in_voided_purchases" as const };
    })());
  } catch {
    return { checked: false, voided: false, reason: "voided_purchase_check_unavailable" as const };
  }
}

export function validateProduct(item?: LineItem) {
  if (!item || item.productId !== PRODUCT_ID) return false;
  const basePlanId = item.offerDetails?.basePlanId || item.autoRenewingPlan?.basePlanId;
  return !basePlanId || basePlanId === BASE_PLAN_ID;
}
