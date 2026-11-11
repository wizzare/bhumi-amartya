import assert from "node:assert/strict";
import test from "node:test";
import {
  shouldRequestPlayReview,
  REVIEW_MIN_ACCOUNT_AGE_MS,
  REVIEW_RETRY_COOLDOWN_MS,
} from "../../lib/rating/reviewEligibility";

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0);
const eligibleInput = {
  accountCreatedAtMs: NOW - 20 * 86_400_000,
  nowMs: NOW,
  requestCount: 0,
  lastRequestedAtMs: null,
};

test("Existing account becomes eligible at its next dashboard login", () => {
  assert.equal(shouldRequestPlayReview(eligibleInput), true);
});

test("New account is deferred until 72 full hours after creation", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW - REVIEW_MIN_ACCOUNT_AGE_MS + 1 }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW - REVIEW_MIN_ACCOUNT_AGE_MS }), true);
});

test("Unknown or future account timestamps fail closed", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: null }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, accountCreatedAtMs: NOW + 60_000 }), false);
});

test("Previously requested users observe the long per-user cooldown", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, requestCount: 1, lastRequestedAtMs: NOW - REVIEW_RETRY_COOLDOWN_MS + 1 }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, requestCount: 1, lastRequestedAtMs: NOW - REVIEW_RETRY_COOLDOWN_MS }), true);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, requestCount: 2, lastRequestedAtMs: NOW - REVIEW_RETRY_COOLDOWN_MS }), false);
});

test("Opt-out and invalid counters never trigger an automatic Play review request", () => {
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, optedOut: true }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, requestCount: -1 }), false);
  assert.equal(shouldRequestPlayReview({ ...eligibleInput, lastRequestedAtMs: NOW + 1 }), false);
});
