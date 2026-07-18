export function canAccessAdminInbox(profile: any) { return ['founder', 'admin'].includes(profile?.guardianRole) || profile?.role === 'admin'; }
if (!canAccessAdminInbox({ guardianRole: 'founder' }) || !canAccessAdminInbox({ role: 'admin' }) || canAccessAdminInbox({ guardianRole: 'user', isPremium: true })) throw new Error('ADMIN_INBOX_ACCESS_FAIL');
console.log('ADMIN_INBOX_ACCESS_PASS');
