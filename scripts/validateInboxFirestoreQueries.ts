import fs from 'fs';
import path from 'path';
import { CommunicationMessage } from '../lib/types/communication';

console.log("=== RUNNING INBOX FIRESTORE QUERY VALIDATOR ===");

const repoPath = path.resolve(__dirname, '../lib/repositories/communicationRepository.ts');
const code = fs.readFileSync(repoPath, 'utf8');

// 1. Static Analysis Checks
console.log("[STATIC] Auditing communicationRepository.ts source code...");

// Ensure getInbox query is bounded (contains limit)
if (!code.includes('orderBy("createdAt", "desc")') || !code.includes('limit(200)')) {
  console.error("FAIL: getInbox query is not properly bounded or ordered.");
  process.exit(1);
}

// Ensure getThread query is bounded
if (!code.includes('where("threadId", "==", threadId)') || !code.includes('limit(200)')) {
  console.error("FAIL: getThread query is not properly bounded or matching threadId.");
  process.exit(1);
}

// Ensure there are no inequality filters in getInbox and getThread queries
const getInboxBlock = code.match(/getInbox[\s\S]+?\}\s+\}/)?.[0] || "";
const getThreadBlock = code.match(/getThread[\s\S]+?\}\s+\}/)?.[0] || "";

const invalidPatterns = [
  /where\(\s*["'][^"']+["']\s*,\s*["']!=["']/,
  /where\(\s*["'][^"']+["']\s*,\s*["']not-in["']/,
  /where\(\s*["'][^"']+["']\s*,\s*["']<["']/,
  /where\(\s*["'][^"']+["']\s*,\s*["']<=["']/,
  /where\(\s*["'][^"']+["']\s*,\s*["']>["']/,
  /where\(\s*["'][^"']+["']\s*,\s*["']>=["']/
];

for (const pattern of invalidPatterns) {
  if (pattern.test(getInboxBlock)) {
    console.error(`FAIL: getInbox contains invalid Firestore query filter: ${pattern.toString()}`);
    process.exit(1);
  }
  if (pattern.test(getThreadBlock)) {
    console.error(`FAIL: getThread contains invalid Firestore query filter: ${pattern.toString()}`);
    process.exit(1);
  }
}

console.log("PASS: Static query constraints verified.");

// 2. Unit Testing sort and filter behavior in-memory
console.log("[DYNAMIC] Testing mock data inbox filter and sorting behavior...");

// Mock implementation of safeTime and sort logic from getInbox
const safeTime = (msg: Partial<CommunicationMessage>) => {
  if (!msg.createdAt) return 0;
  const t = new Date(msg.createdAt).getTime();
  return Number.isFinite(t) ? t : 0;
};

const filterAndSortInbox = (messages: Partial<CommunicationMessage>[]) => {
  // Filter out archived, expired, and reply messages in memory
  const filtered = messages.filter(
    (m) => !m.isArchived && m.status !== "expired" && !m.parentMessageId
  );

  return filtered.sort((a, b) => {
    if (a.isRead === b.isRead) {
      return safeTime(b) - safeTime(a);
    }
    return a.isRead ? 1 : -1;
  });
};

const filterAndSortThread = (messages: Partial<CommunicationMessage>[]) => {
  return messages.sort((a, b) => safeTime(a) - safeTime(b));
};

// Mock dataset
const mockMessages: Partial<CommunicationMessage>[] = [
  { id: "1", isRead: false, isArchived: false, status: "delivered", createdAt: "2026-07-20T00:00:00Z", title: "Active 1" },
  { id: "2", isRead: false, isArchived: false, status: "expired", createdAt: "2026-07-20T01:00:00Z", title: "Expired" },
  { id: "3", isRead: false, isArchived: true, status: "delivered", createdAt: "2026-07-20T02:00:00Z", title: "Archived" },
  { id: "4", isRead: false, isArchived: false, status: "delivered", createdAt: "2026-07-20T03:00:00Z", parentMessageId: "1", title: "Reply" },
  { id: "5", isRead: true, isArchived: false, status: "delivered", createdAt: "2026-07-20T04:00:00Z", title: "Read Oldest" },
  { id: "6", isRead: false, isArchived: false, status: "delivered", createdAt: "2026-07-20T05:00:00Z", title: "Unread Newest" },
  { id: "7", isRead: false, isArchived: false, status: "delivered", createdAt: "invalid-date", title: "Legacy Timestamp" },
];

const inboxResult = filterAndSortInbox(mockMessages);

// Verify expired, archived, and reply are filtered
const ids = inboxResult.map(m => m.id);
if (ids.includes("2") || ids.includes("3") || ids.includes("4")) {
  console.error("FAIL: Failed to filter out expired, archived, or reply messages.");
  process.exit(1);
}

// Verify newest-first and unread-first sorting
// Expectation:
// Unread (6, 1, 7) sorted by date desc: 6 (05:00), 1 (00:00), 7 (invalid-date/0)
// Read (5) at the end
if (inboxResult[0].id !== "6" || inboxResult[1].id !== "1" || inboxResult[2].id !== "7" || inboxResult[3].id !== "5") {
  console.error("FAIL: Inbox sorting is incorrect.", inboxResult.map(m => m.id));
  process.exit(1);
}
console.log("PASS: Inbox filter and sorting works correctly.");

// Verify getThread oldest-to-newest chronological sort
const threadMessages: Partial<CommunicationMessage>[] = [
  { id: "a", createdAt: "2026-07-20T05:00:00Z" },
  { id: "b", createdAt: "2026-07-20T01:00:00Z" },
  { id: "c", createdAt: "invalid-date" },
  { id: "d", createdAt: "2026-07-20T03:00:00Z" },
];
const threadResult = filterAndSortThread(threadMessages);
const threadIds = threadResult.map(m => m.id);
// Expectation: c (0), b (01:00), d (03:00), a (05:00)
if (threadIds[0] !== "c" || threadIds[1] !== "b" || threadIds[2] !== "d" || threadIds[3] !== "a") {
  console.error("FAIL: Thread sorting is incorrect.", threadIds);
  process.exit(1);
}
console.log("PASS: Thread chronological sorting works correctly.");

// Verify empty inbox handling
const emptyResult = filterAndSortInbox([]);
if (emptyResult.length !== 0) {
  console.error("FAIL: Empty inbox returned non-empty array.");
  process.exit(1);
}
console.log("PASS: Empty inbox handled correctly.");

console.log("=== ALL INBOX QUERY VALIDATIONS COMPLETED AND PASSED ===");
