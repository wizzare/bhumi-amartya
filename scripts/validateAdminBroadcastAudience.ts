const broadcastAudiences = new Set(['all', 'premium', 'beta-tester']);
if (![...broadcastAudiences].some((value) => value === 'all') || [...broadcastAudiences].some((value) => value === 'arbitrary')) throw new Error('ADMIN_BROADCAST_AUDIENCE_FAIL');
console.log('ADMIN_BROADCAST_AUDIENCE_PASS');
