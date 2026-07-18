export function canAdminReply(admin: any, targetUid: string, ownerUid: string) { return canAccessAdmin(admin) && Boolean(targetUid) && targetUid === ownerUid; }
function canAccessAdmin(profile: any) { return ['founder', 'admin'].includes(profile?.guardianRole) || profile?.role === 'admin'; }
if (!canAdminReply({ role: 'admin' }, 'u', 'u') || canAdminReply({ role: 'user' }, 'u', 'u')) throw new Error('ADMIN_INBOX_REPLY_FAIL');
console.log('ADMIN_INBOX_REPLY_PASS');
