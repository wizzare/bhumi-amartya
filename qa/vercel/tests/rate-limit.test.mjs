import assert from "node:assert/strict";
import test from "node:test";
import { clientKey, createRateLimiter } from "../lib/rate-limit.mjs";

test("enforces a fixed window per client", () => {
  let now = 1_000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 60_000, now: () => now });
  assert.equal(limiter.check("a"), true);
  assert.equal(limiter.check("a"), true);
  assert.equal(limiter.check("a"), false);
  assert.equal(limiter.check("b"), true);
  now = 61_001;
  assert.equal(limiter.check("a"), true);
});

test("derives the client key from the first forwarded address", () => {
  assert.equal(clientKey({ headers: { "x-forwarded-for": "203.0.113.4, 10.0.0.1" }, socket: { remoteAddress: "10.0.0.2" } }), "203.0.113.4");
  assert.equal(clientKey({ headers: {}, socket: { remoteAddress: "10.0.0.2" } }), "10.0.0.2");
  assert.equal(clientKey({ headers: {} }), "unknown");
});
