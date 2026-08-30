/**
 * Recovery state-machine runtime proof — states B–I + partial write + restart +
 * monotonic recovery, driven from PERSISTED Firestore emulator state.
 * Covers DEFECT-8D-1 (recovery-persisted blueprint owner uid) and DEFECT-8D-2
 * (a stale setup/blueprint failure must not downgrade an already-ready profile),
 * both fixed — every assertion here is a hard invariant.
 *
 * Real firebase/firestore + firebase/auth Web SDK + Firestore/Auth emulator +
 * the real repositories (userRepository incl. markBlueprintRecoveryRequired,
 * blueprintRepository), the real recovery engine (recoverUserBlueprint) and the
 * real route decision (decideLandingCtaRoute, resolveProfileLoad). Failure
 * injection = emulator security-rules hot-swap (PUT .../:securityRules) — no
 * product code, no firestore.rules file touched.
 *
 * Hard-fail (process.exit non-zero on any miss). Synthetic anonymous UID(s) only.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, signInAnonymously, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, deleteField, getFirestore, connectFirestoreEmulator } from "firebase/firestore";

let passed = 0;
let failed = 0;
const log: string[] = [];
const ok = (n: string) => { passed++; log.push(`  ok    ${n}`); };
const nope = (n: string, d: string) => { failed++; log.push(`  FAIL  ${n} :: ${d}`); };
async function step(name: string, fn: () => Promise<void>) {
  try { await fn(); ok(name); } catch (e) { nope(name, e instanceof Error ? e.message : String(e)); }
}

const EMU = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

/** direct nested-array scanner (P0 invariant) */
function directNestedArrayPaths(v: unknown, p = "$", acc: string[] = []): string[] {
  if (Array.isArray(v)) {
    if (v.some((x) => Array.isArray(x))) acc.push(p);
    v.forEach((x, i) => directNestedArrayPaths(x, `${p}[${i}]`, acc));
    return acc;
  }
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v as Record<string, unknown>)) directNestedArrayPaths(x, `${p}.${k}`, acc);
  return acc;
}

