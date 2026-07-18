export function canBroadcast(profile: any) { return profile?.guardianRole === 'founder' || profile?.guardianRole === 'admin' || profile?.role === 'admin'; }
if (!canBroadcast({ guardianRole: 'founder' }) || !canBroadcast({ role: 'admin' }) || canBroadcast({ role: 'user', isPremium: true })) throw new Error('ADMIN_BROADCAST_ACCESS_FAIL');
console.log('ADMIN_BROADCAST_ACCESS_PASS');
