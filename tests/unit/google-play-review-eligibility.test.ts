import assert from "node:assert/strict";
import test from "node:test";
import {
  hasActiveModalInDom,
  isExemptReviewAccount,
  shouldRequestPlayReview,
  REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE,
  REVIEW_MIN_ACCOUNT_AGE_MS,
  REVIEW_RETRY_COOLDOWN_MS,
} from "../../lib/rating/reviewEligibility";
import {
  parseCanonicalAccountTimestamp,
  ReviewTriggerService,
  REVIEW_KEYS,
} from "../../lib/rating/reviewTriggerService";

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
const eligibleInput = {
  accountCreatedAtMs: NOW - 20 * 86_400_000,
  nowMs: NOW,
  requestCount: 0,
  lastRequestedAtMs: null,
};

class HarnessReviewService extends ReviewTriggerService {
  public storage = new Map<string, string>();
  public androidNative = true;
  public online = true;
  public nativeCalls = 0;
  public shouldThrowPluginError = false;
  public playSuppressedDialog = false;

  override getStorageItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  override setStorageItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  protected override isAndroidNativeRuntime(): boolean {
    return this.androidNative;
  }

  protected override isOnline(): boolean {
    return this.online;
  }

  protected override async invokeNativeReview(): Promise<unknown> {
    this.nativeCalls += 1;
    if (this.shouldThrowPluginError) {
      throw new Error("Play Review plugin unavailable");
    }
    if (this.playSuppressedDialog) {
      // Play In-App Review resolves silently when suppressed by quota or sideloaded install
      return { flowCompleted: true, submittedReviewKnown: false };
    }
    return { flowCompleted: true, submittedReviewKnown: false };
  }
}

test("Existing account older than 3 days becomes eligible at its next dashboard login", () => {
  assert.equal(shouldRequestPlayReview(eligibleInput), true);
});

test("New account younger than 3 days is deferred until exactly 72 full hours after creation", () => {
  assert.equal(
    shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW - REVIEW_MIN_ACCOUNT_AGE_MS + 1 }),
    false,
  );
  assert.equal(
    shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW - REVIEW_MIN_ACCOUNT_AGE_MS }),
    true,
  );
});

test("Unknown or future account timestamps fail closed and local install date is never used as authority", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: null }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW + 60_000 }), false);

  const svc = new HarnessReviewService();
  // Local install date is 30 days old, but canonical Firebase creation time is only 24h old
  svc.setStorageItem(REVIEW_KEYS.INSTALL_DATE, new Date(NOW - 30 * 86_400_000).toISOString());
  const newUserProfile = {
    uid: "user-new-24h",
    setupCompleted: true,
    createdAt: new Date(NOW - 24 * 3_600_000).toISOString(),
  };
  assert.equal(
    svc.isEligibleForDashboard(newUserProfile, new Date(NOW - 24 * 3_600_000).toISOString(), NOW),
    false,
  );
});

test("Previously requested users observe 120-day cooldown and max 2 requests per account per installation", () => {
  assert.equal(
    shouldRequestPlayReview({
      ...eligibleInput,
      requestCount: 1,
      lastRequestedAtMs: NOW - REVIEW_RETRY_COOLDOWN_MS + 1,
    }),
    false,
  );
  assert.equal(
    shouldRequestPlayReview({
      ...eligibleInput,
      requestCount: 1,
      lastRequestedAtMs: NOW - REVIEW_RETRY_COOLDOWN_MS,
    }),
    true,
  );
  assert.equal(
    shouldRequestPlayReview({
      ...eligibleInput,
      requestCount: REVIEW_MAX_REQUESTS_PER_ACCOUNT_DEVICE,
      lastRequestedAtMs: NOW - 2 * REVIEW_RETRY_COOLDOWN_MS,
    }),
    false,
  );
});

test("Opt-out, deferral, and invalid counters never trigger an automatic Play review request", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, optedOut: true }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, deferredUntilMs: NOW + 1000 }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, requestCount: -1 }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, lastRequestedAtMs: NOW + 1 }), false);
});

test("Founder, Admin, developer, and QA accounts are exempt from automatic review prompts", () => {
  assert.equal(isExemptReviewAccount({ uid: "u1", guardianRole: "founder" }), true);
  assert.equal(isExemptReviewAccount({ uid: "u2", role: "admin" }), true);
  assert.equal(isExemptReviewAccount({ uid: "u3", isDeveloper: true }), true);
  assert.equal(isExemptReviewAccount({ uid: "u4", role: "qa" }), true);
  assert.equal(isExemptReviewAccount({ uid: "u5", testerBadge: "QA" }), true);
  assert.equal(isExemptReviewAccount({ uid: "u6", email: "qa-user@bhumi.local" }), true);
  assert.equal(isExemptReviewAccount({ uid: "u7", role: "user", email: "member@gmail.com" }), false);

  const svc = new HarnessReviewService();
  const oldCreated = new Date(NOW - 10 * 86_400_000).toISOString();
  assert.equal(svc.isEligibleForDashboard({ uid: "founder-1", guardianRole: "founder", setupCompleted: true }, oldCreated, NOW), false);
  assert.equal(svc.isEligibleForDashboard({ uid: "admin-1", role: "admin", setupCompleted: true }, oldCreated, NOW), false);
  assert.equal(svc.isEligibleForDashboard({ uid: "qa-1", isQA: true, setupCompleted: true }, oldCreated, NOW), false);
});

