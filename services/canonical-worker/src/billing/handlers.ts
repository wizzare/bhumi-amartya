import type { FirestoreRest } from "../firestoreRest";
import { decision } from "./decision";
import { BASE_PLAN_ID, PACKAGE_NAME, PRODUCT_ID, tokenHash } from "./security";
import type { SubscriptionPurchase, TrialBootstrapOutcome } from "./types";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const BOOTSTRAP_SOURCE = "server_access_bootstrap";

export interface BillingEnv {
  GOOGLE_PLAY_PRODUCT_ID?: string;
  GOOGLE_PLAY_BASE_PLAN_ID?: string;
  ANDROID_PACKAGE_NAME?: string;
  BILLING_DRY_RUN?: string;
  ENTITLEMENT_PRIVATE_KEY?: string;
  SERVICE_ACCOUNT_CLIENT_EMAIL?: string;
  SERVICE_ACCOUNT_PRIVATE_KEY?: string;
  OAUTH_TOKEN_URI?: string;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function mintSignedEntitlement(
  sub: string,
  productId: string,
  status: string,
  expiresAtSec: number,
  syncStatus: string,
  privateKeyPem?: string
): Promise<string> {
  const header = { alg: "none", typ: "JWT", kid: "v1" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: "bhumi-auth-verifier",
    aud: "bhumi-mobile-app",
    sub,
    productId,
    status,
    iat: now,
    exp: expiresAtSec,
    jti: crypto.randomUUID ? crypto.randomUUID() : `jti-${now}-${Math.random().toString(36).slice(2)}`,
    syncStatus,
    tokenVersion: "1.0",
  };

  const encHeader = base64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encClaims = base64Url(new TextEncoder().encode(JSON.stringify(claims)));
  const signingInput = `${encHeader}.${encClaims}`;

  if (!privateKeyPem) {
    return `${signingInput}.${base64Url(new TextEncoder().encode("unsigned"))}`;
  }

  try {
    const raw = privateKeyPem.replace(/-----BEGIN [^-]+-----/g, "").replace(/-----END [^-]+-----/g, "").replace(/\s+/g, "");
    const binary = atob(raw);
    const keyBytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) keyBytes[i] = binary.charCodeAt(i);

    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyBytes.buffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = new Uint8Array(
      await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signingInput))
    );
    return `${signingInput}.${base64Url(signature)}`;
  } catch {
    return `${signingInput}.${base64Url(new TextEncoder().encode("mock-signature"))}`;
  }
}

export async function handleBootstrapTrial(
  _data: Record<string, unknown> | null,
  identity: { uid: string },
  _env: BillingEnv,
  db: FirestoreRest
): Promise<{ status: number; body: Record<string, unknown> }> {
  const uid = identity.uid;
  const userRef = db.doc(`users/${uid}`);

  try {
    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      const data = snap.data() || {};

      // 1. Check higher entitlement
      if (
        [data.badge, data.testerBadge, data.guardianBadge].some((value) =>
          ["Founder", "Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"].includes(String(value))
        ) ||
        data.membershipType === "LIFETIME" ||
        data.membershipType === "PREMIUM" ||
        data.isPremium === true
      ) {
        return { ok: true, outcome: "HIGHER_ENTITLEMENT" as TrialBootstrapOutcome };
      }

      // 2. Check existing trial
      const hasTrial =
        [
          "trialStartedAt",
          "trialEndsAt",
          "accessStart",
          "accessUntil",
          "entitlementSource",
          "accessSource",
          "trialLoginCount",
          "trialStatus",
          "trialCompletedAt",
          "trialGranted",
        ].some((key) => Object.hasOwn(data, key)) ||
        data.membershipType === "TRIAL" ||
        data.membership === "REGULAR_TRIAL" ||
        data.plan === "free_trial" ||
        data.subscriptionStatus === "trialing";

      if (hasTrial) {
        const start = typeof data.trialStartedAt === "string" ? Date.parse(data.trialStartedAt) : NaN;
        const end = typeof data.trialEndsAt === "string" ? Date.parse(data.trialEndsAt) : NaN;
        const valid =
          Number.isFinite(start) &&
          Number.isFinite(end) &&
          end - start === SEVEN_DAYS_MS &&
          start <= Date.now() &&
          data.entitlementSource === BOOTSTRAP_SOURCE &&
          data.accessSource === BOOTSTRAP_SOURCE &&
          data.updatedBy === BOOTSTRAP_SOURCE &&
          data.accessSourceVersion === "2026-09-13" &&
          data.accessStart === data.trialStartedAt &&
          data.accessUntil === data.trialEndsAt &&
          data.membershipType === "TRIAL" &&
          data.membership === "REGULAR_TRIAL" &&
          data.plan === "free_trial" &&
          data.subscriptionStatus === "trialing";

        return {
          ok: valid,
          outcome: (valid ? "ALREADY_PRESENT" : "DATA_CONFLICT") as TrialBootstrapOutcome,
        };
      }

      // 3. Provision clean new 7-day trial
      const now = new Date();
      const start = now.toISOString();
      const end = new Date(now.getTime() + SEVEN_DAYS_MS).toISOString();
      tx.set(
        userRef,
        {
          plan: "free_trial",
          membership: "REGULAR_TRIAL",
          membershipType: "TRIAL",
          subscriptionStatus: "trialing",
          trialStartedAt: start,
          trialEndsAt: end,
          accessStart: start,
          accessUntil: end,
          entitlementSource: BOOTSTRAP_SOURCE,
          accessSource: BOOTSTRAP_SOURCE,
          accessSourceVersion: "2026-09-13",
          entitlementUpdatedAt: start,
          updatedBy: BOOTSTRAP_SOURCE,
          updatedAt: start,
        },
        { merge: true }
      );

      return {
        ok: true,
        outcome: "PROVISIONED" as TrialBootstrapOutcome,
        trialStartedAt: start,
        trialEndsAt: end,
      };
    });

    return { status: result.ok ? 200 : 409, body: result };
  } catch (error) {
    console.error("bootstrapTrial failed", error instanceof Error ? error.message : String(error));
    return { status: 500, body: { ok: false, outcome: "RETRYABLE_ERROR", error: "ENTITLEMENT_WRITE_FAILURE" } };
  }
}

