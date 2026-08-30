/**
 * Behavioral matrix for the REAL update-eligibility policy.
 * Imports @/lib/services/appUpdatePolicy directly — no local reimplementation.
 * STRONG_UNIT_REAL_SOURCE. Hard-fail via assertHarness.
 */
import { evaluateAppUpdateStatus, type PlayUpdateCandidate } from "../../lib/services/appUpdatePolicy";
import type { BuildInfo } from "../../lib/config/buildInfo";
import { check, checkEqual, runSuite } from "../helpers/assertHarness";

const build = (versionCode: number, versionName = "0.0.0", platform = "android"): BuildInfo => ({
  versionName,
  versionCode,
  buildNumber: String(versionCode),
  platform,
});

type Remote = Record<string, unknown> | null;
const policyOf = (bi: BuildInfo, remote: Remote, play?: PlayUpdateCandidate | null) =>
  evaluateAppUpdateStatus(bi, remote, play ?? null).policy;

function main() {
  // ---------------------------------------------------------------- §7 A–J ----
  checkEqual(policyOf(build(101, "5.0.1"), { minimumBuild: 102, latestVersionCode: 102 }),
    "immediate_required", "A installed=101 min=102 latestCode=102");

  checkEqual(policyOf(build(102, "5.0.2"), { minimumBuild: 102, latestVersionCode: 102 }),
    "no_update", "B installed=102 min=102 latestCode=102");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 102, latestVersionName: "5.0.2" }),
    "no_update", "C installed=103 latestCode=102 latestName=5.0.2 (older code)");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 103, latestVersionName: "5.0.3" }),
    "no_update", "D installed=103 latestCode=103 (equal code)");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 104, latestVersionName: "5.0.4" }),
    "flexible_available", "E installed=103 latestCode=104");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionName: "5.0.2" }),
    "no_update", "F installed=103 latestCode ABSENT latestName=5.0.2");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionName: "9.9.9" }),
    "no_update", "G installed=103 latestCode ABSENT latestName=9.9.9 (name never decides)");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 102, latestVersionName: "9.9.9" }),
    "no_update", "H installed=103 latestCode=102 latestName=9.9.9");

  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 104, latestVersionCode: 104 }),
    "immediate_required", "I installed=103 min=104 latestCode=104");

  checkEqual(policyOf(build(104, "5.0.4"), { minimumBuild: 102, latestVersionCode: 103 }),
    "no_update", "J installed=104 latestCode=103 (older)");

  // ------------------------------------------------------------- §8 Play ------
  checkEqual(policyOf(build(103, "5.0.3"), null, { availableVersionCode: 102, available: true }),
    "no_update", "Play target 102 < installed 103");
  checkEqual(policyOf(build(103, "5.0.3"), null, { availableVersionCode: 103, available: true }),
    "no_update", "Play target 103 == installed 103");
  checkEqual(policyOf(build(103, "5.0.3"), null, { availableVersionCode: 104, available: true }),
    "flexible_available", "Play target 104 > installed 103");
  checkEqual(policyOf(build(103, "5.0.3"), null, { available: true }),
    "flexible_available", "Play generic UPDATE_AVAILABLE (no numeric code) — Play contract = strictly newer");
  checkEqual(policyOf(build(101, "5.0.1"), { minimumBuild: 102 }, null),
    "immediate_required", "below minimum + Play unavailable/error -> forced");
  checkEqual(policyOf(build(103, "5.0.3"), { minimumBuild: 102 }, null),
    "no_update", "supported + Play error + no higher Firestore candidate");
  // A stale Firestore display name must never cause a prompt even with Play absent.
  checkEqual(policyOf(build(103, "5.0.3"), { latestVersion: "5.0.2", minimumBuild: 102 }, null),
    "no_update", "stale Firestore latestVersion cannot downgrade a supported build");

  // ------------------------------------------------------ §10 backward-compat -
  checkEqual(policyOf(build(103, "5.0.3"), { minimumSupportedVersionCode: 99, latestVersion: "5.0.3" }, null),
    "no_update", "old remote schema (no latestVersionCode) + supported build -> no false optional");

  // ----------------------------------------------------- §13 negative control -
  const installed = build(103, "5.0.3");
  const remote = { latestVersion: "5.0.2", latestVersionCode: 102, minimumBuild: 102 };
  const OLD_LOGIC_RESULT =
    String(remote.latestVersion) !== installed.versionName ? "flexible_available" : "no_update";
  const NEW_LOGIC_RESULT = evaluateAppUpdateStatus(installed, remote, null).policy;
  check(OLD_LOGIC_RESULT === "flexible_available", "negative control: old versionName logic WOULD prompt");
  check(NEW_LOGIC_RESULT === "no_update", "negative control: new numeric logic does NOT prompt");
  console.log(`NEGATIVE_CONTROL OLD_LOGIC_RESULT=${OLD_LOGIC_RESULT} NEW_LOGIC_RESULT=${NEW_LOGIC_RESULT}`);

  // ----------------------------------------------------- display-name surface -
  const eMissing = evaluateAppUpdateStatus(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 104 }, null);
  check(eMissing.latestVersionName === null, "missing remote name -> latestVersionName null (modal uses generic wording)");
  check(eMissing.latestVersionCode === 104, "numeric candidate surfaced as latestVersionCode");
  const eNamed = evaluateAppUpdateStatus(build(103, "5.0.3"), { minimumBuild: 102, latestVersionCode: 104, latestVersionName: "5.0.4" }, null);
  check(eNamed.latestVersionName === "5.0.4", "remote name surfaced when present");

  console.log("APP_UPDATE_POLICY_MATRIX_PASS");
}

runSuite("app-update-policy", main);
