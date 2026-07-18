import { GoogleAuth } from "google-auth-library";
import { BASE_PLAN_ID, PACKAGE_NAME, PRODUCT_ID } from "./security";

type LineItem = { productId?: string; expiryTime?: string; acknowledgementState?: string; autoRenewingPlan?: { basePlanId?: string } };
type Subscription = { subscriptionState?: string; lineItems?: LineItem[] };

async function accessToken() {
  const privateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY?.replace(/\\n/g, "\n");
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

export function validateProduct(item?: LineItem) {
  return item?.productId === PRODUCT_ID && (!item.autoRenewingPlan?.basePlanId || item.autoRenewingPlan.basePlanId === BASE_PLAN_ID);
}
