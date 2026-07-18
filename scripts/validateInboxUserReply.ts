export function canReplyToOwnThread(ownerUid: string, actorUid: string, status: string) { return ownerUid === actorUid && !['archived', 'closed', 'expired'].includes(status); }
if (!canReplyToOwnThread('a', 'a', 'opened') || canReplyToOwnThread('a', 'b', 'opened')) throw new Error('INBOX_USER_REPLY_FAIL');
console.log('INBOX_USER_REPLY_PASS');
