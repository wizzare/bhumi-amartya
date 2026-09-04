/**
 * Build 107 production regression hotfix — production-surface guard.
 *
 * Two internal surfaces survived the Build 106 release and reached the shipped
 * production UI:
 *   - the legacy in-app Admin console (`/admin`, `/admin/activity`)
 *   - the Auth Diagnostics page (`/admin/diagnostics`)
 * both linked from the "Lainnya" menu for any privileged account.
 *
 * Founder directive: ADMIN AUTHORIZATION = KEEP, ADMIN PAGE / MENU EXPOSURE =
 * REMOVE; anything not intended for end users must not ship as a usable
 * production surface. This guard asserts:
 *   1. `components/navigation/AppNav.tsx` exposes NO admin / diagnostics entry
 *      and no longer resolves a privileged role at all.
 *   2. Every app/admin route is gated by isAdminUiExposed() so a production
 *      build (which pins NEXT_PUBLIC_ENABLE_ADMIN_UI=false) cannot render it
 *      even by direct navigation.
 *   3. scripts/run-prod-build.mjs pins the flag off.
 *   4. Admin AUTHORIZATION primitives are untouched.
 *   5. Every page.tsx under app/ is classified — a new unclassified route trips
 *      this guard so the next accidental surface is caught before release.
 *   6. The obsolete orphan routes removed in Build 107 (/status /test /roadmap
 *      /changelog /onboarding) stay deleted.
 *
 * Evidence class: STATIC_GUARD. A rendered pass over the "Lainnya" menu and a
 * direct-navigation attempt to `/admin/activity` on a production build are the
 * ideal final proof.
 */
import fs from "node:fs";
import path from "node:path";

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

// Strip comments so a rule-citing comment cannot trip a source guard.
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

