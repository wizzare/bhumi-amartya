export type SubscriptionState =
  | "SUBSCRIPTION_STATE_UNSPECIFIED"
  | "SUBSCRIPTION_STATE_PENDING"
  | "SUBSCRIPTION_STATE_ACTIVE"
  | "SUBSCRIPTION_STATE_PAUSED"
  | "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
  | "SUBSCRIPTION_STATE_ON_HOLD"
  | "SUBSCRIPTION_STATE_CANCELED"
  | "SUBSCRIPTION_STATE_EXPIRED"
  | "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED";

export type AcknowledgementState =
  | "ACKNOWLEDGEMENT_STATE_UNSPECIFIED"
  | "ACKNOWLEDGEMENT_STATE_PENDING"
  | "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED";

export type LineItem = {
  productId?: string;
  expiryTime?: string;
  autoRenewingPlan?: { basePlanId?: string };
  offerDetails?: { basePlanId?: string; offerId?: string | null };
};

export type SubscriptionPurchase = {
  subscriptionState?: SubscriptionState;
  acknowledgementState?: AcknowledgementState;
  lineItems?: LineItem[];
};

export type DecisionOutcome = {
  active: boolean;
  status: string;
  date: Date | null;
};

export type TrialBootstrapOutcome =
  | "PROVISIONED"
  | "ALREADY_PRESENT"
  | "HIGHER_ENTITLEMENT"
  | "EXPIRED_BY_ACCOUNT_AGE"
  | "DATA_CONFLICT"
  | "AUTH_CREATION_TIME_UNAVAILABLE"
  | "RETRYABLE_ERROR";

export type TrialBootstrapResponse = {
  ok: boolean;
  outcome: TrialBootstrapOutcome;
  trialStartedAt?: string;
  trialEndsAt?: string;
  error?: string;
};
