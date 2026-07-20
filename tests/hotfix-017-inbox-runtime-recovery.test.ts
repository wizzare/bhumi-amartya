import { CommunicationRepository } from "../lib/repositories/communicationRepository";
import { DateTime } from "luxon";

console.log("▶ Running HOTFIX-017 Suite: Inbox Runtime Recovery & Defensive Normalization Assertions\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`✔ ${description}`);
    passed++;
  } else {
    console.error(`✖ ${description}`);
    failed++;
  }
}

async function runTests() {
  // Test 1: Timestamp object normalization
  const timestampDoc = {
    createdAt: { toDate: () => new Date("2026-07-20T10:00:00.000Z") },
    updatedAt: { toDate: () => new Date("2026-07-20T10:00:00.000Z") },
    title: "Timestamp Message",
    content: "Content with timestamp",
    type: "user-message",
    status: "delivered",
    source: "admin",
  };
  const norm1 = CommunicationRepository.normalizeCommunicationMessage(timestampDoc, "doc_ts_1");
  assert(norm1.createdAt === "2026-07-20T10:00:00.000Z", "1. Firestore Timestamp object converts to ISO date string");
  assert(norm1.id === "doc_ts_1", "2. Missing id in raw payload falls back to doc.id");

  // Test 3: Raw seconds object normalization ({ seconds, nanoseconds })
  const secondsDoc = {
    createdAt: { seconds: 1784541600, nanoseconds: 0 },
    title: "Raw Seconds Message",
    content: "Content with raw seconds",
  };
  const norm2 = CommunicationRepository.normalizeCommunicationMessage(secondsDoc, "doc_sec_2");
  assert(typeof norm2.createdAt === "string" && norm2.createdAt.includes("2026"), "3. Raw seconds object converts to ISO date string");

  // Test 4: Missing optional fields do not throw
  const bareDoc = {
    title: "Bare Message",
  };
  const norm3 = CommunicationRepository.normalizeCommunicationMessage(bareDoc, "doc_bare_3");
  assert(norm3.type === "user-message", "4. Missing type falls back to safe user-message default");
  assert(norm3.status === "delivered", "5. Missing status falls back to safe delivered default");
  assert(norm3.isRead === false, "6. Missing isRead falls back to false");
  assert(norm3.deliveryChannels.length === 1 && norm3.deliveryChannels[0] === "inbox", "7. Missing deliveryChannels falls back to ['inbox']");

  // Test 8: Luxon DateTime invalid guard
  const dtInvalid = DateTime.fromISO("invalid-date-string");
  assert(!dtInvalid.isValid, "8. Invalid date string produces invalid Luxon DateTime");
  const displayTime = dtInvalid.isValid ? dtInvalid.toRelative() : "Baru saja";
  assert(displayTime === "Baru saja", "9. Defensive Luxon guard returns fallback string without throwing");

  // Test 10: Valid Luxon DateTime relative formatting
  const dtValid = DateTime.fromISO("2026-07-20T12:00:00.000Z");
  assert(dtValid.isValid, "10. Valid ISO date string produces valid Luxon DateTime");

  // Test 11: Document with status='opened' sets isRead=true
  const openedDoc = {
    status: "opened",
    title: "Opened Message",
  };
  const norm4 = CommunicationRepository.normalizeCommunicationMessage(openedDoc, "doc_opened_4");
  assert(norm4.isRead === true, "11. Document with status='opened' automatically sets isRead=true");

  // Test 12: Document with status='archived' sets isArchived=true
  const archivedDoc = {
    status: "archived",
    title: "Archived Message",
  };
  const norm5 = CommunicationRepository.normalizeCommunicationMessage(archivedDoc, "doc_archived_5");
  assert(norm5.isArchived === true, "12. Document with status='archived' automatically sets isArchived=true");

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`Inbox Runtime Recovery Tests: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log(`✅ ALL ${passed} INBOX RUNTIME RECOVERY CONTRACT ASSERTIONS PASSED PERFECTLY!\n`);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
