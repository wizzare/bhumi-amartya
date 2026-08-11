import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getTrialWelcomePreferenceKey,
  shouldShowTrialWelcome,
} from "../../lib/billing/trialWelcome";

const now = new Date("2026-08-10T00:00:00.000Z");
const activeTrial = { isPremium: true, reason: "trial", status: "Active" };
const newProfile = {
  uid: "fixture-user",
  setupCompleted: true,
  trialStartedAt: "2026-08-09T23:00:00.000Z",
};

assert.equal(shouldShowTrialWelcome(newProfile, activeTrial, now), true);
assert.equal(
  shouldShowTrialWelcome({ ...newProfile, trialStartedAt: "2026-08-08T23:00:00.000Z" }, activeTrial, now),
  false,
);
assert.equal(shouldShowTrialWelcome(newProfile, { isPremium: true, reason: "subscriber", status: "Active" }, now), false);
assert.equal(shouldShowTrialWelcome(newProfile, { isPremium: true, reason: "founder", status: "Active" }, now), false);
assert.equal(shouldShowTrialWelcome(newProfile, { isPremium: false, reason: "none", status: "Expired" }, now), false);
assert.equal(shouldShowTrialWelcome({ ...newProfile, setupCompleted: false }, activeTrial, now), false);

const key = getTrialWelcomePreferenceKey(newProfile);
assert.match(key || "", /^bhumi\.trial-welcome\.v1\.fixture-user\.\d+$/);
assert.equal(getTrialWelcomePreferenceKey({ uid: "fixture-user" }), null);

const dashboardSource = readFileSync("components/dashboard/DashboardClient.tsx", "utf8");
assert.match(
  dashboardSource,
  /<TrialWelcomePopup profile=\{auth\.userProfile\}/,
  "welcome popup consumes the refreshed AuthContext profile",
);

console.log("TRIAL_WELCOME_POPUP_PASS assertions=9");
