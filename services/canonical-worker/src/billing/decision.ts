import type { DecisionOutcome } from "./types";

const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);

export function decision(
  state: string,
  expiry?: string,
  options: { voided?: boolean } = {}
): DecisionOutcome {
  const date = expiry ? new Date(expiry) : null;
  const future = Boolean(date && !Number.isNaN(date.getTime()) && date.getTime() > Date.now());
  if (options.voided) return { active: false, status: "VOIDED", date };
  if (activeStates.has(state) && future) {
    return {
      active: true,
      status: state === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD" ? "GRACE_PERIOD" : "ACTIVE",
      date,
    };
  }
  if (state === "SUBSCRIPTION_STATE_CANCELED" && future) {
    return { active: true, status: "CANCELED_PAID_THROUGH", date };
  }
  if (state === "SUBSCRIPTION_STATE_ON_HOLD") {
    return { active: false, status: "ON_HOLD", date };
  }
  if (state === "SUBSCRIPTION_STATE_PENDING" || state === "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED") {
    return { active: false, status: "SUBSCRIPTION_PENDING", date };
  }
  return { active: false, status: future ? "SUBSCRIPTION_INACTIVE" : "EXPIRED", date };
}
