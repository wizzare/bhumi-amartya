export function validateThreadIsolation(parent: { threadId: string; ownerUserId?: string }, actorUid: string, threadId: string) {
  return Boolean(parent.threadId && parent.threadId === threadId && (!parent.ownerUserId || parent.ownerUserId === actorUid));
}
if (!validateThreadIsolation({ threadId: 't', ownerUserId: 'a' }, 'a', 't') || validateThreadIsolation({ threadId: 't', ownerUserId: 'a' }, 'b', 't')) throw new Error('INBOX_THREAD_ISOLATION_FAIL');
console.log('INBOX_THREAD_ISOLATION_PASS');
