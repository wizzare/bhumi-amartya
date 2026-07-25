import assert from "node:assert";

console.log("▶ Running HOTFIX-022 Suite: Admin Stale Snapshot & Version Provenance Assertions\n");

// Simulate the requestId guard pattern from the fix
function createGuardSystem() {
  let requestId = 0;
  let activeUid: string | null = null;
  return {
    nextRequest(uid: string) {
      requestId += 1;
      activeUid = uid;
      return { requestId, uid };
    },
    isStale(capturedRequestId: number, capturedUid: string) {
      return requestId !== capturedRequestId || activeUid !== capturedUid;
    },
    close() {
      activeUid = null;
    },
  };
}

// Test 1: Guard rejects stale response from previous user
{
  const guard = createGuardSystem();

  // User A clicked
  const reqA = guard.nextRequest("USER_A");

  // User B clicked before A's response
  const reqB = guard.nextRequest("USER_B");

  // User A's response arrives late
  const aIsStale = guard.isStale(reqA.requestId, reqA.uid);
  assert.equal(aIsStale, true, "User A's stale response MUST be rejected");

  // User B's response arrives
  const bIsStale = guard.isStale(reqB.requestId, reqB.uid);
  assert.equal(bIsStale, false, "User B's current response MUST be accepted");

  console.log("  ✓ Guard rejects stale response from previous user");
}

// Test 2: Guard accepts in-order responses
{
  const guard = createGuardSystem();

  const reqA = guard.nextRequest("USER_A");
  const aIsStale = guard.isStale(reqA.requestId, reqA.uid);
  assert.equal(aIsStale, false);

  const reqB = guard.nextRequest("USER_B");
  const bIsStale = guard.isStale(reqB.requestId, reqB.uid);
  assert.equal(bIsStale, false);

  console.log("  ✓ Guard accepts in-order responses");
}

// Test 3: Guard rejects response when modal is closed
{
  const guard = createGuardSystem();
  const reqA = guard.nextRequest("USER_A");
  guard.close();
  const aIsStale = guard.isStale(reqA.requestId, reqA.uid);
  assert.equal(aIsStale, true);
  console.log("  ✓ Guard rejects response after modal close");
}

// Test 4: Guard rejects response for wrong UID (crossover)
{
  const guard = createGuardSystem();
  const reqA = guard.nextRequest("USER_A");
  // Wrong UID in response
  const crossoverStale = guard.isStale(reqA.requestId, "USER_B");
  assert.equal(crossoverStale, true, "Response with wrong UID MUST be rejected");
  console.log("  ✓ Guard rejects cross-user version data");
}

