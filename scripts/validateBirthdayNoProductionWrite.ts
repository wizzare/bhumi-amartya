import fs from 'node:fs';
const source = fs.readFileSync('scripts/validateBirthdayInboxMessage.ts', 'utf8');
if (/setDoc|addDoc|updateDoc|firebase\/firestore/i.test(source)) throw new Error('BIRTHDAY_PRODUCTION_WRITE_FAIL');
console.log('BIRTHDAY_NO_PRODUCTION_WRITE_PASS');
export {};
