"use strict";

const admin = require("firebase-admin");
const crypto = require("crypto");
const functions = require("firebase-functions/v1");
const { google } = require("googleapis");

if (!admin.apps.length) {
  admin.initializeApp();
}

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const GOOGLE_PLAY_PACKAGE_NAME = "com.bhumiamartya.app";
// Must remain aligned with the product shipped by the Android client.
const GOOGLE_PLAY_PREMIUM_PRODUCT_ID = "bhumi_premium_monthly";
const GOOGLE_PLAY_PREMIUM_BASE_PLAN_ID = "monthly";
const GOOGLE_PLAY_ACTIVE_STATES = new Set([
  "SUBSCRIPTION_STATE_ACTIVE",
  "SUBSCRIPTION_STATE_IN_GRACE_PERIOD",
]);
const GOOGLE_PLAY_CANCELED_STATE = "SUBSCRIPTION_STATE_CANCELED";
const GOOGLE_PLAY_INACTIVE_STATES = new Set([
  "SUBSCRIPTION_STATE_ON_HOLD",
  "SUBSCRIPTION_STATE_PAUSED",
  "SUBSCRIPTION_STATE_EXPIRED",
]);
const VOIDED_PURCHASE_LOOKBACK_MS = 30 * 24 * 60 * 60 * 1000;

function toValidDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function buildNewUserGrant(user) {
  const createdAt = toValidDate(user.metadata && user.metadata.creationTime);
  const accessStart = createdAt;
  const accessUntil = new Date(accessStart.getTime() + THREE_DAYS_MS);

  return {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    badge: "Penjaga Bhumi",
    testerBadge: "Penjaga Bhumi",
    plan: "free_trial",
    membership: "REGULAR_TRIAL",
    membershipType: "TRIAL",
    accessStart: accessStart.toISOString(),
    accessUntil: accessUntil.toISOString(),
    trialStartedAt: accessStart.toISOString(),
    trialEndsAt: accessUntil.toISOString(),
    subscriptionStatus: "trialing",
    isPremium: true,
    entitlements: {
      dashboard: true,
      premiumFeatures: true,
    },
    accessSource: "firebase_auth_on_create",
    accessSourceVersion: "2026-07-01",
    updatedBy: "firebase_function_auth_on_create",
    updatedAt: new Date().toISOString(),
  };
}

exports.assignJuly1AccessOnCreate = functions
  .region("asia-southeast2")
  .auth.user()
  .onCreate(async (user) => {
    const payload = buildNewUserGrant(user);

    await admin.firestore().doc(`users/${user.uid}`).set(payload, { merge: true });

    functions.logger.info("[JULY1_NEW_USER_ACCESS_ASSIGNED]", {
      uid: user.uid,
      email: user.email || null,
      badge: payload.badge,
      plan: payload.plan,
      accessStart: payload.accessStart,
      accessUntil: payload.accessUntil,
    });
  });

async function getAndroidPublisherClient() {
  const auth = await google.auth.getClient({
    scopes: ["https://www.googleapis.com/auth/androidpublisher"],
  });
  return google.androidpublisher({ version: "v3", auth });
}

function hashPurchaseToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function normalizePurchaseToken(value) {
  return typeof value === "string" ? value.trim() : "";
}

function firstLineItem(subscription) {
  return Array.isArray(subscription.lineItems) && subscription.lineItems.length
    ? subscription.lineItems[0]
    : null;
}

function normalizeSubscriptionState(state) {
  return typeof state === "string" && state ? state : "SUBSCRIPTION_STATE_UNSPECIFIED";
}

function readBasePlanId(lineItem) {
  return lineItem &&
    lineItem.autoRenewingPlan &&
    typeof lineItem.autoRenewingPlan.basePlanId === "string"
    ? lineItem.autoRenewingPlan.basePlanId
    : GOOGLE_PLAY_PREMIUM_BASE_PLAN_ID;
}

function toIsoOrNull(date) {
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
}

