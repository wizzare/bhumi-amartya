/**
 * Build 107 production regression hotfix — Human Design "menghitung ulang"
 * for existing / legacy users.
 *
 * Root cause (source-verified):
 *   1. Legacy `blueprints/{uid}.humanDesign` records predate the canonical
 *      `hdEngineVersion === "gaia-hd-v1"` / canonical `source` contract, so
 *      `getHdState()` classifies them FALLBACK_LABELED (historical) or, after a
 *      failed recalc, PENDING -> RETRIABLE_ERROR — never CANONICAL.
 *   2. `components/dashboard/CoreIdentity.tsx` had no resolved presentation for a
 *      recoverable stored type: FALLBACK_LABELED -> "Data historis, perlu
 *      kalkulasi ulang", PENDING -> "Menghitung...", RETRIABLE_ERROR -> "Perlu
 *      dihitung ulang" — all ignoring `hdState.type`.
 *   3. `AccuracyUpgradeBanner` / `PendingHdRecoveryBanner` persisted the result
 *      of a failed recalc (a typeless local-fallback/pending chart) OVER the
 *      user's blueprint, stripping the visible historical type and trapping the
 *      user permanently on "menghitung ulang".
 *
 * Fix: any recognized HD type converges to a resolved Identity Core value; the
 * two recalc banners only persist a canonical result; the canonical-accuracy
 * path (remote Gaia engine, background retry, /blueprint/human-design) is
 * unchanged.
 *
 * Evidence class: STRONG_UNIT (getHdState state machine) + STATIC_GUARD (rendered
 * surfaces). A rendered browser pass over the dashboard Identity Core for a
 * legacy account is the ideal final proof.
 */
import fs from "node:fs";
import { createRequire } from "node:module";

const loadModule = createRequire(`${process.cwd()}/tests/unit/build107-hd-existing-user-convergence.test.ts`);
const { getHdState, HD_PENDING_TTL_MS } = loadModule("../../lib/humandesign/hdState.ts");
const { isRecognizedHumanDesignType } = loadModule("../../lib/humandesign/hdAudit.ts");

let passed = 0;
let failed = 0;
function ok(name: string, condition: boolean) {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed += 1;
  } else {
    console.error(`FAIL: ${name}`);
    failed += 1;
  }
}

/**
 * Mirror of the Build 106 `CoreIdentity` decision (kept in lock-step with
 * components/dashboard/CoreIdentity.tsx). A source guard below asserts the
 * component still implements exactly this shape.
 */
function coreIdentityHdValue(humanDesign: unknown, pendingLabel = "Menghitung..."): string {
  const state = getHdState(humanDesign);
  const displayType = state.type === "Manifesting Generator" ? "ManGen" : state.type;
  if (isRecognizedHumanDesignType(state.type)) return displayType as string;
  if (state.state === "PENDING") return pendingLabel;
  return "Belum tersedia";
}

const STUCK_STRINGS = ["Menghitung...", "Perlu dihitung ulang", "Belum tersedia", "ManGen"];
const isStuck = (value: string) => value === "Menghitung..." || value === "Perlu dihitung ulang";

// ---------------------------------------------------------------------------
// 1. Legacy historical record with a usable type (older-user schema, no engine
//    version) converges to the type — NOT "perlu kalkulasi ulang".
// ---------------------------------------------------------------------------
{
  const legacy = { type: "Generator", status: "ready", source: "human-design-py", profile: "1/3", authority: "Sacral" };
  const state = getHdState(legacy);
  ok("legacy no-engine-version record is FALLBACK_LABELED (never CANONICAL)", state.state === "FALLBACK_LABELED");
  ok("legacy record still surfaces its recognized type", isRecognizedHumanDesignType(state.type));
  ok("Identity Core renders the historical type, not a recalculation label", coreIdentityHdValue(legacy) === "Generator" && !isStuck(coreIdentityHdValue(legacy)));
}

