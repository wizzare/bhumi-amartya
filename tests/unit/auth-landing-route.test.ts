/**
 * Landing-page CTA routing — real source, no local reimplementation.
 * Core invariant: a failed/timed-out profile READ must never route an existing
 * authenticated user to first-time /setup (READ ERROR != DOCUMENT MISSING).
 * STRONG_UNIT_REAL_SOURCE. Hard-fail via assertHarness.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { decideLandingCtaRoute } from "../../lib/auth/landingCtaRoute";
import { check, checkEqual, runSuite } from "../helpers/assertHarness";

const USER = { uid: "u1" };
const READ_ERRORS = [
  "Profil masih disiapkan. Silakan coba lagi.",
  "Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.",
  "Terjadi kesalahan sinkronisasi akun.",
];

function main() {
  // A — unauthenticated
  checkEqual(decideLandingCtaRoute({ authUser: null, profile: null }), "login", "A unauthenticated -> login");

  // B — authenticated + still loading -> no setup decision
  checkEqual(decideLandingCtaRoute({ authLoading: true, authUser: USER, profile: null }), "wait", "B auth + authLoading -> wait");
  checkEqual(decideLandingCtaRoute({ profileLoading: true, authUser: USER, profile: null }), "wait", "B auth + profileLoading -> wait");

  // C — profile exists, setupCompleted true
  checkEqual(decideLandingCtaRoute({ authUser: USER, profile: { setupCompleted: true } }), "dashboard", "C setupCompleted=true -> dashboard");

  // D — profile exists, setupCompleted false
  checkEqual(decideLandingCtaRoute({ authUser: USER, profile: { setupCompleted: false } }), "setup", "D setupCompleted=false -> setup");

  // E — confirmed profile missing (no error)
  checkEqual(decideLandingCtaRoute({ authUser: USER, profile: null, profileError: null }), "setup", "E confirmed missing -> setup");

  // F / G / H — profile read error / timeout / permission -> NOT setup
  for (const err of READ_ERRORS) {
    const r = decideLandingCtaRoute({ authUser: USER, profile: null, profileError: err });
    check(r !== "setup", `F/G profileError "${err.slice(0, 24)}…" must NOT route to setup (got ${r})`);
    checkEqual(r, "reauth", `F/G profileError -> reauth`);
  }
  // H — stale/null userProfile while profileError exists (same as F/G)
  checkEqual(
    decideLandingCtaRoute({ authUser: USER, profile: undefined, profileError: READ_ERRORS[0] }),
    "reauth",
    "H null profile + profileError -> reauth (NOT setup)",
  );
  // profileError must win even if a stale profile object is still around
  checkEqual(
    decideLandingCtaRoute({ authUser: USER, profile: { setupCompleted: true }, profileError: READ_ERRORS[0] }),
    "reauth",
    "H stale profile + profileError -> reauth (fail safe, not dashboard/setup)",
  );

  // I — error clears, subsequent successful read, setupCompleted true
  checkEqual(decideLandingCtaRoute({ authUser: USER, profile: { setupCompleted: true }, profileError: null }), "dashboard", "I error cleared + ok -> dashboard");

  // J — error clears, subsequent confirmed missing
  checkEqual(decideLandingCtaRoute({ authUser: USER, profile: null, profileError: null }), "setup", "J error cleared + missing -> setup");

  // ---- §8 both CTAs share this decision (no second state machine) ----
  const pageSrc = readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
  check(/decideLandingCtaRoute\(/.test(pageSrc), "app/page.tsx must call decideLandingCtaRoute");
  check(
    /const handleMulai =[\s\S]*?routeFromLandingCta\(/.test(pageSrc),
    "handleMulai must route via the shared decision helper",
  );
  check(
    /const handlePunyaAkun =[\s\S]*?routeFromLandingCta\(/.test(pageSrc),
    "handlePunyaAkun must route via the shared decision helper",
  );
  check(
    !/auth\?\.userProfile\?\.setupCompleted[\s\S]{0,80}router\.push\("\/setup"\)/.test(pageSrc),
    "app/page.tsx must NOT keep the raw `setupCompleted ? … : router.push('/setup')` CTA branch",
  );
  // §9 — automatic redirect stays guarded on the positive case only
  check(
    /auth\?\.userProfile\?\.setupCompleted\)\s*\{[\s\S]{0,120}router\.replace\("\/dashboard"\)/.test(pageSrc),
    "automatic landing redirect must still fire only when setupCompleted (no setup branch)",
  );
  check(
    !/\[LANDING AUTO-REDIRECT\][\s\S]{0,200}router\.replace\("\/setup"\)/.test(pageSrc),
    "automatic landing redirect must never send to /setup",
  );

  console.log("AUTH_LANDING_ROUTE_MATRIX_PASS");
}

runSuite("auth-landing-route", main);
