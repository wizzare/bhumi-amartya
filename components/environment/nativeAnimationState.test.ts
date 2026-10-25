import assert from "node:assert/strict";
import test from "node:test";
import { observeNativeAnimationState } from "./nativeAnimationState";

test("observeNativeAnimationState on non-native platform resolves to no-op cleanup", () => {
  let calls = 0;
  const cleanup = observeNativeAnimationState(() => { calls++; }, () => {});
  assert.equal(calls, 0);
  assert.equal(typeof cleanup, "function");
  cleanup();
});
