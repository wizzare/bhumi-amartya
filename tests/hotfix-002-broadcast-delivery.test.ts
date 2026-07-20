import assert from "assert";

// Setup node environment variables prior to importing runtime modules
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "mock-api-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "bhumiamartya-app.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "bhumiamartya-app";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "bhumiamartya-app.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:123456";

// Mock firestore functions before importing services
import * as firestoreModule from "firebase/firestore";
(firestoreModule as any).setDoc = async () => Promise.resolve();
(firestoreModule as any).getDocs = async () => ({ docs: [], size: 0, empty: true });
(firestoreModule as any).doc = (_db: any, pathStr: string, ...rest: string[]) => ({ path: [pathStr, ...rest].join("/") });
(firestoreModule as any).collection = (_db: any, pathStr: string, ...rest: string[]) => ({ path: [pathStr, ...rest].join("/") });

async function runHotfix002Tests() {
  console.log("▶ Running HOTFIX-002 Test: Admin Broadcast Delivery Reliability Engine...");

  // Import modules using relative paths
  const { CommunicationCenterService } = await import("../lib/services/communicationCenterService.js");
  const { adminRepository } = await import("../lib/repositories/adminRepository.js");
  const { CommunicationRepository } = await import("../lib/repositories/communicationRepository.js");

  // Mock trackEvent and processDelivery to prevent background network calls
  (CommunicationCenterService as any).trackEvent = async () => Promise.resolve();
  (CommunicationCenterService as any).processDelivery = async () => Promise.resolve();
  const origDispatch = CommunicationCenterService.dispatch;
  CommunicationCenterService.dispatch = async (params: any) => {
    const id = params.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message: any = {
      id,
      uid: params.uid,
      senderUid: params.senderUid || 'bhumi',
      type: params.type,
      priority: params.priority,
      source: params.source,
      title: params.title,
      summary: params.summary,
      content: params.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'queued',
      metadata: params.metadata,
      ownerUserId: params.ownerUserId,
      senderRole: params.senderRole,
      recipientRole: params.recipientRole,
      isRead: false,
      isArchived: false,
      isDismissed: false,
    };
    await CommunicationRepository.save(message);
    return id;
  };

  const mockUsers = [
    { uid: 'user_1', name: 'User One', isPremium: true, testerBadge: undefined },
    { uid: 'user_2', name: 'User Two', isPremium: false, testerBadge: 'Penjaga Bhumi' },
    { uid: 'user_3', name: 'User Three', isPremium: false, guardianBadge: 'guardian' },
    { uid: 'user_4', name: 'User Four', isPremium: false, testerBadge: undefined },
  ];

  // Backup original methods
  const origGetAllUsers = adminRepository.getAllUsersForMonitoring;
  const origSave = CommunicationRepository.save;

  try {
    // Mock getAllUsersForMonitoring
    adminRepository.getAllUsersForMonitoring = async () => mockUsers as any;

    let savedMessages: any[] = [];
    CommunicationRepository.save = async (msg: any) => {
      savedMessages.push(msg);
    };

    // Test 1: Broadcast to ALL users
    savedMessages = [];
    await CommunicationCenterService.sendBroadcast({
      adminUid: 'admin_1',
      targetGroups: ['all'],
      title: 'Announcement',
      content: 'Hello World',
      category: 'SYSTEM_UPDATE',
      priority: 'high',
      broadcastIdOverride: 'bc_test_all',
    });

    assert.strictEqual(savedMessages.length, 4, "Broadcast to 'all' must dispatch to 4 users");
    assert.strictEqual(savedMessages[0].id, 'msg_bc_test_all_user_1', "Message ID must be deterministic `msg_bc_test_all_user_1`");
    console.log("  ✓ Test 1 PASS: Delivered broadcast to all 4 target users.");

    // Test 2: Broadcast to PREMIUM users
    savedMessages = [];
    await CommunicationCenterService.sendBroadcast({
      adminUid: 'admin_1',
      targetGroups: ['premium'],
      title: 'Premium News',
      content: 'For Premium Users Only',
      category: 'FEATURE_ANNOUNCEMENT',
      priority: 'normal',
      broadcastIdOverride: 'bc_test_premium',
    });

    assert.strictEqual(savedMessages.length, 1, "Broadcast to 'premium' must target only user_1");
    assert.strictEqual(savedMessages[0].uid, 'user_1', "Target UID must match user_1");
    console.log("  ✓ Test 2 PASS: Delivered premium broadcast to user_1 only.");

    // Test 3: Broadcast to BETA-TESTER users using canonical testerBadge & guardianBadge
    savedMessages = [];
    await CommunicationCenterService.sendBroadcast({
      adminUid: 'admin_1',
      targetGroups: ['beta-tester'],
      title: 'Beta Update',
      content: 'For Testers',
      category: 'FEATURE_ANNOUNCEMENT',
      priority: 'normal',
      broadcastIdOverride: 'bc_test_beta',
    });

    assert.strictEqual(savedMessages.length, 2, "Broadcast to 'beta-tester' must target user_2 and user_3");
    const targetUids = savedMessages.map((m) => m.uid);
    assert(targetUids.includes('user_2'), "user_2 with testerBadge must be included");
    assert(targetUids.includes('user_3'), "user_3 with guardianBadge must be included");
    console.log("  ✓ Test 3 PASS: Beta-tester targeting correctly resolved testerBadge and guardianBadge.");

    // Test 4: Failure Isolation & Partial Delivery Status
    savedMessages = [];
    CommunicationRepository.save = async (msg: any) => {
      if (msg.uid === 'user_2') {
        throw new Error("Simulated Firestore write failure for user_2");
      }
      savedMessages.push(msg);
    };

    await CommunicationCenterService.sendBroadcast({
      adminUid: 'admin_1',
      targetGroups: ['all'],
      title: 'Resilient Broadcast',
      content: 'Testing Failure Isolation',
      category: 'SYSTEM_UPDATE',
      priority: 'normal',
      broadcastIdOverride: 'bc_test_partial',
    });

    assert.strictEqual(savedMessages.length, 3, "Failure isolation must allow remaining 3 user writes to succeed");
    console.log("  ✓ Test 4 PASS: Partial failure isolated; 3 of 4 recipient writes succeeded.");

    // Test 5: Deterministic Idempotency on Retry
    savedMessages = [];
    CommunicationRepository.save = async (msg: any) => {
      savedMessages.push(msg);
    };

    const broadcastParams = {
      adminUid: 'admin_1',
      targetGroups: ['premium'] as any,
      title: 'Idempotency Test',
      content: 'Retry Content',
      category: 'MAINTENANCE' as any,
      priority: 'normal' as any,
      broadcastIdOverride: 'bc_fixed_id',
    };

    await CommunicationCenterService.sendBroadcast(broadcastParams);
    await CommunicationCenterService.sendBroadcast(broadcastParams);

    assert.strictEqual(savedMessages[0].id, 'msg_bc_fixed_id_user_1', "First dispatch ID");
    assert.strictEqual(savedMessages[1].id, 'msg_bc_fixed_id_user_1', "Second dispatch ID must match for idempotent upsert");
    console.log("  ✓ Test 5 PASS: Deterministic message ID verified for idempotency.");

    console.log("✅ HOTFIX-002 Test Suite PASS: All 5 test scenarios verified successfully!");
    process.exit(0);
  } finally {
    // Restore original functions
    adminRepository.getAllUsersForMonitoring = origGetAllUsers;
    CommunicationRepository.save = origSave;
    CommunicationCenterService.dispatch = origDispatch;
  }
}

runHotfix002Tests().catch((err) => {
  console.error("❌ HOTFIX-002 Test Suite FAIL:", err);
  process.exit(1);
});
