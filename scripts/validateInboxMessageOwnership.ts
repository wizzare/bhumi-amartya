/** Pure, offline ownership checks for the user-to-admin inbox contract. */
type Input = { authenticatedUid: string; category: string; subject: string; content: string };
export const SUPPORT_CATEGORIES = ['SUGGESTION', 'BUG_REPORT', 'GENERAL_FEEDBACK', 'ACCOUNT_SUPPORT'] as const;
export function buildOwnedEnvelope(input: Input) {
  if (!input.authenticatedUid || !SUPPORT_CATEGORIES.includes(input.category as any)) throw new Error('invalid owner envelope');
  if (!input.subject.trim() || !input.content.trim()) throw new Error('empty message');
  return { ownerUserId: input.authenticatedUid, senderUid: input.authenticatedUid, uid: input.authenticatedUid, senderRole: 'user' as const, recipientRole: 'admin' as const, category: input.category };
}
export function validateInboxMessageOwnership() {
  const message = buildOwnedEnvelope({ authenticatedUid: 'user-a', category: 'SUGGESTION', subject: 'Ide', content: 'Isi' });
  if (message.ownerUserId !== 'user-a' || message.senderUid !== 'user-a' || message.recipientRole !== 'admin') throw new Error('ownership failed');
  return 'INBOX_MESSAGE_OWNERSHIP_PASS';
}
console.log(validateInboxMessageOwnership());
