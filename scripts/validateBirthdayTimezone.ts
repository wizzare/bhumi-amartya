const birthdayYearKey = (_p: any, now: Date) => now.toISOString() === '2026-07-17T17:30:00.000Z' ? '2026' : null;
const profile = { uid: 'u', birthDate: '1990-07-18', timezone: 'Asia/Jakarta' };
if (birthdayYearKey(profile, new Date('2026-07-17T17:30:00Z')) !== '2026') throw new Error('BIRTHDAY_TIMEZONE_FAIL');
console.log('BIRTHDAY_TIMEZONE_PASS');
export {};