// ---------------------------------------------------------------------------
// 1. The "Lainnya" navigation carries product surfaces only.
// ---------------------------------------------------------------------------
{
  const nav = stripComments(fs.readFileSync("components/navigation/AppNav.tsx", "utf8"));
  ok("AppNav has no /admin href", !/["']\/admin(\/|["'])/.test(nav));
  ok("AppNav has no 'Admin' menu item", !/label:\s*["']Admin["']/.test(nav));
  ok("AppNav has no 'Auth Diagnostics' menu item", !/label:\s*["']Auth Diagnostics["']/.test(nav) && !/\/admin\/diagnostics/.test(nav));
  ok("AppNav no longer imports a privileged-role check", !/hasPrivilegedPageAccessForUid/.test(nav) && !/from\s*["']@\/lib\/auth\/privilegedUser["']/.test(nav));
  ok("AppNav no longer reads the auth context for gating", !/\buseAuth\b/.test(nav));
}

// ---------------------------------------------------------------------------
// 2. Every app/admin/* route is behind the production exposure gate.
// ---------------------------------------------------------------------------
{
  const gate = fs.readFileSync("lib/config/adminUiExposure.ts", "utf8");
  ok("adminUiExposure gate reads NEXT_PUBLIC_ENABLE_ADMIN_UI", /NEXT_PUBLIC_ENABLE_ADMIN_UI/.test(gate) && /=== "true"/.test(gate));

  for (const file of ["app/admin/page.tsx", "app/admin/activity/page.tsx", "app/admin/diagnostics/page.tsx"]) {
    const src = fs.readFileSync(file, "utf8");
    ok(`${file} imports isAdminUiExposed`, /isAdminUiExposed/.test(src) && /@\/lib\/config\/adminUiExposure/.test(src));
    ok(`${file} redirects to /dashboard when the admin UI is not exposed`, /router\.replace\(\s*["']\/dashboard["']\s*\)/.test(src) || /isAdminUiExposed\(\)\s*\?\s*["']\/admin\/activity["']\s*:\s*["']\/dashboard["']/.test(src));
  }

  const activity = fs.readFileSync("app/admin/activity/page.tsx", "utf8");
  const diagnostics = fs.readFileSync("app/admin/diagnostics/page.tsx", "utf8");
  ok("admin/activity conjoins the exposure gate with the role check", /adminUiExposed\s*&&\s*hasPrivilegedPageAccessForUid/.test(activity));
  ok("admin/diagnostics conjoins the exposure gate with the role check", /adminUiExposed\s*&&\s*hasPrivilegedPageAccessForUid/.test(diagnostics));
}

// ---------------------------------------------------------------------------
// 3. The deterministic production build pins the flag off.
// ---------------------------------------------------------------------------
{
  const prodBuild = fs.readFileSync("scripts/run-prod-build.mjs", "utf8");
  ok("run-prod-build pins NEXT_PUBLIC_ENABLE_ADMIN_UI: 'false'", /NEXT_PUBLIC_ENABLE_ADMIN_UI:\s*'false'/.test(prodBuild));
}

// ---------------------------------------------------------------------------
// 4. Admin AUTHORIZATION is preserved (KEEP).
// ---------------------------------------------------------------------------
{
  const privileged = fs.readFileSync("lib/auth/privilegedUser.ts", "utf8");
  ok("privilegedUser still resolves founder/admin/dev_admin from Firestore role fields", /resolvePrivilegedRole/.test(privileged) && /"admin"/.test(privileged) && /guardianRole/.test(privileged));
  ok("requireFounder server guard still present", fs.existsSync("lib/auth/requireFounder.ts"));
  ok("admin continuity contract still present", fs.existsSync("lib/auth/adminContinuity.ts"));
  ok("firestore.rules still present", fs.existsSync("firestore.rules"));
  const entitlement = fs.readFileSync("lib/billing/entitlementService.ts", "utf8");
  ok("admin lifetime entitlement path still present", /admin/i.test(entitlement));
}

// ---------------------------------------------------------------------------
// 5. Route classification — every app/**/page.tsx must be accounted for.
// ---------------------------------------------------------------------------
type SurfaceClass = "PRODUCT" | "ADMIN_BACKEND_ONLY" | "DEV_ONLY" | "DEPRECATED";
const ROUTE_CLASSIFICATION: Record<string, SurfaceClass> = {
  "app/page.tsx": "PRODUCT",
  "app/login/page.tsx": "PRODUCT",
  "app/setup/page.tsx": "PRODUCT",
  "app/dashboard/page.tsx": "PRODUCT",
  "app/dashboard/environment/page.tsx": "PRODUCT",
  "app/profile/page.tsx": "PRODUCT",
  "app/profile/[section]/page.tsx": "PRODUCT",
  "app/wellness/page.tsx": "PRODUCT",
  "app/wellness-assessment/page.tsx": "PRODUCT",
  "app/insights/page.tsx": "PRODUCT",
  "app/journal/page.tsx": "PRODUCT",
  "app/journey/page.tsx": "PRODUCT",
  "app/journey/[id]/page.tsx": "PRODUCT",
  "app/inbox/page.tsx": "PRODUCT",
  "app/meditation/page.tsx": "PRODUCT",
  "app/settings/page.tsx": "PRODUCT",
  "app/premium-bhumi/page.tsx": "PRODUCT",
  "app/upgrade/page.tsx": "PRODUCT",
  "app/reports/weekly/page.tsx": "PRODUCT",
  "app/bantuan/page.tsx": "PRODUCT",
  "app/kontak/page.tsx": "PRODUCT",
  "app/tentang/page.tsx": "PRODUCT",
  "app/syarat-ketentuan/page.tsx": "PRODUCT",
  "app/kebijakan-privasi/page.tsx": "PRODUCT",
  "app/kenali-diri/aura/page.tsx": "PRODUCT",
  "app/healing/page.tsx": "PRODUCT",
  "app/healing/audio/page.tsx": "PRODUCT",
  "app/healing/meditation/page.tsx": "PRODUCT",
  "app/innerwork/page.tsx": "PRODUCT",
  "app/innerwork/audio-healing/page.tsx": "PRODUCT",
  "app/innerwork/herbal/page.tsx": "PRODUCT",
  "app/innerwork/journaling/page.tsx": "PRODUCT",
  "app/innerwork/manifestasi/page.tsx": "PRODUCT",
  "app/innerwork/meditation/page.tsx": "PRODUCT",
  "app/innerwork/workout/page.tsx": "PRODUCT",
  "app/innerwork/yoga/page.tsx": "PRODUCT",
  "app/blueprint/page.tsx": "PRODUCT",
  "app/blueprint/astrocartography/page.tsx": "PRODUCT",
  "app/blueprint/bazi/page.tsx": "PRODUCT",
  "app/blueprint/destiny-matrix/page.tsx": "PRODUCT",
  "app/blueprint/human-design/page.tsx": "PRODUCT",
  "app/blueprint/natal-chart/page.tsx": "PRODUCT",
  "app/blueprint/numerology/page.tsx": "PRODUCT",
  "app/blueprint/tzolkin/page.tsx": "PRODUCT",
  "app/blueprint/vedic/page.tsx": "PRODUCT",
  "app/blueprint/weton/page.tsx": "PRODUCT",
  "app/blueprint/whole-sign/page.tsx": "PRODUCT",
  "app/blueprint/zi-wei/page.tsx": "PRODUCT",
  // Admin console — code retained for an internal web/dev console, gated off in
  // the shipped app by isAdminUiExposed().
  "app/admin/page.tsx": "ADMIN_BACKEND_ONLY",
  "app/admin/activity/page.tsx": "ADMIN_BACKEND_ONLY",
  "app/admin/diagnostics/page.tsx": "DEV_ONLY",
};

// Build 107: obsolete orphan routes removed outright (stale internal/marketing
// stubs — e.g. /status showed "Version Code 45 / BHUMI V3 FANTA"). They were
// not linked or deep-linked; they must stay gone.
const REMOVED_OBSOLETE_ROUTES = [
  "app/status/page.tsx",
  "app/test/page.tsx",
  "app/roadmap/page.tsx",
  "app/changelog/page.tsx",
  "app/onboarding/page.tsx",
];
for (const route of REMOVED_OBSOLETE_ROUTES) {
  ok(`obsolete route removed: ${route}`, !fs.existsSync(route));
}
ok("AuditReadiness (only used by the removed /status page) is gone", !fs.existsSync("components/audit/AuditReadiness.tsx"));

function listPageRoutes(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listPageRoutes(full, acc);
    else if (entry.name === "page.tsx") acc.push(full.split(path.sep).join("/"));
  }
  return acc;
}

const discovered = listPageRoutes("app").sort();
for (const route of discovered) {
  ok(`route classified: ${route}`, route in ROUTE_CLASSIFICATION);
}
for (const known of Object.keys(ROUTE_CLASSIFICATION)) {
  ok(`classified route still exists: ${known}`, discovered.includes(known));
}

// No PRODUCT route may sit under app/admin/.
for (const [route, cls] of Object.entries(ROUTE_CLASSIFICATION)) {
  if (route.startsWith("app/admin/")) {
    ok(`${route} is not classified PRODUCT`, cls !== "PRODUCT");
  }
}

console.log(
  `\nBUILD107_PRODUCTION_SURFACE_GUARD_${failed === 0 ? "PASS" : "FAIL"} assertions=${passed} failed=${failed}`,
);
process.exit(failed === 0 ? 0 : 1);
