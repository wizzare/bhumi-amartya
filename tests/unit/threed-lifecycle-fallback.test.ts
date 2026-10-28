import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

test("Real3DEarth and Animated3DObjectPOC render valid fallback markup and use separate native gates", () => {
  const earth = fs.readFileSync("C:/tmp/bhumi-build106-recovery/components/environment/Real3DEarth.tsx", "utf8");
  const model = fs.readFileSync("C:/tmp/bhumi-build106-recovery/components/celestial/Animated3DObjectPOC.tsx", "utf8");
  const envPage = fs.readFileSync("C:/tmp/bhumi-build106-recovery/app/dashboard/environment/page.tsx", "utf8");
  const pocPath = fs.existsSync("C:/tmp/bhumi-build106-recovery/tests/harness/routes/test-3d-poc/page.tsx")
    ? "C:/tmp/bhumi-build106-recovery/tests/harness/routes/test-3d-poc/page.tsx"
    : "C:/tmp/bhumi-build106-recovery/app/test-3d-poc/page.tsx";
  const pocPage = fs.readFileSync(pocPath, "utf8");

  assert.match(earth, /observeNativeAnimationState/);
  assert.match(earth, /nativeActive && inViewport && !document\.hidden/);
  assert.match(earth, /<svg width=\{size\} height=\{size\} viewBox="0 0 100 100"/);

  assert.match(model, /observeNativeAnimationState/);
  assert.match(model, /nativeActive && inViewport && !document\.hidden/);
  assert.match(model, /<svg width=\{size\} height=\{size\} viewBox="0 0 100 100"/);

  assert.doesNotMatch(envPage, /Real3DEarth|RotatingEarthCanvas|<canvas/);
  assert.match(envPage, /label=\{t\.environment\.fCurrentLocation\}/);

  assert.match(pocPage, /<ProtectedRoute>/);
  assert.match(pocPage, /process\.env\.NODE_ENV !== "development"/);
});
