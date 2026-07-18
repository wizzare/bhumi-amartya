const buildBirthdayMessage = (p: any, year: string) => ({ id: `birthday:${p.uid}:${year}` });
const message = buildBirthdayMessage({ uid: 'owner', birthDate: '1990-07-18', displayName: 'A' }, '2026');
if (!message.id.startsWith('birthday:owner:')) throw new Error('BIRTHDAY_OWNERSHIP_FAIL');
console.log('BIRTHDAY_OWNERSHIP_PASS');
export {};
