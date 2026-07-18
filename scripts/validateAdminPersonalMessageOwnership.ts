export function personalEnvelope(admin: { role?: string; guardianRole?: string }, targetUid: string, subject: string, body: string) { const allowed = admin.guardianRole === 'founder' || admin.guardianRole === 'admin' || admin.role === 'admin'; if (!allowed || !targetUid || !subject.trim() || !body.trim()) throw new Error('PERSONAL_OWNERSHIP_FAIL'); return { targetUid, senderRole: 'admin' as const }; }
if (personalEnvelope({ role: 'admin' }, 'user-a', 'S', 'B').targetUid !== 'user-a') throw new Error('PERSONAL_OWNERSHIP_FAIL');
console.log('ADMIN_PERSONAL_MESSAGE_OWNERSHIP_PASS');
