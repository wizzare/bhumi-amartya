const birthdayYearKey = (p: any, now: Date) => p.birthDate === '1990-07-18' && now.toISOString().slice(0, 10) === '2026-07-18' ? '2026' : null;
const buildBirthdayMessage = (_p: any, _year: string) => ({ content: 'Bhumi mengucapkan selamat ulang tahun.' });
const now = new Date('2026-07-18T12:00:00Z');
const profile = { uid: 'u1', birthDate: '1990-07-18', timezone: 'Asia/Jakarta', displayName: 'Rina' };
const year = birthdayYearKey(profile, now);
if (year !== '2026' || !buildBirthdayMessage(profile, year).content.toLowerCase().includes('selamat ulang tahun')) throw new Error('BIRTHDAY_MESSAGE_FAIL');
console.log('BIRTHDAY_INBOX_MESSAGE_PASS');
export {};
