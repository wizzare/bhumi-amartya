import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

const existing = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, arsipAvailable: true, normalizedReadingsLength: 49, guidanceSource: "existing" });
test("profile and blueprint with existing guidance render ready", existing.dailyNoteState === "ready");
test("existing guidance exits loading", existing.loading === false);

const local = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, arsipAvailable: true, normalizedReadingsLength: 49, guidanceSource: "local" });
test("available Arsip with missing or stale guidance renders local synthesis", local.dailyNoteState === "ready");
test("local synthesis exits loading", local.loading === false);

const complete = local;
test("complete profile load exits loading", complete.loading === false);

const missingBlueprint = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: false, arsipAvailable: false, normalizedReadingsLength: 0, guidanceSource: "unavailable" });
test("missing blueprint renders unavailable", missingBlueprint.dailyNoteState === "unavailable");

const missingProfile = resolveProfilePageLoadState({ hasProfile: false, hasBlueprint: true, arsipAvailable: true, normalizedReadingsLength: 49, guidanceSource: "existing" });
test("missing profile renders unavailable", missingProfile.dailyNoteState === "unavailable");

const blueprintTimeout = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: false, arsipAvailable: false, normalizedReadingsLength: 0, guidanceSource: "unavailable" });
test("blueprint timeout fallback renders unavailable", blueprintTimeout.dailyNoteState === "unavailable");

const guidanceUnavailable = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, arsipAvailable: false, normalizedReadingsLength: 0, guidanceSource: "unavailable" });
test("unavailable Arsip renders unavailable", guidanceUnavailable.dailyNoteState === "unavailable");
test("valid unavailable state exits loading", guidanceUnavailable.loading === false);
test("settled state cannot remain the Daily Note loading state", guidanceUnavailable.dailyNoteState !== "loading");

const synthesisError = resolveProfilePageLoadState({ hasProfile: true, hasBlueprint: true, arsipAvailable: true, normalizedReadingsLength: 49, guidanceSource: "error" });
test("synthesis failure renders error rather than minimum-data copy", synthesisError.dailyNoteState === "error");

test("current profile load may update state", isCurrentProfilePageLoad(2, 2, false));
test("StrictMode-like first load is stale after second starts", !isCurrentProfilePageLoad(1, 2, false));
test("cancelled load cannot update state", !isCurrentProfilePageLoad(2, 2, true));
test("latest duplicate load remains current", isCurrentProfilePageLoad(3, 3, false));

const profileSource = readFileSync("app/profile/page.tsx", "utf8");
test("profile checks an existing record before local synthesis", profileSource.indexOf("getExistingDailyGuidance") < profileSource.indexOf("buildProfileDailyGuidance"));
test("stale existing guidance takes the local path", profileSource.includes("getDailyGuidanceStaleReason") && profileSource.includes("else if (arsipAvailable)"));
test("local synthesis requires Arsip readings", profileSource.includes("arsipAvailable = normalizedReadingsLength > 0"));
test("profile fallback has no Firestore write", !/\b(setDoc|addDoc|updateDoc|writeBatch)\b/.test(profileSource));
test("profile load effect does not depend on profileSections", profileSource.includes("}, [auditUser]);"));

console.log(`${passed} profile loading tests passed`);