// ---------------------------------------------------------------------------
// 2. A prior failed recalc left a typeless local-fallback/pending record with
//    the real type in auditCandidateType. It must still resolve.
// ---------------------------------------------------------------------------
{
  const stale = new Date(Date.now() - HD_PENDING_TTL_MS - 5_000).toISOString();
  const failedFallback = {
    type: null,
    auditCandidateType: "Projector",
    status: "pending",
    calculationStatus: "pending",
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
    generatedAt: stale,
    updatedAt: stale,
    calculatedAt: stale,
  };
  const state = getHdState(failedFallback);
  ok("stale local-fallback record is non-canonical", state.state !== "CANONICAL");
  ok("stale local-fallback record still exposes the candidate type", state.type === "Projector" && isRecognizedHumanDesignType(state.type));
  ok("Identity Core resolves the candidate type instead of 'Perlu dihitung ulang'", coreIdentityHdValue(failedFallback) === "Projector");
}

// ---------------------------------------------------------------------------
// 3. Manifesting Generator historical type collapses to the "ManGen" chip.
// ---------------------------------------------------------------------------
{
  const mg = { type: "Manifesting Generator", status: "ready", source: "human-design-py" };
  ok("Manifesting Generator historical type renders as 'ManGen'", coreIdentityHdValue(mg) === "ManGen");
}

// ---------------------------------------------------------------------------
// 4. Genuinely empty / in-progress HD for a brand-new user stays "Menghitung..."
//    (legitimate; resolves via background calculation) and a hard error is an
//    honest "Belum tersedia" — neither is the regression.
// ---------------------------------------------------------------------------
{
  const fresh = { status: "pending", type: null, source: "pending", calculatedAt: new Date().toISOString() };
  ok("fresh no-type pending HD shows the calculating label", coreIdentityHdValue(fresh) === "Menghitung...");

  const errored = { status: "error", calculationStatus: "error", type: null };
  ok("hard-errored HD shows an honest unavailable, not a false type", coreIdentityHdValue(errored) === "Belum tersedia");
}

// ---------------------------------------------------------------------------
// 5. Source guards — the rendered surfaces implement the fix.
// ---------------------------------------------------------------------------
{
  const core = fs.readFileSync("components/dashboard/CoreIdentity.tsx", "utf8");
  ok("CoreIdentity imports isRecognizedHumanDesignType", /import\s*\{[^}]*isRecognizedHumanDesignType[^}]*\}\s*from\s*"@\/lib\/humandesign\/hdAudit"/.test(core));
  ok("CoreIdentity early-returns the recognized type", /if\s*\(\s*isRecognizedHumanDesignType\(hdState\.type\)\s*\)/.test(core));
  ok("CoreIdentity no longer renders 'Perlu dihitung ulang' as a value", !core.includes("Perlu dihitung ulang"));
  ok("CoreIdentity no longer renders 'perlu kalkulasi ulang' as a value", !/perlu kalkulasi ulang/i.test(core));

  for (const file of [
    "components/dashboard/AccuracyUpgradeBanner.tsx",
    "components/dashboard/PendingHdRecoveryBanner.tsx",
  ]) {
    const src = fs.readFileSync(file, "utf8");
    ok(`${file} imports isCanonicalHumanDesign`, /isCanonicalHumanDesign/.test(src) && /from\s*"@\/lib\/humandesign\/hdAudit"/.test(src));
    ok(`${file} guards the blueprint write on a canonical result`, /isCanonicalHumanDesign\(nextHD\)/.test(src));
    // Every saveUserBlueprint in these banners must be downstream of the canonical gate.
    const beforeFirstSave = src.slice(0, src.indexOf("saveUserBlueprint"));
    ok(`${file} evaluates the canonical gate before persisting`, beforeFirstSave.includes("isCanonicalHumanDesign(nextHD)"));
  }
}

void STUCK_STRINGS;

console.log(
  `\nBUILD107_HD_EXISTING_USER_CONVERGENCE_${failed === 0 ? "PASS" : "FAIL"} assertions=${passed} failed=${failed}`,
);
process.exit(failed === 0 ? 0 : 1);
