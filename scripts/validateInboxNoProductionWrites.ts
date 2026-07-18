import fs from 'node:fs';
const source = fs.readFileSync('scripts/validateInboxMessageOwnership.ts', 'utf8');
if (/firebase|setDoc|addDoc|updateDoc|deleteDoc/i.test(source)) throw new Error('INBOX_PRODUCTION_WRITE_FAIL');
console.log('INBOX_NO_PRODUCTION_WRITES_PASS');