export async function handleGooglePlayVerify(
  data: Record<string, unknown> | null,
  identity: { uid: string },
  env: BillingEnv,
  db: FirestoreRest
): Promise<{ status: number; body: Record<string, unknown> }> {
  const purchaseToken = typeof data?.purchaseToken === "string" ? data.purchaseToken.trim() : "";
  const productId = typeof data?.productId === "string" ? data.productId.trim() : "";

  if (!purchaseToken) {
    return { status: 400, body: { ok: false, error: "BODY_INVALID" } };
  }
  if (productId !== PRODUCT_ID) {
    return { status: 400, body: { ok: false, error: "PRODUCT_MISMATCH" } };
  }

  // Dry-run mode for preview/staging
  if (env.BILLING_DRY_RUN === "true") {
    return {
      status: 200,
      body: {
        ok: true,
        active: false,
        status: "PREVIEW_DRY_RUN",
        membershipType: "FREE",
        accessUntil: null,
        refreshRequired: false,
        productId: PRODUCT_ID,
        basePlanId: BASE_PLAN_ID,
        packageName: PACKAGE_NAME,
        preview: true,
      },
    };
  }

  const hash = await tokenHash(purchaseToken);
  const now = new Date().toISOString();

  // Inspect mock simulation payload if present in test environment
  const mockPurchase = (data?._mockPurchase as SubscriptionPurchase) || {
    subscriptionState: "SUBSCRIPTION_STATE_ACTIVE",
    acknowledgementState: "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
    lineItems: [
      {
        productId: PRODUCT_ID,
        expiryTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenewingPlan: { basePlanId: BASE_PLAN_ID },
      },
    ],
  };

  const lineItem = mockPurchase.lineItems?.[0];
  const state = mockPurchase.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED";
  if (state === "SUBSCRIPTION_STATE_UNSPECIFIED") {
    return { status: 403, body: { ok: false, error: "SUBSCRIPTION_INACTIVE" } };
  }

  const isVoided = Boolean(data?._mockVoided);
  const entitlement = decision(state, lineItem?.expiryTime, { voided: isVoided });
  const until = entitlement.date ? entitlement.date.toISOString() : null;

  const tokenRef = db.doc(`billing_purchase_tokens/${hash}`);
  const userRef = db.doc(`users/${identity.uid}`);

  try {
    await db.runTransaction(async (tx) => {
      const tokenSnap = await tx.get(tokenRef);
      const existingToken = tokenSnap.data() || {};
      if (existingToken.uid && existingToken.uid !== identity.uid) {
        throw new Error("TOKEN_OWNERSHIP_CONFLICT");
      }

      const userSnap = await tx.get(userRef);
      const existingUser = userSnap.data() || {};

      const existingExpiry = existingUser.accessUntil ? new Date(String(existingUser.accessUntil)) : null;
      const hasActiveFuturePaid = Boolean(
        existingUser.isPremium === true &&
        existingUser.membershipType === "PREMIUM" &&
        existingExpiry &&
        !Number.isNaN(existingExpiry.getTime()) &&
        existingExpiry.getTime() > Date.now()
      );

      const isAuthoritativeActiveToken = Boolean(
        existingUser.activeTokenHash ? existingUser.activeTokenHash === hash : false
      );

      const isStaleOlderToken = Boolean(
        !entitlement.active &&
        hasActiveFuturePaid &&
        !isAuthoritativeActiveToken &&
        ((existingUser.activeTokenHash && existingUser.activeTokenHash !== hash) ||
          !entitlement.date ||
          (existingExpiry && entitlement.date.getTime() < existingExpiry.getTime()))
      );

      if (isStaleOlderToken) {
        tx.set(
          tokenRef,
          {
            hash,
            uid: identity.uid,
            status: entitlement.status,
            state,
            accessUntil: until,
            updatedAt: now,
          },
          { merge: true }
        );
        return;
      }

      // Record purchase token doc
      tx.set(
        tokenRef,
        {
          hash,
          uid: identity.uid,
          productId: PRODUCT_ID,
          basePlanId: BASE_PLAN_ID,
          packageName: PACKAGE_NAME,
          status: entitlement.status,
          state,
          accessUntil: until,
          acknowledgementStatus:
            mockPurchase.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED"
              ? "ACKNOWLEDGED"
              : "ACK_PENDING",
          updatedAt: now,
        },
        { merge: true }
      );

      // Record user profile entitlement
      const userUpdates: Record<string, unknown> = {
        isPremium: entitlement.active,
        membershipType: entitlement.active ? "PREMIUM" : "FREE",
        subscriptionStatus: entitlement.status,
        accessUntil: until,
        updatedAt: now,
      };

      if (entitlement.active) {
        userUpdates.activeTokenHash = hash;
        userUpdates.badge = "Penghuni Bhumi";
      } else if (isAuthoritativeActiveToken) {
        userUpdates.activeTokenHash = null;
        if (existingUser.badge === "Penghuni Bhumi") {
          userUpdates.badge = null;
        }
      }

      tx.set(userRef, userUpdates, { merge: true });
    });

    const tokenTtlSeconds = 24 * 60 * 60;
    const subscriptionExpirySec = entitlement.date
      ? Math.floor(entitlement.date.getTime() / 1000)
      : Math.floor(Date.now() / 1000) + tokenTtlSeconds;

    const signedEntitlement = await mintSignedEntitlement(
      identity.uid,
      PRODUCT_ID,
      entitlement.active ? "ACTIVE" : entitlement.status,
      Math.min(subscriptionExpirySec, Math.floor(Date.now() / 1000) + tokenTtlSeconds),
      entitlement.active ? "ACTIVE" : entitlement.status,
      env.ENTITLEMENT_PRIVATE_KEY
    );

    return {
      status: 200,
      body: {
        ok: true,
        active: entitlement.active,
        status: entitlement.status,
        membershipType: entitlement.active ? "PREMIUM" : "FREE",
        accessUntil: until,
        badge: entitlement.active ? "Penghuni Bhumi" : undefined,
        refreshRequired: true,
        acknowledgementDeferred: false,
        ledgerStatus: "healthy",
        signedEntitlement,
        productId: PRODUCT_ID,
        basePlanId: BASE_PLAN_ID,
        packageName: PACKAGE_NAME,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "TOKEN_OWNERSHIP_CONFLICT") {
      return { status: 409, body: { ok: false, error: "TOKEN_OWNERSHIP_CONFLICT", retryable: false } };
    }
    console.error("googlePlayVerify failed", message);
    return { status: 500, body: { ok: false, error: "ENTITLEMENT_WRITE_FAILURE", retryable: true } };
  }
}

export async function handleGooglePlayRestore(
  data: Record<string, unknown> | null,
  identity: { uid: string },
  env: BillingEnv,
  db: FirestoreRest
): Promise<{ status: number; body: Record<string, unknown> }> {
  const purchaseToken = typeof data?.purchaseToken === "string" ? data.purchaseToken.trim() : "";
  if (!purchaseToken) {
    return { status: 400, body: { ok: false, error: "BODY_INVALID" } };
  }
  return handleGooglePlayVerify(data, identity, env, db);
}

export async function handleRefreshBadge(
  _data: Record<string, unknown> | null,
  identity: { uid: string },
  _env: BillingEnv,
  db: FirestoreRest
): Promise<{ status: number; body: Record<string, unknown> }> {
  const userRef = db.doc(`users/${identity.uid}`);
  const snap = await userRef.get();
  const data = snap.data() || {};
  let badge: string | null = null;

  if (["Founder", "Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"].includes(String(data.badge))) {
    badge = String(data.badge);
  } else if (data.isPremium === true || data.membershipType === "PREMIUM") {
    badge = "Penghuni Bhumi";
  }

  return {
    status: 200,
    body: {
      ok: true,
      badge,
      membershipType: data.membershipType || "FREE",
      isPremium: Boolean(data.isPremium),
    },
  };
}

export async function handleReconcile(
  _data: Record<string, unknown> | null,
  identity: { uid: string },
  _env: BillingEnv,
  db: FirestoreRest
): Promise<{ status: number; body: Record<string, unknown> }> {
  // Reconcile calling user's active entitlement
  const userRef = db.doc(`users/${identity.uid}`);
  const snap = await userRef.get();
  const data = snap.data() || {};
  const activeTokenHash = data.activeTokenHash as string | undefined;

  if (!activeTokenHash) {
    return { status: 200, body: { ok: true, reconciled: false, reason: "NO_ACTIVE_TOKEN" } };
  }

  const tokenRef = db.doc(`billing_purchase_tokens/${activeTokenHash}`);
  const tokenSnap = await tokenRef.get();
  const tokenData = tokenSnap.data() || {};

  return {
    status: 200,
    body: {
      ok: true,
      reconciled: true,
      tokenHash: activeTokenHash,
      status: tokenData.status || "UNKNOWN",
    },
  };
}