function buildEntitlementDecision(subscriptionState, expiryTime, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const expiry = expiryTime ? new Date(expiryTime) : null;
  const expiryValid = Boolean(expiry && !Number.isNaN(expiry.getTime()));
  const expiryInFuture = Boolean(expiryValid && expiry.getTime() > now.getTime());
  const voided = Boolean(options.voided);

  if (voided) {
    return {
      active: false,
      entitlementStatus: "voided",
      accessUntil: expiryValid ? expiry : null,
      reason: "purchase_voided_or_refunded",
    };
  }

  if (!expiryValid) {
    return {
      active: false,
      entitlementStatus: "not_active",
      accessUntil: null,
      reason: "missing_or_invalid_expiry",
    };
  }

  if (GOOGLE_PLAY_ACTIVE_STATES.has(subscriptionState) && expiryInFuture) {
    return {
      active: true,
      entitlementStatus: subscriptionState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD" ? "grace_period" : "active",
      accessUntil: expiry,
      reason: "verified_active_until_expiry",
    };
  }

  if (subscriptionState === GOOGLE_PLAY_CANCELED_STATE && expiryInFuture) {
    return {
      active: true,
      entitlementStatus: "canceled_paid_through",
      accessUntil: expiry,
      reason: "canceled_but_paid_through_until_expiry",
    };
  }

  if (GOOGLE_PLAY_INACTIVE_STATES.has(subscriptionState)) {
    return {
      active: false,
      entitlementStatus: subscriptionState.toLowerCase().replace("subscription_state_", ""),
      accessUntil: expiry,
      reason: "subscription_state_inactive",
    };
  }

  if (!expiryInFuture) {
    return {
      active: false,
      entitlementStatus: "expired",
      accessUntil: expiry,
      reason: "verified_expiry_in_past",
    };
  }

  return {
    active: false,
    entitlementStatus: "not_active",
    accessUntil: expiry,
    reason: "unhandled_subscription_state",
  };
}

function validateTokenOwnership(existingTokenData, uid) {
  if (!existingTokenData || !existingTokenData.uid) {
    return { ok: true, idempotent: false };
  }

  if (existingTokenData.uid === uid) {
    return { ok: true, idempotent: true };
  }

  return {
    ok: false,
    idempotent: false,
    ownerUid: existingTokenData.uid,
    reason: "purchase_token_already_linked_to_another_uid",
  };
}

async function checkVoidedPurchase(androidpublisher, packageName, purchaseToken) {
  const startTime = String(Date.now() - VOIDED_PURCHASE_LOOKBACK_MS);

  try {
    const response = await androidpublisher.purchases.voidedpurchases.list({
      packageName,
      startTime,
      maxResults: 1000,
    });
    const voidedPurchases = response.data && Array.isArray(response.data.voidedPurchases)
      ? response.data.voidedPurchases
      : [];
    const found = voidedPurchases.some((item) => item && item.purchaseToken === purchaseToken);

    return {
      checked: true,
      voided: found,
      reason: found ? "token_found_in_voided_purchases" : "token_not_found_in_voided_purchases",
    };
  } catch (error) {
    return {
      checked: false,
      voided: false,
      reason: "voided_purchase_check_unavailable",
      message: error && error.message,
    };
  }
}

async function acknowledgeSubscriptionIfPending(androidpublisher, packageName, productId, purchaseToken, subscription) {
  if (subscription.acknowledgementState !== "ACKNOWLEDGEMENT_STATE_PENDING") {
    return false;
  }

  await androidpublisher.purchases.subscriptions.acknowledge({
    packageName,
    subscriptionId: productId,
    token: purchaseToken,
    requestBody: {
      developerPayload: "moana_v65_server_verified",
    },
  });

  return true;
}