test("Repeated logins and account switching isolate per-UID review state and reset transient session state", async () => {
  const svc = new HarnessReviewService();
  const created10dAgo = new Date(NOW - 10 * 86_400_000).toISOString();
  const userA = { uid: "user-a-existing", setupCompleted: true, registeredAt: created10dAgo };
  const userB = { uid: "user-b-existing", setupCompleted: true, registeredAt: created10dAgo };

  // User A logs in and is eligible
  assert.equal(svc.isEligibleForDashboard(userA, created10dAgo, NOW), true);
  const requestedA1 = await svc.requestReview(userA.uid, NOW);
  assert.equal(requestedA1, true);
  assert.equal(svc.nativeCalls, 1);

  // Repeated login for User A 1 hour later: blocked by 120-day cooldown
  assert.equal(svc.isEligibleForDashboard(userA, created10dAgo, NOW + 3_600_000), false);
  assert.equal(await svc.requestReview(userA.uid, NOW + 3_600_000), false);
  assert.equal(svc.nativeCalls, 1);

  // Switch account to User B on same installation: transient state resets, User B is eligible
  assert.equal(svc.isEligibleForDashboard(userB, created10dAgo, NOW + 3_600_000), true);
  const requestedB1 = await svc.requestReview(userB.uid, NOW + 3_600_000);
  assert.equal(requestedB1, true);
  assert.equal(svc.nativeCalls, 2);

  // Switch back to User A: User A's persisted 120-day cooldown remains enforced
  assert.equal(svc.isEligibleForDashboard(userA, created10dAgo, NOW + 7_200_000), false);
});

test("Offline conditions, non-Play/suppressed dialogs, and unavailable native plugin fail gracefully without redirect", async () => {
  const svc = new HarnessReviewService();
  const created10dAgo = new Date(NOW - 10 * 86_400_000).toISOString();
  const profile = { uid: "user-resilience", setupCompleted: true, registeredAt: created10dAgo };

  // 1. Offline condition: blocked without consuming request count
  svc.online = false;
  assert.equal(svc.isEligibleForDashboard(profile, created10dAgo, NOW), false);
  assert.equal(await svc.requestReview(profile.uid, NOW), false);
  assert.equal(svc.readUserState(profile.uid).requestCount, 0);

  // 2. Online + plugin throws (e.g. Play Services unavailable / sideloaded): returns false gracefully
  svc.online = true;
  svc.shouldThrowPluginError = true;
  assert.equal(svc.isEligibleForDashboard(profile, created10dAgo, NOW), true);
  const pluginFailResult = await svc.requestReview(profile.uid, NOW);
  assert.equal(pluginFailResult, false);
  assert.equal(svc.readUserState(profile.uid).requestCount, 1);

  // 3. After 120-day cooldown, Google Play suppresses dialog: resolves cleanly without store redirect
  svc.shouldThrowPluginError = false;
  svc.playSuppressedDialog = true;
  const afterCooldown = NOW + REVIEW_RETRY_COOLDOWN_MS + 1000;
  svc.syncActiveUser(null); // new session after 120 days
  assert.equal(svc.isEligibleForDashboard(profile, created10dAgo, afterCooldown), true);
  const suppressedResult = await svc.requestReview(profile.uid, afterCooldown);
  assert.equal(suppressedResult, true);
  assert.equal(svc.readUserState(profile.uid).requestCount, 2);

  // 4. After 2 requests on this installation, further requests are permanently blocked
  const afterSecondCooldown = afterCooldown + REVIEW_RETRY_COOLDOWN_MS + 1000;
  svc.syncActiveUser(null);
  assert.equal(svc.isEligibleForDashboard(profile, created10dAgo, afterSecondCooldown), false);
});

test("Onboarding incomplete and active modal conflicts block review prompt", () => {
  const svc = new HarnessReviewService();
  const created10dAgo = new Date(NOW - 10 * 86_400_000).toISOString();

  assert.equal(
    svc.isEligibleForDashboard({ uid: "user-onboarding", setupCompleted: false }, created10dAgo, NOW),
    false,
  );
  assert.equal(
    svc.isEligibleForDashboard({ uid: "user-onboarding-2", onboardingCompleted: false }, created10dAgo, NOW),
    false,
  );

  // Modal conflict detection in DOM
  const fakeDocWithDialog = {
    querySelector: (selector: string) => (selector.includes('[role="dialog"]') ? ({} as Element) : null),
  } as unknown as Document;
  const fakeDocClean = {
    querySelector: () => null,
  } as unknown as Document;
  assert.equal(hasActiveModalInDom(fakeDocWithDialog), true);
  assert.equal(hasActiveModalInDom(fakeDocClean), false);
});

test("Timestamp parser supports ISO strings, epoch ms, and Firestore Timestamp objects", () => {
  assert.equal(parseCanonicalAccountTimestamp("2026-11-01T00:00:00.000Z"), Date.parse("2026-11-01T00:00:00.000Z"));
  assert.equal(parseCanonicalAccountTimestamp({ seconds: 1762000000 }), 1762000000 * 1000);
  assert.equal(parseCanonicalAccountTimestamp({ toDate: () => new Date(1762000000000) }), 1762000000000);
  assert.equal(parseCanonicalAccountTimestamp(null), null);
});