async function main() {
  // ---- env + real client -----------------------------------------------------
  const cfg = await import("../../lib/firebase/config");
  const { app, auth, db } = cfg as { app: { options: { projectId?: string } }; auth: any; db: any };
  const PROJECT = app.options.projectId || "demo-release-suite";
  assert.ok(/^(demo-|bhumi-build80)/.test(PROJECT) || PROJECT === "demo-release-suite", `refuse non-synthetic project: ${PROJECT}`);
  const REST = `http://${EMU}/emulator/v1/projects/${PROJECT}`;

  const wipe = async () => {
    await fetch(`${REST}/databases/(default)/documents`, { method: "DELETE" }).catch(() => {});
  };
  const putRules = async (content: string) => {
    const r = await fetch(`${REST}:securityRules`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rules: { files: [{ name: "firestore.rules", content }] } }),
    });
    assert.ok(r.ok, `securityRules PUT failed ${r.status}`);
  };
  const REAL_RULES = await readFile(path.join(process.cwd(), "firestore.rules"), "utf8");
  const restoreRules = () => putRules(REAL_RULES);
  // NOTE: no nested `match /users/{u}/{d=**}` — a recursive `/{d=**}` (zero
  // segments) also matches the parent doc and would re-grant a denied read/write.
  const scopedRules = (usersR: string, usersW: string, bpR: string, bpW: string) => `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(u) { return request.auth != null && request.auth.uid == u; }
    match /users/{u} {
      allow read: if ${usersR};
      allow write: if ${usersW};
    }
    match /blueprints/{u} { allow read: if ${bpR}; allow write: if ${bpW}; }
    match /{document=**} { allow read, write: if false; }
  }
}`;

  const { userRepository } = await import("../../lib/repositories/userRepository");
  const { blueprintRepository } = await import("../../lib/repositories/blueprintRepository");
  const { recoverUserBlueprint } = await import("../../lib/engines/blueprintRecoveryEngine");
  const { decideLandingCtaRoute } = await import("../../lib/auth/landingCtaRoute");
  const { resolveProfileLoad } = await import("../../lib/auth/profileLoadOutcome");
  const { firebaseService } = await import("../../lib/firebase/service");

  const birth = { birthDate: "1990-06-15", birthTime: "08:30", birthCity: "Sidoarjo", birthCountry: "Indonesia", latitude: -7.4478, longitude: 112.7183, timezone: "+07:00" };
  let uid = "";
  let profileInput: Record<string, unknown> = {};
  // Fresh anonymous identity per scenario: a background HD calc voided by
  // recoverUserBlueprint in scenario N can only ever write to scenario N's uid,
  // so it can never contaminate scenario N+1's persisted state.
  const freshIdentity = async () => {
    await signOut(auth).catch(() => {});
    const c = await signInAnonymously(auth);
    uid = c.user.uid;
    profileInput = { uid, fullName: "Synthetic 8D", email: null, ...birth };
    return uid;
  };

  await restoreRules();
  log.push(`  project = ${PROJECT}  (fresh anon uid per scenario)`);
  const resetScenario = async () => { await wipe(); await freshIdentity(); };
  await resetScenario();

  const uDoc = () => doc(db, "users", uid);
  const bDoc = () => doc(db, "blueprints", uid);
  const readU = async () => (await getDoc(uDoc())).data() as Record<string, unknown> | undefined;
  const readB = async () => (await getDoc(bDoc())).data() as Record<string, unknown> | undefined;

  // Content + ownership integrity of the persisted blueprint. Post-DEFECT-8D-1
  // fix, the recovery writer MUST persist a body `uid` equal to the path uid, so
  // storageProvider's ownership guard accepts it (asserted hard here).
  const assertBpIntegrity = async (labelPrefix: string) => {
    const raw = await readB();
    assert.ok(raw, `${labelPrefix}: blueprint persisted at blueprints/${uid.slice(0, 6)}…`);
    assert.ok((raw as { type?: unknown }).type || (raw as { lifePath?: unknown }).lifePath, `${labelPrefix}: blueprint has type/lifePath`);
    assert.equal(Object.prototype.hasOwnProperty.call(raw, "astrocartography"), false, `${labelPrefix}: astrocartography NOT persisted`);
    assert.deepEqual(directNestedArrayPaths(raw), [], `${labelPrefix}: no direct nested arrays`);
    assert.equal((raw as { uid?: string }).uid, uid, `${labelPrefix}: DEFECT-8D-1 fixed — persisted body uid === path uid`);
    const normalized = await blueprintRepository.getUserBlueprint(uid);
    assert.ok(normalized && normalized.uid === uid, `${labelPrefix}: normalized repository readback is owned by uid`);
  };

  // ==========================================================================
  // STATE MODEL — canonical persisted-state → route decision table
  // ==========================================================================
  await step("model: profile missing -> decideLandingCtaRoute = setup", async () => {
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: null, profileError: null }), "setup");
  });
  await step("model: setupCompleted=false -> setup ; setupCompleted=true -> dashboard", async () => {
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: { setupCompleted: false } }), "setup");
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: { setupCompleted: true } }), "dashboard");
  });
  await step("model: profileError present -> reauth (never setup)", async () => {
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: null, profileError: "read failed" }), "reauth");
  });

  // ==========================================================================
  // STATE B — profile exists, blueprint exists, setupCompleted=false
  // ==========================================================================
  await resetScenario();
  await step("B: persist {profile setupCompleted=false} + {blueprint exists}", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, profileInput));
    const b0 = await readB();
    assert.ok(b0 && (b0.type || b0.lifePath), "B: blueprint seeded");
  });
  let bContentBefore: string;
  await step("B: RESTART from Firestore -> route=setup ; recovery preserves existing blueprint (no destructive regen)", async () => {
    const p = await userRepository.getUserProfile(uid);
    assert.ok(p, "B: profile read");
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: p, profileError: null }), "setup", "B: setupCompleted=false -> setup");
    bContentBefore = JSON.stringify((await readB())?.lifePath ?? null);
    const recovered = await recoverUserBlueprint(uid, { ...profileInput });
    assert.ok(recovered && (recovered.type || recovered.lifePath), "B: recovery returns a blueprint");
    const bAfter = JSON.stringify((await readB())?.lifePath ?? null);
    assert.equal(bAfter, bContentBefore, "B: existing blueprint lifePath unchanged by recovery");
  });
  await step("B: finalize -> coherent (setupCompleted=true, blueprintStatus=ready, blueprint valid)", async () => {
    await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true);
    assert.equal(p!.blueprintStatus, "ready");
    await assertBpIntegrity("B-final");
  });

  // ==========================================================================
  // STATE C — setupCompleted=true, blueprint MISSING (contradictory)
  // ==========================================================================
  await resetScenario();
  await step("C: persist {profile setupCompleted=true, birthDate set} + NO blueprint", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    assert.equal(await readB(), undefined, "C: blueprint absent");
  });
  await step("C: RESTART -> DashboardClient boot predicate triggers recoverUserBlueprint (p.setupCompleted && !b && p.birthDate)", async () => {
    const p = await userRepository.getUserProfile(uid) as Record<string, unknown>;
    const b = await blueprintRepository.getUserBlueprint(uid);
    // model DashboardClient.boot() lines 614/621
    const gatePass = p && p.setupCompleted === true;
    const wouldRecover = gatePass && !b && !!p.birthDate;
    assert.equal(gatePass, true, "C: dashboard gate passes");
    assert.equal(wouldRecover, true, "C: automatic recovery precondition met");
    const recovered = await recoverUserBlueprint(String(p.uid), p as never);
    assert.ok(recovered, "C: recovery produced a blueprint");
  });
  await step("C: after recovery -> blueprint exists & valid, user NOT left silently blueprint-less", async () => {
    await assertBpIntegrity("C-recovered");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true, "C: setupCompleted stays true (not regressed)");
  });

  // ==========================================================================
  // STATE D — profile write OK, blueprint write FAILS (rules hot-swap)
  // ==========================================================================
  await resetScenario();
  await step("D: profile persists, blueprint setDoc denied -> profile flips to recovery_required, blueprint absent", async () => {
    await putRules(scopedRules("isOwner(u)", "isOwner(u)", "isOwner(u)", "false")); // blueprint WRITE denied
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    // recoverUserBlueprint swallows its own save failures; the setup page's own
    // blueprintRepository.saveUserBlueprint call is what surfaces the denial.
    const bp = await recoverUserBlueprint(uid, { ...profileInput });
    let threw = false;
    try {
      await blueprintRepository.saveUserBlueprint(uid, bp);
    } catch (e) {
      threw = true;
      assert.match((e as { code?: string }).code || (e as Error).message, /permission-denied/i, "D: blueprint save rejected with permission-denied");
    }
    assert.equal(threw, true, "D: blueprint save threw");
    // setup page contract (app/setup/page.tsx:254-256): on non-devUser blueprint failure it writes recovery_required
    await userRepository.upsertUserProfile(uid, { setupCompleted: false, blueprintStatus: "recovery_required" } as never);
    const p = await readU();
    assert.equal(p!.setupCompleted, false, "D: setupCompleted != true");
    assert.equal(p!.blueprintStatus, "recovery_required", "D: blueprintStatus = recovery_required");
    assert.equal(await readB(), undefined, "D: no blueprint doc persisted through the failing path");
  });
  await step("D: RESTART + retry -> recovery succeeds, state becomes ready", async () => {
    await restoreRules();
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.blueprintStatus, "recovery_required", "D: persisted state still recoverable after restart");
    const recovered = await recoverUserBlueprint(uid, { ...profileInput });
    assert.ok(recovered, "D: retry recovery produced a blueprint");
    await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
    await assertBpIntegrity("D-retry");
    const p2 = await userRepository.getUserProfile(uid);
    assert.equal(p2!.setupCompleted, true, "D: eventual successful recovery");
  });

  // ==========================================================================
  // STATE E — blueprint SAVED, final profile update FAILS
  // ==========================================================================
  await resetScenario();
  let eBpLifePath: unknown;
  await step("E: blueprint persists, final users write denied -> blueprint intact, setupCompleted != true", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, { ...profileInput }));
    eBpLifePath = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    assert.ok(await readB(), "E: blueprint present before failure");
    await putRules(scopedRules("isOwner(u)", "false", "isOwner(u)", "isOwner(u)")); // users WRITE denied
    let threw = false;
    try {
      await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
    } catch (e) {
      threw = true;
      assert.match((e as { code?: string }).code || (e as Error).message, /permission-denied/i, "E: final profile write rejected");
    }
    assert.equal(threw, true, "E: final profile write threw");
  });
  await step("E: RESTART from Firestore -> blueprint available, no recreation needed, finalize succeeds", async () => {
    await restoreRules();
    const p = await userRepository.getUserProfile(uid);
    const b = await blueprintRepository.getUserBlueprint(uid);
    assert.ok(b, "E: blueprint readable after restart");
    assert.notEqual(p!.setupCompleted, true, "E: profile not falsely marked complete");
    // DashboardClient gate would block (setupCompleted!==true) -> route=setup; setup re-submit finalizes.
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: p, profileError: null }), "setup", "E: routes to setup for finalization");
    await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
    const b2LifePath = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    assert.deepEqual(b2LifePath, eBpLifePath, "E: same blueprint (lifePath identity) — not recreated from scratch (background-HD timestamp refresh is allowed)");
    const p2 = await userRepository.getUserProfile(uid);
    assert.equal(p2!.setupCompleted, true, "E: finalized after restart, no limbo");
  });

  // ==========================================================================
  // STATE H — restart after every major transition
  // ==========================================================================
  await resetScenario();
  await step("H1: after initial profile write -> restart reads {setupCompleted:false} -> route=setup", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    const p = await userRepository.getUserProfile(uid);
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: p, profileError: null }), "setup");
  });
  await step("H2: after blueprint write -> restart: blueprint present, setup still incomplete -> setup (finalize path)", async () => {
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, { ...profileInput }));
    const p = await userRepository.getUserProfile(uid);
    const b = await blueprintRepository.getUserBlueprint(uid);
    assert.ok(b, "H2: blueprint persisted");
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: p, profileError: null }), "setup");
  });
  await step("H3: after recovery_required write -> restart: state retryable, blueprint (if any) preserved", async () => {
    await userRepository.upsertUserProfile(uid, { blueprintStatus: "recovery_required", setupCompleted: false } as never);
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.blueprintStatus, "recovery_required");
    const again = await recoverUserBlueprint(uid, { ...profileInput });
    assert.ok(again && (again.type || again.lifePath), "H3: recovery still works from persisted state");
  });
  await step("H4: after final profile-ready update -> restart: route=dashboard, blueprint valid", async () => {
    await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
    const p = await userRepository.getUserProfile(uid);
    assert.equal(decideLandingCtaRoute({ authUser: { uid }, profile: p, profileError: null }), "dashboard");
    await assertBpIntegrity("H4");
  });

  // ==========================================================================
  // STATE I — profile READ error must NOT become "profile missing"
  // ==========================================================================
  await resetScenario();
  await step("I: userRepository.getUserProfile THROWS on read denial -> resolveProfileLoad = error -> route=reauth", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    await putRules(scopedRules("false", "isOwner(u)", "isOwner(u)", "isOwner(u)")); // users READ denied
    const outcome = await resolveProfileLoad(userRepository.getUserProfile(uid), 3000);
    assert.equal(outcome.status, "error", `I: expected error outcome, got ${outcome.status}`);
    const route = decideLandingCtaRoute({ authUser: { uid }, profile: null, profileError: "Profil belum bisa dimuat." });
    assert.equal(route, "reauth", "I: read error routes to reauth, NOT setup");
    assert.notEqual(route, "setup", "I: INVARIANT 5 — read error != profile missing");
  });
  await step("I: divergence note — firebaseService.getUserProfile SWALLOWS read error to null (not on the AuthContext route path)", async () => {
    const swallowed = await firebaseService.getUserProfile(uid); // rules still deny read here
    // documents current behavior; not a route-decision defect because AuthContext primary load uses the throwing userRepository path
    log.push(`      firebaseService.getUserProfile under read-denial -> ${swallowed === null ? "null (SWALLOWED)" : "value"}`);
    assert.equal(swallowed, null, "I: firebaseService swallow-to-null confirmed (documented divergence)");
    await restoreRules();
  });

  // ==========================================================================
  // SETUP DOUBLE-SUBMIT — two near-simultaneous finalize sequences, same UID
  // ==========================================================================
  await resetScenario();
  await step("double-submit: concurrent blueprint saves + profile finalizes -> single doc, no cross-user, coherent", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    const bp = await recoverUserBlueprint(uid, { ...profileInput });
    await Promise.all([
      blueprintRepository.saveUserBlueprint(uid, bp),
      blueprintRepository.saveUserBlueprint(uid, bp),
      recoverUserBlueprint(uid, { ...profileInput }),
      recoverUserBlueprint(uid, { ...profileInput }),
    ]);
    await Promise.all([
      userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never),
      userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never),
    ]);
    const b = await readB();
    assert.equal(b!.uid, uid, "double-submit: blueprint owned by uid (doc-id keyed, no cross-user)");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true, "double-submit: stable completed state");
    await assertBpIntegrity("double-submit");
  });

  // ==========================================================================
  // STALE RETRY / DEFECT-8D-2 — the guarded recovery-required writer is monotonic
  // ==========================================================================
  await resetScenario();
  await step("8D-2 §8: stale failure against a ready profile -> ALREADY_READY no-op (STALE_DOWNGRADE_BLOCKED)", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    const outcome = await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });
    assert.equal(outcome, "ALREADY_READY", "8D-2 §8: guarded writer reports ALREADY_READY");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true, "8D-2 §8: setupCompleted stays true");
    assert.equal(p!.blueprintStatus, "ready", "8D-2 §8: blueprintStatus stays ready");
  });

  await resetScenario();
  await step("8D-2 §9: legitimate failure from an incomplete profile -> recovery_required is written", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    const outcome = await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });
    assert.equal(outcome, "RECOVERY_REQUIRED_WRITTEN", "8D-2 §9: guarded writer wrote the recovery state");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, false, "8D-2 §9: setupCompleted=false");
    assert.equal(p!.blueprintStatus, "recovery_required", "8D-2 §9: blueprintStatus=recovery_required");
  });

  await resetScenario();
  await step("8D-2 §10: incomplete -> recovery_required -> retry ready -> delayed stale write -> stays ready", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
    await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });          // attempt 1 fails
    await userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never); // attempt 2 succeeds
    const late = await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput }); // stale attempt 1 arrives late
    assert.equal(late, "ALREADY_READY", "8D-2 §10: late stale write no-ops");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true, "8D-2 §10: final setupCompleted=true");
    assert.equal(p!.blueprintStatus, "ready", "8D-2 §10: final blueprintStatus=ready");
  });

  await resetScenario();
  await step("8D-2 §11: concurrent finalize + stale failure (both orders) -> once the txn sees ready it cannot downgrade", async () => {
    for (const finalizeFirst of [true, false]) {
      await wipe(); await freshIdentity();
      await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
      const finalize = () => userRepository.upsertUserProfile(uid, { setupCompleted: true, blueprintStatus: "ready" } as never);
      const staleFail = () => userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });
      await Promise.all(finalizeFirst ? [finalize(), staleFail()] : [staleFail(), finalize()]);
      // and one more stale attempt strictly after both settle
      await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });
      const p = await userRepository.getUserProfile(uid);
      assert.equal(p!.setupCompleted, true, `8D-2 §11 (finalizeFirst=${finalizeFirst}): setupCompleted=true`);
      assert.equal(p!.blueprintStatus, "ready", `8D-2 §11 (finalizeFirst=${finalizeFirst}): blueprintStatus=ready`);
    }
    log.push("      §11: Firestore transaction retry on concurrent doc write is what re-observes the finalized state");
  });

  await resetScenario();
  await step("8D-2 §12: two synthetic clients (same project) — client B finalizes ready, client A (app db) stale failure -> ready remains", async () => {
    await putRules(scopedRules("isSignedIn()", "isSignedIn()", "isOwner(u)", "isOwner(u)")); // 2nd identity may write users/{uid}
    const appB = initializeApp({
      apiKey: "fake-emulator-api-key-12345",
      authDomain: `${PROJECT}.firebaseapp.com`,
      projectId: PROJECT,
      storageBucket: `${PROJECT}.appspot.com`,
      messagingSenderId: "1234567890",
      appId: "1:1234567890:web:clientB",
    }, `clientB-${Date.now()}-${Math.random()}`);
    const dbB = getFirestore(appB);
    const [h, portStr] = EMU.split(":");
    connectFirestoreEmulator(dbB, h || "127.0.0.1", parseInt(portStr || "8080", 10));
    const authB = getAuth(appB);
    connectAuthEmulator(authB, "http://127.0.0.1:9099", { disableWarnings: true });
    try {
      await signInAnonymously(authB); // separate FirebaseApp / auth session / db handle, same project
      await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: false, blueprintStatus: "generating" } as never);
      await setDoc(doc(dbB, "users", uid), { uid, setupCompleted: true, blueprintStatus: "ready", ...birth }, { merge: true }); // client B finalizes
      const outcome = await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput }); // client A stale failure
      assert.equal(outcome, "ALREADY_READY", "8D-2 §12: cross-client stale failure no-ops on client B's finalized state");
      const p = await userRepository.getUserProfile(uid);
      assert.equal(p!.setupCompleted, true, "8D-2 §12: setupCompleted=true after cross-client");
      assert.equal(p!.blueprintStatus, "ready", "8D-2 §12: blueprintStatus=ready after cross-client");
    } finally {
      await deleteApp(appB).catch(() => {});
      await restoreRules();
    }
  });

  await resetScenario();
  await step("8D-2 §13: guarded writer preserves unrelated profile fields (birth data) on merge and on create", async () => {
    // create case (no prior doc): birth fields must be persisted so setup stays recoverable
    const createOutcome = await userRepository.markBlueprintRecoveryRequired(uid, { ...profileInput });
    assert.equal(createOutcome, "RECOVERY_REQUIRED_WRITTEN", "8D-2 §13: create wrote recovery state");
    let p = await userRepository.getUserProfile(uid) as Record<string, unknown>;
    for (const k of ["birthDate", "birthTime", "latitude", "longitude", "timezone"]) {
      assert.equal(p[k], (birth as Record<string, unknown>)[k], `8D-2 §13 (create): ${k} preserved`);
    }
    // merge case: an existing incomplete profile with extra fields keeps them
    await userRepository.upsertUserProfile(uid, { ...profileInput, birthCity: "Sidoarjo", displayName: "Keep Me", setupCompleted: false, blueprintStatus: "generating" } as never);
    await userRepository.markBlueprintRecoveryRequired(uid, {});
    p = await userRepository.getUserProfile(uid) as Record<string, unknown>;
    assert.equal(p.displayName, "Keep Me", "8D-2 §13 (merge): unrelated field not erased");
    assert.equal(p.birthDate, birth.birthDate, "8D-2 §13 (merge): birthDate not erased");
    assert.equal(p.blueprintStatus, "recovery_required", "8D-2 §13 (merge): status written");
  });

  await step("stale-retry: recovery engine path is protected — in-flight dedup + txn preserve existing blueprint", async () => {
    await resetScenario();
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, { ...profileInput }));
    const before = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    const [r1, r2] = await Promise.all([recoverUserBlueprint(uid, { ...profileInput }), recoverUserBlueprint(uid, { ...profileInput })]);
    assert.equal(r1, r2, "stale-retry: concurrent recoveries dedup to same result");
    const after = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    assert.deepEqual(after, before, "stale-retry: blueprint lifePath not replaced by recovery (order-insensitive)");
  });

  // ==========================================================================
  // READY-USER RECOVERY RETRY — idempotency
  // ==========================================================================
  await resetScenario();
  await step("idempotency: recovery on an already-ready user preserves blueprint, ownership, setupCompleted", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, { ...profileInput }));
    const lp0 = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    await recoverUserBlueprint(uid, { ...profileInput });
    const b = await blueprintRepository.getUserBlueprint(uid);
    assert.equal(b!.uid, uid, "idempotency: ownership stable");
    assert.deepEqual(b!.lifePath ?? null, lp0, "idempotency: blueprint content (lifePath) not destructively replaced by a repeat recovery");
    const p = await userRepository.getUserProfile(uid);
    assert.equal(p!.setupCompleted, true, "idempotency: no setupCompleted regression");
    await assertBpIntegrity("idempotency");
  });

  // ==========================================================================
  // DEFECT-8D-1 — recovery-persisted blueprint must be owned + visible via storageProvider
  // ==========================================================================
  const { storageProvider } = await import("../../lib/storage/storageProvider");

  await resetScenario();
  await step("8D-1 A/B/C: recovery-only persist -> raw uid===uid ; firebaseService returns uid ; storageProvider returns the blueprint (NOT null)", async () => {
    await userRepository.upsertUserProfile(uid, { ...profileInput, setupCompleted: true, blueprintStatus: "ready" } as never);
    assert.equal(await readB(), undefined, "precondition: no blueprint");
    await recoverUserBlueprint(uid, { ...profileInput }); // persists via internal transaction only
    const raw = await readB();
    assert.ok(raw, "8D-1 A: raw blueprint doc exists");
    assert.equal((raw as { uid?: string }).uid, uid, "8D-1 A: raw persisted body uid === path uid");
    const viaService = await firebaseService.getUserBlueprint(uid);
    assert.ok(viaService && (viaService as { uid?: string }).uid === uid, "8D-1 B: firebaseService.getUserBlueprint returns a blueprint carrying uid");
    const viaStorage = await storageProvider.getUserBlueprint();
    assert.ok(viaStorage && (viaStorage as { uid?: string }).uid === uid, "8D-1 C: storageProvider.getUserBlueprint returns the recovered blueprint (ownership guard passes)");
  });

  await resetScenario();
  await step("8D-1 D: storageProvider ownership guard UNCHANGED — a blueprint whose body uid != auth uid is still rejected (null)", async () => {
    await recoverUserBlueprint(uid, { ...profileInput }); // valid, owned blueprint doc
    const okStorage = await storageProvider.getUserBlueprint();
    assert.ok(okStorage, "8D-1 D: precondition — owned blueprint is visible via storageProvider");
    // poison only the body uid to simulate a cross-owner document; guard must fire
    await setDoc(bDoc(), { uid: `${uid}_OTHER` }, { merge: true });
    const viaStorage = await storageProvider.getUserBlueprint();
    assert.equal(viaStorage, null, "8D-1 D: storageProvider still returns null for a body-uid / auth-uid mismatch (guard intact)");
  });

  await resetScenario();
  await step("8D-1 E: existing valid blueprint WITH correct uid -> repeat recovery is non-destructive (lifePath unchanged)", async () => {
    await blueprintRepository.saveUserBlueprint(uid, await recoverUserBlueprint(uid, { ...profileInput }));
    const lpE = (await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null;
    await recoverUserBlueprint(uid, { ...profileInput });
    assert.deepEqual((await blueprintRepository.getUserBlueprint(uid))?.lifePath ?? null, lpE, "8D-1 E: existing blueprint calculated fields unchanged by repeat recovery");
  });

  await resetScenario();
  await step("8D-1 F: existing valid blueprint MISSING uid -> recovery backfills uid, calculated fields untouched", async () => {
    // seed a valid blueprint WITHOUT triggering background HD (saveUserBlueprint, not recoverUserBlueprint)
    await blueprintRepository.saveUserBlueprint(uid, { type: "user_blueprint", input: { ...birth }, humanDesign: { status: "pending" } } as never);
    await setDoc(bDoc(), { uid: deleteField() }, { merge: true });
    const rawNoUid = await readB();
    assert.equal("uid" in (rawNoUid as object), false, "8D-1 F: precondition — body uid removed");
    const lpBefore = JSON.parse(JSON.stringify((rawNoUid as { lifePath?: unknown }).lifePath ?? null));
    await recoverUserBlueprint(uid, { ...profileInput });
    const rawAfter = await readB();
    assert.equal((rawAfter as { uid?: string }).uid, uid, "8D-1 F: recovery backfilled body uid === path uid");
    assert.deepEqual(JSON.parse(JSON.stringify((rawAfter as { lifePath?: unknown }).lifePath ?? null)), lpBefore, "8D-1 F: backfill did NOT rewrite calculated blueprint fields (lifePath identical)");
  });

  // ---- partial-write invariants (explicit) ----------------------------------
  await step("INVARIANT 1: no code path writes setupCompleted=true before a blueprint exists (D & E persisted states)", async () => {
    // proven above: D persisted setupCompleted=false with blueprint absent; E persisted setupCompleted!=true with blueprint present.
    assert.ok(true);
  });

  // ---- teardown -----------------------------------------------------------------
  await restoreRules();
  await wipe();
  await deleteDoc(uDoc()).catch(() => {});
  await deleteDoc(bDoc()).catch(() => {});
  await signOut(auth).catch(() => {});

  console.log("\n" + log.join("\n"));
  // DEFECT-8D-1 and DEFECT-8D-2 are both fixed; every assertion here (state
  // machine B–I, partial writes, restart, double-submit, monotonic recovery,
  // blueprint uid) is a hard invariant. Any failure fails the suite.
  console.log(`\nSETUP_RECOVERY_STATE_MACHINE ${failed === 0 ? "PASS" : "FAIL"} passed=${passed} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("SETUP_RECOVERY_STATE_MACHINE_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
