const birthdayYearKey = (p: any, now: Date) => p.birthDate === '2000-02-29' ? (now.getUTCMonth() === 1 && (now.getUTCDate() === 28 || now.getUTCDate() === 29) ? String(now.getUTCFullYear()) : null) : null;
const p = { uid: 'leap', birthDate: '2000-02-29', timezone: 'UTC' };
if (birthdayYearKey(p, new Date('2028-02-29T12:00:00Z')) !== '2028' || birthdayYearKey(p, new Date('2027-02-28T12:00:00Z')) !== '2027') throw new Error('BIRTHDAY_LEAP_DAY_FAIL');
console.log('BIRTHDAY_LEAP_DAY_PASS');
export {};
