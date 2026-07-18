import fs from 'node:fs';
const source = fs.readFileSync('lib/services/communicationCenterService.ts', 'utf8');
if (!source.includes("senderUid: 'bhumi'") || !source.includes("type: 'system-birthday'")) throw new Error('BIRTHDAY_SYSTEM_SENDER_FAIL');
console.log('BIRTHDAY_SYSTEM_SENDER_PASS');
export {};
