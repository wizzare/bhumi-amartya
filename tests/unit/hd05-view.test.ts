import assert from "node:assert/strict";
import test from "node:test";
import { selectHdView, hdUiCopy } from "../../lib/humandesign/hdView";

for (const state of Object.keys(hdUiCopy)) {
  test(`HD05 Indonesian copy: ${state}`, () => assert.ok(hdUiCopy[state as keyof typeof hdUiCopy].length > 15));
}
test("HD05 missing blueprint settles", () => assert.equal(selectHdView("synthetic", null, null).state, "missing_blueprint"));
test("HD05 authentication required", () => assert.equal(selectHdView("", null, null).state, "authentication_required"));
test("HD05 cross-account data is hidden", () => assert.equal(selectHdView("synthetic", { uid: "other" }, null).chart, null));
test("HD05 incomplete canonical is not a chart", () => {
  const view = selectHdView("synthetic", { uid: "synthetic", humanDesign: { type: "Generator", status: "ready", hdEngineVersion: "gaia-hd-v1" } }, null);
  assert.equal(view.chart, null);
  assert.equal(view.state, "retryable_error");
});
test("HD05 changed revision is hidden", () => {
  const view = selectHdView("synthetic", { uid: "synthetic", humanDesign: { inputHash: "old" } }, { birthDate: "1990-01-01", birthTime: "12:00" });
  assert.equal(view.state, "input_revision_mismatch");
  assert.equal(view.chart, null);
});
