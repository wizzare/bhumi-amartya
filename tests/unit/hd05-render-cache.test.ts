import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { selectHdView } from "../../lib/humandesign/hdView";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HdStatus } from "../../components/blueprint/HdStatus";
import { hdUiCopy } from "../../lib/humandesign/hdView";
import { loadHdView, HD_CACHE_TTL_MS } from "../../lib/humandesign/hdLoad";
import { computeBirthInputFingerprint } from "../../lib/humandesign/birthFingerprint";

const input = { birthDate: "1990-01-01", birthTime: "12:00", birthCity: "Synthetic", timezone: "UTC", latitude: 0, longitude: 0 };
function fixture() {
  const uid = "synthetic-hd05";
  const blueprint = { uid, input, humanDesign: {
    type: "Generator", strategy: "Respond", authority: "Sacral", profile: "1/3", definition: "Single",
    gates: [1, 2], channels: ["1-2"], incarnationCross: { name: "Synthetic" },
    centers: { head: false, ajna: false, throat: true, g: true, ego: false, spleen: false, sacral: true, solarPlexus: false, root: false },
    status: "ready", source: "human-design-py", calculationQuality: "verified", hdEngineVersion: "gaia-hd-v1",
    inputHash: computeBirthInputFingerprint(uid, input)!.revisionHash,
  } };
  return { uid, session: {}, input, signal: new AbortController().signal, active: () => true, online: true, read: async () => blueprint, now: 1000 };
}
for (const state of Object.keys(hdUiCopy) as Array<keyof typeof hdUiCopy>) {
  test(`HD05 SSR status ${state}`, () => {
    const html = renderToStaticMarkup(React.createElement(HdStatus, { state }));
    assert.ok(html.includes(hdUiCopy[state]));
    assert.ok(html.includes(`data-hd-state="${state}"`));
    assert.ok(html.includes('aria-live="polite"'));
  });
}
test("HD05 confirmed cache and offline reuse", async () => {
  const f = fixture();
  assert.equal((await loadHdView(f)).state, "ready_canonical");
  assert.equal((await loadHdView({ ...f, online: false })).state, "offline_with_valid_cache");
});
for (const kind of ["uid", "session", "revision", "expiry", "clock"] as const) {
  test(`HD05 cache rejects ${kind}`, async () => {
    const f = fixture();
    await loadHdView(f);
    const next = { ...f, online: false };
    if (kind === "uid") next.uid = "other";
    if (kind === "session") next.session = {};
    if (kind === "revision") next.input = { ...input, birthTime: "13:00" };
    if (kind === "expiry") next.now += HD_CACHE_TTL_MS;
    if (kind === "clock") next.now = 0;
    assert.equal((await loadHdView(next)).state, "offline_without_cache");
  });
}
test("HD05 no unconfirmed cache", async () => {
  assert.equal((await loadHdView({ ...fixture(), online: false })).blueprint, null);
});
test("HD05 stale UID response and unmount never populate cache", async () => {
  for (const abort of [false, true]) {
    const f = fixture();
    const controller = new AbortController();
    let active = true;
    const read = async () => { active = false; if (abort) controller.abort(); return f.read(); };
    assert.equal((await loadHdView({ ...f, read, signal: controller.signal, active: () => active })).state, "cancelled");
    assert.equal((await loadHdView({ ...f, online: false })).state, "offline_without_cache");
  }
});
test("HD05 read outage preserves valid confirmed chart", async () => {
  const f = fixture();
  await loadHdView(f);
  const result = await loadHdView({ ...f, read: async () => { throw new Error("private error"); } });
  assert.equal(result.state, "read_error");
  assert.ok(result.blueprint);
});
test("HD05 bounded hung read", async () => {
  assert.equal((await loadHdView({ ...fixture(), timeoutMs: 5, read: () => new Promise(() => {}) })).state, "read_error");
});
test("HD05 historical unknown binding remains honest and readable", async () => {
  const f = fixture();
  const bp = await f.read();
  const historical = { ...bp, humanDesign: { ...bp.humanDesign, inputHash: undefined, hdEngineVersion: undefined } };
  const view = selectHdView(f.uid, historical, input);
  assert.equal(view.state, "ready_historical");
  assert.ok(view.chart);
});
test("HD05 failed retry and exhaustion use shared rendered states", () => {
  const f = fixture();
  for (const [hd, state] of [[{ status: "retriable_error" }, "retryable_error"], [{ status: "pending", retryCount: 999 }, "exhausted"]] as const) {
    const view = selectHdView(f.uid, { uid: f.uid, humanDesign: hd }, input);
    assert.equal(view.state, state);
    assert.ok(renderToStaticMarkup(React.createElement(HdStatus, { state: view.state })).includes(hdUiCopy[state]));
  }
});
test("HD05 Setup Settings CoreIdentity share stored status component wiring", () => {
  for (const path of ["app/setup/page.tsx", "app/settings/page.tsx", "components/dashboard/CoreIdentity.tsx"]) {
    assert.ok(readFileSync(path, "utf8").includes("<HdStoredStatus"));
  }
});
test("HD05 server missing invalidates cache", async () => {
  const f = fixture();
  assert.equal((await loadHdView(f)).state, "ready_canonical");
  assert.equal((await loadHdView({ ...f, read: async () => null })).state, "missing_blueprint");
  assert.equal((await loadHdView({ ...f, online: false })).state, "offline_without_cache");
});
