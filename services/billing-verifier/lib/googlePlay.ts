import { GoogleAuth } from "google-auth-library";
import { BASE_PLAN_ID, PACKAGE_NAME, PRODUCT_ID } from "./security";

type LineItem = { productId?: string; expiryTime?: string; autoRenewingPlan?: { basePlanId?: string } };
type Subscription = { subscriptionState?: string; acknowledgementState?: string; lineItems?: LineItem[] };
type VoidedPurchase = { purchaseToken?: string };
type VoidedPurchasesResponse = { voidedPurchases?: VoidedPurchase[] };

const VOIDED_PURCHASE_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

async function accessToken() {
  const rawKey = process.env.GOOGLE_PLAY_PRIVATE_KEY || "";
  const privateKey = rawKey.trim().startsWith("-----BEGIN")
    ? rawKey.replace(/\\n/g, "\n")
    : Buffer.from(rawKey.trim(), "base64").toString("utf-8");
  if (!process.env.GOOGLE_PLAY_CLIENT_EMAIL || !privateKey) throw new Error("GOOGLE_PLAY_CREDENTIALS_MISSING");
  const auth = new GoogleAuth({ credentials: { client_email: process.env.GOOGLE_PLAY_CLIENT_EMAIL, private_key: privateKey }, scopes: ["https://www.googleapis.com/auth/androidpublisher"] });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("GOOGLE_PLAY_ACCESS_TOKEN_MISSING");
  return token.token;
}

export async function fetchSubscription(purchaseToken: string): Promise<Subscription> {
  const response = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, { headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!response.ok) throw new Error(response.status === 404 ? "TOKEN_INVALID" : "GOOGLE_API_FAILURE");
  return response.json() as Promise<Subscription>;
}

export async function acknowledgeSubscription(purchaseToken: string) {
  const response = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/subscriptions/${encodeURIComponent(PRODUCT_ID)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, { method: "POST", headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" }, body: JSON.stringify({ developerPayload: "bhumi_vercel_verified" }) });
  if (!response.ok && response.status !== 409) throw new Error("ACKNOWLEDGMENT_FAILURE");
}

export async function checkVoidedPurchase(purchaseToken: string) {
  try {
    const endpoint = new URL(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/purchases/voidedpurchases`);
    endpoint.searchParams.set("startTime", String(Date.now() - VOIDED_PURCHASE_LOOKBACK_MS));
    endpoint.searchParams.set("maxResults", "1000");
    const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${await accessToken()}` } });
    if (!response.ok) return { checked: false, voided: false, reason: "voided_purchase_check_unavailable" as const };
    const body = await response.json() as VoidedPurchasesResponse;
    const voided = Array.isArray(body.voidedPurchases) && body.voidedPurchases.some((item) => item?.purchaseToken === purchaseToken);
    return { checked: true, voided, reason: voided ? "token_found_in_voided_purchases" as const : "token_not_found_in_voided_purchases" as const };
  } catch {
    return { checked: false, voided: false, reason: "voided_purchase_check_unavailable" as const };
  }
}

export function validateProduct(item?: LineItem) {
  return item?.productId === PRODUCT_ID && (!item.autoRenewingPlan?.basePlanId || item.autoRenewingPlan.basePlanId === BASE_PLAN_ID);
}
