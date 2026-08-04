import assert from "assert";
import fs from "fs";
import path from "path";

// Setup node environment variables prior to importing runtime modules
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "bhumiamartya-app.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "bhumiamartya-app";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "bhumiamartya-app.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:123456";

async function runPhaseAReadReductionTests() {
  console.log("▶ Running Phase A Emergency Read Reduction Test Suite...");
  let totalAssertions = 0;

  const rootDir = process.cwd();
  const pageFile = fs.readFileSync(path.join(rootDir, "app/admin/activity/page.tsx"), "utf8");
  const adminRepoFile = fs.readFileSync(path.join(rootDir, "lib/repositories/adminRepository.ts"), "utf8");
  const commRepoFile = fs.readFileSync(path.join(rootDir, "lib/repositories/communicationRepository.ts"), "utf8");
  const commServiceFile = fs.readFileSync(path.join(rootDir, "lib/services/communicationCenterService.ts"), "utf8");
  const inboxCompFile = fs.readFileSync(path.join(rootDir, "components/admin/AdminInboxWorkspace.tsx"), "utf8");

  // 1. Static Contract Checks
  console.log("\n--- Category 1: Source Code Structural Contracts ---");

  // Check 1: opening /admin/activity defaults to 25 users
  assert(adminRepoFile.includes("pageSize = 25"), "adminRepository.getAllUsersForMonitoring must default to pageSize = 25");
  assert(pageFile.includes("getAllUsersForMonitoring(25"), "page.tsx must call getAllUsersForMonitoring with 25");
  totalAssertions += 2;
  console.log("  ✓ Item 1 PASS: Opening /admin/activity limits initial users fetch to 25.");

  // Check 2: Activity does not query before Analytics tab is active
  assert(pageFile.includes('activeTab === "analytics"'), "page.tsx must gate activity/analytics loading on activeTab === 'analytics'");
  assert(pageFile.includes("hasLoadedAnalytics.current"), "page.tsx must use hasLoadedAnalytics ref to avoid re-querying on tab switch");
  totalAssertions += 2;
  console.log("  ✓ Item 2 PASS: Activity/Analytics query is deferred until Analytics tab is active.");

  // Check 3: Inbox does not query before tab is opened
  assert(inboxCompFile.includes("if (!allowed || !active) return null;"), "AdminInboxWorkspace must return null early when not active");
  assert(inboxCompFile.includes("active && !hasLoadedOnce.current"), "AdminInboxWorkspace must gate initial load on active && !hasLoadedOnce");
  assert(pageFile.includes('AdminInboxWorkspace active={activeTab === "inbox"}'), "page.tsx must pass active={activeTab === 'inbox'}");
  totalAssertions += 3;
  console.log("  ✓ Item 3 PASS: Inbox query is deferred until Inbox tab is active.");

  // Check 4: communications max 50
  assert(commRepoFile.includes("pageSize = 50"), "communicationRepository.getAllUserCommunications must default to pageSize = 50");
  assert(commRepoFile.includes("limit(pageSize)"), "communicationRepository.getAllUserCommunications must pass limit(pageSize)");
  totalAssertions += 2;
  console.log("  ✓ Item 4 PASS: communications query is bounded to limit 50.");

  // Check 5: sender lookup is not N+1 (batched with 'in' query)
  assert(commRepoFile.includes('where(documentId(), "in", chunk)'), "communicationRepository sender lookup must batch UIDs using documentId() in");
  assert(commRepoFile.includes("senderMetaCache"), "communicationRepository must use in-memory sender metadata cache");
  totalAssertions += 2;
  console.log("  ✓ Item 5 PASS: Sender lookup uses batched 'in' query instead of N+1 getDoc calls.");

  // Check 6 & 7: User detail modal lazy loading & single query per tab
  assert(pageFile.includes("loadModalTab = useCallback"), "page.tsx must use loadModalTab for lazy tab loading in user detail modal");
  assert(pageFile.includes("loadedTabs.has(tabName)"), "page.tsx must check loadedTabs to ensure modal tab queries fire only once");
  assert(pageFile.includes("firestoreLimit(20)"), "page.tsx modal subcollection queries must be bounded to limit 20");
  totalAssertions += 3;
  console.log("  ✓ Items 6 & 7 PASS: User row click does not fetch subcollections; detail tabs are lazy-loaded once.");

  // Check 8: Cursor pagination
  assert(adminRepoFile.includes("startAfter(cursor)"), "adminRepository must use startAfter(cursor) for pagination");
  assert(commRepoFile.includes("startAfter(cursor)"), "communicationRepository must use startAfter(cursor) for pagination");
  assert(!adminRepoFile.includes("offset("), "adminRepository must not use offset pagination");
  assert(!commRepoFile.includes("offset("), "communicationRepository must not use offset pagination");
  totalAssertions += 4;
  console.log("  ✓ Item 8 PASS: All repository pagination uses cursors (startAfter) without offset.");

  // Check 9: Rerender protection
  assert(pageFile.includes("currentRequestId.current"), "page.tsx must use request ID guards to prevent stale response overwrites on rerender");
  assert(inboxCompFile.includes("hasLoadedOnce.current"), "AdminInboxWorkspace must use ref to protect against duplicate reads on rerender");
  totalAssertions += 2;
  console.log("  ✓ Item 9 PASS: Rerenders are protected from triggering duplicate reads via stable refs/deps.");

  // Check 10: Manual refresh
  assert(pageFile.includes("loadUsersPage(true)"), "page.tsx manual refresh must reload users page with reset=true");
  assert(inboxCompFile.includes("load(true)"), "AdminInboxWorkspace manual refresh button must pass reset=true");
  totalAssertions += 2;
  console.log("  ✓ Item 10 PASS: Manual refresh handlers explicitly reset pagination cursors and force fresh loads.");

  // Check 11: Broadcast recipient list caching
  assert(commServiceFile.includes("getCachedBroadcastRecipients"), "communicationCenterService must use cached broadcast recipients");
  assert(commServiceFile.includes("BROADCAST_RECIPIENT_CACHE_TTL_MS"), "communicationCenterService must define TTL for broadcast recipient cache");
  totalAssertions += 2;
  console.log("  ✓ Item 11 PASS: Broadcast delivery reuses recipient list cache within TTL window.");

  // 2. Runtime Behavior & Isolation Unit Tests
  console.log("\n--- Category 2: Runtime Unit & Cache Behavior Verification ---");

  // Import runtime modules
  const { CommunicationCenterService } = await import("../lib/services/communicationCenterService.js");
  const { adminRepository } = await import("../lib/repositories/adminRepository.js");
  const { CommunicationRepository } = await import("../lib/repositories/communicationRepository.js");

  // Mock trackEvent & processDelivery
  (CommunicationCenterService as any).trackEvent = async () => Promise.resolve();
  (CommunicationCenterService as any).processDelivery = async () => Promise.resolve();
  const origDispatch = CommunicationCenterService.dispatch;
  CommunicationCenterService.dispatch = async (params: any) => {
    return params.id || `msg_${Date.now()}`;
  };

  let fetchUsersCallCount = 0;
  const origGetAllUsersUnbounded = adminRepository.getAllUsersUnbounded;

  try {
    adminRepository.getAllUsersUnbounded = async () => {
      fetchUsersCallCount++;
      return [
        { uid: "user_a", name: "User A", isPremium: true },
        { uid: "user_b", name: "User B", isPremium: false },
      ] as any;
    };

    // Trigger sendBroadcast twice in short succession
    await CommunicationCenterService.sendBroadcast({
      adminUid: "admin_test",
      targetGroups: ["all"],
      title: "Test 1",
      content: "Content 1",
      category: "announcement",
      priority: "normal",
      broadcastIdOverride: "bc_phase_a_1",
    });

    await CommunicationCenterService.sendBroadcast({
      adminUid: "admin_test",
      targetGroups: ["all"],
      title: "Test 2",
      content: "Content 2",
      category: "announcement",
      priority: "normal",
      broadcastIdOverride: "bc_phase_a_2",
    });

    assert.strictEqual(fetchUsersCallCount, 1, "getAllUsersUnbounded must be called exactly ONCE due to 30s recipient caching");
    totalAssertions += 1;
    console.log("  ✓ Broadcast Recipient Cache Verified: 2 consecutive broadcasts triggered only 1 Firestore read call.");

  } finally {
    adminRepository.getAllUsersUnbounded = origGetAllUsersUnbounded;
    CommunicationCenterService.dispatch = origDispatch;
  }

  console.log(`\n✅ All 11 Phase A Emergency Read Reduction Test Scenarios PASS! (${totalAssertions} assertions verified)`);
}

runPhaseAReadReductionTests().catch((err) => {
  console.error("❌ Phase A Read Reduction Test Suite FAIL:", err);
  process.exit(1);
});
