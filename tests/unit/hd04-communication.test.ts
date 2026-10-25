import assert from "node:assert/strict";
import test from "node:test";
import { requestHdJson, withHdDeadline, hdHttpFailure, isHdRetryable } from "../../lib/humandesign/hdCommunication";

for (const [status, code, retry] of [
  [404, "endpoint_not_found", false], [401, "unauthorized", false], [403, "unauthorized", false],
  [429, "rate_limited", true], [500, "service_unavailable", true], [400, "invalid_input", false],
] as const) {
  test(`HD04 HTTP ${status}`, async () => {
    assert.equal(hdHttpFailure(status), code);
    assert.equal(isHdRetryable(code), retry);
    await assert.rejects(requestHdJson("/synthetic", {}, {
      fetch: async () => new Response(null, { status }),
    }), { message: code });
  });
}

test("HD04 normal response", async () => {
  assert.deepEqual(await requestHdJson("/synthetic", {}, {
    fetch: async () => Response.json({ status: "ready" }),
  }), { status: "ready" });
});

for (const phase of ["token", "headers", "body"]) {
  test(`HD04 deadline covers hung ${phase}`, async () => {
    const hung = () => new Promise<never>(() => {});
    await assert.rejects(requestHdJson("/synthetic", {}, {
      timeoutMs: 10,
      token: phase === "token" ? hung : undefined,
      fetch: phase === "headers" ? hung : async () => ({ ok: true, json: hung }) as unknown as Response,
    }), { message: "timeout" });
  });
}

test("HD04 invalid JSON body", async () => {
  await assert.rejects(requestHdJson("/synthetic", {}, {
    fetch: async () => new Response("invalid"),
  }), { message: "invalid_response" });
});

test("HD04 cancellation aborts underlying signal", async () => {
  const controller = new AbortController();
  let underlying: AbortSignal | undefined;
  const pending = withHdDeadline(async signal => {
    underlying = signal;
    controller.abort();
    return new Promise<never>(() => {});
  }, 1000, controller.signal);
  await assert.rejects(pending, { message: "cancelled" });
  assert.equal(underlying?.aborted, true);
});

test("HD04 completion clears deadline", context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  return withHdDeadline(async () => 7, 1000).then(value => {
    assert.equal(value, 7);
    context.mock.timers.tick(2000);
    context.mock.timers.reset();
  });
});