exports.verifyGooglePlayPurchase = functions
  .region("asia-southeast2")
  .https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError("unauthenticated", "Login diperlukan untuk verifikasi pembelian.");
    }

    const uid = context.auth.uid;
    const packageName = typeof data.packageName === "string" && data.packageName
      ? data.packageName
      : GOOGLE_PLAY_PACKAGE_NAME;
    const purchaseToken = normalizePurchaseToken(data.purchaseToken);
    const purchaseTokenHash = purchaseToken ? hashPurchaseToken(purchaseToken) : null;

    if (packageName !== GOOGLE_PLAY_PACKAGE_NAME) {
      throw new functions.https.HttpsError("invalid-argument", "Package name tidak sesuai.");
    }

    if (!purchaseToken) {
      throw new functions.https.HttpsError("invalid-argument", "Purchase token wajib dikirim.");
    }

    const androidpublisher = await getAndroidPublisherClient();
    let subscription;

    try {
      const response = await androidpublisher.purchases.subscriptionsv2.get({
        packageName,
        token: purchaseToken,
      });
      subscription = response.data || {};
    } catch (error) {
      functions.logger.error("[GOOGLE_PLAY_SUBSCRIPTION_VERIFY_FAILED]", {
        uid,
        productId: GOOGLE_PLAY_PREMIUM_PRODUCT_ID,
        basePlanId: GOOGLE_PLAY_PREMIUM_BASE_PLAN_ID,
        purchaseTokenHash,
        message: error && error.message,
      });
      throw new functions.https.HttpsError("failed-precondition", "Verifikasi Google Play gagal.");
    }

    const lineItem = firstLineItem(subscription);
    const verifiedProductId = lineItem && lineItem.productId;
    const verifiedBasePlanId = readBasePlanId(lineItem);
    const subscriptionState = normalizeSubscriptionState(subscription.subscriptionState);
    const accessUntil = lineItem && lineItem.expiryTime ? new Date(lineItem.expiryTime) : null;

    if (verifiedProductId !== GOOGLE_PLAY_PREMIUM_PRODUCT_ID) {
      throw new functions.https.HttpsError("permission-denied", "Purchase token bukan untuk produk Premium Bhumi.");
    }

    if (verifiedBasePlanId !== GOOGLE_PLAY_PREMIUM_BASE_PLAN_ID) {
      throw new functions.https.HttpsError("permission-denied", "Purchase token bukan untuk base plan monthly.");
    }

    const voidedCheck = await checkVoidedPurchase(androidpublisher, packageName, purchaseToken);
    const decision = buildEntitlementDecision(subscriptionState, lineItem && lineItem.expiryTime, {
      voided: voidedCheck.voided,
    });

    let acknowledgedByServer = false;
    if (decision.active) {
      try {
        acknowledgedByServer = await acknowledgeSubscriptionIfPending(
          androidpublisher,
          packageName,
          verifiedProductId,
          purchaseToken,
          subscription,
        );
      } catch (error) {
        functions.logger.warn("[GOOGLE_PLAY_ACKNOWLEDGE_DEFERRED]", {
          uid,
          productId: verifiedProductId,
          purchaseTokenHash,
          message: error && error.message,
        });
      }
    }

    const nowIso = new Date().toISOString();
    const accessUntilIso = toIsoOrNull(decision.accessUntil);

    await admin.firestore().runTransaction(async (transaction) => {
      const userRef = admin.firestore().doc(`users/${uid}`);
      const tokenRef = admin.firestore().doc(`billing_purchase_tokens/${purchaseTokenHash}`);
      const tokenSnap = await transaction.get(tokenRef);
      const tokenOwnership = validateTokenOwnership(tokenSnap.exists ? tokenSnap.data() : null, uid);

      if (!tokenOwnership.ok) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Purchase token sudah terhubung dengan akun lain.",
          { reason: tokenOwnership.reason },
        );
      }

      const snap = await transaction.get(userRef);
      const existing = snap.exists ? snap.data() || {} : {};
      const nextBadge = existing.badge === "Founder"
        ? existing.badge
        : decision.active
          ? "Penghuni Bhumi"
          : existing.badge || "Penjaga Bhumi";
      const nextTesterBadge = existing.testerBadge === "Founder"
        ? existing.testerBadge
        : decision.active
          ? "Penghuni Bhumi"
          : existing.testerBadge || "Penjaga Bhumi";
      const existingEntitlements = existing.entitlements || {};
      const nextEntitlements = decision.active
        ? {
            ...existingEntitlements,
            dashboard: true,
            premiumFeatures: true,
            premium: true,
            googlePlayPremium: true,
          }
        : {
            ...existingEntitlements,
            premiumFeatures: false,
            premium: false,
            googlePlayPremium: false,
          };

      transaction.set(tokenRef, {
        uid,
        provider: "google_play",
        packageName,
        productId: verifiedProductId,
        basePlanId: verifiedBasePlanId,
        tokenHash: purchaseTokenHash,
        subscriptionState,
        entitlementStatus: decision.entitlementStatus,
        accessUntil: accessUntilIso,
        latestOrderId: subscription.latestOrderId || null,
        firstLinkedAt: tokenOwnership.idempotent
          ? (tokenSnap.data() && tokenSnap.data().firstLinkedAt) || nowIso
          : nowIso,
        lastVerifiedAt: nowIso,
        updatedAt: nowIso,
      }, { merge: true });

      transaction.set(userRef, {
        plan: decision.active ? "premium" : "free",
        planLabel: decision.active ? "Premium Monthly" : "Free",
        membership: decision.active ? "GOOGLE_PLAY_PREMIUM" : "GOOGLE_PLAY_INACTIVE",
        membershipType: decision.active ? "PREMIUM" : "FREE",
        membershipStartDate: existing.membershipStartDate || admin.firestore.FieldValue.serverTimestamp(),
        membershipExpiryDate: decision.accessUntil ? admin.firestore.Timestamp.fromDate(decision.accessUntil) : null,
        accessUntil: accessUntilIso,
        subscriptionStatus: decision.entitlementStatus,
        isPremium: decision.active,
        badge: nextBadge,
        testerBadge: nextTesterBadge,
        entitlementSource: "google_play",
        entitlementUpdatedAt: nowIso,
        entitlements: nextEntitlements,
        purchase: {
          provider: "google_play",
          packageName,
          productId: verifiedProductId,
          basePlanId: verifiedBasePlanId,
          tokenHash: purchaseTokenHash,
          subscriptionState,
          entitlementStatus: decision.entitlementStatus,
          entitlementDecisionReason: decision.reason,
          acknowledgementState: subscription.acknowledgementState || null,
          acknowledgedByServer,
          latestOrderId: subscription.latestOrderId || null,
          voidedCheck: {
            checked: voidedCheck.checked,
            voided: voidedCheck.voided,
            reason: voidedCheck.reason,
          },
          verifiedAt: nowIso,
        },
        purchases: {
          ...(existing.purchases || {}),
          googlePlay: {
            productId: verifiedProductId,
            basePlanId: verifiedBasePlanId,
            tokenHash: purchaseTokenHash,
            subscriptionState,
            entitlementStatus: decision.entitlementStatus,
            accessUntil: accessUntilIso,
            updatedAt: nowIso,
          },
        },
        updatedBy: "verify_google_play_purchase",
        updatedAt: nowIso,
      }, { merge: true });
    });

    functions.logger.info("[GOOGLE_PLAY_SUBSCRIPTION_VERIFIED]", {
      uid,
      productId: verifiedProductId,
      basePlanId: verifiedBasePlanId,
      purchaseTokenHash,
      subscriptionState,
      accessUntil: accessUntilIso,
      entitlementDecision: decision.entitlementStatus,
      reason: decision.reason,
      voidedCheck: voidedCheck.reason,
      acknowledgedByServer,
    });

    return {
      ok: true,
      active: decision.active,
      plan: decision.active ? "premium" : "free",
      productId: verifiedProductId,
      basePlanId: verifiedBasePlanId,
      accessUntil: accessUntilIso,
      subscriptionState,
      entitlementStatus: decision.entitlementStatus,
      reason: decision.reason,
      acknowledgedByServer,
    };
  });

exports._private = {
  buildNewUserGrant,
  buildEntitlementDecision,
  validateTokenOwnership,
  normalizePurchaseToken,
  hashPurchaseToken,
};