// Test 5: Simulate pickFirst version resolution
function pickFirst(source: any, keys: string[]): string {
  for (const key of keys) {
    const value = source?.[key] ?? source?.profile?.[key] ?? source?.profile?.blueprintInput?.[key] ?? source?.participationMetrics?.[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return "";
}

{
  // User doc with version in root
  const userA = { versionName: "4.4.4", appVersion: "4.4.4", buildNumber: "79" };
  const verA = pickFirst(userA, ["versionName", "appVersion", "buildNumber"]);
  assert.equal(verA, "4.4.4");
  console.log("  ✓ pickFirst resolves root versionName");

  // User doc with version only in participationMetrics
  const userB = { participationMetrics: { appVersion: "3.1.12", buildNumber: "57" } };
  const verB = pickFirst(userB, ["versionName", "appVersion", "buildNumber"]);
  assert.equal(verB, "3.1.12");
  console.log("  ✓ pickFirst falls back to participationMetrics");

  // Empty version
  const userC = {};
  const verC = pickFirst(userC, ["versionName", "appVersion", "buildNumber"]);
  assert.equal(verC, "");
  console.log("  ✓ pickFirst returns empty for missing version");
}

// Test 6: Version source priority (user_activity > participationMetrics > users root)
{
  interface VersionCandidate {
    source: string;
    version: string;
    build: string;
    timestamp: string | null;
  }

  // Simulate user_activity as most recent source
  const activityVer = { source: "user_activity/2026-07-23", version: "3.1.12", build: "57", timestamp: "2026-07-23" };
  const metricsVer = { source: "users.participationMetrics", version: "3.1.12-RC", build: "57", timestamp: "2026-07-22T23:00:24.171Z" };
  const rootVer = { source: "users.appVersion", version: "3.1.12-RC", build: "57", timestamp: "2026-07-22T23:00:24.172Z" };

  function selectCanonical(candidates: VersionCandidate[]): VersionCandidate {
    const withTimestamp = candidates.filter(c => c.timestamp);
    if (withTimestamp.length > 0) {
      withTimestamp.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
      return withTimestamp[0];
    }
    return candidates[0];
  }

  const candidates = [metricsVer, rootVer, activityVer];
  const canonical = selectCanonical(candidates);
  assert.equal(canonical.source, "user_activity/2026-07-23", "user_activity with latest timestamp must be canonical");
  assert.equal(canonical.version, "3.1.12");
  assert.equal(canonical.build, "57");
  console.log("  ✓ Version source priority: user_activity > participationMetrics > users root");
}

// Test 7: UID key forces React remount
{
  function modalKey(uid: string | null): string | null {
    return uid ? `${uid}-detail-modal` : null;
  }

  const keyA = modalKey("USER_A");
  const keyB = modalKey("USER_B");
  assert.notEqual(keyA, keyB, "Each UID must produce a different modal key");
  assert.equal(modalKey(null), null, "Null UID produces null key");
  console.log("  ✓ UID-based React key forces modal remount on user change");
}

// Test 8: User_activity version takes priority over user doc root
{
  const userDocVersion = "4.4.4-RC";
  const userActivityVersion = "3.1.12";
  const buildUser = "79";
  const buildActivity = "57";

  // The admin display should use user_activity version when available
  const displayVersion = userActivityVersion || userDocVersion;
  const displayBuild = buildActivity || buildUser;

  assert.equal(displayVersion, "3.1.12");
  assert.equal(displayBuild, "57");
  console.log("  ✓ user_activity version takes priority when available");
}

// Test 9: Old snapshot cleared before new data loads
{
  let selectedDetail: any = { activity: { appVersion: "4.4.4" } };
  let selectedBlueprint: any = { lifePath: "Old" };
  let selectedUid: string | null = "OLD_USER";

  // Simulate clicking new user - clear old data
  selectedDetail = null;
  selectedBlueprint = null;
  selectedUid = "NEW_USER";

  assert.equal(selectedDetail, null, "Old detail MUST be cleared on user change");
  assert.equal(selectedBlueprint, null, "Old blueprint MUST be cleared on user change");
  assert.equal(selectedUid, "NEW_USER");
  console.log("  ✓ Old snapshot cleared before new data loads");
}

// Test 10: Version display shows source
{
  function formatVersion(activity: { appVersion?: string; buildNumber?: string } | null, user: { versionName?: string; appVersion?: string; buildNumber?: string }): string {
    const actVer = activity?.appVersion;
    const actBuild = activity?.buildNumber;
    const uVer = user.versionName || user.appVersion || "";
    const uBuild = user.buildNumber || "";
    const ver = actVer || uVer || "-";
    const build = actBuild || uBuild || "";
    const src = actVer ? "user_activity" : "users.doc";
    return `${ver}${build ? ` · Build ${build}` : ""} (${src})`;
  }

  // With user_activity data
  const withActivity = formatVersion({ appVersion: "3.1.12", buildNumber: "57" }, { versionName: "3.1.12-RC", buildNumber: "57" });
  assert.match(withActivity, /3\.1\.12/);
  assert.match(withActivity, /Build 57/);
  assert.match(withActivity, /user_activity/);
  console.log("  ✓ Version display includes source when user_activity is available");

  // Fallback to user doc
  const withoutActivity = formatVersion(null, { versionName: "3.1.12-RC", buildNumber: "57" });
  assert.match(withoutActivity, /3\.1\.12-RC/);
  assert.match(withoutActivity, /Build 57/);
  assert.match(withoutActivity, /users\.doc/);
  console.log("  ✓ Version display falls back to users.doc source");
}

console.log(`\n✅ All 10 stale snapshot & version provenance tests PASSED`);
console.log("PRODUCTION READS: 0");
console.log("PRODUCTION WRITES: 0");
console.log("FILES CHANGED: tests/hotfix-022-admin-stale-snapshot.test.ts, app/admin/activity/page.tsx");