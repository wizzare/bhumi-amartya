/**
 * Build 106 — DS-2C1 source-invariant guard.
 *
 * new-user gate Invariant E (secondary path): a Firestore *read failure*
 * (permission-denied / unavailable / offline) on `users/{uid}` must stay
 * distinguishable from a genuinely absent document, so route guards send the
 * user to re-auth instead of /setup.
 *
 * `lib/repositories/userRepository.ts` `getUserProfile` already does this (it
 * lets the throw propagate and returns null only for `!exists()`). This guard
 * pins the same invariant onto `lib/firebase/service.ts` `getUserProfile`
 * (previously it caught every error and returned null), and confirms the
 * routing-relevant callers that deliberately want tolerance opt in explicitly
 * with `.catch(() => null)`.
 *
 * Behavioral error-classification (a rejected profile promise ->
 * resolveProfileLoad status "error" -> route=reauth) is covered by
 * tests/unit/auth-profile-load-outcome.test.ts.
 *
 * Evidence class: STATIC_GUARD.
 */
import fs from "node:fs";

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

const service = fs.readFileSync("lib/firebase/service.ts", "utf8");
const userRepo = fs.readFileSync("lib/repositories/userRepository.ts", "utf8");
const storageProvider = fs.readFileSync("lib/storage/storageProvider.ts", "utf8");
const resolveActiveProfile = fs.readFileSync("lib/auth/resolveActiveProfile.ts", "utf8");
const loginPage = fs.readFileSync("app/login/page.tsx", "utf8");

// --- 1. firebaseService.getUserProfile no longer swallows read errors ---------
const gupStart = service.indexOf("async getUserProfile(uid: string)");
ok("firebaseService.getUserProfile is present", gupStart !== -1);
const gupBody = service.slice(gupStart, service.indexOf("\n  }", gupStart) + 4);

// Isolate the catch block body: from `catch (error) {` to its 4-space `}` closer.
const catchOpen = gupBody.indexOf("catch (error) {");
const catchBody = catchOpen === -1 ? "" : gupBody.slice(catchOpen, gupBody.indexOf("\n    }", catchOpen));
ok(
  "DS-2C1: getUserProfile re-throws on read failure (no silent null on error)",
  catchOpen !== -1 && /throw error;/.test(catchBody),
);
ok(
  "DS-2C1: the catch block does not return null (read failure is not 'profile missing')",
  catchOpen !== -1 && !/return null/.test(catchBody),
);
ok(
  "DS-2C1: getUserProfile still returns null for a genuinely absent document",
  /if\s*\(!userDoc\.exists\(\)\)\s*\{\s*return null;/.test(gupBody),
);
ok(
  "DS-2C1: read-failure log is sanitized (name/code only, not the raw error object)",
  /read failed[\s\S]*name:\s*\(error as[\s\S]*code:\s*\(error as/.test(gupBody) &&
    !/console\.error\('Error getting user profile:', error\)/.test(gupBody),
);

// --- 2. canonical repository keeps the same contract -------------------------
const repoStart = userRepo.indexOf("const getUserProfile = async (uid: string)");
const repoBody = userRepo.slice(repoStart, userRepo.indexOf("\n};", repoStart) + 3);
ok(
  "userRepository.getUserProfile still propagates read failures (no catch)",
  repoStart !== -1 && !/catch/.test(repoBody) && /if\s*\(docSnap\.exists\(\)\)/.test(repoBody),
);

// --- 3. routing-relevant callers opt into tolerance explicitly --------------
ok(
  "storageProvider.getUserPlan tolerates read failure (.catch(() => null))",
  /getUserPlan\(\)[\s\S]*firebaseService\.getUserProfile\(uid\)\.catch\(\(\)\s*=>\s*null\)/.test(storageProvider),
);
ok(
  "storageProvider.saveUserPlan tolerates read failure (.catch(() => null))",
  /saveUserPlan\([\s\S]*firebaseService\.getUserProfile\(uid\)\.catch\(\(\)\s*=>\s*null\)/.test(storageProvider),
);
ok(
  "resolveActiveProfile feature-page fallback tolerates read failure",
  /storageProvider\.getUserProfile\(\)\.catch\(\(\)\s*=>\s*null\)/.test(resolveActiveProfile),
);
ok(
  "login page cold-mirror fallback tolerates read failure (server re-check owns routing)",
  /storageProvider\.getUserProfile\(\)\.catch\(\(\)\s*=>\s*null\)/.test(loginPage),
);

console.log(
  `\nBUILD106_DS2C1_${failed === 0 ? "PASS" : "FAIL"} assertions=${passed} failed=${failed}`,
);
process.exit(failed === 0 ? 0 : 1);
