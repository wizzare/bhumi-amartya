import assert from "node:assert/strict";
import {
  isCurrentProfilePageLoad,
  resolveProfilePageLoadState,
} from "../../lib/profile/profilePageLoadState.ts";

let passed = 0;
function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed += 1;
  console.log(`PASS: ${label}`);
}

const complete = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, guidanceReady: true });
test("profile and blueprint with guidance render ready", complete.dailyNoteState === "ready");
test("complete profile load exits loading", complete.loading === false);

const missingBlueprint = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: false, guidanceReady: false });
test("missing blueprint renders unavailable", missingBlueprint.dailyNoteState === "unavailable");

const missingProfile = resolveProfilePageLoadState({ hasProfile: false, hasBlueprint: true, guidanceReady: true });
test("missing profile renders unavailable", missingProfile.dailyNoteState === "unavailable");

const blueprintTimeout = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: false, guidanceReady: false });
test("blueprint timeout fallback renders unavailable", blueprintTimeout.dailyNoteState === "unavailable");

const guidanceUnavailable = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, guidanceReady: false });
test("unavailable guidance renders unavailable", guidanceUnavailable.dailyNoteState === "unavailable");
test("valid unavailable state exits loading", guidanceUnavailable.loading === false);
test("settled state cannot remain the Daily Note loading state", guidanceUnavailable.dailyNoteState !== "loading");

test("current profile load may update state", isCurrentProfilePageLoad(2, 2, false));
test("StrictMode-like first load is stale after second starts", !isCurrentProfilePageLoad(1, 2, false));
test("cancelled load cannot update state", !isCurrentProfilePageLoad(2, 2, true));
test("latest duplicate load remains current", isCurrentProfilePageLoad(3, 3, false));

console.log(`${passed} profile loading tests passed`);
