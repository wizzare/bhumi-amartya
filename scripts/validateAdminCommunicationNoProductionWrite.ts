import fs from 'node:fs';
const source = fs.readFileSync('scripts/validateAdminBroadcastAccess.ts', 'utf8');
if (/firebase|setDoc|addDoc|updateDoc|deleteDoc/i.test(source)) throw new Error('ADMIN_COMMUNICATION_PRODUCTION_WRITE_FAIL');
console.log('ADMIN_COMMUNICATION_NO_PRODUCTION_WRITE_PASS');
