// Mock Firebase client configuration before module evaluation
const mockEnv: Record<string, string> = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "mock-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "mock.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "bhumiamartya-fe85c",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "mock.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:mock",
};
for (const [key, value] of Object.entries(mockEnv)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

async function main() {
  const assert = await import("node:assert/strict");
  const fs = await import("node:fs");
  const path = await import("node:path");

  // Dynamic import after env vars are populated
  const { UserCommunicationService } = await import("../../lib/services/userCommunicationService");
  const { CommunicationCenterService } = await import("../../lib/services/communicationCenterService");
  const { birthdayYearKey, buildBirthdayMessage } = await import("../../lib/birthday/birthdayMessage");

  let assertionsCount = 0;
  function testAssert(condition: any, message: string) {
    assert.ok(condition, message);
    assertionsCount++;
    console.log(`  PASS [${assertionsCount}]: ${message}`);
  }

  console.log("=== Platform 02C: User Communication & Session Isolation Tests ===");

  // -------------------------------------------------------------------------
  // 1. UserCommunicationService exports all user methods and DOES NOT import or expose adminRepository
  // -------------------------------------------------------------------------
  console.log("\n[Behavior 1] UserCommunicationService exports and isolation:");
  const userCommSource = fs.readFileSync(path.resolve(__dirname, "../../lib/services/userCommunicationService.ts"), "utf-8");
  testAssert(!userCommSource.includes("adminRepository"), "userCommunicationService.ts does not import or mention adminRepository");
  testAssert((UserCommunicationService as any).adminRepository === undefined, "UserCommunicationService does not expose adminRepository");

  const expectedUserMethods = [
    "submitUserSupportMessage",
    "ensureBirthdayMessage",
    "dispatch",
    "sendUserReply",
    "getInbox",
    "getThread",
    "updateState",
    "markAllAsRead",
    "submitFeedback",
    "getFeedback",
    "updateFeedback",
    "trackEvent",
    "maintenance",
  ];
  for (const method of expectedUserMethods) {
    testAssert(typeof (UserCommunicationService as any)[method] === "function", `UserCommunicationService exports method: ${method}`);
  }

  // -------------------------------------------------------------------------
  // 2. Birthday message creation idempotency
  // -------------------------------------------------------------------------
  console.log("\n[Behavior 2] Birthday message creation idempotency:");
  const sampleProfile = {
    uid: "user_test_42",
    birthDate: "1995-10-21",
    timezone: "UTC",
    displayName: "Kartika",
    fullName: "Kartika Chandra",
  };
  const birthdayDate = new Date("2026-10-21T10:00:00Z");
  const nonBirthdayDate = new Date("2026-10-22T10:00:00Z");

  const yearKey = birthdayYearKey(sampleProfile, birthdayDate);
  testAssert(yearKey === "2026", `birthdayYearKey returns '2026' on user birthday (got: ${yearKey})`);

  const nonYearKey = birthdayYearKey(sampleProfile, nonBirthdayDate);
  testAssert(nonYearKey === null, `birthdayYearKey returns null on non-birthday (got: ${nonYearKey})`);

  const bdayMsg = buildBirthdayMessage(sampleProfile, "2026");
  testAssert(bdayMsg.id === `birthday:${sampleProfile.uid}:2026`, "buildBirthdayMessage generates deterministic partitioned ID");
  testAssert(bdayMsg.title.includes("Kartika"), "buildBirthdayMessage title addresses user name");
  testAssert(typeof bdayMsg.content === "string" && bdayMsg.content.length > 0, "buildBirthdayMessage generates content");

  // Mock CommunicationRepository backing store to test ensureBirthdayMessage logic in isolation
  const originalGetInbox = UserCommunicationService.getInbox;
  const originalDispatch = UserCommunicationService.dispatch;
  try {
    let inboxStore: any[] = [];
    let dispatchedMessages: any[] = [];

    UserCommunicationService.getInbox = async (uid: string) => {
      return inboxStore.filter(m => m.uid === uid);
    };
    UserCommunicationService.dispatch = async (params: any) => {
      dispatchedMessages.push(params);
      inboxStore.push(params);
      return params.id;
    };

    // Calling ensureBirthdayMessage on non-birthday should return false and not dispatch
    const nonBdayResult = await UserCommunicationService.ensureBirthdayMessage(sampleProfile, nonBirthdayDate);
    testAssert(nonBdayResult === false, "ensureBirthdayMessage returns false on non-birthday");
    testAssert(dispatchedMessages.length === 0, "No message dispatched on non-birthday");

    // Calling ensureBirthdayMessage on birthday should return true and dispatch
    const bdayResult = await UserCommunicationService.ensureBirthdayMessage(sampleProfile, birthdayDate);
    testAssert(bdayResult === true, "ensureBirthdayMessage returns true when birthday matches and message absent");
    testAssert(dispatchedMessages.length === 1, "Exactly 1 birthday message dispatched");
    testAssert(dispatchedMessages[0].id === `birthday:${sampleProfile.uid}:2026`, "Dispatched birthday message uses partitioned id");
    testAssert(dispatchedMessages[0].ownerUserId === sampleProfile.uid, "Dispatched message owned by user");
    testAssert(dispatchedMessages[0].type === "system-birthday", "Dispatched message has type system-birthday");

    // Calling ensureBirthdayMessage AGAIN on same birthday should be idempotent (return false, no dispatch)
    const duplicateBdayResult = await UserCommunicationService.ensureBirthdayMessage(sampleProfile, birthdayDate);
    testAssert(duplicateBdayResult === false, "ensureBirthdayMessage is idempotent and returns false when already sent");
    testAssert(dispatchedMessages.length === 1, "No duplicate message dispatched on second call");
  } finally {
    UserCommunicationService.getInbox = originalGetInbox;
    UserCommunicationService.dispatch = originalDispatch;
  }

  // -------------------------------------------------------------------------
  // 3. User session isolation: Partitioned by UID
  // -------------------------------------------------------------------------
  console.log("\n[Behavior 3] User session isolation (partitioned by UID):");
  const userA = { uid: "user_alpha_01", birthDate: "1990-05-15", timezone: "Asia/Jakarta" };
  const userB = { uid: "user_beta_02", birthDate: "1990-05-15", timezone: "Asia/Jakarta" };
  const sameDate = new Date("2026-05-15T08:00:00Z");

  const msgA = buildBirthdayMessage(userA, birthdayYearKey(userA, sameDate)!);
  const msgB = buildBirthdayMessage(userB, birthdayYearKey(userB, sameDate)!);

  testAssert(msgA.id !== msgB.id, "Birthday message IDs for User A and B on same birth date must differ");
  testAssert(msgA.id === `birthday:${userA.uid}:2026`, "User A birthday message key is partitioned by userA.uid");
  testAssert(msgB.id === `birthday:${userB.uid}:2026`, "User B birthday message key is partitioned by userB.uid");

  // -------------------------------------------------------------------------
  // 4. CommunicationCenterService facade backward compatibility
  // -------------------------------------------------------------------------
  console.log("\n[Behavior 4] CommunicationCenterService facade backward compatibility:");
  const commCenterSource = fs.readFileSync(path.resolve(__dirname, "../../lib/services/communicationCenterService.ts"), "utf-8");
  testAssert(commCenterSource.includes("UserCommunicationService.submitUserSupportMessage"), "Facade delegates submitUserSupportMessage");
  testAssert(commCenterSource.includes("UserCommunicationService.ensureBirthdayMessage"), "Facade delegates ensureBirthdayMessage");
  testAssert(commCenterSource.includes("UserCommunicationService.getInbox"), "Facade delegates getInbox");
  testAssert(commCenterSource.includes("UserCommunicationService.markAllAsRead"), "Facade delegates markAllAsRead");
  testAssert(commCenterSource.includes("UserCommunicationService.sendUserReply"), "Facade delegates sendUserReply");

  // Admin methods remain on CommunicationCenterService
  testAssert(typeof (CommunicationCenterService as any).sendBroadcast === "function", "CommunicationCenterService has sendBroadcast");
  testAssert(typeof (CommunicationCenterService as any).getAllUserCommunications === "function", "CommunicationCenterService has getAllUserCommunications");
  testAssert(typeof (CommunicationCenterService as any).sendAdminReply === "function", "CommunicationCenterService has sendAdminReply");

  // -------------------------------------------------------------------------
  // 5. Verify AuthContext.tsx and app/inbox/page.tsx import UserCommunicationService and NOT adminRepository
  // -------------------------------------------------------------------------
  console.log("\n[Behavior 5] AuthContext and Inbox import verification:");
  const authContextSource = fs.readFileSync(path.resolve(__dirname, "../../context/AuthContext.tsx"), "utf-8");
  testAssert(authContextSource.includes("UserCommunicationService"), "AuthContext.tsx imports/uses UserCommunicationService");
  testAssert(!authContextSource.includes("adminRepository"), "AuthContext.tsx does NOT import or use adminRepository");

  const inboxPageSource = fs.readFileSync(path.resolve(__dirname, "../../app/inbox/page.tsx"), "utf-8");
  testAssert(inboxPageSource.includes("UserCommunicationService"), "app/inbox/page.tsx imports/uses UserCommunicationService");
  testAssert(!inboxPageSource.includes("adminRepository"), "app/inbox/page.tsx does NOT import or use adminRepository");
  testAssert(!inboxPageSource.includes("CommunicationCenterService"), "app/inbox/page.tsx uses UserCommunicationService directly, not CommunicationCenterService");

  console.log(`\n================================================================`);
  console.log(`ALL TESTS PASSED CLEANLY (Exit 0). Total Assertions: ${assertionsCount}`);
  console.log(`================================================================`);
}

main().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
