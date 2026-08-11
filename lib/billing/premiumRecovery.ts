export type RecoverablePurchase = { purchaseToken?: string; products?: string[]; purchaseState?: number };

export type PremiumRecoveryState =
  | "ACCESS_ACTIVE"
  | "NO_ACTIVE_PURCHASE"
  | "PAYMENT_PENDING"
  | "RETRYABLE_VERIFICATION_FAILURE"
  | "PERMANENT_VERIFICATION_FAILURE"
  | "PERSISTENCE_FAILURE"
  | "PROFILE_REFRESH_FAILURE";

export type PremiumRecoveryResult = {
  state: PremiumRecoveryState;
  attempted: number;
  verified: number;
  verifiedAny: boolean;
  accessActive: boolean;
  retryableFailures: number;
  permanentFailures: number;
  pendingCount: number;
  errorCode?: PremiumRecoveryState;
};

export type PremiumPurchaseResult = {
  alreadyOwned?: boolean;
  purchases: RecoverablePurchase[];
};

type RecoveryDependencies = {
  productId: string;
  verify: (purchase: RecoverablePurchase) => Promise<{ ok: boolean; active: boolean; status?: string }>;
  refresh: () => Promise<void>;
  existingAccessActive?: boolean;
};

function classifyFailure(error: unknown): "retryable" | "permanent" | "persistence" {
  const code = String((error as { code?: unknown } | null)?.code || "").toUpperCase();
  const status = Number((error as { status?: unknown } | null)?.status || 0);
  if (["ENTITLEMENT_WRITE_FAILURE", "PERSISTENCE_TIMEOUT", "TOKEN_OWNERSHIP_CONFLICT"].includes(code)) return "persistence";
  if ((error as { retryable?: boolean } | null)?.retryable || status === 429 || status >= 500 || error instanceof TypeError) return "retryable";
  return "permanent";
}

export async function recoverAndRefreshPremiumPurchases(
  purchases: RecoverablePurchase[],
  productId: string,
  verify: RecoveryDependencies["verify"],
  refresh: RecoveryDependencies["refresh"],
  existingAccessActive = false,
): Promise<PremiumRecoveryResult> {
  const tokens = new Set<string>();
  const eligible = purchases.filter((purchase) =>
    purchase.products?.includes(productId) &&
    Boolean(purchase.purchaseToken) &&
    (purchase.purchaseState === 1 || purchase.purchaseState === undefined)
  );
  let verified = 0;
  let retryableFailures = 0;
  let permanentFailures = 0;
  let persistenceFailures = 0;
  let pendingCount = 0;

  for (const purchase of eligible) {
    const token = purchase.purchaseToken!;
    if (tokens.has(token)) continue;
    tokens.add(token);
    try {
      const result = await verify(purchase);
      if (result.ok && result.active) {
        verified++;
      } else if (result.ok && !result.active && result.status === "SUBSCRIPTION_PENDING") {
        pendingCount++;
      } else {
        permanentFailures++;
      }
    } catch (error) {
      const kind = classifyFailure(error);
      if (kind === "retryable") retryableFailures++;
      else if (kind === "persistence") persistenceFailures++;
      else permanentFailures++;
    }
  }

  const base = { attempted: tokens.size, verified, retryableFailures, permanentFailures, pendingCount };
  if (verified > 0) {
    try {
      // The verifier response is returned only after its idempotent persistence;
      // this awaited refresh is therefore the sole canonical post-write refresh.
      await refresh();
      return { ...base, state: "ACCESS_ACTIVE", verifiedAny: true, accessActive: true };
    } catch {
      return { ...base, state: "PROFILE_REFRESH_FAILURE", errorCode: "PROFILE_REFRESH_FAILURE", verifiedAny: false, accessActive: existingAccessActive };
    }
  }

  const state: PremiumRecoveryState = persistenceFailures > 0
    ? "PERSISTENCE_FAILURE"
    : retryableFailures > 0
      ? "RETRYABLE_VERIFICATION_FAILURE"
      : pendingCount > 0
        ? "PAYMENT_PENDING"
        : permanentFailures > 0
          ? "PERMANENT_VERIFICATION_FAILURE"
          : "NO_ACTIVE_PURCHASE";
  return { ...base, state, errorCode: state, verifiedAny: false, accessActive: existingAccessActive };
}

export async function orchestratePremiumCheckout(
  purchase: () => Promise<PremiumPurchaseResult>,
  queryOwned: () => Promise<PremiumPurchaseResult>,
  dependencies: RecoveryDependencies,
): Promise<PremiumRecoveryResult> {
  const result = await purchase();
  const purchases = result.alreadyOwned && result.purchases.length === 0
    ? (await queryOwned()).purchases
    : result.purchases;
  return recoverAndRefreshPremiumPurchases(purchases, dependencies.productId, dependencies.verify, dependencies.refresh, dependencies.existingAccessActive);
}

export async function orchestratePremiumRestore(
  queryOwned: () => Promise<PremiumPurchaseResult>,
  dependencies: RecoveryDependencies,
): Promise<PremiumRecoveryResult> {
  const result = await queryOwned();
  return recoverAndRefreshPremiumPurchases(result.purchases, dependencies.productId, dependencies.verify, dependencies.refresh, dependencies.existingAccessActive);
}
